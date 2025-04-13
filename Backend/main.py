from fastapi import FastAPI, UploadFile, File, Form
from PIL import Image
import numpy as np
import cv2
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import date

from Scanner import function
from hobbies import generate_hobbies

app = FastAPI()

class ActivityRequest(BaseModel):
    destination: str
    startDate: date
    endDate: date
    budget: float
    interests: List[str]



origins = [
    "http://localhost:3001",
    "http://127.0.0.1:3001"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/test")
async def image_scanner(    
    receipt: UploadFile = File(...),
):
    sketch_bytes = await receipt.read()
    nparr = np.frombuffer(sketch_bytes, np.uint8)

    sketch_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR) 

    # Resize image
    sketch_img = cv2.resize(sketch_img, (512, 512))

    text = function(sketch_img)

    return text

@app.post("/hobbies")
async def suggest_activities(request: ActivityRequest):
    return generate_hobbies(request.startDate, request.endDate, request.destination, request.budget, request.interests)
    
    


