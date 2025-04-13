"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  Search,
  Utensils,
  Plus,
  ShoppingCart,
  Trash2,
  ArrowLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Recipe {
  id: string;
  name: string;
  instructions: string;
  createdAt: string;
  ingredients: string[];
}

interface CartItem {
  id: string;
  name: string;
}

// Default recipes for demo purposes (will be used if localStorage is empty)
const defaultRecipes: Recipe[] = [
  {
    id: "1",
    name: "Spaghetti Carbonara",
    instructions:
      "1. Cook pasta\n2. Fry bacon\n3. Mix eggs, cheese\n4. Combine all ingredients",
    createdAt: new Date().toISOString(),
    ingredients: [
      "Spaghetti",
      "Eggs",
      "Bacon",
      "Parmesan cheese",
      "Black pepper",
    ],
  },
  {
    id: "2",
    name: "Classic Omelette",
    instructions:
      "1. Beat eggs\n2. Heat butter in pan\n3. Pour eggs\n4. Add fillings and fold",
    createdAt: new Date().toISOString(),
    ingredients: ["Eggs", "Butter", "Salt", "Pepper", "Cheese"],
  },
];

export default function RecipeSearchPage() {
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [newRecipeTitle, setNewRecipeTitle] = useState("");
  const [newRecipeInstructions, setNewRecipeInstructions] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Mark component as client-side rendered
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load data from localStorage on initial render
  useEffect(() => {
    if (!isClient) return;

    const loadRecipes = () => {
      const savedRecipes = localStorage.getItem("recipes");
      if (savedRecipes) {
        try {
          setRecipes(JSON.parse(savedRecipes));
        } catch (error) {
          console.error("Error parsing recipes from localStorage:", error);
          setRecipes(defaultRecipes);
        }
      } else {
        // Use default recipes if no data in localStorage
        setRecipes(defaultRecipes);
      }
    };

    const loadCartItems = () => {
      const savedCartItems = localStorage.getItem("cartItems");
      if (savedCartItems) {
        try {
          setCartItems(JSON.parse(savedCartItems));
        } catch (error) {
          console.error("Error parsing cart items from localStorage:", error);
          setCartItems([]);
        }
      }
    };

    // Initial load
    loadRecipes();
    loadCartItems();

    // Set up event listener for storage changes
    // (useful if multiple tabs are open)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "recipes") {
        loadRecipes();
      } else if (e.key === "cartItems") {
        loadCartItems();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [isClient]);

  // Save recipes to localStorage whenever it changes
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem("recipes", JSON.stringify(recipes));
  }, [recipes, isClient]);

  // Save cart items to localStorage whenever it changes
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems, isClient]);

  const handleAddRecipe = async () => {
    if (!newRecipeTitle.trim() || !newRecipeInstructions.trim()) return;

    try {
      // Call the API to get ingredients
      const response = await fetch("/api/ingredients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipeInstructions: newRecipeInstructions }),
      });

      if (!response.ok) {
        throw new Error("Failed to extract ingredients");
      }

      const data = await response.json();

      // Create new recipe
      const newRecipe: Recipe = {
        id: Date.now().toString(),
        name: newRecipeTitle,
        instructions: newRecipeInstructions,
        createdAt: new Date().toISOString(),
        ingredients: data.ingredients,
      };

      setRecipes([...recipes, newRecipe]);
      setNewRecipeTitle("");
      setNewRecipeInstructions("");
      setDialogOpen(false); // Close the dialog after adding
    } catch (error) {
      console.error("Error adding recipe:", error);
    }
  };

  const deleteRecipe = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click event
    setRecipes(recipes.filter((recipe) => recipe.id !== id));

    // If the deleted recipe is currently selected, go back to the recipe list
    if (selectedRecipe && selectedRecipe.id === id) {
      setSelectedRecipe(null);
    }
  };

  const addToCart = (ingredient: string) => {
    const newItem: CartItem = {
      id: Date.now().toString(),
      name: ingredient,
    };
    setCartItems([...cartItems, newItem]);
  };

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <main className="container mx-auto px-4 py-6">
      {!selectedRecipe ? (
        <>
          <h1 className="text-2xl font-bold mb-6">Recipe Search</h1>

          <div className="flex mb-6 gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search recipes by name..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex gap-1 items-center">
                  <Plus className="h-4 w-4" />
                  Add Recipe
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Recipe</DialogTitle>
                  <DialogDescription>
                    Enter the details of your new recipe below.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="recipe-title" className="text-right">
                      Title
                    </Label>
                    <Input
                      id="recipe-title"
                      value={newRecipeTitle}
                      onChange={(e) => setNewRecipeTitle(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="recipe-instructions" className="text-right">
                      Instructions
                    </Label>
                    <Textarea
                      id="recipe-instructions"
                      value={newRecipeInstructions}
                      onChange={(e) => setNewRecipeInstructions(e.target.value)}
                      className="col-span-3"
                      rows={5}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleAddRecipe}>
                    Search Ingredients
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </>
      ) : null}

      {recipes.length === 0 && !selectedRecipe ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            No recipes yet. Add your first recipe!
          </p>
        </div>
      ) : selectedRecipe ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Button
              variant="outline"
              className="mb-4 flex items-center gap-1"
              onClick={() => setSelectedRecipe(null)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Recipes
            </Button>
            <h2 className="text-xl font-bold mb-2">{selectedRecipe.name}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Created on {formatDate(selectedRecipe.createdAt)}
            </p>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Instructions:</h3>
              <p className="whitespace-pre-wrap">
                {selectedRecipe.instructions}
              </p>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="invisible mb-4">
              <Button
                variant="outline"
                className="opacity-0 pointer-events-none"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Recipes
              </Button>
            </div>
            <h2 className="text-xl font-bold mb-2 invisible">Hidden Title</h2>
            <p className="text-sm text-muted-foreground mb-4 invisible">
              Hidden Date
            </p>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Ingredients:</h3>
              <ul className="space-y-2">
                {selectedRecipe.ingredients.map((ingredient, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-2 border rounded-lg"
                  >
                    <span className="flex-grow">{ingredient}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => addToCart(ingredient)}
                      className="ml-2 h-8 w-8 text-black hover:text-black"
                      title="Add to Cart"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <Card
              key={recipe.id}
              className="cursor-pointer hover:shadow-md transition-shadow relative"
              onClick={() => setSelectedRecipe(recipe)}
            >
              <CardHeader>
                <CardTitle>{recipe.name}</CardTitle>
                <CardDescription>
                  Created on {formatDate(recipe.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {recipe.instructions}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm">
                  {recipe.ingredients.length} ingredients
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8 absolute top-2 right-2"
                  onClick={(e) => deleteRecipe(recipe.id, e)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
