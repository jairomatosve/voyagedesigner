import React, { useEffect } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function LoadingSkeleton({
  width = "100%",
  height = 20,
  borderRadius = BorderRadius.sm,
  style,
}: LoadingSkeletonProps) {
  const { theme } = useTheme();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.7, 0.3]),
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.backgroundTertiary,
        },
        style,
        animatedStyle,
      ]}
    />
  );
}

export function TripCardSkeleton() {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.tripCard,
        { backgroundColor: theme.backgroundDefault },
      ]}
    >
      <LoadingSkeleton height={140} borderRadius={BorderRadius.lg} />
      <View style={styles.tripCardContent}>
        <LoadingSkeleton height={24} width="70%" />
        <LoadingSkeleton
          height={16}
          width="50%"
          style={{ marginTop: Spacing.sm }}
        />
        <View style={styles.tripCardFooter}>
          <LoadingSkeleton height={14} width="40%" />
          <LoadingSkeleton height={24} width={80} />
        </View>
      </View>
    </View>
  );
}

export function ActivityCardSkeleton() {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.activityCard,
        { backgroundColor: theme.backgroundDefault },
      ]}
    >
      <View style={styles.activityTime}>
        <LoadingSkeleton height={20} width={50} />
        <LoadingSkeleton
          height={12}
          width={40}
          style={{ marginTop: Spacing.xs }}
        />
      </View>
      <View style={styles.activityContent}>
        <LoadingSkeleton height={20} width="80%" />
        <LoadingSkeleton
          height={14}
          width="60%"
          style={{ marginTop: Spacing.sm }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: "hidden",
  },
  tripCard: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  tripCardContent: {
    padding: Spacing.lg,
  },
  tripCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  activityCard: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  activityTime: {
    width: 60,
    alignItems: "center",
  },
  activityContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
});
