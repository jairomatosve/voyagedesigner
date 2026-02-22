import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { supabase } from "../lib/supabase";
import type {
  User,
  Trip,
  Itinerary,
  Expense,
  Activity,
} from "../types";

interface AppState {
  user: any | null;
  isAuthenticated: boolean;
  trips: Trip[];
  currentTrip: Trip | null;
  currentItinerary: Itinerary | null;
  expenses: Expense[];
  language: string;
  isLoading: boolean;

  setUser: (user: any | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setTrips: (trips: Trip[]) => void;
  addTrip: (trip: Trip) => void;
  updateTrip: (tripId: string, updates: Partial<Trip>) => void;
  deleteTrip: (tripId: string) => void;
  setCurrentTrip: (trip: Trip | null) => void;
  setCurrentItinerary: (itinerary: Itinerary | null) => void;
  updateActivityStatus: (
    activityId: string,
    status: Activity["status"]
  ) => void;
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  setLanguage: (language: string) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  persistState: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  trips: [],
  currentTrip: null,
  currentItinerary: null,
  expenses: [],
  language: "en",
  isLoading: true,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

  setTrips: (trips) => {
    set({ trips });
    get().persistState();
  },

  addTrip: (trip) => {
    set((state) => ({ trips: [...state.trips, trip] }));
    get().persistState();
  },

  updateTrip: (tripId, updates) => {
    set((state) => ({
      trips: state.trips.map((t) =>
        t.id === tripId ? { ...t, ...updates } : t
      ),
      currentTrip:
        state.currentTrip?.id === tripId
          ? { ...state.currentTrip, ...updates }
          : state.currentTrip,
    }));
    get().persistState();
  },

  deleteTrip: (tripId) => {
    set((state) => ({
      trips: state.trips.filter((t) => t.id !== tripId),
      currentTrip:
        state.currentTrip?.id === tripId ? null : state.currentTrip,
    }));
    get().persistState();
  },

  setCurrentTrip: (trip) => set({ currentTrip: trip }),

  setCurrentItinerary: (itinerary) => {
    set({ currentItinerary: itinerary });
    get().persistState();
  },

  updateActivityStatus: (activityId, status) => {
    set((state) => {
      if (!state.currentItinerary) return state;

      const updatedDays = state.currentItinerary.days.map((day) => ({
        ...day,
        activities: day.activities.map((activity) =>
          activity.id === activityId ? { ...activity, status } : activity
        ),
      }));

      return {
        currentItinerary: {
          ...state.currentItinerary,
          days: updatedDays,
        },
      };
    });
    get().persistState();
  },

  setExpenses: (expenses) => {
    set({ expenses });
    get().persistState();
  },

  addExpense: (expense) => {
    set((state) => ({ expenses: [...state.expenses, expense] }));
    get().persistState();
  },

  setLanguage: async (language) => {
    set({ language });
    await AsyncStorage.setItem("@language", language);
  },

  setLoading: (isLoading) => set({ isLoading }),

  logout: async () => {
    await supabase.auth.signOut();
    await AsyncStorage.removeItem("@trips");
    await AsyncStorage.removeItem("@expenses");
    set({
      user: null,
      isAuthenticated: false,
      trips: [],
      currentTrip: null,
      currentItinerary: null,
      expenses: [],
    });
  },

  initialize: async () => {
    try {
      const languageData = await AsyncStorage.getItem("@language");
      if (languageData) {
        set({ language: languageData });
      }

      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        set({
          user: session.user,
          isAuthenticated: true,
        });
      }

      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          user: session?.user ?? null,
          isAuthenticated: !!session?.user,
        });
      });

      // Load cached local state
      const [tripsData, expensesData] = await Promise.all([
        AsyncStorage.getItem("@trips"),
        AsyncStorage.getItem("@expenses"),
      ]);

      set({
        trips: tripsData ? JSON.parse(tripsData) : [],
        expenses: expensesData ? JSON.parse(expensesData) : [],
        isLoading: false
      });

    } catch (error) {
      console.error("Failed to initialize store:", error);
      set({ isLoading: false });
    }
  },

  persistState: async () => {
    try {
      const state = get();
      await Promise.all([
        AsyncStorage.setItem("@trips", JSON.stringify(state.trips)),
        AsyncStorage.setItem("@expenses", JSON.stringify(state.expenses)),
      ]);
    } catch (error) {
      console.error("Failed to persist state:", error);
    }
  },
}));
