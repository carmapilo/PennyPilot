// Trip-related type definitions

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  description: string;
  budget: number;
  active?: boolean;
}

export interface TripEvent {
  id: string;
  tripId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  endTime: string;
  cost: number;
}

export interface ActivityRequest {
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  interests: string;
}

export interface ActivityResponse {
  events: TripEvent[];
}
