import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type {
  User,
  Trip,
  TripPreferences,
  Itinerary,
  Expense,
  Activity,
} from "../types";

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  trips: Trip[];
  currentTrip: Trip | null;
  currentItinerary: Itinerary | null;
  expenses: Expense[];
  language: string;
  isLoading: boolean;

  setUser: (user: User | null) => void;
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
  logout: () => void;
  initialize: () => Promise<void>;
  persistState: () => Promise<void>;
}

const secureStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export const useStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  trips: [],
  currentTrip: null,
  currentItinerary: null,
  expenses: [],
  language: "en",
  isLoading: false,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
    get().persistState();
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
    await secureStorage.removeItem("auth_token");
    await AsyncStorage.removeItem("@user");
    await AsyncStorage.removeItem("@trips");
    await AsyncStorage.removeItem("@itineraries");
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
      const [languageData, userData, tripsData, expensesData] =
        await Promise.all([
          AsyncStorage.getItem("@language"),
          AsyncStorage.getItem("@user"),
          AsyncStorage.getItem("@trips"),
          AsyncStorage.getItem("@expenses"),
        ]);

      const updates: Partial<AppState> = {};

      if (languageData) {
        updates.language = languageData;
      }

      if (userData) {
        const user = JSON.parse(userData);
        updates.user = user;
        updates.isAuthenticated = true;
      }

      if (tripsData) {
        updates.trips = JSON.parse(tripsData);
      }

      if (expensesData) {
        updates.expenses = JSON.parse(expensesData);
      }

      set(updates);
    } catch (error) {
      console.error("Failed to initialize store:", error);
    }
  },

  persistState: async () => {
    try {
      const state = get();
      await Promise.all([
        state.user
          ? AsyncStorage.setItem("@user", JSON.stringify(state.user))
          : AsyncStorage.removeItem("@user"),
        AsyncStorage.setItem("@trips", JSON.stringify(state.trips)),
        AsyncStorage.setItem("@expenses", JSON.stringify(state.expenses)),
      ]);
    } catch (error) {
      console.error("Failed to persist state:", error);
    }
  },
}));
