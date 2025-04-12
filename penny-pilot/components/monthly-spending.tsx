"use client"

import { useEffect, useState } from "react"
import { ArrowDown, ArrowUp } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function MonthlySpending() {
  const [progress, setProgress] = useState(0)

  // Mock data
  const currentSpending = 1250
  const budget = 2000
  const percentageSpent = (currentSpending / budget) * 100
  const previousMonthSpending = 1350
  const percentChange = ((currentSpending - previousMonthSpending) / previousMonthSpending) * 100
  const isIncrease = currentSpending > previousMonthSpending

  useEffect(() => {
    const timer = setTimeout(() => setProgress(percentageSpent), 500)
    return () => clearTimeout(timer)
  }, [percentageSpent])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Monthly Spending</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-end mb-2">
          <div>
            <span className="text-3xl font-bold">${currentSpending.toLocaleString()}</span>
            <span className="text-muted-foreground ml-2">/ ${budget.toLocaleString()}</span>
          </div>
          <div className={`flex items-center ${isIncrease ? "text-red-500" : "text-green-500"}`}>
            {isIncrease ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
            <span className="text-sm font-medium">{Math.abs(percentChange).toFixed(1)}%</span>
            <span className="text-xs text-muted-foreground ml-1">vs last month</span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">{(budget - currentSpending).toLocaleString()} remaining</p>
      </CardContent>
    </Card>
  )
}
