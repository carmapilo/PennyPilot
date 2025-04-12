import cv2
import pytesseract
from PIL import Image


image = cv2.imread("receipts/receipt1.jpg")
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
thresh = cv2.adaptiveThreshold(
    gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
    cv2.THRESH_BINARY, 11, 2
)

#Clean up the image

text = pytesseract.image_to_string(thresh)
print(text)

#use Pytesseract to extract the image