"use client";

import { useState, useEffect } from "react";
import {
  CalendarIcon,
  DollarSign,
  MapPin,
  Plus,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import {
  format,
  addDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addWeeks,
  startOfDay,
  isSameMonth,
  isSameDay,
  parseISO,
  getWeek,
  setWeek,
} from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Trip,
  TripEvent,
  ActivityRequest,
  ActivityResponse,
} from "@/lib/trip-types";

// API client for trip services
const tripApi = {
  async suggestActivities(request: ActivityRequest): Promise<TripEvent[]> {
    try {
      const response = await fetch("/api/trip/suggest-activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: ActivityResponse = await response.json();
      return data.events;
    } catch (error) {
      console.error("Error calling suggest-activities API:", error);
      throw error;
    }
  },
};

export default function TripPlannerPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripEvents, setTripEvents] = useState<TripEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [tripName, setTripName] = useState("");
  const [destination, setDestination] = useState("");
  const [tripStartDate, setTripStartDate] = useState("");
  const [budget, setBudget] = useState("");
  const [interests, setInterests] = useState("");

  // Load data from localStorage on mount
  useEffect(() => {
    const storedTrips = localStorage.getItem("trips");
    const storedEvents = localStorage.getItem("tripEvents");

    if (storedTrips) {
      setTrips(JSON.parse(storedTrips));
    }

    if (storedEvents) {
      setTripEvents(JSON.parse(storedEvents));
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    if (trips.length > 0) {
      localStorage.setItem("trips", JSON.stringify(trips));
    }

    if (tripEvents.length > 0) {
      localStorage.setItem("tripEvents", JSON.stringify(tripEvents));
    }
  }, [trips, tripEvents]);

  // Create a new trip
  const handleCreateTrip = async () => {
    if (!tripName || !destination || !tripStartDate || !budget || !interests) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const newTrip: Trip = {
        id: `trip-${Date.now()}`,
        name: tripName,
        destination,
        startDate: tripStartDate,
        description: interests,
        budget: parseFloat(budget),
        active: true,
      };

      // Add the trip
      const updatedTrips = [...trips, newTrip];
      setTrips(updatedTrips);

      // Generate events for the trip via API
      const suggestedEvents = await tripApi.suggestActivities({
        destination,
        startDate: tripStartDate,
        budget: parseFloat(budget),
        interests,
      });

      // Update event IDs with the trip ID
      const tripEvents = suggestedEvents.map((event) => ({
        ...event,
        tripId: newTrip.id,
      }));

      setTripEvents((prev) => [...prev, ...tripEvents]);
      setDialogOpen(false);

      // Focus the calendar on the week of the trip
      setCurrentDate(parseISO(tripStartDate));

      // Reset form
      setTripName("");
      setDestination("");
      setTripStartDate("");
      setBudget("");
      setInterests("");
    } catch (error) {
      console.error("Error creating trip:", error);
      alert("Failed to create trip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle trip active status
  const toggleTripActive = (tripId: string) => {
    setTrips((prev) =>
      prev.map((trip) =>
        trip.id === tripId ? { ...trip, active: !trip.active } : trip
      )
    );
  };

  // Delete a trip
  const confirmDeleteTrip = (tripId: string) => {
    setTripToDelete(tripId);
    setDeleteDialogOpen(true);
  };

  const deleteTrip = () => {
    if (!tripToDelete) return;

    setTrips((prev) => prev.filter((trip) => trip.id !== tripToDelete));
    setTripEvents((prev) =>
      prev.filter((event) => event.tripId !== tripToDelete)
    );
    setDeleteDialogOpen(false);
    setTripToDelete(null);
  };

  // Calendar navigation
  const prevWeek = () => {
    setCurrentDate((prev) => addWeeks(prev, -1));
  };

  const nextWeek = () => {
    setCurrentDate((prev) => addWeeks(prev, 1));
  };

  // Generate weekly calendar view
  const weekStart = startOfWeek(currentDate);

  // Get active trip events
  const activeTrips = trips
    .filter((trip) => trip.active !== false)
    .map((trip) => trip.id);
  const activeEvents = tripEvents.filter((event) =>
    activeTrips.includes(event.tripId)
  );

  // Create day columns for the week
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);
    const formattedDate = format(day, "yyyy-MM-dd");
    const eventsOnDay = activeEvents.filter(
      (event) => event.date === formattedDate
    );

    // Sort events by time
    eventsOnDay.sort((a, b) => a.time.localeCompare(b.time));

    weekDays.push(
      <div
        key={formattedDate}
        className="flex-1 min-w-0 border-r last:border-r-0 border-gray-200"
      >
        <div
          className={`h-12 flex flex-col items-center justify-center border-b border-gray-200 ${
            isSameDay(day, new Date()) ? "bg-blue-50" : ""
          }`}
        >
          <div className="text-sm font-medium">{format(day, "EEE")}</div>
          <div
            className={`text-sm ${
              isSameDay(day, new Date()) ? "font-bold" : ""
            }`}
          >
            {format(day, "MMM d")}
          </div>
        </div>
        <div className="h-[calc(100%-3rem)] overflow-y-auto p-1 space-y-1">
          {eventsOnDay.map((event) => {
            // Find the parent trip for this event
            const parentTrip = trips.find((trip) => trip.id === event.tripId);

            return (
              <Popover key={event.id}>
                <PopoverTrigger asChild>
                  <div
                    className="text-xs p-2 rounded bg-blue-100 hover:bg-blue-200 cursor-pointer transition-colors"
                    style={{
                      borderLeft: `3px solid ${getTripColor(event.tripId)}`,
                    }}
                  >
                    <div className="font-medium truncate">
                      {event.time} - {event.title}
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="truncate text-[10px] text-gray-600">
                        {parentTrip?.name || "Unknown Trip"}
                      </span>
                      <span className="font-semibold">${event.cost}</span>
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-base">{event.title}</h3>
                        <p className="text-sm text-gray-500">
                          {format(parseISO(event.date), "MMMM d, yyyy")} at{" "}
                          {event.time}
                        </p>
                      </div>
                      <Badge>${event.cost}</Badge>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm">{event.description}</p>
                    </div>
                    {parentTrip && (
                      <div className="mt-4 pt-2 border-t border-gray-100">
                        <div className="flex items-center">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-gray-500" />
                          <span className="text-xs text-gray-600">
                            {parentTrip.destination}
                          </span>
                        </div>
                        <div className="text-xs font-medium mt-1">
                          Part of: {parentTrip.name}
                        </div>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            );
          })}
        </div>
      </div>
    );
  }

  // Function to get a deterministic color based on trip ID
  function getTripColor(tripId: string): string {
    const colors = [
      "#3B82F6", // blue
      "#10B981", // green
      "#F59E0B", // amber
      "#EF4444", // red
      "#8B5CF6", // purple
      "#EC4899", // pink
      "#06B6D4", // cyan
    ];

    // Generate a deterministic index based on trip ID
    let hash = 0;
    for (let i = 0; i < tripId.length; i++) {
      hash = tripId.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  // Calculate total budget and expenses for active trips
  const totalBudget = trips
    .filter((trip) => trip.active !== false)
    .reduce((sum, trip) => sum + trip.budget, 0);

  const totalExpenses = activeEvents.reduce(
    (sum, event) => sum + event.cost,
    0
  );

  return (
    <main className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trip Planner</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Trip
        </Button>
      </div>

      {/* Calendar Navigation */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold">
            Week of {format(weekStart, "MMMM d, yyyy")}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={prevWeek}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={nextWeek}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Weekly Calendar View */}
      <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white h-[600px] flex flex-col">
        <div className="flex-1 flex">{weekDays}</div>
      </div>

      {/* Trip Budget Summary */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Trip Budget Summary</CardTitle>
            <CardDescription>For all active trips</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Total Budget:
                </span>
                <span className="font-medium">${totalBudget.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Total Expenses:
                </span>
                <span className="font-medium">${totalExpenses.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Remaining:
                </span>
                <Badge
                  variant="outline"
                  className={
                    totalBudget - totalExpenses > 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  ${(totalBudget - totalExpenses).toFixed(2)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Trips List */}
      <h2 className="text-xl font-semibold mb-4">My Trips</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trips.map((trip) => (
          <Card
            key={trip.id}
            className="overflow-hidden"
            style={{
              borderTop: `3px solid ${getTripColor(trip.id)}`,
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between">
                <CardTitle>{trip.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600"
                  onClick={() => confirmDeleteTrip(trip.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription className="flex items-center">
                <MapPin className="mr-1 h-4 w-4" /> {trip.destination}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex items-center text-sm mb-2">
                <CalendarIcon className="mr-1 h-4 w-4 text-muted-foreground" />
                <span>{format(parseISO(trip.startDate), "MMMM d, yyyy")}</span>
              </div>
              <div className="mb-2 text-sm text-muted-foreground">
                <p>Interests: {trip.description}</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Budget:</span>
                  <span className="font-medium">${trip.budget.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge
                    variant="outline"
                    className={
                      trip.active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100"
                    }
                  >
                    {trip.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-3 flex gap-2">
              <Button
                variant={trip.active ? "outline" : "default"}
                size="sm"
                className="flex-1"
                onClick={() => toggleTripActive(trip.id)}
              >
                {trip.active ? "Hide from Calendar" : "Show on Calendar"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(parseISO(trip.startDate))}
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Create Trip Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Plan a New Trip</DialogTitle>
            <DialogDescription>
              Enter your trip details to get personalized recommendations.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Trip Name
              </Label>
              <Input
                id="name"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                className="col-span-3"
                placeholder="Summer Vacation"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="destination" className="text-right">
                Destination
              </Label>
              <Input
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="col-span-3"
                placeholder="Miami, FL"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Start Date
              </Label>
              <Input
                id="date"
                type="date"
                value={tripStartDate}
                onChange={(e) => setTripStartDate(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="budget" className="text-right">
                Budget ($)
              </Label>
              <Input
                id="budget"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="col-span-3"
                placeholder="1000"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="interests" className="text-right">
                Interests
              </Label>
              <Input
                id="interests"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="col-span-3"
                placeholder="Food, Culture, Outdoors, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleCreateTrip} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Trip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trip</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this trip? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteTrip}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
