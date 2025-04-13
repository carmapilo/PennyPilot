"use client";

import { format } from "date-fns";
import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Purchase } from "./purchase-history";

interface PurchaseItemProps {
  purchase: Purchase;
  onClick: () => void;
  onLabelChange?: (id: string, newLabel: string) => void;
  isEditMode?: boolean;
  onDeleteClick?: (e: React.MouseEvent) => void;
  hideActions?: boolean;
}

export function PurchaseItem({
  purchase,
  onClick,
  onLabelChange,
  isEditMode = false,
  onDeleteClick,
  hideActions = false,
}: PurchaseItemProps) {
  const [selectedLabel, setSelectedLabel] = useState(purchase.label || "none");

  // Update selectedLabel when purchase.label changes (e.g., when a different purchase is shown)
  useEffect(() => {
    setSelectedLabel(purchase.label || "none");
  }, [purchase.label]);

  // Map labels to colors
  const labelColors: Record<string, string> = {
    Food: "bg-orange-100 text-orange-800 hover:bg-orange-200",
    Transportation: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    Entertainment: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    Health: "bg-green-100 text-green-800 hover:bg-green-200",
    Shopping: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
    Bills: "bg-red-100 text-red-800 hover:bg-red-200",
    Other: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    none: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    "": "bg-gray-100 text-gray-800 hover:bg-gray-200",
  };

  const badgeClass =
    labelColors[purchase.label || "none"] ||
    "bg-gray-100 text-gray-800 hover:bg-gray-200";

  const handleClick = (e: React.MouseEvent) => {
    if (isEditMode || hideActions) {
      e.stopPropagation();
    } else {
      onClick();
    }
  };

  const handleLabelClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card onClick
  };

  const handleLabelChange = (newLabel: string) => {
    setSelectedLabel(newLabel);
    if (onLabelChange) {
      // Convert "none" to empty string when sending to parent component
      const labelToSave = newLabel === "none" ? "" : newLabel;
      if (labelToSave !== purchase.label) {
        onLabelChange(purchase.id, labelToSave);
      }
    }
  };

  return (
    <Card
      className={`hover:shadow-md transition-shadow ${
        isEditMode || hideActions ? "" : "cursor-pointer"
      }`}
      onClick={handleClick}
    >
      <CardContent className="p-4 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="font-medium">{purchase.name}</span>
          <span className="text-sm text-muted-foreground">
            {format(new Date(purchase.date), "MMM d, yyyy")}
          </span>
        </div>

        <div
          className="flex items-center justify-end"
          style={{ minWidth: "180px" }}
        >
          {/* Simple badge for the dashboard view with no actions */}
          {hideActions ? (
            <div className="flex gap-3 items-center">
              <Badge variant="outline" className={badgeClass}>
                {purchase.label || "No Label"}
              </Badge>
              <span className="font-semibold">
                ${purchase.amount.toFixed(2)}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Width-constrained select to avoid layout shifts */}
              <div className="w-32">
                <Select
                  value={selectedLabel}
                  onValueChange={handleLabelChange}
                  disabled={!isEditMode}
                >
                  <SelectTrigger
                    className={`h-8 px-2 py-0 text-xs ${
                      isEditMode
                        ? ""
                        : "border-0 bg-transparent hover:bg-transparent focus:ring-0"
                    }`}
                    onClick={handleLabelClick}
                  >
                    <SelectValue placeholder="No Label" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Label</SelectItem>
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

              <span className="font-semibold">
                ${purchase.amount.toFixed(2)}
              </span>

              {isEditMode && onDeleteClick && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={onDeleteClick}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
