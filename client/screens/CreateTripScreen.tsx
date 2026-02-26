import React, { useState } from "react";
import { View, StyleSheet, Pressable, Platform, TextInput, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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

export default function CreateTripScreen() {
  const navigation = useNavigation<NavigationProp>();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation("trips");
  const { theme } = useTheme();
  const { addTrip } = useStore();

  const [title, setTitle] = useState("");
  const [globalDestination, setGlobalDestination] = useState("");
  const [globalLatitude, setGlobalLatitude] = useState<number | null>(null);
  const [globalLongitude, setGlobalLongitude] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [globalVisibility, setGlobalVisibility] = useState<"public" | "contacts" | "private">("private");
  const [globalStartDate, setGlobalStartDate] = useState<string | null>(null);
  const [globalEndDate, setGlobalEndDate] = useState<string | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [markedDates, setMarkedDates] = useState<any>({});

  const [loading, setLoading] = useState(false);

  const handleDestinationSearch = async (text: string) => {
    setGlobalDestination(text);
    if (text.length > 2) {
      setIsSearching(true);
      setShowSuggestions(true);
      try {
        const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&featuretype=city&addressdetails=1`);
        const data = await resp.json();
        const formattedData = data.slice(0, 5).map((item: any) => {
          const parts = item.display_name.split(",");
          const city = parts[0].trim();
          const country = parts[parts.length - 1].trim();
          return {
            ...item,
            clean_name: `${city}, ${country}`
          };
        });
        setSuggestions(formattedData);
      } catch (e) {
        console.error("Nominatim search failed:", e);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (item: any) => {
    setGlobalDestination(item.clean_name);
    setGlobalLatitude(parseFloat(item.lat));
    setGlobalLongitude(parseFloat(item.lon));
    setShowSuggestions(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

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

  const handleCreate = async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (!globalStartDate || !globalEndDate) throw new Error("Missing dates");

      const tripData = {
        title: title || `Trip to ${globalDestination.split(',')[0]}`,
        destination: globalDestination,
        visibility: globalVisibility,
        latitude: globalLatitude,
        longitude: globalLongitude,
        startDate: new Date(globalStartDate).toISOString(),
        endDate: new Date(globalEndDate).toISOString(),
        totalBudget: 0,
        currency: "USD",
        destinations: [{
          location: globalDestination,
          orderIndex: 0,
          startDate: new Date(globalStartDate).toISOString(),
          endDate: new Date(globalEndDate).toISOString(),
          transportType: null,
        }]
      };

      const response = await apiRequest("POST", "/api/trips", tripData);
      const newTrip: Trip = await response.json();

      addTrip(newTrip);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack(); // Will push to Hub in next iteration when Hub is ready
    } catch (error) {
      console.error("Failed to create trip:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    return globalDestination.trim().length > 0 && globalStartDate !== null && globalEndDate !== null;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[styles.content, { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + Spacing['4xl'] }]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => navigation.goBack()} style={{ marginBottom: Spacing.xl }}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>

        <View style={styles.stepContent}>
          <ThemedText type="h1" style={[styles.stepTitle, { textAlign: 'center', marginBottom: Spacing['2xl'] }]}>
            {t("create_trip.title", "Planificar un nuevo viaje")}
          </ThemedText>

          <Input
            label={t("create_trip.title_optional", "Trip Title")}
            placeholder={t("create_trip.title_placeholder_opt", "e.g., Eurotrip 2024")}
            value={title}
            onChangeText={setTitle}
            leftIcon="edit-3"
          />

          <View style={[styles.customInputContainer, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
            <View style={styles.destInputRow}>
              <ThemedText type="body" style={{ fontWeight: 'bold' }}>
                {t("create_trip.where_to", "¿A dónde?")}
              </ThemedText>
              <TextInput
                style={[styles.transparentInput, { color: theme.text }]}
                placeholder={t("create_trip.destination_placeholder", "p. ej. París, Hawái, Japón")}
                placeholderTextColor={theme.textSecondary}
                value={globalDestination}
                onChangeText={handleDestinationSearch}
                {...Platform.select({ web: { outlineStyle: 'none' } as any })}
              />
            </View>
            {showSuggestions && suggestions.length > 0 && (
              <View style={{ backgroundColor: theme.backgroundTertiary, borderTopWidth: 1, borderTopColor: theme.border }}>
                {suggestions.map((item, idx) => (
                  <Pressable
                    key={item.place_id || idx}
                    style={{ padding: Spacing.md, borderBottomWidth: idx < suggestions.length - 1 ? 1 : 0, borderBottomColor: theme.border }}
                    onPress={() => selectSuggestion(item)}
                  >
                    <ThemedText style={{ color: theme.text }}>{item.clean_name}</ThemedText>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
          {!globalDestination && (
            <ThemedText type="caption" style={{ color: Colors.error, textAlign: 'center', marginBottom: Spacing.xl }}>
              {t("create_trip.choose_destination_prompt", "Elige un destino para comenzar a planificar")}
            </ThemedText>
          )}

          {globalDestination ? <View style={{ height: Spacing.xl }} /> : null}

          <View style={[styles.customInputContainer, { backgroundColor: theme.inputBackground, borderColor: theme.border, padding: 0, overflow: 'hidden' }]}>
            <ThemedText type="small" style={{ fontWeight: '600', padding: Spacing.md, paddingBottom: 0 }}>
              {t("create_trip.dates_optional", "Fechas (opcional)")}
            </ThemedText>
            <Pressable
              style={styles.datesRow}
              onPress={() => setShowCalendarModal(true)}
            >
              <View style={styles.dateBlock}>
                <Feather name="calendar" size={16} color={theme.textSecondary} />
                <ThemedText type="body" style={{ color: globalStartDate ? theme.text : theme.textSecondary }}>
                  {globalStartDate ? formatDate(new Date(globalStartDate + 'T12:00:00')) : t("create_trip.start_date_short", "Fecha de inicio")}
                </ThemedText>
              </View>
              <View style={{ width: 1, height: 20, backgroundColor: theme.border }} />
              <View style={styles.dateBlock}>
                <Feather name="calendar" size={16} color={theme.textSecondary} />
                <ThemedText type="body" style={{ color: globalEndDate ? theme.text : theme.textSecondary }}>
                  {globalEndDate ? formatDate(new Date(globalEndDate + 'T12:00:00')) : t("create_trip.end_date_short", "Fecha de fin")}
                </ThemedText>
              </View>
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.xl, paddingHorizontal: Spacing.sm, zIndex: -1 }}>
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
              <Feather name="plus" size={20} color={theme.textSecondary} />
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                {t("create_trip.invite_companions", "+ Travel Crew")}
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => {
                const options: ("public" | "contacts" | "private")[] = ["contacts", "public", "private"];
                const nextIdx = (options.indexOf(globalVisibility) + 1) % options.length;
                setGlobalVisibility(options[nextIdx]);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: theme.backgroundTertiary, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.sm }}
            >
              <Feather name={globalVisibility === 'public' ? "globe" : globalVisibility === 'contacts' ? "users" : "lock"} size={16} color={theme.textSecondary} />
              <ThemedText type="body" style={{ color: theme.text, textTransform: 'capitalize' }}>
                {globalVisibility === 'contacts' ? t("create_trip.tour_group", "Contacts") : globalVisibility}
              </ThemedText>
              <Feather name="chevron-down" size={16} color={theme.textSecondary} />
            </Pressable>
          </View>

          <Modal
            visible={showCalendarModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowCalendarModal(false)}
          >
            <Pressable style={styles.modalOverlay} onPress={() => setShowCalendarModal(false)}>
              <Pressable style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]} onPress={(e) => e.stopPropagation()}>
                <View style={styles.modalHeader}>
                  <ThemedText type="h4">{t("create_trip.step_dates")}</ThemedText>
                  <Pressable onPress={() => setShowCalendarModal(false)} style={{ padding: Spacing.xs }}>
                    <Feather name="x" size={24} color={theme.text} />
                  </Pressable>
                </View>
                <View style={{ flex: 1, borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: theme.border, marginHorizontal: Spacing.md, marginBottom: Spacing.md }}>
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
                <View style={{ padding: Spacing.lg, borderTopWidth: 1, borderColor: theme.border, flexDirection: 'row', justifyContent: 'center', gap: Spacing.md }}>
                  <Button onPress={() => { setGlobalStartDate(null); setGlobalEndDate(null); setMarkedDates({}); }} variant="ghost" style={{ flex: 1 }}>
                    {t("common:clear", "Borrar fechas")}
                  </Button>
                  <Button onPress={() => setShowCalendarModal(false)} variant="primary" style={{ flex: 1 }}>
                    {t("common:save", "Guardar fechas")}
                  </Button>
                </View>
              </Pressable>
            </Pressable>
          </Modal>

        </View>

        <View style={styles.buttonContainer}>
          <Button
            onPress={handleCreate}
            variant="primary"
            size="large"
            disabled={!canProceed() || loading}
            loading={loading}
            style={styles.nextButton}
            rightIcon={<Feather name="check" size={20} color={!canProceed() ? theme.textSecondary : "#FFFFFF"} />}
          >
            {t("create_trip.button_create", "Create Trip")}
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
  content: {
    paddingHorizontal: Spacing.xl,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    marginBottom: Spacing["2xl"],
  },
  customInputContainer: {
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  destInputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  transparentInput: {
    flex: 1,
    marginLeft: Spacing.md,
    fontSize: 16,
  },
  datesRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
  },
  dateBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "80%",
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing["2xl"],
  },
  nextButton: {
    flex: 1,
  },
});
