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
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PurchaseItem } from "@/components/purchase-item";
import { useEffect, useState } from "react";
import { Purchase } from "@/components/purchase-history";
import { Trip } from "@/lib/trip-types";
import { format, parseISO, isAfter } from "date-fns";

// Define recipe type
interface Recipe {
  id: string;
  name: string;
  instructions: string;
  createdAt: string;
  ingredients: string[];
}

export default function Home() {
  const [recentPurchases, setRecentPurchases] = useState<Purchase[]>([]);
  const [nextTrip, setNextTrip] = useState<Trip | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]);

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

    // Load trips from localStorage
    const storedTrips = localStorage.getItem("trips");
    if (storedTrips) {
      try {
        const allTrips: Trip[] = JSON.parse(storedTrips);

        // Find the next upcoming trip (trips with startDate after today)
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to beginning of today

        // Filter trips that haven't happened yet
        const upcomingTrips = allTrips.filter((trip) => {
          const tripDate = parseISO(trip.startDate);
          return isAfter(tripDate, today) || isSameDay(tripDate, today);
        });

        // Sort by startDate
        upcomingTrips.sort((a, b) => {
          return (
            parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime()
          );
        });

        // Set the next trip (first in the sorted list)
        setNextTrip(upcomingTrips.length > 0 ? upcomingTrips[0] : null);
      } catch (e) {
        console.error("Error parsing trips:", e);
      }
    }

    // Load recipes from localStorage
    const storedRecipes = localStorage.getItem("recipes");
    if (storedRecipes) {
      try {
        const allRecipes: Recipe[] = JSON.parse(storedRecipes);
        // Sort by creation date (newest first)
        allRecipes.sort((a, b) => {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
        setRecentRecipes(allRecipes.slice(0, 3)); // Get 3 most recent recipes
      } catch (e) {
        console.error("Error parsing recipes:", e);
      }
    }
  }, []);

  // Check if the date is today
  function isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

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
              {isClient && nextTrip ? (
                <div className="border-b pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{nextTrip.name}</p>
                      <div className="flex items-center text-sm text-muted-foreground mb-1">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        {nextTrip.destination}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(nextTrip.startDate), "MMM d, yyyy")}
                      </p>
                    </div>
                    <p className="font-semibold">
                      ${nextTrip.budget.toFixed(2)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-center py-2 text-muted-foreground">
                  {isClient ? "No upcoming trips" : "Loading trip data..."}
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
                {!isClient ? (
                  <div className="py-4 text-center text-muted-foreground">
                    Loading recipes...
                  </div>
                ) : recentRecipes.length > 0 ? (
                  recentRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      className="flex flex-col overflow-hidden border rounded-md p-3"
                    >
                      <div className="w-full">
                        <h3 className="font-medium text-sm line-clamp-1">
                          {recipe.name}
                        </h3>
                        <div className="text-xs text-muted-foreground mt-1">
                          <p className="line-clamp-2">{recipe.instructions}</p>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>{recipe.ingredients.length} ingredients</span>
                          <span>{formatDate(recipe.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-muted-foreground">
                    No recipes found
                  </p>
                )}
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
