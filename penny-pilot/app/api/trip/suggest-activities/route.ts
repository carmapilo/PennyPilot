import { NextResponse } from "next/server";
import { format, addDays, parseISO, differenceInDays } from "date-fns";
import { ActivityRequest } from "@/lib/trip-types";

export async function POST(request: Request) {
  try {
    // Parse request body
    const body: ActivityRequest = await request.json();
    const { destination, startDate, endDate, budget, interests = "" } = body;

    if (!destination || !startDate || !endDate || !budget || budget <= 0) {
      return NextResponse.json(
        { error: "Missing required fields or invalid budget" },
        { status: 400 }
      );
    }

    // Generate events based on parameters
    const mockActivities = generateMockActivities(
      destination,
      startDate,
      endDate,
      budget,
      interests || ""
    );

    // Simulate API delay for realism
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Return the array directly as expected by the client
    return NextResponse.json(mockActivities);
  } catch (error) {
    console.error("Error in trip suggestion API:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

// Interface to match what the client expects
interface MockActivity {
  location: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  approximate_cost: number;
}

function generateMockActivities(
  destination: string,
  startDate: string,
  endDate: string,
  budget: number,
  interests: string = ""
): MockActivity[] {
  const activities: MockActivity[] = [];
  const baseDate = parseISO(startDate);
  const lastDate = parseISO(endDate);

  // Calculate trip duration in days (at least 1)
  const tripDuration = Math.max(1, differenceInDays(lastDate, baseDate) + 1);

  // Distribute events across the entire trip duration
  // Calculate how many events to generate based on trip duration and budget
  const minEventsPerDay = 1;
  const maxEventsPerDay = 3;
  const totalEvents = Math.min(
    // Calculate reasonable number of events based on trip duration
    Math.floor(
      tripDuration *
        (Math.random() * (maxEventsPerDay - minEventsPerDay) + minEventsPerDay)
    ),
    // Ensure we don't generate too many low-cost events that would make no sense
    Math.floor(budget / 10) + 1
  );

  // Safely parse interests string, provide empty array as fallback
  const interestArray =
    interests && typeof interests === "string"
      ? interests.split(",").map((i) => i.trim().toLowerCase())
      : [];

  const possibleEvents = [
    {
      title: "Local Museum Visit",
      description: "Explore local history and culture",
      baseCost: 15,
      category: "culture",
    },
    {
      title: "Scenic Hiking Trail",
      description: "Experience natural beauty",
      baseCost: 0,
      category: "outdoor",
    },
    {
      title: "Food Tour",
      description: "Taste local cuisine",
      baseCost: 35,
      category: "food",
    },
    {
      title: "Landmark Tour",
      description: "Visit famous landmarks",
      baseCost: 25,
      category: "sightseeing",
    },
    {
      title: "Beach Day",
      description: "Relax by the ocean",
      baseCost: 5,
      category: "leisure",
    },
    {
      title: "Nightlife Experience",
      description: "Explore bars and clubs",
      baseCost: 50,
      category: "nightlife",
    },
    {
      title: "Local Market",
      description: "Shop for souvenirs and local goods",
      baseCost: 10,
      category: "shopping",
    },
    {
      title: "Concert or Show",
      description: "Enjoy local entertainment",
      baseCost: 40,
      category: "entertainment",
    },
    {
      title: "Historical Site",
      description: "Visit important historical locations",
      baseCost: 20,
      category: "culture",
    },
    {
      title: "Outdoor Adventure",
      description: "Exciting outdoor activities",
      baseCost: 45,
      category: "outdoor",
    },
  ];

  // Destination-specific events
  const destinationLower = destination.toLowerCase();
  let locationEvents: typeof possibleEvents = [];

  if (
    destinationLower.includes("miami") ||
    destinationLower.includes("beach")
  ) {
    locationEvents = [
      {
        title: "Beach Day",
        description: "Relax on the famous beaches",
        baseCost: 0,
        category: "leisure",
      },
      {
        title: "Art Deco Tour",
        description: "Explore Miami's unique architecture",
        baseCost: 25,
        category: "culture",
      },
      {
        title: "Everglades Tour",
        description: "Wildlife and nature experience",
        baseCost: 45,
        category: "outdoor",
      },
    ];
  } else if (
    destinationLower.includes("new york") ||
    destinationLower.includes("nyc")
  ) {
    locationEvents = [
      {
        title: "Broadway Show",
        description: "World-class theater experience",
        baseCost: 120,
        category: "entertainment",
      },
      {
        title: "Central Park Exploration",
        description: "Urban greenspace in the heart of NYC",
        baseCost: 0,
        category: "outdoor",
      },
      {
        title: "Museum of Modern Art",
        description: "World-famous art collection",
        baseCost: 25,
        category: "culture",
      },
    ];
  } else if (destinationLower.includes("las vegas")) {
    locationEvents = [
      {
        title: "Casino Night",
        description: "Try your luck at the tables",
        baseCost: 100,
        category: "entertainment",
      },
      {
        title: "Grand Canyon Helicopter Tour",
        description: "Breathtaking aerial views",
        baseCost: 300,
        category: "outdoor",
      },
      {
        title: "Magic Show",
        description: "World-class illusionists",
        baseCost: 85,
        category: "entertainment",
      },
    ];
  }

  // Combine location-specific events with general possibilities
  let allPossibleEvents = [...possibleEvents];
  if (locationEvents.length > 0) {
    allPossibleEvents = [...locationEvents, ...possibleEvents];
  }

  // Filter by interests if provided
  let filteredEvents = [...allPossibleEvents];

  if (interestArray.length > 0 && interests.trim() !== "") {
    filteredEvents = allPossibleEvents.filter((event) =>
      interestArray.some(
        (interest) =>
          event.description.toLowerCase().includes(interest) ||
          event.category.includes(interest)
      )
    );

    // If no matches, fall back to all events
    if (filteredEvents.length === 0) {
      filteredEvents = [...allPossibleEvents];
    }
  }

  // Ensure we have enough events
  while (filteredEvents.length < totalEvents) {
    filteredEvents.push(...allPossibleEvents);
  }

  // Generate events spread across the trip duration
  for (let i = 0; i < totalEvents; i++) {
    // Distribute events evenly across the trip duration
    const dayOffset = Math.floor((i / totalEvents) * tripDuration);
    const eventDate = addDays(baseDate, dayOffset);

    // Make sure event date doesn't exceed the end date
    if (differenceInDays(eventDate, lastDate) > 0) {
      continue;
    }

    const eventTemplate = filteredEvents[i % filteredEvents.length];

    // Random cost variation within budget constraints
    const maxCost = Math.min((budget / totalEvents) * 2, budget * 0.4);
    const costVariation = Math.random() * 0.4 - 0.2; // +/- 20%
    const cost = Math.min(
      Math.round(eventTemplate.baseCost * (1 + costVariation)),
      maxCost
    );

    // Generate a random time in 24-hour format
    const hour = Math.floor(Math.random() * 24); // 0-23 hours
    const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45 minutes
    const start_time = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;

    // Generate end time (1-2 hours after start time)
    const durationHours = 1 + Math.floor(Math.random() * 2); // 1 or 2 hours
    const endHour = (hour + durationHours) % 24;
    const end_time = `${endHour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;

    activities.push({
      location: eventTemplate.title,
      description: eventTemplate.description,
      date: format(eventDate, "yyyy-MM-dd"),
      start_time: start_time,
      end_time: end_time,
      approximate_cost: cost,
    });
  }

  return activities;
}
