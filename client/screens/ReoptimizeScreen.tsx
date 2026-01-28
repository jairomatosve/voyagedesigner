import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useStore } from "@/store/useStore";
import { Spacing, BorderRadius, Colors, Shadows } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { AISuggestion } from "@/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ReoptimizeRouteProp = RouteProp<RootStackParamList, "Reoptimize">;

const mockSuggestions: AISuggestion[] = [
  {
    id: "sug-1",
    title: "Visit the Botanical Gardens",
    description:
      "A peaceful alternative that's nearby and available now. Perfect for relaxation.",
    estimatedCost: 15,
    duration: 90,
    reason: "Similar activity type, lower cost, highly rated",
  },
  {
    id: "sug-2",
    title: "Move tomorrow's museum to today",
    description:
      "Swap schedules to make the most of your remaining time today.",
    estimatedCost: 0,
    duration: 120,
    reason: "No extra cost, optimizes your schedule",
  },
  {
    id: "sug-3",
    title: "Extended lunch experience",
    description:
      "Turn your lunch into a food tour, exploring local cuisine spots.",
    estimatedCost: 25,
    duration: 150,
    reason: "Matches your food interest, fills the time gap",
  },
];

export default function ReoptimizeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ReoptimizeRouteProp>();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation("itinerary");
  const { theme } = useTheme();
  const { currentItinerary } = useStore();

  const [isLoading, setIsLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setSuggestions(mockSuggestions);
    setIsLoading(false);
  };

  const handleAccept = (suggestion: AISuggestion) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  };

  const handleDecline = (suggestion: AISuggestion) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
  };

  const skippedActivities = currentItinerary?.days
    .flatMap((day) => day.activities)
    .filter((a) => a.status === "skipped");

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing["2xl"],
          paddingHorizontal: Spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeIn.duration(400)}
          style={styles.header}
        >
          <View style={styles.aiIconContainer}>
            <Feather name="cpu" size={32} color={Colors.primary} />
          </View>
          <ThemedText type="h2" style={styles.title}>
            {t("reoptimizer.title")}
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.subtitle, { color: theme.textSecondary }]}
          >
            {t("reoptimizer.subtitle")}
          </ThemedText>
        </Animated.View>

        {skippedActivities && skippedActivities.length > 0 ? (
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={[
              styles.skippedCard,
              { backgroundColor: `${Colors.warning}15` },
            ]}
          >
            <Feather name="alert-circle" size={20} color={Colors.warning} />
            <View style={styles.skippedContent}>
              <ThemedText type="small" style={{ fontWeight: "600" }}>
                Skipped Activities
              </ThemedText>
              {skippedActivities.map((activity) => (
                <ThemedText
                  key={activity.id}
                  type="caption"
                  style={{ color: theme.textSecondary }}
                >
                  {activity.title}
                </ThemedText>
              ))}
            </View>
          </Animated.View>
        ) : null}

        {isLoading ? (
          <Animated.View
            entering={FadeIn.duration(300)}
            style={styles.loadingContainer}
          >
            <ActivityIndicator size="large" color={Colors.primary} />
            <ThemedText
              type="body"
              style={[styles.loadingText, { color: theme.textSecondary }]}
            >
              {t("reoptimizer.getting")}
            </ThemedText>
          </Animated.View>
        ) : (
          <View style={styles.suggestionsContainer}>
            <ThemedText type="h3" style={styles.suggestionsTitle}>
              {t("reoptimizer.suggestion")}s
            </ThemedText>

            {suggestions.map((suggestion, index) => (
              <Animated.View
                key={suggestion.id}
                entering={FadeInDown.delay(200 + index * 100).duration(400)}
                style={[
                  styles.suggestionCard,
                  { backgroundColor: theme.backgroundDefault },
                  Shadows.card,
                ]}
              >
                <View style={styles.suggestionHeader}>
                  <View
                    style={[
                      styles.suggestionIcon,
                      { backgroundColor: `${Colors.primary}15` },
                    ]}
                  >
                    <Feather name="zap" size={16} color={Colors.primary} />
                  </View>
                  <ThemedText type="h4" style={styles.suggestionTitle}>
                    {suggestion.title}
                  </ThemedText>
                </View>

                <ThemedText
                  type="body"
                  style={[styles.suggestionDescription, { color: theme.textSecondary }]}
                >
                  {suggestion.description}
                </ThemedText>

                <View style={styles.suggestionMeta}>
                  <View style={styles.metaItem}>
                    <Feather
                      name="clock"
                      size={14}
                      color={theme.textSecondary}
                    />
                    <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                      {suggestion.duration} min
                    </ThemedText>
                  </View>
                  <View style={styles.metaItem}>
                    <Feather
                      name="dollar-sign"
                      size={14}
                      color={
                        suggestion.estimatedCost === 0
                          ? Colors.success
                          : theme.textSecondary
                      }
                    />
                    <ThemedText
                      type="caption"
                      style={{
                        color:
                          suggestion.estimatedCost === 0
                            ? Colors.success
                            : theme.textSecondary,
                      }}
                    >
                      {suggestion.estimatedCost === 0
                        ? "Free"
                        : `+$${suggestion.estimatedCost}`}
                    </ThemedText>
                  </View>
                </View>

                <View
                  style={[
                    styles.reasonBadge,
                    { backgroundColor: theme.backgroundSecondary },
                  ]}
                >
                  <Feather
                    name="info"
                    size={12}
                    color={theme.textSecondary}
                  />
                  <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                    {suggestion.reason}
                  </ThemedText>
                </View>

                <View style={styles.suggestionActions}>
                  <Button
                    onPress={() => handleDecline(suggestion)}
                    variant="outline"
                    size="small"
                    style={styles.declineButton}
                  >
                    {t("reoptimizer.decline")}
                  </Button>
                  <Button
                    onPress={() => handleAccept(suggestion)}
                    variant="accent"
                    size="small"
                    style={styles.acceptButton}
                  >
                    {t("reoptimizer.accept")}
                  </Button>
                </View>
              </Animated.View>
            ))}

            {suggestions.length === 0 ? (
              <View style={styles.noSuggestions}>
                <Feather name="check-circle" size={48} color={Colors.success} />
                <ThemedText type="body" style={{ color: theme.textSecondary }}>
                  All suggestions handled!
                </ThemedText>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  aiIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(26, 95, 122, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    textAlign: "center",
  },
  skippedCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  skippedContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
  },
  loadingText: {
    marginTop: Spacing.lg,
  },
  suggestionsContainer: {
    gap: Spacing.lg,
  },
  suggestionsTitle: {
    marginBottom: Spacing.sm,
  },
  suggestionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  suggestionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionTitle: {
    flex: 1,
  },
  suggestionDescription: {
    marginBottom: Spacing.md,
  },
  suggestionMeta: {
    flexDirection: "row",
    gap: Spacing.xl,
    marginBottom: Spacing.md,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  reasonBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  suggestionActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  declineButton: {
    flex: 1,
  },
  acceptButton: {
    flex: 1,
  },
  noSuggestions: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
    gap: Spacing.md,
  },
});
