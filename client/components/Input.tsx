import React, { useState } from "react";
import {
  TextInput,
  View,
  StyleSheet,
  TextInputProps,
  Pressable,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Feather.glyphMap;
  rightIcon?: keyof typeof Feather.glyphMap;
  onRightIconPress?: () => void;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  ...props
}: InputProps) {
  const { theme, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const borderColor = useSharedValue(theme.border);

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
  }));

  const handleFocus = () => {
    setIsFocused(true);
    borderColor.value = withSpring(Colors.primary);
  };

  const handleBlur = () => {
    setIsFocused(false);
    borderColor.value = withSpring(error ? Colors.error : theme.border);
  };

  return (
    <View style={styles.container}>
      {label ? (
        <ThemedText type="small" style={styles.label}>
          {label}
        </ThemedText>
      ) : null}
      <Animated.View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.inputBackground,
            borderColor: error ? Colors.error : theme.border,
          },
          animatedStyle,
        ]}
      >
        {leftIcon ? (
          <Feather
            name={leftIcon}
            size={20}
            color={isFocused ? Colors.primary : theme.textSecondary}
            style={styles.leftIcon}
          />
        ) : null}
        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
              paddingLeft: leftIcon ? 0 : Spacing.lg,
              paddingRight: rightIcon ? 0 : Spacing.lg,
            },
            style,
          ]}
          placeholderTextColor={theme.textSecondary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {rightIcon ? (
          <Pressable onPress={onRightIconPress} style={styles.rightIcon}>
            <Feather
              name={rightIcon}
              size={20}
              color={theme.textSecondary}
            />
          </Pressable>
        ) : null}
      </Animated.View>
      {error ? (
        <ThemedText
          type="caption"
          style={[styles.error, { color: Colors.error }]}
        >
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    height: Spacing.inputHeight,
  },
  leftIcon: {
    marginLeft: Spacing.lg,
    marginRight: Spacing.sm,
  },
  rightIcon: {
    paddingHorizontal: Spacing.lg,
    height: "100%",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    ...Platform.select({
      web: {
        outlineStyle: "none",
      } as any,
    }),
  },
  error: {
    marginTop: Spacing.xs,
  },
});
