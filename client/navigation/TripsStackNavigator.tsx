import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

import TripsScreen from "@/screens/TripsScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type TripsStackParamList = {
  Trips: undefined;
};

const Stack = createNativeStackNavigator<TripsStackParamList>();

export default function TripsStackNavigator() {
  const screenOptions = useScreenOptions();
  const { t } = useTranslation("trips");

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Trips"
        component={TripsScreen}
        options={{
          headerTitle: () => <HeaderTitle title={t("dashboard.title")} />,
        }}
      />
    </Stack.Navigator>
  );
}
