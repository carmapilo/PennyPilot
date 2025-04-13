import { NextRequest, NextResponse } from "next/server";

// Mock function to simulate receipt processing
function mockReceiptProcessing(): Array<{ item: string; price: number }> {
  // Generate random items
  const numItems = Math.floor(Math.random() * 8) + 2; // 2-10 items
  const items: Array<{ item: string; price: number }> = [];

  const groceryItems = [
    { item: "Milk", priceRange: [2.99, 5.99] },
    { item: "Bread", priceRange: [2.49, 4.99] },
    { item: "Eggs", priceRange: [3.49, 6.99] },
    { item: "Bananas", priceRange: [0.99, 2.99] },
    { item: "Apples", priceRange: [3.99, 6.99] },
    { item: "Chicken Breast", priceRange: [7.99, 12.99] },
    { item: "Ground Beef", priceRange: [5.99, 10.99] },
    { item: "Pasta", priceRange: [1.49, 3.99] },
    { item: "Tomato Sauce", priceRange: [1.99, 4.99] },
    { item: "Cereal", priceRange: [3.49, 6.99] },
    { item: "Orange Juice", priceRange: [2.99, 5.99] },
    { item: "Coffee", priceRange: [6.99, 12.99] },
    { item: "Cheese", priceRange: [4.99, 8.99] },
    { item: "Yogurt", priceRange: [1.99, 4.99] },
    { item: "Potato Chips", priceRange: [2.99, 4.99] },
    { item: "Ice Cream", priceRange: [3.99, 7.99] },
    { item: "Frozen Pizza", priceRange: [4.99, 9.99] },
    { item: "Paper Towels", priceRange: [2.99, 6.99] },
    { item: "Toilet Paper", priceRange: [4.99, 12.99] },
    { item: "Laundry Detergent", priceRange: [7.99, 15.99] },
  ];

  // Randomly select items without repeating
  const selectedIndices = new Set<number>();
  while (selectedIndices.size < numItems) {
    const index = Math.floor(Math.random() * groceryItems.length);
    selectedIndices.add(index);
  }

  selectedIndices.forEach((index) => {
    const item = groceryItems[index];
    const minPrice = item.priceRange[0];
    const maxPrice = item.priceRange[1];
    const price = +(minPrice + Math.random() * (maxPrice - minPrice)).toFixed(
      2
    );

    items.push({
      item: item.item,
      price: price,
    });
  });

  return items;
}

export async function POST(request: NextRequest) {
  try {
    // In a real implementation, you would:
    // 1. Extract the uploaded file from the request
    // 2. Process the image using OCR or ML
    // 3. Return structured data

    // For this demo, we'll skip the actual processing and return mock data
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const receiptItems = mockReceiptProcessing();

    // Return just the array of items
    return NextResponse.json(receiptItems, { status: 200 });
  } catch (error) {
    console.error("Error processing receipt:", error);
    return NextResponse.json(
      { error: "Failed to process receipt" },
      { status: 500 }
    );
  }
}
