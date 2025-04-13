import { NextResponse } from "next/server";
import { format, addDays, parseISO } from "date-fns";
import { ActivityRequest, TripEvent } from "@/lib/trip-types";

export async function POST(request: Request) {
  try {
    // Parse request body
    const body: ActivityRequest = await request.json();
    const { destination, startDate, budget, interests } = body;

    if (!destination || !startDate || !budget || budget <= 0) {
      return NextResponse.json(
        { error: "Missing required fields or invalid budget" },
        { status: 400 }
      );
    }

    // Generate events based on parameters
    const events = generateEvents(destination, startDate, budget, interests);

    // Simulate API delay for realism
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error in trip suggestion API:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

function generateEvents(
  destination: string,
  startDate: string,
  budget: number,
  interests: string
): TripEvent[] {
  const events: TripEvent[] = [];
  const baseDate = parseISO(startDate);

  // Generate 3-7 random events
  const eventCount = Math.floor(Math.random() * 5) + 3;
  const interestArray = interests.split(",").map((i) => i.trim().toLowerCase());

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
  while (filteredEvents.length < eventCount) {
    filteredEvents.push(...allPossibleEvents);
  }

  // Generate events over 3 days
  for (let i = 0; i < eventCount; i++) {
    const dayOffset = Math.floor(i / 3);
    const eventDate = addDays(baseDate, dayOffset);
    const eventTemplate = filteredEvents[i % filteredEvents.length];

    // Random cost variation within budget constraints
    const maxCost = Math.min((budget / eventCount) * 2, budget * 0.4);
    const costVariation = Math.random() * 0.4 - 0.2; // +/- 20%
    const cost = Math.min(
      Math.round(eventTemplate.baseCost * (1 + costVariation)),
      maxCost
    );

    // Generate a random time
    const hour = 9 + Math.floor(Math.random() * 10); // Between 9 AM and 7 PM
    const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45 minutes
    const time = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;

    events.push({
      id: `event-${i + 1}`,
      tripId: "pending", // Will be replaced with actual trip ID by the client
      title: eventTemplate.title,
      description: eventTemplate.description,
      date: format(eventDate, "yyyy-MM-dd"),
      time: time,
      cost: cost,
    });
  }

  return events;
}
