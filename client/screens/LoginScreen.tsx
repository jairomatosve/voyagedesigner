import React, { useState } from "react";
import { View, StyleSheet, Image, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { useStore } from "@/store/useStore";
import { supabase } from "@/lib/supabase";
import { Spacing, Colors } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation(["auth", "common"]);
  const { theme } = useTheme();
  const { setUser, setAuthenticated } = useStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = t("auth:errors.email_required");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("auth:errors.invalid_email");
    }

    if (!password.trim()) {
      newErrors.password = t("auth:errors.password_required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Zustand store will automatically catch the onAuthStateChange event and update
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      console.error(error);
      setErrors({ email: error.message });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[Colors.primary, "#0D3D4D"]}
      style={styles.gradient}
    >
      <KeyboardAwareScrollViewCompat
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + Spacing["4xl"],
            paddingBottom: insets.bottom + Spacing["2xl"],
          },
        ]}
      >
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText type="display" style={styles.title}>
            {t("common:app_name")}
          </ThemedText>
          <ThemedText type="body" style={styles.subtitle}>
            {t("common:tagline")}
          </ThemedText>
        </View>

        <View
          style={[styles.form, { backgroundColor: theme.backgroundDefault }]}
        >
          <ThemedText type="h1" style={styles.formTitle}>
            {t("auth:login.title")}
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.formSubtitle, { color: theme.textSecondary }]}
          >
            {t("auth:login.subtitle")}
          </ThemedText>

          <Input
            placeholder={t("auth:login.email_placeholder")}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon="mail"
            error={errors.email}
          />

          <Input
            placeholder={t("auth:login.password_placeholder")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            leftIcon="lock"
            rightIcon={showPassword ? "eye-off" : "eye"}
            onRightIconPress={() => setShowPassword(!showPassword)}
            error={errors.password}
          />

          <Button
            onPress={handleLogin}
            loading={loading}
            variant="accent"
            style={styles.loginButton}
          >
            {loading ? t("auth:login.signing_in") : t("auth:login.button")}
          </Button>

          <View style={styles.footer}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              {t("auth:login.no_account")}{" "}
            </ThemedText>
            <Pressable onPress={() => navigation.navigate("Signup")}>
              <ThemedText type="link">{t("auth:login.sign_up_link")}</ThemedText>
            </Pressable>
          </View>
        </View>
      </KeyboardAwareScrollViewCompat>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: Spacing.lg,
  },
  title: {
    color: "#FFFFFF",
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
  },
  form: {
    borderRadius: 24,
    padding: Spacing["2xl"],
    flex: 1,
  },
  formTitle: {
    marginBottom: Spacing.xs,
  },
  formSubtitle: {
    marginBottom: Spacing["2xl"],
  },
  loginButton: {
    marginTop: Spacing.lg,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing["2xl"],
  },
});
