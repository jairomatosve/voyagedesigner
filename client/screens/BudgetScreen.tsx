import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Modal,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Svg, { Circle } from "react-native-svg";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useTheme } from "@/hooks/useTheme";
import { useStore } from "@/store/useStore";
import { Spacing, BorderRadius, Colors, Shadows } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { Expense, ExpenseCategory } from "@/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type BudgetRouteProp = RouteProp<RootStackParamList, "Budget">;

const categoryColors: Record<ExpenseCategory, string> = {
  accommodation: Colors.primary,
  food: "#F59E0B",
  transport: "#3B82F6",
  activities: Colors.accent,
  shopping: "#8B5CF6",
  other: "#6B7280",
};

const categoryIcons: Record<ExpenseCategory, keyof typeof Feather.glyphMap> = {
  accommodation: "home",
  food: "coffee",
  transport: "navigation",
  activities: "activity",
  shopping: "shopping-bag",
  other: "more-horizontal",
};

export default function BudgetScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<BudgetRouteProp>();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation("itinerary");
  const { theme } = useTheme();
  const { currentTrip, expenses, addExpense } = useStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: "food" as ExpenseCategory,
    amount: "",
    description: "",
  });

  const tripExpenses = expenses.filter((e) => e.tripId === route.params.tripId);

  const totalBudget = currentTrip?.totalBudget || 0;
  const totalSpent = tripExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = totalBudget - totalSpent;
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const expensesByCategory = tripExpenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  const handleAddExpense = () => {
    if (!newExpense.amount || !newExpense.description) return;

    const expense: Expense = {
      id: `expense-${Date.now()}`,
      tripId: route.params.tripId,
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
      description: newExpense.description,
      date: new Date().toISOString(),
    };

    addExpense(expense);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowAddModal(false);
    setNewExpense({ category: "food", amount: "", description: "" });
  };

  const renderDonutChart = () => {
    const size = 160;
    const strokeWidth = 16;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(spentPercentage, 100);
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <View style={styles.chartContainer}>
        <Svg width={size} height={size} style={styles.chart}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.backgroundTertiary}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={
              spentPercentage > 100
                ? Colors.error
                : spentPercentage > 80
                  ? Colors.warning
                  : Colors.primary
            }
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={styles.chartCenter}>
          <ThemedText type="h2">${totalSpent.toFixed(0)}</ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {t("budget.spent")}
          </ThemedText>
        </View>
      </View>
    );
  };

  const renderExpense = ({ item, index }: { item: Expense; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(300)}
      style={[
        styles.expenseCard,
        { backgroundColor: theme.backgroundDefault },
      ]}
    >
      <View
        style={[
          styles.expenseIcon,
          { backgroundColor: `${categoryColors[item.category]}15` },
        ]}
      >
        <Feather
          name={categoryIcons[item.category]}
          size={18}
          color={categoryColors[item.category]}
        />
      </View>
      <View style={styles.expenseContent}>
        <ThemedText type="body">{item.description}</ThemedText>
        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
          {t(`budget.categories.${item.category}`)}
        </ThemedText>
      </View>
      <ThemedText type="h4" style={{ color: Colors.error }}>
        -${item.amount.toFixed(0)}
      </ThemedText>
    </Animated.View>
  );

  const renderEmpty = () => (
    <EmptyState
      image={require("../../assets/images/empty-budget.png")}
      title={t("budget.no_expenses")}
      subtitle={t("budget.no_expenses_subtitle")}
      actionLabel={t("budget.add_expense")}
      onAction={() => setShowAddModal(true)}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Animated.View entering={FadeIn.duration(400)}>
        {renderDonutChart()}
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        style={styles.budgetSummary}
      >
        <View style={styles.summaryItem}>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {t("budget.total_budget")}
          </ThemedText>
          <ThemedText type="h3">${totalBudget.toFixed(0)}</ThemedText>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {t("budget.remaining")}
          </ThemedText>
          <ThemedText
            type="h3"
            style={{ color: remaining >= 0 ? Colors.success : Colors.error }}
          >
            ${remaining.toFixed(0)}
          </ThemedText>
        </View>
      </Animated.View>

      {Object.keys(expensesByCategory).length > 0 ? (
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={styles.categoriesContainer}
        >
          <ThemedText type="h4" style={styles.categoriesTitle}>
            By Category
          </ThemedText>
          {Object.entries(expensesByCategory).map(([category, amount]) => (
            <View key={category} style={styles.categoryRow}>
              <View style={styles.categoryLeft}>
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: categoryColors[category as ExpenseCategory] },
                  ]}
                />
                <ThemedText type="body">
                  {t(`budget.categories.${category}`)}
                </ThemedText>
              </View>
              <ThemedText type="body">${amount.toFixed(0)}</ThemedText>
            </View>
          ))}
        </Animated.View>
      ) : null}

      {tripExpenses.length > 0 ? (
        <ThemedText type="h4" style={styles.expensesTitle}>
          Recent Expenses
        </ThemedText>
      ) : null}
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={tripExpenses}
        keyExtractor={(item) => item.id}
        renderItem={renderExpense}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing["4xl"] + 60,
          paddingHorizontal: Spacing.lg,
          flexGrow: tripExpenses.length === 0 ? 1 : undefined,
        }}
        showsVerticalScrollIndicator={false}
      />

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setShowAddModal(true);
        }}
        style={[
          styles.fab,
          { backgroundColor: Colors.accent, bottom: insets.bottom + Spacing.xl },
          Shadows.fab,
        ]}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </Pressable>

      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={styles.modalHeader}>
              <ThemedText type="h2">{t("budget.add_expense")}</ThemedText>
              <Pressable onPress={() => setShowAddModal(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ThemedText type="small" style={styles.categoryLabel}>
              {t("budget.category")}
            </ThemedText>
            <View style={styles.categoryGrid}>
              {(Object.keys(categoryColors) as ExpenseCategory[]).map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setNewExpense({ ...newExpense, category: cat });
                  }}
                  style={[
                    styles.categoryOption,
                    {
                      backgroundColor:
                        newExpense.category === cat
                          ? categoryColors[cat]
                          : theme.backgroundSecondary,
                    },
                  ]}
                >
                  <Feather
                    name={categoryIcons[cat]}
                    size={18}
                    color={newExpense.category === cat ? "#FFFFFF" : theme.text}
                  />
                </Pressable>
              ))}
            </View>

            <Input
              label={t("budget.amount")}
              placeholder="0"
              value={newExpense.amount}
              onChangeText={(text) =>
                setNewExpense({ ...newExpense, amount: text })
              }
              keyboardType="numeric"
              leftIcon="dollar-sign"
            />

            <Input
              label={t("budget.description")}
              placeholder={t("budget.description")}
              value={newExpense.description}
              onChangeText={(text) =>
                setNewExpense({ ...newExpense, description: text })
              }
              leftIcon="edit-3"
            />

            <Button
              onPress={handleAddExpense}
              variant="accent"
              style={styles.addButton}
            >
              {t("budget.add_expense")}
            </Button>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    marginBottom: Spacing.lg,
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  chart: {
    transform: [{ rotate: "0deg" }],
  },
  chartCenter: {
    position: "absolute",
    alignItems: "center",
  },
  budgetSummary: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: Spacing.xl,
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  categoriesContainer: {
    marginBottom: Spacing.xl,
  },
  categoriesTitle: {
    marginBottom: Spacing.md,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  expensesTitle: {
    marginBottom: Spacing.md,
  },
  expenseCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  expenseContent: {
    flex: 1,
    marginLeft: Spacing.md,
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
  categoryLabel: {
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },
  categoryGrid: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  categoryOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    marginTop: Spacing.lg,
  },
});
