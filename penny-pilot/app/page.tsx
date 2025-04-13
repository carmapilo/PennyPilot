import { MonthlySpending } from "@/components/monthly-spending";
import { PurchaseHistory } from "@/components/purchase-history";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <MonthlySpending />
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Purchases</h2>
        <PurchaseHistory limit={5} />
      </div>
    </main>
  );
}
