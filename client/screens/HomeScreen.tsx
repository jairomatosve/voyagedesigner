import { FlatList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

import { useTheme } from "@/hooks/useTheme";
import { useStore } from "@/store/useStore";
import { Spacing } from "@/constants/theme";
import { TripCard } from "@/components/TripCard";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import type { Trip } from "@/types";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useTranslation } from "react-i18next";

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { t } = useTranslation("trips");

  const { trips, setTrips } = useStore();

  const { data, isLoading, refetch } = useQuery<Trip[]>({
    queryKey: ["/api/trips"],
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Sync to store when data successfully load
  useFocusEffect(
    useCallback(() => {
      if (data) {
        setTrips(data);
      }
    }, [data, setTrips])
  );

  if (isLoading && trips.length === 0) {
    return (
      <View style={{ flex: 1, padding: Spacing.xl, paddingTop: headerHeight + Spacing.xl, backgroundColor: theme.backgroundRoot }}>
        <LoadingSkeleton />
        <LoadingSkeleton />
      </View>
    );
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={trips}
      renderItem={({ item }) => (
        <TripCard
          trip={item}
          onPress={() => navigation.navigate("TripDetail", { tripId: item.id })}
        />
      )}
      ListEmptyComponent={
        <EmptyState
          image={require('../../assets/images/icon.png')}
          title={t("dashboard.no_trips")}
          subtitle={t("dashboard.no_trips_subtitle")}
        />
      }
    />
  );
}
