import cv2

import easyocr
from PIL import Image
from google import genai
import json


def function(test_image):
    image = test_image
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    denoised = cv2.fastNlMeansDenoising(gray, h=30)
    thresh = cv2.adaptiveThreshold(
        denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY, 11, 2
    )
    scaled = cv2.resize(thresh, None, fx=2, fy=2, interpolation=cv2.INTER_LINEAR)

    #Clean up the image

    cv2.imwrite("thresh_output.jpg", scaled)
    reader = easyocr.Reader(['en'])
    result = reader.readtext(scaled)
    result_text = ""
    for (bbox, text, prob) in result:
        result_text +=  "(" + text + ": " + str(prob) + ")"
        print(text, prob)




    client = genai.Client(api_key="AIzaSyDr6fCdacS32OE0Phkvu3YorcT0-zCfKtM")

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents="Correct the possible grocery list item names and make a json output of items, prices are included and usually come before an F " \
        "also use local grocery prices to give a realistic amount" + result_text,
    )

    cleaned = response.text.strip().strip("```json").strip("```")

    # Load it as JSON
    items = json.loads(cleaned)


    return items

