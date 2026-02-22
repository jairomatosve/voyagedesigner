import React, { useState } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import DateTimePicker from "@react-native-community/datetimepicker";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { useStore } from "@/store/useStore";
import { apiRequest } from "@/lib/query-client";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { Trip } from "@/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const interests = [
  { id: "cultural", icon: "book" },
  { id: "food", icon: "coffee" },
  { id: "nature", icon: "sun" },
  { id: "nightlife", icon: "moon" },
  { id: "adventure", icon: "compass" },
  { id: "shopping", icon: "shopping-bag" },
  { id: "history", icon: "clock" },
  { id: "art", icon: "image" },
];

export default function CreateTripScreen() {
  const navigation = useNavigation<NavigationProp>();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation("trips");
  const { theme } = useTheme();
  const { addTrip } = useStore();

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const [budget, setBudget] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [pace, setPace] = useState<"relaxed" | "moderate" | "fast">("moderate");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const totalSteps = 3;

  const toggleInterest = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleCreate();
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const tripData = {
        title: title || `Trip to ${destination}`,
        destination,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalBudget: parseFloat(budget) || null,
        currency: "USD",
        status: "planning",
      };

      const response = await apiRequest("POST", "/api/trips", tripData);
      const newTrip: Trip = await response.json();

      addTrip(newTrip);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error) {
      console.error("Failed to create trip:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return destination.trim().length > 0;
      case 2:
        return startDate < endDate;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <ThemedText type="h2" style={styles.stepTitle}>
        {t("create_trip.step_destination")}
      </ThemedText>

      <Input
        label={t("create_trip.title_placeholder")}
        placeholder={t("create_trip.title_placeholder")}
        value={title}
        onChangeText={setTitle}
        leftIcon="edit-3"
      />

      <Input
        label={t("create_trip.destination_placeholder")}
        placeholder={t("create_trip.destination_placeholder")}
        value={destination}
        onChangeText={setDestination}
        leftIcon="map-pin"
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <ThemedText type="h2" style={styles.stepTitle}>
        {t("create_trip.step_dates")} & {t("create_trip.step_budget")}
      </ThemedText>

      <View style={styles.dateContainer}>
        <Pressable
          onPress={() => setShowStartPicker(true)}
          style={[styles.dateButton, { backgroundColor: theme.backgroundSecondary }]}
        >
          <Feather name="calendar" size={20} color={Colors.primary} />
          <View style={styles.dateTextContainer}>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {t("create_trip.start_date")}
            </ThemedText>
            <ThemedText type="body">{formatDate(startDate)}</ThemedText>
          </View>
        </Pressable>

        <Pressable
          onPress={() => setShowEndPicker(true)}
          style={[styles.dateButton, { backgroundColor: theme.backgroundSecondary }]}
        >
          <Feather name="calendar" size={20} color={Colors.accent} />
          <View style={styles.dateTextContainer}>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {t("create_trip.end_date")}
            </ThemedText>
            <ThemedText type="body">{formatDate(endDate)}</ThemedText>
          </View>
        </Pressable>
      </View>

      {showStartPicker ? (
        <DateTimePicker
          value={startDate}
          mode="date"
          onChange={(_, date) => {
            setShowStartPicker(false);
            if (date) setStartDate(date);
          }}
        />
      ) : null}

      {showEndPicker ? (
        <DateTimePicker
          value={endDate}
          mode="date"
          minimumDate={startDate}
          onChange={(_, date) => {
            setShowEndPicker(false);
            if (date) setEndDate(date);
          }}
        />
      ) : null}

      <Input
        label={t("create_trip.budget_placeholder")}
        placeholder="2000"
        value={budget}
        onChangeText={setBudget}
        keyboardType="numeric"
        leftIcon="dollar-sign"
      />
    </View>
  );

  const renderStep3 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <ThemedText type="h2" style={styles.stepTitle}>
        {t("create_trip.step_preferences")}
      </ThemedText>

      <ThemedText type="h4" style={styles.sectionTitle}>
        {t("preferences.interests")}
      </ThemedText>

      <View style={styles.interestsGrid}>
        {interests.map((interest) => (
          <Pressable
            key={interest.id}
            onPress={() => toggleInterest(interest.id)}
            style={[
              styles.interestChip,
              {
                backgroundColor: selectedInterests.includes(interest.id)
                  ? Colors.primary
                  : theme.backgroundSecondary,
                borderColor: selectedInterests.includes(interest.id)
                  ? Colors.primary
                  : theme.border,
              },
            ]}
          >
            <Feather
              name={interest.icon as any}
              size={16}
              color={
                selectedInterests.includes(interest.id)
                  ? "#FFFFFF"
                  : theme.text
              }
            />
            <ThemedText
              type="small"
              style={[
                styles.interestText,
                {
                  color: selectedInterests.includes(interest.id)
                    ? "#FFFFFF"
                    : theme.text,
                },
              ]}
            >
              {t(`preferences.${interest.id}`)}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        {t("preferences.pace")}
      </ThemedText>

      <View style={styles.paceContainer}>
        {(["relaxed", "moderate", "fast"] as const).map((p) => (
          <Pressable
            key={p}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setPace(p);
            }}
            style={[
              styles.paceOption,
              {
                backgroundColor:
                  pace === p ? Colors.primary : theme.backgroundSecondary,
                borderColor: pace === p ? Colors.primary : theme.border,
              },
            ]}
          >
            <ThemedText
              type="small"
              style={{ color: pace === p ? "#FFFFFF" : theme.text }}
            >
              {t(`preferences.pace_${p}`)}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing["2xl"],
          },
        ]}
      >
        <View style={styles.progressContainer}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                {
                  backgroundColor:
                    i < step ? Colors.primary : theme.backgroundTertiary,
                  width: i + 1 === step ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        <View style={styles.buttonContainer}>
          <Button
            onPress={handleBack}
            variant="outline"
            style={styles.backButton}
          >
            {step === 1 ? t("common:cancel") : t("create_trip.button_back")}
          </Button>

          <Button
            onPress={handleNext}
            variant="accent"
            disabled={!canProceed()}
            loading={loading}
            style={styles.nextButton}
          >
            {step === totalSteps
              ? t("create_trip.button_create")
              : t("create_trip.button_next")}
          </Button>
        </View>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    flexGrow: 1,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing["2xl"],
  },
  progressDot: {
    height: 8,
    borderRadius: 4,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
    marginTop: Spacing.lg,
  },
  dateContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  dateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  dateTextContainer: {
    flex: 1,
  },
  interestsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  interestChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  interestText: {
    fontWeight: "500",
  },
  paceContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  paceOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing["2xl"],
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});
