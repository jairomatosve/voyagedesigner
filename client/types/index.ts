export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  preferredLanguage: string;
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  currency: string;
  description?: string;
  status: "planning" | "ongoing" | "completed";
  createdAt: string;
  imageUrl?: string;
}

export interface TripPreferences {
  tripId: string;
  interests: string[];
  travelPace: "relaxed" | "moderate" | "fast";
}

export interface Itinerary {
  id: string;
  tripId: string;
  version: number;
  days: ItineraryDay[];
  createdAt: string;
}

export interface ItineraryDay {
  id: string;
  dayNumber: number;
  date: string;
  theme: string;
  activities: Activity[];
}

export interface Activity {
  id: string;
  dayId: string;
  order: number;
  timeStart: string;
  timeEnd?: string;
  title: string;
  description?: string;
  location?: string;
  estimatedCost: number;
  category: ActivityCategory;
  status: ActivityStatus;
  duration: number;
}

export type ActivityCategory =
  | "dining"
  | "sightseeing"
  | "transport"
  | "activity"
  | "rest"
  | "accommodation";

export type ActivityStatus =
  | "planned"
  | "ongoing"
  | "completed"
  | "skipped";

export interface Expense {
  id: string;
  tripId: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
}

export type ExpenseCategory =
  | "accommodation"
  | "food"
  | "transport"
  | "activities"
  | "shopping"
  | "other";

export interface AISuggestion {
  id: string;
  title: string;
  description: string;
  estimatedCost: number;
  duration: number;
  reason: string;
}
