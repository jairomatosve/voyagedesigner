import React from "react";
import { View, StyleSheet, ScrollView, Pressable, ImageBackground } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useStore } from "@/store/useStore";
import { Spacing, BorderRadius, Colors, Shadows } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TripDetailRouteProp = RouteProp<RootStackParamList, "TripDetail">;

export default function TripDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TripDetailRouteProp>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation("trips");
  const { theme } = useTheme();
  const { currentTrip, currentItinerary, deleteTrip } = useStore();

  if (!currentTrip) {
    navigation.goBack();
    return null;
  }

  const trip = currentTrip;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getDaysRemaining = () => {
    const start = new Date(trip.startDate);
    const today = new Date();
    const diff = Math.ceil(
      (start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, diff);
  };

  const getTripDuration = () => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    return Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const handleGenerateItinerary = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("GenerateItinerary", { tripId: trip.id });
  };

  const handleViewItinerary = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("Itinerary", { tripId: trip.id });
  };

  const handleViewBudget = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("Budget", { tripId: trip.id });
  };

  const handleDeleteTrip = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    deleteTrip(trip.id);
    navigation.goBack();
  };

  const daysRemaining = getDaysRemaining();
  const duration = getTripDuration();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing["2xl"] }}
      showsVerticalScrollIndicator={false}
    >
      <ImageBackground
        source={require("../../assets/images/empty-trips.png")}
        style={styles.hero}
        imageStyle={styles.heroImage}
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.heroGradient}
        >
          <Animated.View entering={FadeInUp.delay(100).duration(400)}>
            <ThemedText type="display" style={styles.heroTitle}>
              {trip.title}
            </ThemedText>
            <View style={styles.heroLocation}>
              <Feather name="map-pin" size={16} color={Colors.accent} />
              <ThemedText type="body" style={styles.heroLocationText}>
                {trip.destinations && trip.destinations.length > 0
                  ? trip.destinations.map(d => d.location).join(" → ")
                  : t("trip_detail.no_destinations")}
              </ThemedText>
            </View>
          </Animated.View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.content}>
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={styles.statsRow}
        >
          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <Feather name="calendar" size={24} color={Colors.primary} />
            <ThemedText type="h3">{duration}</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              days
            </ThemedText>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <Feather name="clock" size={24} color={Colors.warning} />
            <ThemedText type="h3">{daysRemaining}</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {t("dashboard.days_remaining")}
            </ThemedText>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <Feather name="dollar-sign" size={24} color={Colors.success} />
            <ThemedText type="h3">${trip.totalBudget}</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {t("dashboard.budget")}
            </ThemedText>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <View style={styles.dateRow}>
            <Feather name="calendar" size={18} color={theme.textSecondary} />
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </ThemedText>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            {t("trip_detail.quick_actions")}
          </ThemedText>

          <View style={styles.actionsGrid}>
            <Pressable
              onPress={
                currentItinerary ? handleViewItinerary : handleGenerateItinerary
              }
              style={[
                styles.actionCard,
                { backgroundColor: Colors.primary },
                Shadows.card,
              ]}
            >
              <Feather
                name={currentItinerary ? "list" : "cpu"}
                size={28}
                color="#FFFFFF"
              />
              <ThemedText type="h4" style={styles.actionText}>
                {currentItinerary
                  ? t("trip_detail.view_itinerary")
                  : t("trip_detail.generate_itinerary")}
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={handleViewBudget}
              style={[
                styles.actionCard,
                { backgroundColor: Colors.success },
                Shadows.card,
              ]}
            >
              <Feather name="pie-chart" size={28} color="#FFFFFF" />
              <ThemedText type="h4" style={styles.actionText}>
                {t("trip_detail.view_budget")}
              </ThemedText>
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <Button
            onPress={handleDeleteTrip}
            variant="ghost"
            style={styles.deleteButton}
          >
            <ThemedText type="body" style={{ color: Colors.error }}>
              {t("trip_detail.delete_trip")}
            </ThemedText>
          </Button>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    height: 280,
    justifyContent: "flex-end",
  },
  heroImage: {
    opacity: 0.9,
  },
  heroGradient: {
    padding: Spacing.xl,
    paddingTop: Spacing["4xl"],
  },
  heroTitle: {
    color: "#FFFFFF",
    marginBottom: Spacing.xs,
  },
  heroLocation: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroLocationText: {
    color: "rgba(255,255,255,0.9)",
    marginLeft: Spacing.xs,
  },
  content: {
    padding: Spacing.xl,
    marginTop: -Spacing["2xl"],
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  actionsGrid: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  actionCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    minHeight: 120,
  },
  actionText: {
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  deleteButton: {
    marginTop: Spacing.xl,
  },
});
