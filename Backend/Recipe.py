from google import genai
import json


def generate_ingredients(recipe):
    client = genai.Client(api_key="AIzaSyDr6fCdacS32OE0Phkvu3YorcT0-zCfKtM")
    response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents=(f"""
Given the following recipe instructions, extract a list of ingredients used. 

Instructions:
"{recipe}"

Output the result strictly in JSON format like this:
{{
  "ingredients": ["ingredient1", "ingredient2", "ingredient3"]
}}

Ensure:
- All ingredient names are lowercase.
- No duplicates.
- No additional explanation—just return the JSON.
"""
    )
)

    cleaned = response.text.strip().strip("```json").strip("```")
    return json.loads(cleaned)