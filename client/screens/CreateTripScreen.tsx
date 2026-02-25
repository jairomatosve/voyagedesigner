import React, { useState } from "react";
import { View, StyleSheet, Pressable, ScrollView, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import DateTimePicker from "@react-native-community/datetimepicker";
import { CalendarList, DateData } from "react-native-calendars";

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

interface DestinationStop {
  id: string;
  location: string;
  startDate: Date;
  endDate: Date;
  transportType: string | null;
}

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

  // Step 1: Global Range State
  const [globalDestination, setGlobalDestination] = useState("");
  const [globalStartDate, setGlobalStartDate] = useState<string | null>(null);
  const [globalEndDate, setGlobalEndDate] = useState<string | null>(null);
  const [markedDates, setMarkedDates] = useState<any>({});

  // Dynamic multi-destination state (Start Point -> Stops... -> Return Point)
  const [destinations, setDestinations] = useState<DestinationStop[]>([]);

  const [budget, setBudget] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [pace, setPace] = useState<"relaxed" | "moderate" | "fast">("moderate");
  const [loading, setLoading] = useState(false);

  // Date Picker Modals State
  const [activeDatePicker, setActiveDatePicker] = useState<{ id: string, type: 'start' | 'end' } | null>(null);
  const [hoveredTransport, setHoveredTransport] = useState<string | null>(null);

  const totalSteps = 4;

  // Sync internal destinations when reaching Step 2 for the first time
  React.useEffect(() => {
    if (step === 2 && destinations.length === 0 && globalStartDate && globalEndDate) {
      const start = new Date(globalStartDate + 'T12:00:00');
      const end = new Date(globalEndDate + 'T12:00:00');

      setDestinations([
        {
          id: "start",
          location: globalDestination,
          startDate: start,
          endDate: start,
          transportType: "flight",
        },
        {
          id: "1",
          location: "",
          startDate: new Date(start.getTime() + 24 * 60 * 60 * 1000),
          endDate: new Date(end.getTime() - 24 * 60 * 60 * 1000),
          transportType: "flight",
        },
        {
          id: "return",
          location: "", // Ask user where they return
          startDate: end,
          endDate: end,
          transportType: null,
        }
      ]);
    }
  }, [step, globalStartDate, globalEndDate]);

  const onDayPress = (day: DateData) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!globalStartDate || (globalStartDate && globalEndDate)) {
      setGlobalStartDate(day.dateString);
      setGlobalEndDate(null);
      setMarkedDates({ [day.dateString]: { startingDay: true, color: Colors.primary, textColor: '#fff' } });
    } else if (globalStartDate && !globalEndDate) {
      const start = new Date(globalStartDate);
      const end = new Date(day.dateString);

      if (end <= start) {
        setGlobalStartDate(day.dateString);
        setMarkedDates({ [day.dateString]: { startingDay: true, color: Colors.primary, textColor: '#fff' } });
      } else {
        setGlobalEndDate(day.dateString);
        const range: any = {};
        let current = new Date(start);

        while (current <= end) {
          const dateStr = current.toISOString().split('T')[0];
          if (dateStr === globalStartDate) {
            range[dateStr] = { startingDay: true, color: Colors.primary, textColor: '#fff' };
          } else if (dateStr === day.dateString) {
            range[dateStr] = { endingDay: true, color: Colors.primary, textColor: '#fff' };
          } else {
            range[dateStr] = { color: theme.backgroundTertiary, textColor: theme.text };
          }
          current.setDate(current.getDate() + 1);
        }
        setMarkedDates(range);
      }
    }
  };

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
      if (!globalStartDate || !globalEndDate) throw new Error("Missing dates");

      const tripData = {
        title: title || `Trip to ${globalDestination}`,
        startDate: new Date(globalStartDate).toISOString(),
        endDate: new Date(globalEndDate).toISOString(),
        totalBudget: parseFloat(budget) || null,
        currency: "USD",
        destinations: destinations.map((d, index) => ({
          location: d.location,
          orderIndex: index,
          startDate: d.startDate.toISOString(),
          endDate: d.endDate.toISOString(),
          transportType: d.transportType
        }))
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
        // Must have global destination and dual dates selected
        return globalDestination.trim().length > 0 && globalStartDate !== null && globalEndDate !== null;
      case 2:
        // Must have at least one valid destination where start is before end
        const isValid = destinations.every(d => d.location.trim().length > 0 && d.startDate <= d.endDate);
        return destinations.length > 0 && isValid;
      case 3:
      case 4:
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

  const addDestination = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Insert new stop BEFORE the Return Point
    setDestinations((prev) => {
      const returnPoint = prev[prev.length - 1];
      const previousStop = prev[prev.length - 2] || prev[0];

      const newStop: DestinationStop = {
        id: Math.random().toString(),
        location: "",
        startDate: new Date(previousStop.endDate),
        endDate: new Date(previousStop.endDate.getTime() + 3 * 24 * 60 * 60 * 1000),
        transportType: "flight"
      };

      // Push Return Point's dates back
      const updatedReturnPoint = {
        ...returnPoint,
        startDate: new Date(newStop.endDate.getTime() + 24 * 60 * 60 * 1000),
        endDate: new Date(newStop.endDate.getTime() + 24 * 60 * 60 * 1000),
      };

      return [...prev.slice(0, prev.length - 1), newStop, updatedReturnPoint];
    });
  };

  const removeDestination = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDestinations(destinations.filter(d => d.id !== id));
  };

  const updateDestination = (id: string, field: keyof DestinationStop, value: any) => {
    setDestinations(destinations.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <ThemedText type="h2" style={styles.stepTitle}>
        {t("create_trip.step_destination_and_dates")}
      </ThemedText>

      <Input
        label={t("create_trip.where_to")}
        placeholder="e.g., Europe, Japan, Hawaii..."
        value={globalDestination}
        onChangeText={setGlobalDestination}
        leftIcon="map-pin"
      />

      <Input
        label={t("create_trip.title_optional")}
        placeholder={t("create_trip.title_placeholder_opt")}
        value={title}
        onChangeText={setTitle}
        leftIcon="edit-3"
      />

      <ThemedText type="h4" style={styles.sectionTitle}>
        {t("create_trip.step_dates")}
      </ThemedText>

      <View style={{ flex: 1, borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: theme.border }}>
        <CalendarList
          horizontal={Platform.OS === 'web'}
          pagingEnabled={Platform.OS === 'web'}
          pastScrollRange={0}
          futureScrollRange={24}
          markingType={'period'}
          markedDates={markedDates}
          onDayPress={onDayPress}
          theme={{
            backgroundColor: theme.backgroundSecondary,
            calendarBackground: theme.backgroundSecondary,
            textSectionTitleColor: theme.textSecondary,
            selectedDayBackgroundColor: Colors.primary,
            selectedDayTextColor: '#ffffff',
            todayTextColor: Colors.primary,
            dayTextColor: theme.text,
            textDisabledColor: theme.border,
            monthTextColor: theme.text,
          }}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <ThemedText type="h2" style={styles.stepTitle}>
        {t("create_trip.step_itinerary")}
      </ThemedText>

      <ScrollView style={{ marginTop: Spacing.md }} showsVerticalScrollIndicator={false}>
        {destinations.map((dest, index) => (
          <View key={dest.id} style={[styles.destinationCard, { backgroundColor: theme.backgroundSecondary }]}>
            <View style={styles.destHeader}>
              <ThemedText type="h4" style={styles.destIndex}>
                {index === 0
                  ? t("create_trip.start_point")
                  : index === destinations.length - 1 && destinations.length > 1
                    ? t("create_trip.return_point")
                    : `${t("create_trip.stop")} ${index}`}
              </ThemedText>
              {destinations.length > 1 && (
                <Pressable onPress={() => removeDestination(dest.id)} style={styles.removeBtn}>
                  <Feather name="x" size={20} color={Colors.error} />
                </Pressable>
              )}
            </View>

            <Input
              placeholder={t("create_trip.where_to")}
              value={dest.location}
              onChangeText={(text) => updateDestination(dest.id, "location", text)}
              leftIcon="map-pin"
            />

            <View style={styles.dateRow}>
              <Pressable
                onPress={() => {
                  if (Platform.OS !== 'web') setActiveDatePicker({ id: dest.id, type: 'start' });
                }}
                style={[styles.smallDateBtn, { backgroundColor: theme.backgroundTertiary, overflow: 'hidden' }]}
              >
                <Feather name="calendar" size={14} color={Colors.primary} />
                <ThemedText type="caption">{formatDate(dest.startDate)}</ThemedText>
                {Platform.OS === 'web' && (
                  <input
                    type="date"
                    value={dest.startDate.toISOString().split('T')[0]}
                    min={index > 0 ? destinations[index - 1].endDate.toISOString().split('T')[0] : undefined}
                    onChange={(e) => {
                      if (e.target.value) {
                        const newDate = new Date(e.target.value + 'T12:00:00');
                        updateDestination(dest.id, 'startDate', newDate);
                      }
                    }}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' } as any}
                  />
                )}
              </Pressable>

              <Feather name="arrow-right" size={16} color={theme.textSecondary} />

              <Pressable
                onPress={() => {
                  if (Platform.OS !== 'web') setActiveDatePicker({ id: dest.id, type: 'end' });
                }}
                style={[styles.smallDateBtn, { backgroundColor: theme.backgroundTertiary, overflow: 'hidden' }]}
              >
                <Feather name="calendar" size={14} color={Colors.accent} />
                <ThemedText type="caption">{formatDate(dest.endDate)}</ThemedText>
                {Platform.OS === 'web' && (
                  <input
                    type="date"
                    value={dest.endDate.toISOString().split('T')[0]}
                    min={dest.startDate.toISOString().split('T')[0]}
                    onChange={(e) => {
                      if (e.target.value) {
                        const newDate = new Date(e.target.value + 'T12:00:00');
                        updateDestination(dest.id, 'endDate', newDate);
                      }
                    }}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' } as any}
                  />
                )}
              </Pressable>
            </View>

            {/* Transport Picker for NEXT destination (if not the last one) */}
            {index < destinations.length - 1 && (
              <View style={styles.transportContainer}>
                <View style={[styles.transportLine, { backgroundColor: theme.border }]} />
                <View style={[styles.transportPicker, { backgroundColor: theme.backgroundTertiary }]}>
                  {["flight", "train", "car", "bus"].map(mode => {
                    const isHoveredLocal = hoveredTransport === `${dest.id}-${mode}`;
                    const isActive = dest.transportType === mode;
                    const isExpanded = isActive || isHoveredLocal;

                    return (
                      <Pressable
                        key={mode}
                        onPress={() => updateDestination(dest.id, "transportType", mode)}
                        //@ts-ignore
                        onHoverIn={() => setHoveredTransport(`${dest.id}-${mode}`)}
                        onHoverOut={() => setHoveredTransport(null)}
                        style={[
                          styles.transportBtn,
                          isExpanded && { backgroundColor: isActive ? Colors.primary : theme.border, width: 'auto', paddingHorizontal: Spacing.md }
                        ]}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                          <Ionicons
                            name={mode === 'flight' ? 'airplane' : mode === 'train' ? 'train' : mode === 'car' ? 'car' : 'bus'}
                            size={16}
                            color={isActive ? '#FFF' : theme.textSecondary}
                          />
                          {isExpanded && (
                            <ThemedText type="caption" style={{ color: isActive ? '#FFF' : theme.text, fontWeight: '500' }}>
                              {t(`create_trip.transport_${mode}`)}
                            </ThemedText>
                          )}
                        </View>
                      </Pressable>
                    )
                  })}
                </View>
                <View style={[styles.transportLine, { backgroundColor: theme.border }]} />
              </View>
            )}

            {/* Date Picker Modal for current dest */}
            {activeDatePicker?.id === dest.id && Platform.OS !== 'web' && (
              <DateTimePicker
                value={activeDatePicker.type === 'start' ? dest.startDate : dest.endDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                minimumDate={activeDatePicker.type === 'end' ? dest.startDate : undefined}
                onChange={(_, date) => {
                  setActiveDatePicker(null);
                  if (date) updateDestination(dest.id, activeDatePicker.type === 'start' ? 'startDate' : 'endDate', date);
                }}
              />
            )}
          </View>
        ))}

        <Button
          variant="outline"
          onPress={addDestination}
          style={styles.addDestBtn}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.sm }}>
            <Feather name="plus" size={18} color={theme.text} />
            <ThemedText style={{ color: theme.text }}>{t("create_trip.add_stop")}</ThemedText>
          </View>
        </Button>
      </ScrollView>

    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <ThemedText type="h2" style={styles.stepTitle}>
        {t("create_trip.step_budget")}
      </ThemedText>

      <ThemedText type="body" style={{ color: theme.textSecondary, marginBottom: Spacing.xl }}>
        {t("create_trip.overall_budget")}
      </ThemedText>

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

  const renderStep4 = () => (
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
        {step === 4 && renderStep4()}

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
  destinationCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  destHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  destIndex: {
    fontWeight: "600",
  },
  removeBtn: {
    padding: Spacing.xs,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  smallDateBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  transportContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.lg,
  },
  transportLine: {
    flex: 1,
    height: 1,
  },
  transportPicker: {
    flexDirection: "row",
    padding: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    marginHorizontal: Spacing.md,
  },
  transportBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  addDestBtn: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
});
