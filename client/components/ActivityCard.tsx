import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import type { Activity } from "@/types";

interface ActivityCardProps {
  activity: Activity;
  onPress?: () => void;
  onStatusChange?: (status: Activity["status"]) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const categoryIcons: Record<string, keyof typeof Feather.glyphMap> = {
  dining: "coffee",
  sightseeing: "camera",
  transport: "navigation",
  activity: "activity",
  rest: "moon",
  accommodation: "home",
};

export function ActivityCard({
  activity,
  onPress,
  onStatusChange,
}: ActivityCardProps) {
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
    onPress?.();
  };

  const getStatusColor = () => {
    switch (activity.status) {
      case "completed":
        return Colors.success;
      case "skipped":
        return Colors.error;
      case "ongoing":
        return Colors.warning;
      default:
        return theme.textSecondary;
    }
  };

  const getStatusIcon = (): keyof typeof Feather.glyphMap => {
    switch (activity.status) {
      case "completed":
        return "check-circle";
      case "skipped":
        return "x-circle";
      case "ongoing":
        return "play-circle";
      default:
        return "circle";
    }
  };

  const getCategoryColor = () => {
    switch (activity.category) {
      case "dining":
        return "#F59E0B";
      case "sightseeing":
        return "#8B5CF6";
      case "transport":
        return "#3B82F6";
      case "activity":
        return Colors.accent;
      case "rest":
        return "#6366F1";
      case "accommodation":
        return Colors.primary;
      default:
        return Colors.primary;
    }
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundDefault,
          borderLeftColor: getCategoryColor(),
          opacity: activity.status === "skipped" ? 0.6 : 1,
        },
        animatedStyle,
      ]}
    >
      <View style={styles.timeContainer}>
        <ThemedText type="h4" style={{ color: Colors.primary }}>
          {activity.timeStart}
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
          {activity.duration} min
        </ThemedText>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: `${getCategoryColor()}15` },
            ]}
          >
            <Feather
              name={categoryIcons[activity.category] || "activity"}
              size={12}
              color={getCategoryColor()}
            />
          </View>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              const nextStatus =
                activity.status === "planned"
                  ? "completed"
                  : activity.status === "completed"
                    ? "skipped"
                    : "planned";
              onStatusChange?.(nextStatus);
            }}
            hitSlop={12}
          >
            <Feather
              name={getStatusIcon()}
              size={20}
              color={getStatusColor()}
            />
          </Pressable>
        </View>

        <ThemedText
          type="body"
          style={[
            styles.title,
            activity.status === "completed" && styles.completedText,
          ]}
          numberOfLines={2}
        >
          {activity.title}
        </ThemedText>

        {activity.location ? (
          <View style={styles.locationRow}>
            <Feather
              name="map-pin"
              size={12}
              color={theme.textSecondary}
            />
            <ThemedText
              type="caption"
              style={[styles.location, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {activity.location}
            </ThemedText>
          </View>
        ) : null}

        {activity.estimatedCost > 0 ? (
          <View style={styles.costBadge}>
            <ThemedText type="caption" style={{ color: Colors.primary }}>
              ${activity.estimatedCost}
            </ThemedText>
          </View>
        ) : null}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  timeContainer: {
    width: 60,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: Spacing.xs,
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  categoryBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.7,
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
  costBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(26, 95, 122, 0.1)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    marginTop: Spacing.sm,
  },
});
