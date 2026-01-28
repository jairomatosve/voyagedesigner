import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import LoginScreen from "@/screens/LoginScreen";
import SignupScreen from "@/screens/SignupScreen";
import CreateTripScreen from "@/screens/CreateTripScreen";
import TripDetailScreen from "@/screens/TripDetailScreen";
import GenerateItineraryScreen from "@/screens/GenerateItineraryScreen";
import ItineraryScreen from "@/screens/ItineraryScreen";
import ReoptimizeScreen from "@/screens/ReoptimizeScreen";
import BudgetScreen from "@/screens/BudgetScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useStore } from "@/store/useStore";
import { Colors } from "@/constants/theme";

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Main: undefined;
  CreateTrip: undefined;
  TripDetail: { tripId: string };
  GenerateItinerary: { tripId: string };
  Itinerary: { tripId: string };
  Reoptimize: { tripId: string };
  Budget: { tripId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { isAuthenticated, initialize } = useStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initialize();
      setIsReady(true);
    };
    init();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Signup"
            component={SignupScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CreateTrip"
            component={CreateTripScreen}
            options={{
              presentation: "modal",
              headerTitle: "New Trip",
            }}
          />
          <Stack.Screen
            name="TripDetail"
            component={TripDetailScreen}
            options={{
              headerTitle: "",
              headerTransparent: true,
            }}
          />
          <Stack.Screen
            name="GenerateItinerary"
            component={GenerateItineraryScreen}
            options={{
              headerTitle: "Generate Itinerary",
            }}
          />
          <Stack.Screen
            name="Itinerary"
            component={ItineraryScreen}
            options={{
              headerTitle: "Itinerary",
            }}
          />
          <Stack.Screen
            name="Reoptimize"
            component={ReoptimizeScreen}
            options={{
              presentation: "modal",
              headerTitle: "AI Reoptimize",
            }}
          />
          <Stack.Screen
            name="Budget"
            component={BudgetScreen}
            options={{
              headerTitle: "Budget Tracker",
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
