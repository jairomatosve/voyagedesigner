import React from "react";
import { View, StyleSheet, Pressable, ImageBackground } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows, Colors } from "@/constants/theme";
import type { Trip } from "@/types";

interface TripCardProps {
  trip: Trip;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const destinationImages: Record<string, any> = {
  default: require("../../assets/images/empty-trips.png"),
};

export function TripCard({ trip, onPress }: TripCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

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
    return diff;
  };

  const daysRemaining = getDaysRemaining();

  const getStatusColor = () => {
    if (trip.status === "completed") return Colors.success;
    if (trip.status === "ongoing") return Colors.accent;
    if (daysRemaining <= 7 && daysRemaining > 0) return Colors.warning;
    return Colors.primary;
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: theme.backgroundDefault },
          Shadows.card,
        ]}
      >
        <View style={styles.imageContainer}>
          <ImageBackground
            source={destinationImages.default}
            style={styles.image}
            imageStyle={styles.imageStyle}
          >
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.7)"]}
              style={styles.gradient}
            >
              <View style={styles.statusBadge}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor() },
                  ]}
                />
                <ThemedText
                  type="caption"
                  style={[styles.statusText, { color: "#FFFFFF" }]}
                >
                  {trip.status === "completed"
                    ? "Completed"
                    : trip.status === "ongoing"
                      ? "Ongoing"
                      : daysRemaining > 0
                        ? `${daysRemaining} days`
                        : "Past"}
                </ThemedText>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        <View style={styles.content}>
          <ThemedText type="h3" numberOfLines={1}>
            {trip.title}
          </ThemedText>

          <View style={styles.locationRow}>
            <Feather
              name="map-pin"
              size={14}
              color={Colors.accent}
            />
            <ThemedText
              type="small"
              style={[styles.location, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {trip.destinations && trip.destinations.length > 0
                ? trip.destinations.map(d => d.location).join(" → ")
                : "No destinations"}
            </ThemedText>
          </View>

          <View style={styles.footer}>
            <View style={styles.dateRow}>
              <Feather
                name="calendar"
                size={14}
                color={theme.textSecondary}
              />
              <ThemedText
                type="caption"
                style={{ color: theme.textSecondary }}
              >
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </ThemedText>
            </View>

            <View style={styles.budgetBadge}>
              <ThemedText type="caption" style={{ color: Colors.primary }}>
                ${trip.totalBudget.toLocaleString()}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  card: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  imageContainer: {
    height: 140,
  },
  image: {
    flex: 1,
    justifyContent: "flex-end",
  },
  imageStyle: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
  },
  gradient: {
    padding: Spacing.md,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.xs,
  },
  statusText: {
    fontWeight: "600",
  },
  content: {
    padding: Spacing.lg,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  location: {
    marginLeft: Spacing.xs,
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.md,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  budgetBadge: {
    backgroundColor: "rgba(26, 95, 122, 0.1)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
});
