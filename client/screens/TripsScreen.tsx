import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { TripCard } from "@/components/TripCard";
import { EmptyState } from "@/components/EmptyState";
import { TripCardSkeleton } from "@/components/LoadingSkeleton";
import { useTheme } from "@/hooks/useTheme";
import { useStore } from "@/store/useStore";
import { Spacing, BorderRadius, Colors, Shadows } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { Trip } from "@/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TripsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation("trips");
  const { theme } = useTheme();
  const { trips, setCurrentTrip, isLoading } = useStore();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleTripPress = (trip: Trip) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentTrip(trip);
    navigation.navigate("TripDetail", { tripId: trip.id });
  };

  const handleCreateTrip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("CreateTrip");
  };

  const renderTrip = ({ item, index }: { item: Trip; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
      <TripCard trip={item} onPress={() => handleTripPress(item)} />
    </Animated.View>
  );

  const renderEmpty = () => (
    <EmptyState
      image={require("../../assets/images/empty-trips.png")}
      title={t("dashboard.no_trips")}
      subtitle={t("dashboard.no_trips_subtitle")}
      actionLabel={t("dashboard.create_trip")}
      onAction={handleCreateTrip}
    />
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <TripCardSkeleton />
      <TripCardSkeleton />
      <TripCardSkeleton />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        renderItem={renderTrip}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: tabBarHeight + Spacing["4xl"] + 60,
          },
          trips.length === 0 && styles.emptyList,
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={isInitialLoad ? renderLoading : renderEmpty}
      />

      <Pressable
        onPress={handleCreateTrip}
        style={[
          styles.fab,
          { backgroundColor: Colors.accent, bottom: tabBarHeight + Spacing.xl },
          Shadows.fab,
        ]}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  emptyList: {
    flexGrow: 1,
  },
  loadingContainer: {
    paddingTop: Spacing.lg,
  },
  fab: {
    position: "absolute",
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
