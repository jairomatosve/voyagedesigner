import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useStore } from "@/store/useStore";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

const languages: LanguageOption[] = [
  { code: "en", name: "English", flag: "US" },
  { code: "es", name: "Español", flag: "ES" },
  { code: "pt", name: "Português", flag: "PT" },
  { code: "fr", name: "Français", flag: "FR" },
];

interface LanguageSelectorProps {
  onClose?: () => void;
}

export function LanguageSelector({ onClose }: LanguageSelectorProps) {
  const { theme } = useTheme();
  const { i18n } = useTranslation();
  const { language, setLanguage } = useStore();

  const handleSelect = async (code: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await setLanguage(code);
    i18n.changeLanguage(code);
    onClose?.();
  };

  return (
    <View style={styles.container}>
      {languages.map((lang) => (
        <Pressable
          key={lang.code}
          onPress={() => handleSelect(lang.code)}
          style={[
            styles.option,
            {
              backgroundColor:
                language === lang.code
                  ? `${Colors.primary}15`
                  : theme.backgroundDefault,
              borderColor:
                language === lang.code ? Colors.primary : theme.border,
            },
          ]}
        >
          <ThemedText type="h3" style={styles.flag}>
            {getFlagEmoji(lang.flag)}
          </ThemedText>
          <ThemedText
            type="body"
            style={[
              styles.name,
              language === lang.code && { color: Colors.primary },
            ]}
          >
            {lang.name}
          </ThemedText>
          {language === lang.code ? (
            <Feather name="check" size={20} color={Colors.primary} />
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
  },
  flag: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  name: {
    flex: 1,
    fontWeight: "500",
  },
});
