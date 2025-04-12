"use client";

import { format } from "date-fns";
import { useState } from "react";
import { Edit2, Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
}

export function PurchaseItem({
  purchase,
  onClick,
  onLabelChange,
  isEditMode = false,
}: PurchaseItemProps) {
  const [isLabelPopoverOpen, setIsLabelPopoverOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(purchase.label);

  // Map labels to colors
  const labelColors: Record<string, string> = {
    Food: "bg-orange-100 text-orange-800 hover:bg-orange-200",
    Transportation: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    Entertainment: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    Health: "bg-green-100 text-green-800 hover:bg-green-200",
    Shopping: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
    Bills: "bg-red-100 text-red-800 hover:bg-red-200",
    Other: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    "": "bg-gray-100 text-gray-800 hover:bg-gray-200",
  };

  const badgeClass =
    labelColors[purchase.label] ||
    "bg-gray-100 text-gray-800 hover:bg-gray-200";

  const handleLabelClick = (e: React.MouseEvent) => {
    if (isEditMode) {
      e.stopPropagation(); // Prevent triggering the card onClick
    }
  };

  const handleLabelChange = () => {
    if (onLabelChange && selectedLabel !== purchase.label) {
      onLabelChange(purchase.id, selectedLabel);
    }
    setIsLabelPopoverOpen(false);
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-4 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="font-medium">{purchase.name}</span>
          <span className="text-sm text-muted-foreground">
            {format(new Date(purchase.date), "MMM d, yyyy")}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Popover
            open={isLabelPopoverOpen}
            onOpenChange={setIsLabelPopoverOpen}
          >
            <PopoverTrigger asChild onClick={handleLabelClick}>
              <div className="flex items-center gap-1 cursor-pointer">
                <Badge variant="outline" className={badgeClass}>
                  {purchase.label || "No Label"}
                </Badge>
                <Edit2 className="h-3 w-3 text-muted-foreground" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-3" align="end">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Edit Category</h4>
                <Select value={selectedLabel} onValueChange={setSelectedLabel}>
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
                <Button
                  className="w-full"
                  size="sm"
                  onClick={handleLabelChange}
                >
                  <Check className="mr-1 h-3 w-3" /> Save
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <span className="font-semibold">${purchase.amount.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
