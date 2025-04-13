"use client";

import { MonthlySpending } from "@/components/monthly-spending";
import { PurchaseHistory } from "@/components/purchase-history";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CalendarDays,
  ChevronRight,
  Utensils,
  History,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PurchaseItem } from "@/components/purchase-item";
import { useEffect, useState } from "react";
import { Purchase } from "@/components/purchase-history";

// Mock data for upcoming trips
const upcomingTrips = [
  {
    id: "trip1",
    name: "New York City",
    startDate: "2023-06-15",
    endDate: "2023-06-20",
    budget: 1800,
  },
  {
    id: "trip2",
    name: "San Francisco",
    startDate: "2023-07-10",
    endDate: "2023-07-15",
    budget: 2200,
  },
];

// Mock data for recent recipes
const recentRecipes = [
  {
    id: "recipe1",
    name: "Spaghetti Carbonara",
    cuisine: "Italian",
    prepTime: "25 mins",
    image:
      "https://images.unsplash.com/photo-1600803907087-f56d462fd26b?q=80&w=1974&auto=format&fit=crop",
  },
  {
    id: "recipe2",
    name: "Chicken Tikka Masala",
    cuisine: "Indian",
    prepTime: "45 mins",
    image:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=2071&auto=format&fit=crop",
  },
];

export default function Home() {
  const [recentPurchases, setRecentPurchases] = useState<Purchase[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set isClient to true once component mounts - this ensures we only render client-specific content after hydration
    setIsClient(true);

    // Load purchases from localStorage
    const storedPurchases = localStorage.getItem("purchases");
    if (storedPurchases) {
      try {
        const allPurchases: Purchase[] = JSON.parse(storedPurchases);
        setRecentPurchases(allPurchases.slice(0, 5)); // Get 5 most recent purchases
      } catch (e) {
        console.error("Error parsing purchases:", e);
      }
    }
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Get just the next upcoming trip
  const nextTrip = upcomingTrips.length > 0 ? upcomingTrips[0] : null;

  return (
    <main className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Monthly Spending - Left column */}
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-medium">
                  Monthly Spending
                </CardTitle>
                {isClient && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      // Find the MonthlySpending component and call its handleBudgetEdit function
                      const monthlySpendingDiv = document.querySelector(
                        ".monthly-spending-component"
                      );
                      if (monthlySpendingDiv) {
                        const editBudgetEvent = new CustomEvent("editBudget");
                        monthlySpendingDiv.dispatchEvent(editBudgetEvent);
                      }
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Budget
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isClient && <MonthlySpending />}
              {!isClient && (
                <div className="py-4 text-center text-muted-foreground">
                  Loading spending data...
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column for Upcoming Trip */}
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-medium">Next Trip</CardTitle>
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>Your next planned trip</CardDescription>
            </CardHeader>
            <CardContent className="pb-0">
              {nextTrip ? (
                <div key={nextTrip.id} className="border-b pb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{nextTrip.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(nextTrip.startDate)} -{" "}
                        {formatDate(nextTrip.endDate)}
                      </p>
                    </div>
                    <p className="font-semibold">${nextTrip.budget}</p>
                  </div>
                </div>
              ) : (
                <p className="text-center py-2 text-muted-foreground">
                  No upcoming trips
                </p>
              )}
            </CardContent>
            <CardFooter className="pt-2 mt-auto">
              <Button asChild variant="ghost" className="w-full" size="sm">
                <Link href="/trip-planner">
                  Plan a Trip <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Recent Purchases - Below monthly spending with same width */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-medium">
                  Recent Purchases
                </CardTitle>
                <History className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {!isClient ? (
                  <div className="py-4 text-center text-muted-foreground">
                    Loading purchases...
                  </div>
                ) : recentPurchases.length > 0 ? (
                  recentPurchases.map((purchase) => (
                    <PurchaseItem
                      key={purchase.id}
                      purchase={purchase}
                      onClick={() => {}} // No action needed
                      hideActions={true} // Hide edit options
                    />
                  ))
                ) : (
                  <p className="text-center py-4 text-muted-foreground">
                    No purchases found
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0 pb-3">
              <Button asChild variant="outline" size="sm" className="ml-auto">
                <Link href="/purchase-history">
                  View All <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Recently Searched Recipes - On right side */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-medium">
                  Recent Recipes
                </CardTitle>
                <Utensils className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>Recently viewed recipes</CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-3">
                {recentRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="flex h-16 overflow-hidden border rounded-md"
                  >
                    <div
                      className="w-1/3 bg-cover bg-center"
                      style={{ backgroundImage: `url(${recipe.image})` }}
                    ></div>
                    <div className="w-2/3 p-2">
                      <h3 className="font-medium text-sm line-clamp-1">
                        {recipe.name}
                      </h3>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{recipe.cuisine}</span>
                        <span>{recipe.prepTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-1 pb-3">
              <Button asChild variant="ghost" size="sm" className="w-full">
                <Link href="/recipe-search">
                  Find Recipes <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}
