"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowUp, ArrowDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Purchase } from "@/components/purchase-history";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  format,
  startOfMonth,
  subMonths,
  isWithinInterval,
  parseISO,
} from "date-fns";

// Mock data for purchase details - will be used as fallback
const purchaseDetails = {
  "1": {
    id: "1",
    name: "Grocery Shopping",
    date: "2023-04-10",
    amount: 78.52,
    label: "Food",
    store: "Whole Foods Market",
    items: [
      { name: "Organic Bananas", price: 3.99 },
      { name: "Whole Grain Bread", price: 4.5 },
      { name: "Free Range Eggs", price: 5.99 },
      { name: "Almond Milk", price: 3.49 },
      { name: "Chicken Breast", price: 12.99 },
      { name: "Spinach", price: 3.99 },
      { name: "Tomatoes", price: 4.99 },
      { name: "Pasta", price: 2.99 },
      { name: "Pasta Sauce", price: 3.99 },
      { name: "Cheese", price: 6.99 },
      { name: "Yogurt", price: 4.99 },
      { name: "Apples", price: 5.99 },
      { name: "Cereal", price: 4.99 },
      { name: "Coffee", price: 8.99 },
    ],
  },
  "2": {
    id: "2",
    name: "Gas Station",
    date: "2023-04-08",
    amount: 45.0,
    label: "Transportation",
    store: "Shell Gas Station",
    items: [{ name: "Regular Unleaded Gasoline (10.5 gallons)", price: 45.0 }],
  },
  "3": {
    id: "3",
    name: "Netflix Subscription",
    date: "2023-04-05",
    amount: 14.99,
    label: "Entertainment",
    store: "Netflix",
    items: [{ name: "Monthly Subscription - Standard Plan", price: 14.99 }],
  },
  "4": {
    id: "4",
    name: "Restaurant Dinner",
    date: "2023-04-03",
    amount: 65.3,
    label: "Food",
    store: "Olive Garden",
    items: [
      { name: "Fettuccine Alfredo", price: 18.99 },
      { name: "Chicken Parmesan", price: 21.99 },
      { name: "Breadsticks", price: 0.0 },
      { name: "Caesar Salad", price: 8.99 },
      { name: "Tiramisu", price: 7.99 },
      { name: "Soft Drinks (2)", price: 5.98 },
      { name: "Tax & Tip", price: 11.36 },
    ],
  },
  "5": {
    id: "5",
    name: "Pharmacy",
    date: "2023-04-01",
    amount: 32.75,
    label: "Health",
    store: "CVS Pharmacy",
    items: [
      { name: "Prescription Medication", price: 15.0 },
      { name: "Multivitamins", price: 9.99 },
      { name: "Pain Reliever", price: 7.76 },
    ],
  },
};

// Map labels to colors
const labelColors: Record<string, string> = {
  Food: "bg-orange-100 text-orange-800",
  Transportation: "bg-blue-100 text-blue-800",
  Entertainment: "bg-purple-100 text-purple-800",
  Health: "bg-green-100 text-green-800",
};

export default function PurchaseDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const purchaseId = Array.isArray(id) ? id[0] : id;
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [allPurchases, setAllPurchases] = useState<Purchase[]>([]);
  const [storeTotals, setStoreTotals] = useState<{
    currentMonth: number;
    previousMonth: number;
    twoMonthsAgo: number;
  }>({ currentMonth: 0, previousMonth: 0, twoMonthsAgo: 0 });
  const [categoryTotals, setCategoryTotals] = useState<{
    currentMonth: number;
    previousMonth: number;
    twoMonthsAgo: number;
  }>({ currentMonth: 0, previousMonth: 0, twoMonthsAgo: 0 });

  // Load purchases from localStorage on mount and update when localStorage changes
  useEffect(() => {
    if (typeof window !== "undefined" && purchaseId) {
      const loadFromLocalStorage = () => {
        // Try to find the purchase in localStorage
        const storedPurchases = localStorage.getItem("purchases");

        if (storedPurchases) {
          try {
            const parsedPurchases: Purchase[] = JSON.parse(storedPurchases);
            setAllPurchases(parsedPurchases);

            const foundPurchase = parsedPurchases.find(
              (p) => p.id === purchaseId
            );

            if (foundPurchase) {
              setPurchase(foundPurchase);
              setLoading(false);
              return true; // Indicate purchase was found
            }
          } catch (e) {
            console.error("Error parsing purchases from localStorage:", e);
          }
        }
        return false; // Indicate purchase was not found
      };

      // First try to load from localStorage
      const found = loadFromLocalStorage();

      // If not found in localStorage, use the mock data as a fallback
      if (!found) {
        // @ts-ignore - This is just mock data
        const mockPurchase = purchaseDetails[purchaseId];
        if (mockPurchase) {
          setPurchase(mockPurchase);
        }
        setLoading(false);
      }

      // Listen for storage changes
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === "purchases") {
          loadFromLocalStorage();
        }
      };

      window.addEventListener("storage", handleStorageChange);
      return () => {
        window.removeEventListener("storage", handleStorageChange);
      };
    }
  }, [purchaseId]);

  // Calculate spending analytics for the store and category
  useEffect(() => {
    if (purchase && purchase.store && allPurchases.length > 0) {
      const now = new Date();
      const currentMonth = startOfMonth(now);
      const previousMonth = startOfMonth(subMonths(now, 1));
      const twoMonthsAgo = startOfMonth(subMonths(now, 2));

      // Filter purchases by store and time periods
      const storeCurrentMonth = allPurchases
        .filter(
          (p) =>
            p.store === purchase.store &&
            isWithinInterval(parseISO(p.date), {
              start: currentMonth,
              end: now,
            })
        )
        .reduce((sum, p) => sum + p.amount, 0);

      const storePreviousMonth = allPurchases
        .filter(
          (p) =>
            p.store === purchase.store &&
            isWithinInterval(parseISO(p.date), {
              start: previousMonth,
              end: currentMonth,
            })
        )
        .reduce((sum, p) => sum + p.amount, 0);

      const storeTwoMonthsAgo = allPurchases
        .filter(
          (p) =>
            p.store === purchase.store &&
            isWithinInterval(parseISO(p.date), {
              start: twoMonthsAgo,
              end: previousMonth,
            })
        )
        .reduce((sum, p) => sum + p.amount, 0);

      setStoreTotals({
        currentMonth: storeCurrentMonth,
        previousMonth: storePreviousMonth,
        twoMonthsAgo: storeTwoMonthsAgo,
      });

      // Filter purchases by category and time periods
      const categoryCurrentMonth = allPurchases
        .filter(
          (p) =>
            p.label === purchase.label &&
            isWithinInterval(parseISO(p.date), {
              start: currentMonth,
              end: now,
            })
        )
        .reduce((sum, p) => sum + p.amount, 0);

      const categoryPreviousMonth = allPurchases
        .filter(
          (p) =>
            p.label === purchase.label &&
            isWithinInterval(parseISO(p.date), {
              start: previousMonth,
              end: currentMonth,
            })
        )
        .reduce((sum, p) => sum + p.amount, 0);

      const categoryTwoMonthsAgo = allPurchases
        .filter(
          (p) =>
            p.label === purchase.label &&
            isWithinInterval(parseISO(p.date), {
              start: twoMonthsAgo,
              end: previousMonth,
            })
        )
        .reduce((sum, p) => sum + p.amount, 0);

      setCategoryTotals({
        currentMonth: categoryCurrentMonth,
        previousMonth: categoryPreviousMonth,
        twoMonthsAgo: categoryTwoMonthsAgo,
      });
    }
  }, [purchase, allPurchases]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <p className="text-center py-8">Loading purchase details...</p>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <p className="text-center py-8">Purchase not found</p>
      </div>
    );
  }

  const badgeClass = labelColors[purchase.label] || "bg-gray-100 text-gray-800";
  const formattedDate = new Date(purchase.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const currentMonthName = format(new Date(), "MMMM yyyy");
  const previousMonthName = format(subMonths(new Date(), 1), "MMMM yyyy");
  const twoMonthsAgoName = format(subMonths(new Date(), 2), "MMMM yyyy");

  return (
    <div className="container mx-auto px-4 py-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{purchase.name}</CardTitle>
                <p className="text-muted-foreground">{formattedDate}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-2xl font-bold">
                  ${purchase.amount.toFixed(2)}
                </span>
                <Badge className={badgeClass}>{purchase.label}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="details">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Store</h3>
                  <p>{purchase.store}</p>
                </div>

                <h3 className="font-semibold mb-2">Items</h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-2">Item</th>
                        <th className="text-right p-2">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchase.items?.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">{item.name}</td>
                          <td className="text-right p-2">
                            ${item.price.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t bg-muted">
                        <td className="p-2 font-semibold">Total</td>
                        <td className="text-right p-2 font-semibold">
                          ${purchase.amount.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="analysis">
                <div className="space-y-6">
                  {purchase.store && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Spending at {purchase.store}
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <Card>
                          <CardHeader className="py-3">
                            <CardTitle className="text-sm">
                              {twoMonthsAgoName}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-2xl font-bold">
                              ${storeTotals.twoMonthsAgo.toFixed(2)}
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="py-3">
                            <CardTitle className="text-sm">
                              {previousMonthName}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-2xl font-bold">
                              ${storeTotals.previousMonth.toFixed(2)}
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="py-3">
                            <CardTitle className="text-sm">
                              {currentMonthName}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center">
                              <p className="text-2xl font-bold">
                                ${storeTotals.currentMonth.toFixed(2)}
                              </p>
                              {storeTotals.currentMonth >
                              storeTotals.previousMonth ? (
                                <ArrowUp className="ml-2 h-5 w-5 text-red-500" />
                              ) : storeTotals.currentMonth <
                                storeTotals.previousMonth ? (
                                <ArrowDown className="ml-2 h-5 w-5 text-green-500" />
                              ) : null}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Spending on {purchase.label}
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm">
                            {twoMonthsAgoName}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">
                            ${categoryTotals.twoMonthsAgo.toFixed(2)}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm">
                            {previousMonthName}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">
                            ${categoryTotals.previousMonth.toFixed(2)}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm">
                            {currentMonthName}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center">
                            <p className="text-2xl font-bold">
                              ${categoryTotals.currentMonth.toFixed(2)}
                            </p>
                            {categoryTotals.currentMonth >
                            categoryTotals.previousMonth ? (
                              <ArrowUp className="ml-2 h-5 w-5 text-red-500" />
                            ) : categoryTotals.currentMonth <
                              categoryTotals.previousMonth ? (
                              <ArrowDown className="ml-2 h-5 w-5 text-green-500" />
                            ) : null}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
