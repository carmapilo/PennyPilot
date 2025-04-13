"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Trash2, Edit, X, Check, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PurchaseItem } from "@/components/purchase-item";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Interface for Purchase type
export interface Purchase {
  id: string;
  name: string;
  date: string;
  amount: number;
  label: string;
  store?: string;
  items?: Array<{ name: string; price: number }>;
}

// Default mock data for demo purposes (will be used if localStorage is empty)
const defaultPurchases: Purchase[] = [
  {
    id: "1",
    name: "Grocery Shopping",
    date: "2023-04-10",
    amount: 78.52,
    label: "Food",
  },
  {
    id: "2",
    name: "Gas Station",
    date: "2023-04-08",
    amount: 45.0,
    label: "Transportation",
  },
  {
    id: "3",
    name: "Netflix Subscription",
    date: "2023-04-05",
    amount: 14.99,
    label: "Entertainment",
  },
  {
    id: "4",
    name: "Restaurant Dinner",
    date: "2023-04-03",
    amount: 65.3,
    label: "Food",
  },
  {
    id: "5",
    name: "Pharmacy",
    date: "2023-04-01",
    amount: 32.75,
    label: "Health",
  },
];

interface PurchaseHistoryProps {
  limit?: number;
}

export function PurchaseHistory({ limit }: PurchaseHistoryProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<Purchase | null>(
    null
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [addPurchaseOpen, setAddPurchaseOpen] = useState(false);

  // New purchase form state
  const [newPurchaseName, setNewPurchaseName] = useState("");
  const [newPurchaseDate, setNewPurchaseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [newPurchaseAmount, setNewPurchaseAmount] = useState("");
  const [newPurchaseLabel, setNewPurchaseLabel] = useState("Food");
  const [newPurchaseStore, setNewPurchaseStore] = useState("");
  const [newPurchaseItems, setNewPurchaseItems] = useState("");

  // Load purchases from localStorage on mount and update when localStorage changes
  useEffect(() => {
    const loadPurchases = () => {
      if (typeof window !== "undefined") {
        const storedPurchases = localStorage.getItem("purchases");
        if (storedPurchases) {
          try {
            setPurchases(JSON.parse(storedPurchases));
          } catch (e) {
            console.error("Error parsing purchases from localStorage:", e);
            setPurchases(defaultPurchases);
          }
        } else {
          // Use mock data if no data in localStorage
          setPurchases(defaultPurchases);
        }
      }
    };

    // Initial load
    loadPurchases();

    // Set up event listener for storage changes
    // (useful if multiple tabs are open)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "purchases") {
        loadPurchases();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const filteredPurchases = purchases.filter(
    (purchase) =>
      purchase.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (purchase.label &&
        purchase.label.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const displayPurchases = limit
    ? filteredPurchases.slice(0, limit)
    : filteredPurchases;

  const handlePurchaseClick = (id: string) => {
    // Only navigate if not in edit mode
    if (!isEditMode) {
      router.push(`/purchase/${id}`);
    }
  };

  const confirmDeletePurchase = (purchase: Purchase, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent clicking through to the purchase item
    setPurchaseToDelete(purchase);
    setDeleteConfirmOpen(true);
  };

  const deletePurchase = () => {
    if (!purchaseToDelete) return;

    // Remove the purchase from localStorage
    const storedPurchases = localStorage.getItem("purchases");
    if (storedPurchases) {
      try {
        const parsedPurchases: Purchase[] = JSON.parse(storedPurchases);
        const updatedPurchases = parsedPurchases.filter(
          (p) => p.id !== purchaseToDelete.id
        );
        localStorage.setItem("purchases", JSON.stringify(updatedPurchases));

        // Update the state
        setPurchases(updatedPurchases);
      } catch (e) {
        console.error("Error deleting purchase:", e);
      }
    }

    // Close the dialog
    setDeleteConfirmOpen(false);
    setPurchaseToDelete(null);
  };

  const handleLabelChange = (id: string, newLabel: string) => {
    // Update the purchase label in localStorage
    const storedPurchases = localStorage.getItem("purchases");
    if (storedPurchases) {
      try {
        const parsedPurchases: Purchase[] = JSON.parse(storedPurchases);
        const updatedPurchases = parsedPurchases.map((p) =>
          p.id === id ? { ...p, label: newLabel } : p
        );
        localStorage.setItem("purchases", JSON.stringify(updatedPurchases));

        // Update the state
        setPurchases(updatedPurchases);
      } catch (e) {
        console.error("Error updating purchase label:", e);
      }
    }
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const addNewPurchase = () => {
    const amount = parseFloat(newPurchaseAmount);
    if (!newPurchaseName || isNaN(amount)) return;

    // Parse items from textarea (format: item name: price)
    let parsedItems: { name: string; price: number }[] = [];
    if (newPurchaseItems.trim()) {
      // Check if input contains spaces but no newlines - treat as space-separated items
      if (!newPurchaseItems.includes("\n") && newPurchaseItems.includes(" ")) {
        parsedItems = newPurchaseItems
          .split(" ")
          .filter((item) => item.trim() && item.includes(":"))
          .map((item) => {
            const parts = item.split(":");
            const name = parts[0].trim();
            const priceText = parts.length > 1 ? parts[1].trim() : "";
            const price = priceText ? parseFloat(priceText) : 0;
            return { name, price: isNaN(price) ? 0 : price };
          });
      } else {
        // Original logic for newline-separated items
        parsedItems = newPurchaseItems
          .split("\n")
          .filter((line) => line.trim())
          .map((line) => {
            const parts = line.split(":");
            const name = parts[0].trim();
            // Handle case where price might not be included
            const priceText = parts.length > 1 ? parts[1].trim() : "";
            const price = priceText ? parseFloat(priceText) : 0;
            return { name, price: isNaN(price) ? 0 : price };
          });
      }
    }

    // Create new purchase
    const newPurchase: Purchase = {
      id: `purchase-${Date.now()}`,
      name: newPurchaseName,
      date: newPurchaseDate,
      amount: amount,
      label: newPurchaseLabel,
      store: newPurchaseStore || undefined,
      items: parsedItems.length > 0 ? parsedItems : undefined,
    };

    // Add to purchases list
    const updatedPurchases = [newPurchase, ...purchases];
    setPurchases(updatedPurchases);
    localStorage.setItem("purchases", JSON.stringify(updatedPurchases));

    // Clear form and close dialog
    resetNewPurchaseForm();
    setAddPurchaseOpen(false);
  };

  const resetNewPurchaseForm = () => {
    setNewPurchaseName("");
    setNewPurchaseDate(new Date().toISOString().split("T")[0]);
    setNewPurchaseAmount("");
    setNewPurchaseLabel("Food");
    setNewPurchaseStore("");
    setNewPurchaseItems("");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="relative flex-1 mr-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search purchases..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAddPurchaseOpen(true)}
            className="flex items-center gap-1.5"
          >
            <PlusCircle className="h-4 w-4" />
            Add Purchase
          </Button>
          <Button
            variant={isEditMode ? "destructive" : "outline"}
            size="sm"
            onClick={toggleEditMode}
            className="flex items-center gap-1.5"
          >
            {isEditMode ? (
              <>
                <X className="h-4 w-4" />
                Done
              </>
            ) : (
              <>
                <Edit className="h-4 w-4" />
                Edit
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {displayPurchases.length > 0 ? (
          displayPurchases.map((purchase) => (
            <div key={purchase.id} className="relative">
              <PurchaseItem
                purchase={purchase}
                onClick={() => handlePurchaseClick(purchase.id)}
                onLabelChange={handleLabelChange}
                isEditMode={isEditMode}
                onDeleteClick={(e) => confirmDeletePurchase(purchase, e)}
              />
            </div>
          ))
        ) : (
          <p className="text-center py-8 text-muted-foreground">
            No purchases found
          </p>
        )}
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Purchase</AlertDialogTitle>
            <AlertDialogDescription>
              {purchaseToDelete && (
                <>
                  Are you sure you want to delete{" "}
                  <strong>"{purchaseToDelete.name}"</strong> from{" "}
                  <strong>
                    {format(new Date(purchaseToDelete.date), "MMMM d, yyyy")}
                  </strong>
                  ?<div className="mt-1">This action cannot be undone.</div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deletePurchase}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={addPurchaseOpen} onOpenChange={setAddPurchaseOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Purchase</DialogTitle>
            <DialogDescription>
              Enter the details of your purchase below.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Purchase Name</Label>
              <Input
                id="name"
                placeholder="Grocery Shopping"
                value={newPurchaseName}
                onChange={(e) => setNewPurchaseName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newPurchaseDate}
                  onChange={(e) => setNewPurchaseDate(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={newPurchaseAmount}
                  onChange={(e) => setNewPurchaseAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="label">Category</Label>
                <Select
                  value={newPurchaseLabel}
                  onValueChange={setNewPurchaseLabel}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Transportation">
                        Transportation
                      </SelectItem>
                      <SelectItem value="Entertainment">
                        Entertainment
                      </SelectItem>
                      <SelectItem value="Health">Health</SelectItem>
                      <SelectItem value="Shopping">Shopping</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="store">Store (Optional)</Label>
                <Input
                  id="store"
                  placeholder="Store name"
                  value={newPurchaseStore}
                  onChange={(e) => setNewPurchaseStore(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="items">
                Items (Optional, one per line: item name: price)
              </Label>
              <Textarea
                id="items"
                placeholder="Apples: 3.99&#10;Bread: 4.50&#10;Milk: 2.99"
                value={newPurchaseItems}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setNewPurchaseItems(e.target.value)
                }
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddPurchaseOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addNewPurchase}>Add Purchase</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
