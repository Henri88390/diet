import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Meal, PlanStyle } from "../models";
import type { BatchPrep } from "../groceryEstimate";
import type { BudgetPlan, BudgetWarning } from "../budgetPlan";
import { formatMoney } from "../countryPricing";
import { formatDateKey, getDailyProtein, getMealsInDisplayOrder } from "../sampleData";
import { palette } from "../theme";
import { CalendarDateStrip } from "../components/CalendarDateStrip";
import { MealCard } from "../components/MealCard";
import { BatchPrepCard } from "../components/BatchCooking";
import { useTranslation } from "react-i18next";
import { useDateLocale } from "../i18n";

type Props = {
  dates: Date[];
  today: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onTodayPress: () => void;
  meals: Meal[];
  batchPrep: BatchPrep | null;
  onMealPress: (meal: Meal) => void;
  planStyle: PlanStyle;
  budgetWarning: BudgetWarning | null;
  budgetStatus: BudgetPlan["status"];
  currencyCode: string;
  onDateStripTouchChange: (touching: boolean) => void;
};

export function CalendarScreen(props: Props): React.JSX.Element {
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const meals = getMealsInDisplayOrder(props.meals);
  const protein = getDailyProtein(meals);
  const calories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const cost = formatMoney({
    amountMinorUnits: meals.reduce((sum, meal) => sum + (meal.estimatedCost?.amountMinorUnits ?? meal.estimatedCostCents), 0),
    currencyCode: props.currencyCode
  });
  const monthLabel = props.selectedDate.toLocaleDateString(dateLocale, { month: "long", year: "numeric" });

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.dateHeading}>
        <View style={styles.dateHeadingRow}>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("calendar.goToToday")}
            accessibilityHint={t("calendar.todayHint")}
            onPress={props.onTodayPress}
            style={({ pressed }) => [styles.todayButton, pressed && styles.pressed]}
          >
            <Text style={styles.todayButtonText}>{t("calendar.today")}</Text>
          </Pressable>
        </View>
      </View>
      <CalendarDateStrip
        dates={props.dates}
        selectedDate={props.selectedDate}
        today={props.today}
        batchCooking={props.planStyle === "batchCooking"}
        onSelectDate={props.onSelectDate}
        onTouchChange={props.onDateStripTouchChange}
      />

      {meals.length > 0 && (
        <Text style={styles.dailyTotals}>{t("details.totalValue", { kcal: calories, protein, cost })}</Text>
      )}

      {props.budgetStatus === "compromised" && (
        <View style={styles.budgetNotice}>
          <Text style={styles.budgetNoticeText}>{t("calendar.budgetCompromised")}</Text>
        </View>
      )}
      {props.budgetWarning && (
        <View style={styles.budgetNotice}>
          <Text style={styles.budgetNoticeText}>
            {t("calendar.budgetWarning", {
              cost: formatMoney({ amountMinorUnits: props.budgetWarning.weeklyCost, currencyCode: props.currencyCode })
            })}
          </Text>
        </View>
      )}

      {meals.length > 0 && props.batchPrep && (
        <BatchPrepCard prep={props.batchPrep} selectedDateKey={formatDateKey(props.selectedDate)} todayKey={formatDateKey(props.today)} />
      )}
      {meals.length > 0 ? (
        <View style={styles.mealsList}>{meals.map((meal) => <MealCard key={meal.id} meal={meal} onPress={props.onMealPress} />)}</View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>🍽️</Text>
          <Text style={styles.emptyTitle}>{t("calendar.emptyTitle")}</Text>
          <Text style={styles.emptyCopy}>{t("calendar.emptyCopy")}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 22, paddingTop: 22, paddingBottom: 40 },
  dateHeading: { marginBottom: 12 },
  dateHeadingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  monthLabel: { color: palette.ink, fontSize: 16, fontWeight: "700" },
  todayButton: { minHeight: 34, justifyContent: "center", paddingHorizontal: 13, borderRadius: 10, borderWidth: 1, borderColor: "#C9D9C9", backgroundColor: palette.softGreen },
  todayButtonText: { color: palette.green, fontSize: 12, fontWeight: "700" },
  dailyTotals: { color: palette.muted, fontSize: 12, fontWeight: "600", textAlign: "right", marginTop: 4 },
  budgetNotice: { backgroundColor: "#FFF4DC", borderRadius: 14, padding: 12, marginTop: 12, gap: 4 },
  budgetNoticeText: { color: palette.ink, fontSize: 12, lineHeight: 17 },
  pressed: { opacity: 0.84 },
  mealsList: { gap: 10, marginTop: 20 },
  emptyCard: { backgroundColor: palette.white, borderRadius: 16, padding: 22, alignItems: "center", marginTop: 20 },
  emptyEmoji: { fontSize: 25 },
  emptyTitle: { color: palette.ink, fontWeight: "700", marginTop: 8 },
  emptyCopy: { color: palette.muted, fontSize: 12, textAlign: "center", marginTop: 5 }
});
