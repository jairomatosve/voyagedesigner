import React from "react";
import { View, StyleSheet, SectionList, Pressable } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ActivityCard } from "@/components/ActivityCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useStore } from "@/store/useStore";
import { Spacing, BorderRadius, Colors, Shadows } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { Activity, ItineraryDay } from "@/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ItineraryRouteProp = RouteProp<RootStackParamList, "Itinerary">;

interface SectionData {
  title: string;
  date: string;
  theme: string;
  data: Activity[];
}

export default function ItineraryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ItineraryRouteProp>();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation("itinerary");
  const { theme } = useTheme();
  const { currentItinerary, currentTrip, updateActivityStatus } = useStore();

  const hasSkippedActivity = currentItinerary?.days.some((day) =>
    day.activities.some((a) => a.status === "skipped")
  );

  const handleStatusChange = (
    activityId: string,
    status: Activity["status"]
  ) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateActivityStatus(activityId, status);
  };

  const handleReoptimize = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("Reoptimize", { tripId: route.params.tripId });
  };

  const handleGenerateItinerary = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("GenerateItinerary", { tripId: route.params.tripId });
  };

  if (!currentItinerary) {
    return (
      <ThemedView style={styles.container}>
        <View
          style={[
            styles.emptyContainer,
            {
              paddingTop: headerHeight + Spacing.xl,
              paddingBottom: insets.bottom + Spacing.xl,
            },
          ]}
        >
          <EmptyState
            image={require("../../assets/images/empty-itinerary.png")}
            title={t("viewer.no_itinerary")}
            subtitle={t("viewer.no_itinerary_subtitle")}
            actionLabel={t("generator.button")}
            onAction={handleGenerateItinerary}
          />
        </View>
      </ThemedView>
    );
  }

  const sections: SectionData[] = currentItinerary.days.map((day) => ({
    title: `${t("viewer.day")} ${day.dayNumber}`,
    date: new Date(day.date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
    theme: day.theme,
    data: day.activities,
  }));

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const renderSectionHeader = ({
    section,
  }: {
    section: SectionData;
  }) => (
    <Animated.View
      entering={FadeInDown.duration(300)}
      style={[styles.sectionHeader, { backgroundColor: theme.backgroundRoot }]}
    >
      <View style={styles.sectionHeaderLeft}>
        <ThemedText type="h2">{section.title}</ThemedText>
        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
          {section.date}
        </ThemedText>
      </View>
      <View
        style={[styles.themeBadge, { backgroundColor: `${Colors.primary}15` }]}
      >
        <ThemedText type="caption" style={{ color: Colors.primary }}>
          {section.theme}
        </ThemedText>
      </View>
    </Animated.View>
  );

  const renderActivity = ({ item, index }: { item: Activity; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <ActivityCard
        activity={item}
        onStatusChange={(status) => handleStatusChange(item.id, status)}
      />
    </Animated.View>
  );

  return (
    <ThemedView style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderActivity}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing["4xl"] + 70,
          paddingHorizontal: Spacing.lg,
        }}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.xs }} />}
        SectionSeparatorComponent={() => (
          <View style={{ height: Spacing.lg }} />
        )}
      />

      {hasSkippedActivity ? (
        <Pressable
          onPress={handleReoptimize}
          style={[
            styles.reoptimizeButton,
            { bottom: insets.bottom + Spacing.xl },
            Shadows.fab,
          ]}
        >
          <Feather name="zap" size={20} color="#FFFFFF" />
          <ThemedText type="body" style={styles.reoptimizeText}>
            {t("reoptimizer.title")}
          </ThemedText>
        </Pressable>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionHeaderLeft: {
    gap: Spacing.xs,
  },
  themeBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  reoptimizeButton: {
    position: "absolute",
    left: Spacing.xl,
    right: Spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  reoptimizeText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
