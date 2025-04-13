import { NextRequest, NextResponse } from "next/server";

// Mock function to simulate receipt scanning
function mockReceiptProcessing(): {
  store: string;
  items: Array<{ name: string; price: number }>;
} {
  // Randomly select a store from these options
  const stores = [
    "Walmart",
    "Target",
    "Kroger",
    "Whole Foods",
    "Trader Joe's",
    "Publix",
    "Costco",
  ];

  const storeIndex = Math.floor(Math.random() * stores.length);
  const store = stores[storeIndex];

  // Generate random items based on the store
  const numItems = Math.floor(Math.random() * 8) + 2; // 2-10 items
  const items: Array<{ name: string; price: number }> = [];

  const groceryItems = [
    { name: "Milk", priceRange: [2.99, 5.99] },
    { name: "Bread", priceRange: [2.49, 4.99] },
    { name: "Eggs", priceRange: [3.49, 6.99] },
    { name: "Bananas", priceRange: [0.99, 2.99] },
    { name: "Apples", priceRange: [3.99, 6.99] },
    { name: "Chicken Breast", priceRange: [7.99, 12.99] },
    { name: "Ground Beef", priceRange: [5.99, 10.99] },
    { name: "Pasta", priceRange: [1.49, 3.99] },
    { name: "Tomato Sauce", priceRange: [1.99, 4.99] },
    { name: "Cereal", priceRange: [3.49, 6.99] },
    { name: "Orange Juice", priceRange: [2.99, 5.99] },
    { name: "Coffee", priceRange: [6.99, 12.99] },
    { name: "Cheese", priceRange: [4.99, 8.99] },
    { name: "Yogurt", priceRange: [1.99, 4.99] },
    { name: "Potato Chips", priceRange: [2.99, 4.99] },
    { name: "Ice Cream", priceRange: [3.99, 7.99] },
    { name: "Frozen Pizza", priceRange: [4.99, 9.99] },
    { name: "Paper Towels", priceRange: [2.99, 6.99] },
    { name: "Toilet Paper", priceRange: [4.99, 12.99] },
    { name: "Laundry Detergent", priceRange: [7.99, 15.99] },
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
      name: item.name,
      price: price,
    });
  });

  return {
    store,
    items,
  };
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

    const receiptData = mockReceiptProcessing();

    return NextResponse.json(receiptData, { status: 200 });
  } catch (error) {
    console.error("Error processing receipt:", error);
    return NextResponse.json(
      { error: "Failed to process receipt" },
      { status: 500 }
    );
  }
}
