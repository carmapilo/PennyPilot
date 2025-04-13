# ExpenseWise

Hey! This is our project for HackaBull 2025. We built this app because we wanted a centralized hub where we can manage our finances and plan for the future. It's pretty cool, you can scan receipts, plan vacation trips, and even make a shopping list based on recipe descriptions

## Frontend

To get the frontend running:

```
npm i
npm run dev
```

### Dashboard

The dashboard gives you a quick overview of all that the app has to offer It shows some charts of your spending habits and tracks your budget over time. It pulls data from localStorage to display your recent purchases, upcoming trips, and saved recipes.

### Purchase History

This section lets you see everything you've bought before based on scanned receipts and manual input.You can see details based on store and purchasing habits to have a better understanding of your financial habits. You can click on any purchase to see detailed info.

### Receipt Scanner

Just take a picture of your receipt, and it'll extract all the items and prices automatically. It sends the image in a POST request to `http://127.0.0.1:8000/test` and uses Gemini to process the image. The backend returns JSON with all the items and their prices.

### Trip Planner

This helps you plan fun trips based on your interests and budget. Just enter your destination, travel dates, budget, and what kind of activities you're into, and it'll create a personalized itinerary for you. It sends a POST request to `http://127.0.0.1:8000/hobbies` with your destination, date range, budget, and interests. The backend uses Gemini to generate a custom trip plan with activities tailored to your preferences and returns a JSON array of recommended events with locations, descriptions, times, and costs.

### Recipe Ingredient Search

Got random stuff in your fridge but don't know what to make? This feature's got you covered. Enter whatever ingredients you have, and it'll suggest recipes. It sends a POST request to `http://127.0.0.1:8000/ingredients` with recipe instructions. The backend uses Gemini to extract ingredients and returns a JSON array with the ingredients needed.

## Backend

Our backend is built with FastAPI because of its ease of use. We're using Gemini for AI tasks, such as processing receipt images, generate schedule based on trip details, and generating ingredient list.

The main endpoints are:

- `http://127.0.0.1:8000/test` - POST request for receipt scanning with Gemini
- `http://127.0.0.1:8000/hobbies` - POST request for trip planning
- `http://127.0.0.1:8000/ingredients` - POST request for recipe ingredient extraction with Gemini
