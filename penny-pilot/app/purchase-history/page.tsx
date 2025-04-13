import { PurchaseHistory } from "@/components/purchase-history"

export default function PurchaseHistoryPage() {
  return (
    <main className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Purchase History</h1>
      <PurchaseHistory />
    </main>
  )
}
