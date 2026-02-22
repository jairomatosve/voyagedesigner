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

export default function SignupScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation(["auth", "common"]);
  const { theme } = useTheme();
  const { setUser, setAuthenticated } = useStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = t("auth:errors.name_required");
    }

    if (!email.trim()) {
      newErrors.email = t("auth:errors.email_required");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("auth:errors.invalid_email");
    }

    if (!password.trim()) {
      newErrors.password = t("auth:errors.password_required");
    } else if (password.length < 8) {
      newErrors.password = t("auth:errors.password_too_short");
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = t("auth:errors.passwords_dont_match");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name,
          },
        },
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
            paddingTop: insets.top + Spacing["3xl"],
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
        </View>

        <View
          style={[styles.form, { backgroundColor: theme.backgroundDefault }]}
        >
          <ThemedText type="h1" style={styles.formTitle}>
            {t("auth:signup.title")}
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.formSubtitle, { color: theme.textSecondary }]}
          >
            {t("auth:signup.subtitle")}
          </ThemedText>

          <Input
            placeholder={t("auth:signup.name_placeholder")}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            leftIcon="user"
            error={errors.name}
          />

          <Input
            placeholder={t("auth:signup.email_placeholder")}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon="mail"
            error={errors.email}
          />

          <Input
            placeholder={t("auth:signup.password_placeholder")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            leftIcon="lock"
            rightIcon={showPassword ? "eye-off" : "eye"}
            onRightIconPress={() => setShowPassword(!showPassword)}
            error={errors.password}
          />

          <Input
            placeholder={t("auth:signup.confirm_password_placeholder")}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            leftIcon="lock"
            error={errors.confirmPassword}
          />

          <Button
            onPress={handleSignup}
            loading={loading}
            variant="accent"
            style={styles.signupButton}
          >
            {loading ? t("auth:signup.creating") : t("auth:signup.button")}
          </Button>

          <View style={styles.footer}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              {t("auth:signup.have_account")}{" "}
            </ThemedText>
            <Pressable onPress={() => navigation.goBack()}>
              <ThemedText type="link">{t("auth:signup.sign_in_link")}</ThemedText>
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
    marginBottom: Spacing["2xl"],
  },
  logo: {
    width: 60,
    height: 60,
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
  signupButton: {
    marginTop: Spacing.lg,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing["2xl"],
  },
});
