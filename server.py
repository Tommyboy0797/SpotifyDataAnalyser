from fastapi import FastAPI, Request, HTTPException, Query
from fastapi.responses import JSONResponse, FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import httpx
import base64
from urllib.parse import urlencode
import requests
from typing import Optional

load_dotenv()

CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")

app = FastAPI()
class recieveData:
    send_str:str


# Allow CORS for React dev server (change for production)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True  # Required for cookies
)

# Serve static files (for production)
app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")

@app.get("/api/hello")
async def api_hello():
    return {"message": "Hello from FastAPI backend!"}

# Handle Spotify OAuth callback
@app.get("/callback")
async def callback(request: Request):
    code = request.query_params.get("code")
    state = request.query_params.get("state")

    if not code or not state:
        raise HTTPException(status_code=400, detail="Missing code or state")

    token_url = "https://accounts.spotify.com/api/token"
    auth_header = base64.b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode()

    headers = {
        "Authorization": f"Basic {auth_header}",
        "Content-Type": "application/x-www-form-urlencoded"
    }

    data = {
        "code": code,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code"
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(token_url, data=data, headers=headers)

    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to retrieve token")

    token_data = response.json()
    access_token = token_data["access_token"]

    # Set the access token as a secure HttpOnly cookie
    redirect_response = RedirectResponse(url="http://127.0.0.1:5173/dashboard")
    redirect_response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # Set to True if using HTTPS in production
        samesite="Lax",
        max_age=3600  # 1 hour
    )
    return redirect_response

@app.get("/api/me")
async def get_me(request: Request):
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.spotify.com/v1/me", headers=headers)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch user data")

    return response.json()

@app.get("/api/usr")
async def get_me(request: Request):
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    return {"access_token": access_token}


@app.get("/dashboard/following/followed_artists")
def get_followed_artists(request: Request, after: Optional[str] = None):
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    next_after = after
    artists_list = []

    while True:
        params = {
            'type': 'artist',
            'limit': 50,
        }
        if next_after:
            params['after'] = next_after

        headers = {
            'Authorization': f'Bearer {access_token}',
        }
        
        response = requests.get("https://api.spotify.com/v1/me/following", params=params, headers=headers)

        if response.status_code != 200: # if the repsonse isnt 200 code (good), raise an error
            raise HTTPException(status_code=response.status_code, detail = response.text)

        data = response.json() # take the response and make it json
        artists = data["artists"]["items"]
        artists_list.extend(artists)

        next_after = data["artists"]["cursors"].get("after")

        if not next_after:
            break

        print(artists_list)

    return artists_list

@app.get("/tracks_data")
def tracks_data(request: Request, time_range: Optional[str] = Query("long_term", regex="^(long_term|medium_term|short_term)$")):
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    url = "https://api.spotify.com/v1/me/top/tracks"
    params = {
        "limit": 15,
        "time_range": time_range
    }

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    response = requests.get(url, params=params, headers=headers)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    data = response.json()
    return data.get("items", [])

@app.get("/artist_info")
def artist_info(request: Request, id: str = Query(..., description="Spotify artist ID")):
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    url = f"https://api.spotify.com/v1/artists/{id}"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()


# Catch-all route for React (must come last)
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    index_path = os.path.join("dist", "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return JSONResponse({"error": "Frontend not built yet"}, status_code=404)
