import React, { useState } from "react";
import { View, StyleSheet, Image, ActivityIndicator } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useStore } from "@/store/useStore";
import { Spacing, Colors } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { Itinerary, ItineraryDay, Activity } from "@/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type GenerateRouteProp = RouteProp<RootStackParamList, "GenerateItinerary">;

const generateMockItinerary = (
  tripId: string,
  startDate: string,
  days: number
): Itinerary => {
  const activities: Activity[][] = [
    [
      {
        id: "act-1",
        dayId: "day-1",
        order: 1,
        timeStart: "09:00",
        title: "Morning coffee at local cafe",
        description: "Start your day with local specialties",
        location: "Downtown Coffee House",
        estimatedCost: 15,
        category: "dining",
        status: "planned",
        duration: 60,
      },
      {
        id: "act-2",
        dayId: "day-1",
        order: 2,
        timeStart: "10:30",
        title: "City walking tour",
        description: "Explore the historic district",
        location: "Old Town",
        estimatedCost: 45,
        category: "sightseeing",
        status: "planned",
        duration: 150,
      },
      {
        id: "act-3",
        dayId: "day-1",
        order: 3,
        timeStart: "13:00",
        title: "Lunch at local restaurant",
        description: "Try the regional cuisine",
        location: "Main Square",
        estimatedCost: 35,
        category: "dining",
        status: "planned",
        duration: 90,
      },
      {
        id: "act-4",
        dayId: "day-1",
        order: 4,
        timeStart: "15:00",
        title: "Museum visit",
        description: "Art and culture exploration",
        location: "National Museum",
        estimatedCost: 25,
        category: "activity",
        status: "planned",
        duration: 120,
      },
    ],
    [
      {
        id: "act-5",
        dayId: "day-2",
        order: 1,
        timeStart: "08:00",
        title: "Sunrise viewpoint",
        description: "Catch the sunrise from the best spot",
        location: "Mountain Overlook",
        estimatedCost: 0,
        category: "sightseeing",
        status: "planned",
        duration: 90,
      },
      {
        id: "act-6",
        dayId: "day-2",
        order: 2,
        timeStart: "10:00",
        title: "Nature hike",
        description: "Moderate trail through scenic landscape",
        location: "National Park",
        estimatedCost: 10,
        category: "activity",
        status: "planned",
        duration: 180,
      },
      {
        id: "act-7",
        dayId: "day-2",
        order: 3,
        timeStart: "14:00",
        title: "Picnic lunch",
        description: "Enjoy local delicacies outdoors",
        location: "Park Meadow",
        estimatedCost: 20,
        category: "dining",
        status: "planned",
        duration: 60,
      },
      {
        id: "act-8",
        dayId: "day-2",
        order: 4,
        timeStart: "16:00",
        title: "Spa & relaxation",
        description: "Unwind after the hike",
        location: "Wellness Center",
        estimatedCost: 80,
        category: "rest",
        status: "planned",
        duration: 120,
      },
    ],
    [
      {
        id: "act-9",
        dayId: "day-3",
        order: 1,
        timeStart: "10:00",
        title: "Local market visit",
        description: "Shop for souvenirs and local goods",
        location: "Central Market",
        estimatedCost: 50,
        category: "activity",
        status: "planned",
        duration: 120,
      },
      {
        id: "act-10",
        dayId: "day-3",
        order: 2,
        timeStart: "12:30",
        title: "Cooking class",
        description: "Learn to make local dishes",
        location: "Culinary School",
        estimatedCost: 65,
        category: "activity",
        status: "planned",
        duration: 180,
      },
      {
        id: "act-11",
        dayId: "day-3",
        order: 3,
        timeStart: "16:00",
        title: "Evening stroll",
        description: "Explore the waterfront",
        location: "Riverside Walk",
        estimatedCost: 0,
        category: "sightseeing",
        status: "planned",
        duration: 90,
      },
      {
        id: "act-12",
        dayId: "day-3",
        order: 4,
        timeStart: "19:00",
        title: "Farewell dinner",
        description: "Fine dining experience",
        location: "Rooftop Restaurant",
        estimatedCost: 100,
        category: "dining",
        status: "planned",
        duration: 120,
      },
    ],
  ];

  const themes = [
    "Arrival & City Exploration",
    "Nature & Adventure",
    "Culture & Farewell",
  ];

  const itineraryDays: ItineraryDay[] = Array.from({ length: Math.min(days, 3) }).map(
    (_, i) => {
      const dayDate = new Date(startDate);
      dayDate.setDate(dayDate.getDate() + i);

      return {
        id: `day-${i + 1}`,
        dayNumber: i + 1,
        date: dayDate.toISOString(),
        theme: themes[i] || `Day ${i + 1}`,
        activities: activities[i] || [],
      };
    }
  );

  return {
    id: `itinerary-${Date.now()}`,
    tripId,
    version: 1,
    days: itineraryDays,
    createdAt: new Date().toISOString(),
  };
};

export default function GenerateItineraryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<GenerateRouteProp>();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation("itinerary");
  const { theme } = useTheme();
  const { currentTrip, setCurrentItinerary } = useStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const rotation = useSharedValue(0);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const handleGenerate = async () => {
    if (!currentTrip) return;

    setIsGenerating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    rotation.value = withRepeat(withTiming(360, { duration: 2000 }), -1, false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const startDate = new Date(currentTrip.startDate);
      const endDate = new Date(currentTrip.endDate);
      const days = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const itinerary = generateMockItinerary(
        currentTrip.id,
        currentTrip.startDate,
        days
      );

      setCurrentItinerary(itinerary);
      setIsComplete(true);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setTimeout(() => {
        navigation.replace("Itinerary", { tripId: currentTrip.id });
      }, 1500);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setIsGenerating(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing["3xl"],
            paddingBottom: insets.bottom + Spacing["2xl"],
          },
        ]}
      >
        <View style={styles.centerContent}>
          <Animated.View
            style={[styles.iconContainer, isGenerating && animatedIconStyle]}
          >
            {isComplete ? (
              <Animated.View entering={FadeIn.duration(300)}>
                <Feather name="check-circle" size={80} color={Colors.success} />
              </Animated.View>
            ) : (
              <Image
                source={require("../../assets/images/ai-companion.png")}
                style={styles.aiImage}
                resizeMode="contain"
              />
            )}
          </Animated.View>

          <ThemedText type="h1" style={styles.title}>
            {isComplete
              ? "Itinerary Ready!"
              : isGenerating
                ? t("generator.generating")
                : t("generator.title")}
          </ThemedText>

          <ThemedText
            type="body"
            style={[styles.subtitle, { color: theme.textSecondary }]}
          >
            {isComplete
              ? "Your personalized trip is ready"
              : isGenerating
                ? "AI is crafting your perfect trip..."
                : t("generator.subtitle")}
          </ThemedText>

          {isGenerating && !isComplete ? (
            <Animated.View
              entering={FadeIn.duration(300)}
              style={styles.loadingContainer}
            >
              <ActivityIndicator size="large" color={Colors.primary} />
            </Animated.View>
          ) : null}
        </View>

        {!isGenerating && !isComplete ? (
          <Button
            onPress={handleGenerate}
            variant="accent"
            size="large"
            leftIcon={<Feather name="cpu" size={20} color="#FFFFFF" />}
          >
            {t("generator.button")}
          </Button>
        ) : null}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: "space-between",
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginBottom: Spacing["2xl"],
  },
  aiImage: {
    width: 120,
    height: 120,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
    maxWidth: 280,
  },
  loadingContainer: {
    marginTop: Spacing["2xl"],
  },
});
