"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { PurchaseItem } from "@/components/purchase-item"

// Mock data for purchase history
const purchases = [
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
]

interface PurchaseHistoryProps {
  limit?: number
}

export function PurchaseHistory({ limit }: PurchaseHistoryProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPurchases = purchases.filter(
    (purchase) =>
      purchase.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.label.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const displayPurchases = limit ? filteredPurchases.slice(0, limit) : filteredPurchases

  const handlePurchaseClick = (id: string) => {
    router.push(`/purchase/${id}`)
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search purchases..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        {displayPurchases.length > 0 ? (
          displayPurchases.map((purchase) => (
            <PurchaseItem key={purchase.id} purchase={purchase} onClick={() => handlePurchaseClick(purchase.id)} />
          ))
        ) : (
          <p className="text-center py-8 text-muted-foreground">No purchases found</p>
        )}
      </div>
    </div>
  )
}
