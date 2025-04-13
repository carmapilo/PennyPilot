from fastapi import FastAPI, UploadFile, File, Form
from PIL import Image
import numpy as np
import cv2

from Scanner import function

app = FastAPI()


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

