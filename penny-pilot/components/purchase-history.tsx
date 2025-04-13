"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Trash2, Edit, X, Check } from "lucide-react";
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
      purchase.label.toLowerCase().includes(searchQuery.toLowerCase())
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

      <div className="space-y-2">
        {displayPurchases.length > 0 ? (
          displayPurchases.map((purchase) => (
            <div key={purchase.id} className="relative group">
              <PurchaseItem
                purchase={purchase}
                onClick={() => handlePurchaseClick(purchase.id)}
                onLabelChange={handleLabelChange}
                isEditMode={isEditMode}
              />
              {isEditMode && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 transition-opacity"
                  onClick={(e) => confirmDeletePurchase(purchase, e)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
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
    </div>
  );
}
