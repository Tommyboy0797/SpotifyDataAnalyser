from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import requests
import os
from urllib.parse import urlencode
from dotenv import load_dotenv
from pydantic import BaseModel
from fastapi.templating import Jinja2Templates


app = FastAPI()
templates = Jinja2Templates(directory="frontend")
app.mount("/static",StaticFiles(directory = "static"),name="static")


@app.get("/")
def read_root(request: Request):
    respo = templates.TemplateResponse(
        "index.html", 
        {"request": request,
          "title": "Test thing from eendpoint",
            }   
    )
    
    return respo
