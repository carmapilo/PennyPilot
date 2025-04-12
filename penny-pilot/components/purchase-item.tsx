"use client"

import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface Purchase {
  id: string
  name: string
  date: string
  amount: number
  label: string
}

interface PurchaseItemProps {
  purchase: Purchase
  onClick: () => void
}

export function PurchaseItem({ purchase, onClick }: PurchaseItemProps) {
  // Map labels to colors
  const labelColors: Record<string, string> = {
    Food: "bg-orange-100 text-orange-800 hover:bg-orange-200",
    Transportation: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    Entertainment: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    Health: "bg-green-100 text-green-800 hover:bg-green-200",
  }

  const badgeClass = labelColors[purchase.label] || "bg-gray-100 text-gray-800 hover:bg-gray-200"

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-4 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="font-medium">{purchase.name}</span>
          <span className="text-sm text-muted-foreground">{format(new Date(purchase.date), "MMM d, yyyy")}</span>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={badgeClass}>
            {purchase.label}
          </Badge>
          <span className="font-semibold">${purchase.amount.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
