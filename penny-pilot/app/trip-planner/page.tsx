import { CalendarIcon, DollarSign, MapPin, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Mock data for trips
const trips = [
  {
    id: "1",
    name: "Summer Vacation",
    destination: "Miami, FL",
    startDate: "2023-07-15",
    endDate: "2023-07-22",
    budget: 2500,
    expenses: 1800,
  },
  {
    id: "2",
    name: "Business Conference",
    destination: "Chicago, IL",
    startDate: "2023-05-10",
    endDate: "2023-05-13",
    budget: 1200,
    expenses: 950,
  },
]

export default function TripPlannerPage() {
  return (
    <main className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trip Planner</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Trip
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trips.map((trip) => (
          <Card key={trip.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle>{trip.name}</CardTitle>
              <CardDescription className="flex items-center">
                <MapPin className="mr-1 h-4 w-4" /> {trip.destination}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex items-center text-sm mb-2">
                <CalendarIcon className="mr-1 h-4 w-4 text-muted-foreground" />
                <span>
                  {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Budget:</span>
                  <span className="font-medium">${trip.budget}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Spent:</span>
                  <span className="font-medium">${trip.expenses}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Remaining:</span>
                  <Badge
                    variant="outline"
                    className={
                      trip.budget - trip.expenses > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }
                  >
                    ${trip.budget - trip.expenses}
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-3">
              <Button variant="outline" size="sm">
                View Details
              </Button>
              <Button variant="outline" size="sm">
                <DollarSign className="mr-1 h-4 w-4" /> Add Expense
              </Button>
            </CardFooter>
          </Card>
        ))}

        {/* Add Trip Card */}
        <Card className="flex flex-col items-center justify-center p-6 border-dashed">
          <Plus className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Plan a New Trip</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Create a budget and track expenses for your next adventure
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Trip
          </Button>
        </Card>
      </div>
    </main>
  )
}
