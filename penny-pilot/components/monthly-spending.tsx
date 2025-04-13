"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowDown, ArrowUp, Edit, Check } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { Purchase } from "./purchase-history";

export function MonthlySpending() {
  const [progress, setProgress] = useState(0);
  const [currentSpending, setCurrentSpending] = useState(0);
  const [budget, setBudget] = useState(2000); // Default budget
  const [percentageSpent, setPercentageSpent] = useState(0);
  const [previousMonthSpending, setPreviousMonthSpending] = useState(0);
  const [percentChange, setPercentChange] = useState(0);
  const [isIncrease, setIsIncrease] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [spendingByLabel, setSpendingByLabel] = useState<
    Record<string, number>
  >({});
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);

    // Load budget from localStorage
    const storedBudget = localStorage.getItem("monthlyBudget");
    if (storedBudget) {
      const parsedBudget = parseFloat(storedBudget);
      if (!isNaN(parsedBudget)) {
        setBudget(parsedBudget);
        setBudgetInput(parsedBudget.toString());
      }
    }

    // Listen for external edit budget event
    const handleEditBudgetEvent = () => {
      handleBudgetEdit();
    };

    const currentRef = componentRef.current;
    if (currentRef) {
      currentRef.addEventListener("editBudget", handleEditBudgetEvent);
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener("editBudget", handleEditBudgetEvent);
      }
    };
  }, []);

  useEffect(() => {
    // Only calculate spending after the component has mounted
    if (!isMounted) return;

    // Calculate spending from purchase history
    const storedPurchases = localStorage.getItem("purchases");
    if (storedPurchases) {
      try {
        const parsedPurchases: Purchase[] = JSON.parse(storedPurchases);

        // Get current month purchases
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const currentMonthPurchases = parsedPurchases.filter((purchase) => {
          const purchaseDate = new Date(purchase.date);
          return (
            purchaseDate.getMonth() === currentMonth &&
            purchaseDate.getFullYear() === currentYear
          );
        });

        // Calculate total spending for current month
        const totalSpending = currentMonthPurchases.reduce(
          (sum, purchase) => sum + purchase.amount,
          0
        );
        setCurrentSpending(totalSpending);

        // Calculate spending by label
        const labelSpending: Record<string, number> = {};
        currentMonthPurchases.forEach((purchase) => {
          const label = purchase.label || "Uncategorized";
          labelSpending[label] = (labelSpending[label] || 0) + purchase.amount;
        });
        setSpendingByLabel(labelSpending);

        // Calculate percentage spent
        const percentage = (totalSpending / budget) * 100;
        setPercentageSpent(percentage);

        // Get previous month purchases
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevMonthYear =
          currentMonth === 0 ? currentYear - 1 : currentYear;

        const prevMonthPurchases = parsedPurchases.filter((purchase) => {
          const purchaseDate = new Date(purchase.date);
          return (
            purchaseDate.getMonth() === prevMonth &&
            purchaseDate.getFullYear() === prevMonthYear
          );
        });

        // Calculate total spending for previous month
        const prevTotalSpending = prevMonthPurchases.reduce(
          (sum, purchase) => sum + purchase.amount,
          0
        );
        setPreviousMonthSpending(prevTotalSpending);

        // Calculate percent change
        if (prevTotalSpending > 0) {
          const change =
            ((totalSpending - prevTotalSpending) / prevTotalSpending) * 100;
          setPercentChange(change);
          setIsIncrease(totalSpending > prevTotalSpending);
        } else {
          setPercentChange(0);
          setIsIncrease(false);
        }
      } catch (e) {
        console.error("Error parsing purchases:", e);
      }
    }
  }, [budget, isMounted]);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(percentageSpent), 500);
    return () => clearTimeout(timer);
  }, [percentageSpent]);

  const handleBudgetEdit = () => {
    setIsEditingBudget(true);
    setBudgetInput(budget.toString());
  };

  const handleBudgetSave = () => {
    const newBudget = parseFloat(budgetInput);
    if (!isNaN(newBudget) && newBudget > 0) {
      setBudget(newBudget);
      localStorage.setItem("monthlyBudget", newBudget.toString());
    } else {
      setBudgetInput(budget.toString());
    }
    setIsEditingBudget(false);
  };

  // Determine progress color based on percentage spent
  const getProgressColor = () => {
    if (percentageSpent >= 100) return "bg-red-500"; // Over budget
    if (percentageSpent >= 85) return "bg-yellow-500"; // Close to budget
    return "bg-green-500"; // Well under budget
  };

  // Determine text color for remaining amount
  const getRemainingColor = () => {
    if (percentageSpent >= 100) return "text-red-500";
    if (percentageSpent >= 85) return "text-yellow-500";
    return "text-green-500";
  };

  // Get label color from the common mapping
  const getLabelColor = (label: string) => {
    const labelColors: Record<string, string> = {
      Food: "text-orange-500",
      Transportation: "text-blue-500",
      Entertainment: "text-purple-500",
      Health: "text-green-500",
      Shopping: "text-pink-500",
      Utilities: "text-indigo-500",
      Other: "text-gray-500",
      Uncategorized: "text-gray-500",
    };

    return labelColors[label] || "text-gray-500";
  };

  return (
    <div ref={componentRef} className="monthly-spending-component flex gap-6">
      <div className="w-2/3">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-3xl font-bold">
              ${currentSpending.toLocaleString()}
            </span>
            {isEditingBudget ? (
              <div className="mt-2">
                <Label htmlFor="budget">Monthly Budget</Label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm">$</span>
                  <Input
                    id="budget"
                    type="number"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    className="max-w-[120px]"
                  />
                </div>
              </div>
            ) : (
              <span className="text-muted-foreground ml-2">
                / ${budget.toLocaleString()}
              </span>
            )}
          </div>

          {/* Move the edit budget button to the card header in page.tsx */}
          {isEditingBudget && (
            <Button size="sm" variant="outline" onClick={handleBudgetSave}>
              <Check className="h-4 w-4 mr-1" /> Save
            </Button>
          )}

          {previousMonthSpending > 0 && !isEditingBudget && (
            <div
              className={`flex items-center ${
                isIncrease ? "text-red-500" : "text-green-500"
              }`}
            >
              {isIncrease ? (
                <ArrowUp className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 mr-1" />
              )}
              <span className="text-sm font-medium">
                {Math.abs(percentChange).toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                vs last month
              </span>
            </div>
          )}
        </div>
        <Progress value={progress} className={`h-2 ${getProgressColor()}`} />
        <div className="flex justify-between mt-2">
          <p className={`text-xs ${getRemainingColor()} font-medium`}>
            {budget - currentSpending > 0
              ? `$${(budget - currentSpending).toLocaleString()} remaining`
              : `$${(currentSpending - budget).toLocaleString()} over budget`}
          </p>
          <p className="text-xs text-muted-foreground">
            {percentageSpent.toFixed(0)}% used
          </p>
        </div>
      </div>

      <div className="w-1/3 border-l pl-6">
        <h3 className="text-sm font-medium mb-2">Spending by Category</h3>
        {Object.keys(spendingByLabel).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(spendingByLabel)
              .sort(([, amountA], [, amountB]) => amountB - amountA)
              .map(([label, amount]) => (
                <div key={label} className="flex justify-between">
                  <span
                    className={`text-sm font-medium ${getLabelColor(label)}`}
                  >
                    {label}:
                  </span>
                  <span className="text-sm">${amount.toFixed(2)}</span>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No data available</p>
        )}
      </div>
    </div>
  );
}
