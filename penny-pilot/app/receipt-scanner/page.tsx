"use client";

import type React from "react";

import { useState } from "react";
import { Camera, Upload, Check, X, Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Interface for the backend API response
interface ReceiptData {
  items: Array<{
    item: string;
    price: number;
  }>;
}

export default function ReceiptScannerPage() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [scannedData, setScannedData] = useState<ReceiptData | null>(null);
  const [purchaseData, setPurchaseData] = useState<{
    id: string;
    name: string;
    date: string;
    amount: number;
    label: string;
    store: string;
    items: Array<{ name: string; price: number }>;
  } | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string>("");
  const [editingStoreName, setEditingStoreName] = useState(false);
  const [storeName, setStoreName] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleScan = async () => {
    if (!file) return;

    setIsScanning(true);

    try {
      // Create form data to send the image
      const formData = new FormData();
      formData.append("receipt", file);

      // Send to backend API
      const response = await fetch("http://127.0.0.1:8000/test", {
        method: "POST",
        body: formData,
      });

      console.log(response);
      if (!response.ok) {
        throw new Error("Failed to scan receipt");
      }

      // Parse the response data
      const responseData = await response.json();
      console.log("API Response:", responseData); // Debug: log the raw response

      // Create receipt data with default store as Publix
      const receiptData: ReceiptData = {
        items: Array.isArray(responseData)
          ? responseData.map((item) => ({
              item: item.item,
              price: item.price,
            }))
          : [],
      };

      console.log("Receipt Data:", receiptData); // Debug: log the receipt data

      setScannedData(receiptData);
      setStoreName("Publix"); // Set default store name

      // Calculate total amount from items
      const totalAmount = receiptData.items.reduce(
        (sum, item) => sum + item.price,
        0
      );
      // Create a new purchase object
      const newPurchase = {
        id: Date.now().toString(), // Generate a unique ID
        name: "Publix", // Default store name
        date: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format
        amount: totalAmount,
        label: "", // No default label
        store: "Publix", // Default store name
        items: receiptData.items.map((item) => ({
          name: item.item,
          price: item.price,
        })),
      };

      setPurchaseData(newPurchase);
      setShowConfirmation(true);
    } catch (error) {
      console.error("Error scanning receipt:", error);
      alert("Error scanning receipt. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirm = () => {
    if (!purchaseData) return;

    // Update with the selected label and possibly edited store name
    const updatedPurchase = {
      ...purchaseData,
      label: selectedLabel,
      name: storeName,
      store: storeName,
    };

    // Save to localStorage
    const storedPurchases = localStorage.getItem("purchases");
    const purchases = storedPurchases ? JSON.parse(storedPurchases) : [];
    purchases.unshift(updatedPurchase); // Add new purchase at the beginning
    localStorage.setItem("purchases", JSON.stringify(purchases));

    // Close dialog and navigate to purchase detail
    setShowConfirmation(false);
    router.push(`/purchase/${updatedPurchase.id}`);
  };

  const handleReject = () => {
    setShowConfirmation(false);
    setScannedData(null);
    setPurchaseData(null);
  };

  return (
    <main className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Receipt Scanner</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Scan Receipt</CardTitle>
            <CardDescription>
              Take a photo or upload an image of your receipt to automatically
              extract purchase information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
                {preview ? (
                  <div className="relative w-full">
                    <img
                      src={preview || "/placeholder.svg"}
                      alt="Receipt preview"
                      className="max-h-[300px] mx-auto object-contain"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setFile(null);
                        setPreview(null);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Drag and drop a receipt image or click to upload
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="receipt-upload"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="receipt-upload">
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        asChild
                      >
                        <span>Choose File</span>
                      </Button>
                    </label>
                  </>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  className="flex-1"
                  onClick={handleScan}
                  disabled={!file || isScanning}
                >
                  {isScanning ? "Scanning..." : "Scan Receipt"}
                </Button>
                <Button
                  variant="outline"
                  className="flex gap-2"
                  onClick={() => {
                    // Create a file input with camera capture
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.capture = "environment"; // Use the rear camera

                    // Handle file selection
                    input.onchange = (e) => {
                      if (
                        e.target &&
                        e.target instanceof HTMLInputElement &&
                        e.target.files
                      ) {
                        const file = e.target.files[0];
                        if (file) {
                          // Create a synthetic event to pass to handleFileChange
                          const syntheticEvent = {
                            target: {
                              files: e.target.files,
                            },
                          } as React.ChangeEvent<HTMLInputElement>;
                          handleFileChange(syntheticEvent);
                        }
                      }
                    };

                    // Trigger the file selection dialog
                    input.click();
                  }}
                >
                  <Camera className="h-4 w-4" />
                  Take Photo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scanning Tips</CardTitle>
            <CardDescription>
              Follow these tips for the best scanning results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Make sure the receipt is on a flat surface with good lighting
              </li>
              <li>Ensure all text is clearly visible and not crumpled</li>
              <li>Avoid shadows and glare on the receipt</li>
              <li>Include the entire receipt in the frame</li>
              <li>For best results, use the app in good lighting conditions</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col z-50 w-[95vw]">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Confirm Scanned Receipt</DialogTitle>
            <DialogDescription>
              Review the scanned receipt data before saving
            </DialogDescription>
          </DialogHeader>

          {purchaseData && (
            <div className="flex-1 overflow-y-auto py-4 space-y-4 -mt-2">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="store">Store</Label>
                  {!editingStoreName ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingStoreName(true)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingStoreName(false)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {editingStoreName ? (
                  <Input
                    id="store"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                  />
                ) : (
                  <div className="p-2 border rounded-md bg-muted/50">
                    {storeName}
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={setSelectedLabel} value={selectedLabel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Transportation">
                      Transportation
                    </SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="Shopping">Shopping</SelectItem>
                    <SelectItem value="Bills">Bills</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Items</Label>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-2">Item</th>
                        <th className="text-right p-2">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseData?.items?.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">{item.name}</td>
                          <td className="text-right p-2">
                            ${item.price.toFixed(2)}
                          </td>
                        </tr>
                      )) || (
                        <tr>
                          <td colSpan={2} className="p-2 text-center">
                            No items found
                          </td>
                        </tr>
                      )}
                      <tr className="border-t bg-muted">
                        <td className="p-2 font-semibold">Total</td>
                        <td className="text-right p-2 font-semibold">
                          ${purchaseData?.amount?.toFixed(2) || "0.00"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-shrink-0 mt-4 flex justify-between sm:justify-between border-t pt-4">
            <Button type="button" variant="destructive" onClick={handleReject}>
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedLabel}
            >
              <Check className="mr-2 h-4 w-4" />
              Confirm & Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
