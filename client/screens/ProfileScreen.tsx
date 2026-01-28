import React, { useState } from "react";
import { View, StyleSheet, Image, Pressable, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { Button } from "@/components/Button";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTheme } from "@/hooks/useTheme";
import { useStore } from "@/store/useStore";
import { Spacing, BorderRadius, Colors, Shadows } from "@/constants/theme";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { t, i18n } = useTranslation(["common", "trips"]);
  const { theme } = useTheme();
  const { user, trips, logout, language } = useStore();

  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    logout();
  };

  const getLanguageName = () => {
    const names: Record<string, string> = {
      en: "English",
      es: "Español",
      pt: "Português",
      fr: "Français",
    };
    return names[language] || "English";
  };

  const completedTrips = trips.filter((t) => t.status === "completed").length;
  const ongoingTrips = trips.filter((t) => t.status === "ongoing").length;

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        style={styles.avatarContainer}
      >
        <Image
          source={require("../../assets/images/avatar-default.png")}
          style={styles.avatar}
        />
        <Pressable
          style={[styles.editAvatarButton, { backgroundColor: Colors.primary }]}
        >
          <Feather name="camera" size={16} color="#FFFFFF" />
        </Pressable>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        style={styles.nameContainer}
      >
        <ThemedText type="h1">{user?.name || "Traveler"}</ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          {user?.email || "traveler@example.com"}
        </ThemedText>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(300).duration(400)}
        style={styles.statsRow}
      >
        <View
          style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}
        >
          <ThemedText type="h2" style={{ color: Colors.primary }}>
            {trips.length}
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {t("trips:tabs.trips")}
          </ThemedText>
        </View>
        <View
          style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}
        >
          <ThemedText type="h2" style={{ color: Colors.warning }}>
            {ongoingTrips}
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            Ongoing
          </ThemedText>
        </View>
        <View
          style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}
        >
          <ThemedText type="h2" style={{ color: Colors.success }}>
            {completedTrips}
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            Completed
          </ThemedText>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          {t("common:settings")}
        </ThemedText>

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowLanguageModal(true);
          }}
          style={[
            styles.settingItem,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <View style={styles.settingLeft}>
            <View
              style={[
                styles.settingIcon,
                { backgroundColor: `${Colors.primary}15` },
              ]}
            >
              <Feather name="globe" size={20} color={Colors.primary} />
            </View>
            <ThemedText type="body">{t("common:language")}</ThemedText>
          </View>
          <View style={styles.settingRight}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              {getLanguageName()}
            </ThemedText>
            <Feather
              name="chevron-right"
              size={20}
              color={theme.textSecondary}
            />
          </View>
        </Pressable>

        <Pressable
          style={[
            styles.settingItem,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <View style={styles.settingLeft}>
            <View
              style={[
                styles.settingIcon,
                { backgroundColor: `${Colors.accent}15` },
              ]}
            >
              <Feather name="bell" size={20} color={Colors.accent} />
            </View>
            <ThemedText type="body">Notifications</ThemedText>
          </View>
          <Feather
            name="chevron-right"
            size={20}
            color={theme.textSecondary}
          />
        </Pressable>

        <Pressable
          style={[
            styles.settingItem,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <View style={styles.settingLeft}>
            <View
              style={[
                styles.settingIcon,
                { backgroundColor: `${Colors.success}15` },
              ]}
            >
              <Feather name="shield" size={20} color={Colors.success} />
            </View>
            <ThemedText type="body">Privacy</ThemedText>
          </View>
          <Feather
            name="chevron-right"
            size={20}
            color={theme.textSecondary}
          />
        </Pressable>

        <Pressable
          style={[
            styles.settingItem,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <View style={styles.settingLeft}>
            <View
              style={[
                styles.settingIcon,
                { backgroundColor: `${Colors.warning}15` },
              ]}
            >
              <Feather name="help-circle" size={20} color={Colors.warning} />
            </View>
            <ThemedText type="body">Help & Support</ThemedText>
          </View>
          <Feather
            name="chevron-right"
            size={20}
            color={theme.textSecondary}
          />
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(500).duration(400)}>
        <Button
          onPress={handleLogout}
          variant="ghost"
          style={styles.logoutButton}
        >
          <View style={styles.logoutContent}>
            <Feather name="log-out" size={18} color={Colors.error} />
            <ThemedText type="body" style={{ color: Colors.error }}>
              {t("common:logout")}
            </ThemedText>
          </View>
        </Button>
      </Animated.View>

      <Modal
        visible={showLanguageModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={styles.modalHeader}>
              <ThemedText type="h2">{t("common:language")}</ThemedText>
              <Pressable onPress={() => setShowLanguageModal(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>
            <LanguageSelector onClose={() => setShowLanguageModal(false)} />
          </View>
        </View>
      </Modal>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  avatarContainer: {
    alignSelf: "center",
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  nameContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButton: {
    marginTop: Spacing.xl,
  },
  logoutContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
});
