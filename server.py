from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse, FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import httpx
import base64
from urllib.parse import urlencode

load_dotenv()

CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")

app = FastAPI()

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


# Catch-all route for React (must come last)
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    index_path = os.path.join("dist", "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return JSONResponse({"error": "Frontend not built yet"}, status_code=404)
