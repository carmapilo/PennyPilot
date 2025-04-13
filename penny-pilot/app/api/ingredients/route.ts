import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipeInstructions } = body;

    // Mock ingredient extraction logic
    // In a real application, this would use NLP or external API to extract ingredients
    const mockIngredients = [
      "chicken breast",
      "olive oil",
      "salt",
      "pepper",
      "garlic",
      "onion",
      "bell pepper",
      "tomatoes",
      "rice",
      "pasta",
      "flour",
      "sugar",
      "butter",
      "milk",
      "eggs",
    ];

    // Randomly select 3-7 ingredients from the mock list
    const numberOfIngredients = Math.floor(Math.random() * 5) + 3;
    const shuffled = [...mockIngredients].sort(() => 0.5 - Math.random());
    const selectedIngredients = shuffled.slice(0, numberOfIngredients);

    return NextResponse.json({ ingredients: selectedIngredients });
  } catch (error) {
    console.error("Error processing recipe ingredients:", error);
    return NextResponse.json(
      { error: "Failed to process recipe ingredients" },
      { status: 500 }
    );
  }
}
