from google import genai
import json


def generate_hobbies(start_date, end_date, place, budget, hobbies):
    client = genai.Client(api_key="AIzaSyDr6fCdacS32OE0Phkvu3YorcT0-zCfKtM")
    response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents=(
        f"Generate a vacation trip plan starting from {start_date} to {end_date} "
        f"in the location {place}, with a budget of {budget}. "
        f"The plan should suit a person with the following hobbies: {hobbies}. "
        f"Return the result in JSON format, where each object contains: start time, end time, date, location, "
        f"a short description, and approximate cost. Make sure to include specific times for each activity."
    )
)

    cleaned = response.text.strip().strip("```json").strip("```")
    return json.loads(cleaned)

generate_hobbies("april 13th 2025", "april 20 2025", "tampa florida", "20 a day", "soccer, golf, fishing")