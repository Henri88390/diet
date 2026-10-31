import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { FruitPreference, Meal, MealsPerDay, PlanStyle } from "../models";
import type { BatchPrep } from "../groceryEstimate";
import type { BudgetPlan, BudgetWarning } from "../budgetPlan";
import { getBudgetStep, stepBudget } from "../budgetPlan";
import { formatMoney, getCurrencySymbol } from "../countryPricing";
import { formatDateKey, getDailyProtein, getMealsInDisplayOrder, MAX_DAILY_CALORIE_GOAL, MIN_DAILY_CALORIE_GOAL } from "../sampleData";
import { palette } from "../theme";
import { CalendarDateStrip } from "../components/CalendarDateStrip";
import { MealCard } from "../components/MealCard";
import { BatchPrepCard } from "../components/BatchCooking";
import { ArrowButton } from "../components/ArrowButton";
import { AmountStepper } from "../components/AmountStepper";
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
  dailyCalorieGoal: string;
  goalInput: string;
  setGoalInput: (goal: string) => void;
  hasValidGoal: boolean;
  onAdjustGoal: (amount: number) => void;
  onMealPress: (meal: Meal) => void;
  mealsPerDay: MealsPerDay;
  onMealsPerDayChange: (mealsPerDay: MealsPerDay) => void;
  planStyle: PlanStyle;
  onPlanStyleChange: (planStyle: PlanStyle) => void;
  fruitPreference: FruitPreference;
  onFruitPreferenceChange: (fruitPreference: FruitPreference) => void;
  weeklyBudget: string;
  onWeeklyBudgetChange: (weeklyBudget: string) => void;
  budgetWarning: BudgetWarning | null;
  budgetStatus: BudgetPlan["status"];
  currencyCode: string;
  onEditPreferences: () => void;
  onOpenGroceries: () => void;
  onDateStripTouchChange: (touching: boolean) => void;
};

const mealsPerDayOptions: MealsPerDay[] = [2, 3, 4, 5];
const planStyleOptions: PlanStyle[] = ["balanced", "highProtein", "lowCost", "batchCooking"];
const fruitOptions: FruitPreference[] = ["include", "optional", "avoid"];

export function CalendarScreen(props: Props): React.JSX.Element {
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const [mealMenuOpen, setMealMenuOpen] = useState(false);
  const [styleMenuOpen, setStyleMenuOpen] = useState(false);
  const [fruitMenuOpen, setFruitMenuOpen] = useState(false);
  const fruitLabel = (value: FruitPreference): string =>
    t(`calendar.fruit${value.charAt(0).toUpperCase()}${value.slice(1)}`);
  const budgetNumber = Number(props.weeklyBudget.replace(",", "."));
  const budgetIsValid = props.weeklyBudget.trim() === "" || (Number.isFinite(budgetNumber) && budgetNumber >= 0);
  const styleLabel = (style: PlanStyle): string => t(`planStyle.${style}`);
  const planStyleLabel = styleLabel(props.planStyle);
  const mealsPerDayLabel = t(`mealsPerDay.${props.mealsPerDay}`);
  const meals = getMealsInDisplayOrder(props.meals);
  const protein = getDailyProtein(meals);
  const monthLabel = props.selectedDate.toLocaleDateString(dateLocale, { month: "long", year: "numeric" });

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {(mealMenuOpen || styleMenuOpen || fruitMenuOpen) && (
        <Pressable
          accessible={false}
          onPress={() => {
            setMealMenuOpen(false);
            setStyleMenuOpen(false);
            setFruitMenuOpen(false);
          }}
          style={styles.menuBackdrop}
        />
      )}
      <View style={styles.header}>
        <ArrowButton variant="compact" direction="left" label={t("calendar.preferences")} accessibilityLabel={t("calendar.preferencesA11y")} onPress={props.onEditPreferences} />
        <ArrowButton variant="compact" style={{ flexShrink: 1, marginLeft: 10 }} label={t("calendar.weeklyGrocery")} accessibilityLabel={t("calendar.weeklyGroceryA11y")} onPress={props.onOpenGroceries} />
      </View>
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

      <View style={styles.calorieCard}>
        <View style={styles.cardMain}>
          <View style={[styles.menuAnchor, { zIndex: 2 }]}>
          <View style={styles.calorieBottomRow}>
            <View style={styles.statChip}>
              <Text style={styles.statChipValue}>{protein}</Text>
              <Text style={styles.statChipLabel}> {t("common.proteinUnit")}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("calendar.mealsPerDayChange", { label: mealsPerDayLabel })}
              accessibilityState={{ expanded: mealMenuOpen }}
              onPress={() => {
                setStyleMenuOpen(false);
                setFruitMenuOpen(false);
                setMealMenuOpen((open) => !open);
              }}
              style={[styles.statChip, styles.mealChip]}
            >
              <Text style={styles.statChipLabel}>{mealsPerDayLabel}</Text>
              <Text style={styles.mealChipCaret}>{mealMenuOpen ? "▴" : "▾"}</Text>
            </Pressable>
          </View>
          {mealMenuOpen && (
            <View style={styles.mealMenu}>
              {mealsPerDayOptions.map((option) => {
                const selected = option === props.mealsPerDay;
                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    accessibilityLabel={t("prefs.mealsPerDayA11y", { label: t(`mealsPerDay.${option}`) })}
                    accessibilityState={{ selected }}
                    onPress={() => {
                      setMealMenuOpen(false);
                      if (!selected) props.onMealsPerDayChange(option);
                    }}
                    style={[styles.mealMenuItem, selected && styles.mealMenuItemSelected]}
                  >
                    <Text style={[styles.mealMenuText, selected && styles.mealMenuTextSelected]}>{t(`mealsPerDay.${option}`)}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
          </View>
          <View style={[styles.menuAnchor, { zIndex: 1 }]}>
          <View style={styles.stepperRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("calendar.planStyleChange", { label: planStyleLabel })}
              accessibilityState={{ expanded: styleMenuOpen }}
              onPress={() => {
                setMealMenuOpen(false);
                setFruitMenuOpen(false);
                setStyleMenuOpen((open) => !open);
              }}
              style={[styles.statChip, styles.styleChip]}
            >
              <Text numberOfLines={1} style={[styles.statChipLabel, styles.styleChipLabel]}>{planStyleLabel}</Text>
              <Text style={styles.mealChipCaret}>{styleMenuOpen ? "▴" : "▾"}</Text>
            </Pressable>
            <AmountStepper
              value={props.goalInput}
              onChangeText={props.setGoalInput}
              onStep={(direction) => props.onAdjustGoal(direction * 100)}
              unit={t("common.kcal")}
              keyboardType="number-pad"
              inputLabel={t("calendar.goalLabel")}
              inputHint={t("calendar.goalHint", { min: MIN_DAILY_CALORIE_GOAL, max: MAX_DAILY_CALORIE_GOAL })}
              decreaseLabel={t("calendar.decrease")}
              increaseLabel={t("calendar.increase")}
              invalid={!props.hasValidGoal}
            />
          </View>
          {styleMenuOpen && (
            <View style={styles.mealMenu}>
              {planStyleOptions.map((option) => {
                const selected = option === props.planStyle;
                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    accessibilityLabel={t("prefs.planStyleA11y", { label: styleLabel(option) })}
                    accessibilityState={{ selected }}
                    onPress={() => {
                      setStyleMenuOpen(false);
                      if (!selected) props.onPlanStyleChange(option);
                    }}
                    style={[styles.mealMenuItem, selected && styles.mealMenuItemSelected]}
                  >
                    <Text style={[styles.mealMenuText, selected && styles.mealMenuTextSelected]}>{styleLabel(option)}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
          </View>
          <View style={[styles.menuAnchor, { zIndex: 0 }]}>
            <View style={styles.stepperRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("calendar.fruitChange", { label: fruitLabel(props.fruitPreference) })}
                accessibilityState={{ expanded: fruitMenuOpen }}
                onPress={() => {
                  setMealMenuOpen(false);
                  setStyleMenuOpen(false);
                  setFruitMenuOpen((open) => !open);
                }}
                style={[styles.statChip, styles.styleChip]}
              >
                <Text numberOfLines={1} style={[styles.statChipLabel, styles.styleChipLabel]}>🍎 {fruitLabel(props.fruitPreference)}</Text>
                <Text style={styles.mealChipCaret}>{fruitMenuOpen ? "▴" : "▾"}</Text>
              </Pressable>
              <AmountStepper
                value={props.weeklyBudget}
                onChangeText={props.onWeeklyBudgetChange}
                onStep={(direction) => props.onWeeklyBudgetChange(stepBudget(props.weeklyBudget, direction * getBudgetStep(props.currencyCode)))}
                unit={getCurrencySymbol(props.currencyCode)}
                keyboardType="decimal-pad"
                inputLabel={t("prefs.budget")}
                decreaseLabel={t("calendar.decrease")}
                increaseLabel={t("calendar.increase")}
                placeholder="–"
                invalid={!budgetIsValid}
                warning={!!props.budgetWarning}
              />
            </View>
            {fruitMenuOpen && (
              <View style={styles.mealMenu}>
                {fruitOptions.map((option) => {
                  const selected = option === props.fruitPreference;
                  return (
                    <Pressable
                      key={option}
                      accessibilityRole="button"
                      accessibilityLabel={t("prefs.fruitA11y", { label: t(`prefs.fruit${option.charAt(0).toUpperCase()}${option.slice(1)}`) })}
                      accessibilityState={{ selected }}
                      onPress={() => {
                        setFruitMenuOpen(false);
                        if (!selected) props.onFruitPreferenceChange(option);
                      }}
                      style={[styles.mealMenuItem, selected && styles.mealMenuItemSelected]}
                    >
                      <Text style={[styles.mealMenuText, selected && styles.mealMenuTextSelected]}>{fruitLabel(option)}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
          {!props.hasValidGoal && <Text style={styles.goalError}>{t("calendar.goalError")}</Text>}
        </View>
      </View>

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
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dateHeading: { marginTop: 26, marginBottom: 12 },
  dateHeadingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  monthLabel: { color: palette.ink, fontSize: 16, fontWeight: "700" },
  todayButton: { minHeight: 34, justifyContent: "center", paddingHorizontal: 13, borderRadius: 10, borderWidth: 1, borderColor: "#C9D9C9", backgroundColor: palette.softGreen },
  todayButtonText: { color: palette.green, fontSize: 12, fontWeight: "700" },
  calorieCard: { backgroundColor: palette.green, borderRadius: 20, padding: 12, zIndex: 10, elevation: 4 },
  menuAnchor: { position: "relative" },
  menuBackdrop: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, zIndex: 5 },
  cardMain: { gap: 8 },
  calorieBottomRow: { flexDirection: "row", alignItems: "stretch", gap: 6 },
  statChip: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#456A4E", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6 },
  statChipValue: { color: palette.white, fontSize: 14, fontWeight: "700" },
  statChipLabel: { color: "#D3E0D2", fontSize: 11, fontWeight: "600" },
  mealChip: { gap: 6 },
  styleChip: { gap: 4, paddingHorizontal: 6 },
  styleChipLabel: { flexShrink: 1 },
  budgetNotice: { backgroundColor: "#FFF4DC", borderRadius: 14, padding: 12, marginTop: 12, gap: 4 },
  budgetNoticeImpossible: { backgroundColor: "#F8E7E4" },
  budgetNoticeText: { color: palette.ink, fontSize: 12, lineHeight: 17 },
  mealChipCaret: { color: "#D3E0D2", fontSize: 11 },
  mealMenu: { position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, zIndex: 20, borderRadius: 12, backgroundColor: palette.white, padding: 4, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  mealMenuItem: { minHeight: 40, justifyContent: "center", paddingHorizontal: 12, borderRadius: 9 },
  mealMenuItemSelected: { backgroundColor: palette.softGreen },
  mealMenuText: { color: palette.ink, fontSize: 13, fontWeight: "600" },
  mealMenuTextSelected: { color: palette.green, fontWeight: "800" },
  stepperRow: { flex: 1, flexDirection: "row", alignItems: "stretch", gap: 6, minHeight: 44 },
  goalError: { color: "#FFE1DA", fontSize: 10, textAlign: "right", marginTop: 7 },
  pressed: { opacity: 0.84 },
  mealsList: { gap: 10, marginTop: 20 },
  emptyCard: { backgroundColor: palette.white, borderRadius: 16, padding: 22, alignItems: "center", marginTop: 20 },
  emptyEmoji: { fontSize: 25 },
  emptyTitle: { color: palette.ink, fontWeight: "700", marginTop: 8 },
  emptyCopy: { color: palette.muted, fontSize: 12, textAlign: "center", marginTop: 5 }
});
