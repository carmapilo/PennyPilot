"use client"

import { useState } from "react"
import { Clock, Search, Utensils } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

// Mock data for recipes
const recipes = [
  {
    id: "1",
    name: "Chicken Stir Fry",
    image: "/placeholder.svg?height=200&width=300",
    prepTime: "15 mins",
    cookTime: "10 mins",
    cost: 12.5,
    tags: ["Quick", "Healthy", "Dinner"],
  },
  {
    id: "2",
    name: "Vegetable Pasta",
    image: "/placeholder.svg?height=200&width=300",
    prepTime: "10 mins",
    cookTime: "15 mins",
    cost: 8.75,
    tags: ["Vegetarian", "Pasta", "Easy"],
  },
  {
    id: "3",
    name: "Breakfast Smoothie Bowl",
    image: "/placeholder.svg?height=200&width=300",
    prepTime: "5 mins",
    cookTime: "0 mins",
    cost: 5.25,
    tags: ["Breakfast", "Healthy", "No-Cook"],
  },
  {
    id: "4",
    name: "Baked Salmon",
    image: "/placeholder.svg?height=200&width=300",
    prepTime: "5 mins",
    cookTime: "20 mins",
    cost: 15.99,
    tags: ["Seafood", "Dinner", "High-Protein"],
  },
]

export default function RecipeSearchPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <main className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Recipe Search</h1>

      <div className="relative mb-6">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search recipes by name or tag..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRecipes.map((recipe) => (
          <Card key={recipe.id} className="overflow-hidden">
            <img src={recipe.image || "/placeholder.svg"} alt={recipe.name} className="w-full h-48 object-cover" />
            <CardHeader className="pb-2">
              <CardTitle>{recipe.name}</CardTitle>
              <CardDescription>
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                    <span className="text-xs">{recipe.prepTime} prep</span>
                  </div>
                  <div className="flex items-center">
                    <Utensils className="mr-1 h-4 w-4 text-muted-foreground" />
                    <span className="text-xs">{recipe.cookTime} cook</span>
                  </div>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <div className="text-sm font-medium">Est. Cost: ${recipe.cost.toFixed(2)}</div>
              <Button size="sm">View Recipe</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  )
}
