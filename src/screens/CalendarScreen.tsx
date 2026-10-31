import React, { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { Meal, MealsPerDay, PlanStyle } from "../models";
import { getDailyProtein, getMealsInDisplayOrder, MAX_DAILY_CALORIE_GOAL, MIN_DAILY_CALORIE_GOAL } from "../sampleData";
import { palette } from "../theme";
import { CalendarDateStrip } from "../components/CalendarDateStrip";
import { MealCard } from "../components/MealCard";
import { ArrowButton } from "../components/ArrowButton";
import { useTranslation } from "react-i18next";
import { useDateLocale } from "../i18n";

type Props = {
  dates: Date[];
  today: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onTodayPress: () => void;
  meals: Meal[];
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
  onEditPreferences: () => void;
  onOpenGroceries: () => void;
  onDateStripTouchChange: (touching: boolean) => void;
};

const mealsPerDayOptions: MealsPerDay[] = [2, 3, 4, 5];
const planStyleOptions: PlanStyle[] = ["balanced", "highProtein", "lowCost", "moreVariety", "simpleIngredients"];

export function CalendarScreen(props: Props): React.JSX.Element {
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const [mealMenuOpen, setMealMenuOpen] = useState(false);
  const [styleMenuOpen, setStyleMenuOpen] = useState(false);
  const styleLabel = (style: PlanStyle): string => t(style === "moreVariety" ? "planStyle.moreVarietyShort" : `planStyle.${style}`);
  const planStyleLabel = styleLabel(props.planStyle);
  const goalInputRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const [goalSelection, setGoalSelection] = useState<{ start: number; end: number } | undefined>();

  function focusGoalInput(): void {
    const end = props.goalInput.length;
    setGoalSelection({ start: end, end });
    goalInputRef.current?.focus();
  }
  const mealsPerDayLabel = t(`mealsPerDay.${props.mealsPerDay}`);
  const meals = getMealsInDisplayOrder(props.meals);
  const protein = getDailyProtein(meals);
  const monthLabel = props.selectedDate.toLocaleDateString(dateLocale, { month: "long", year: "numeric" });

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
        onSelectDate={props.onSelectDate}
        onTouchChange={props.onDateStripTouchChange}
      />

      <View style={styles.calorieCard}>
        <View style={styles.cardMain}>
          <View style={styles.calorieBottomRow}>
            <View style={styles.statChip}>
              <Text style={styles.statChipValue}>{protein}</Text>
              <Text style={styles.statChipLabel}> {t("common.proteinUnit")}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("calendar.mealsPerDayChange", { label: mealsPerDayLabel })}
              accessibilityState={{ expanded: mealMenuOpen }}
              onPress={() => setMealMenuOpen((open) => !open)}
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
          <View style={styles.stepperRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("calendar.planStyleChange", { label: planStyleLabel })}
              accessibilityState={{ expanded: styleMenuOpen }}
              onPress={() => setStyleMenuOpen((open) => !open)}
              style={[styles.statChip, styles.styleChip]}
            >
              <Text numberOfLines={1} style={[styles.statChipLabel, styles.styleChipLabel]}>{planStyleLabel}</Text>
              <Text style={styles.mealChipCaret}>{styleMenuOpen ? "▴" : "▾"}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={t("calendar.decrease")} onPress={() => props.onAdjustGoal(-100)} style={styles.stepperButton}>
              <Text style={styles.stepperText}>−</Text>
            </Pressable>
            <Pressable onPress={focusGoalInput} style={[styles.goalInputContainer, !props.hasValidGoal && styles.goalInputInvalid]}>
              <TextInput
                ref={goalInputRef}
                selection={goalSelection}
                onSelectionChange={() => setGoalSelection(undefined)}
                accessibilityLabel={t("calendar.goalLabel")}
                accessibilityHint={t("calendar.goalHint", { min: MIN_DAILY_CALORIE_GOAL, max: MAX_DAILY_CALORIE_GOAL })}
                keyboardType="number-pad"
                onChangeText={props.setGoalInput}
                style={styles.goalInput}
                value={props.goalInput}
              />
              <Text style={styles.goalUnit}>{t("common.kcal")}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={t("calendar.increase")} onPress={() => props.onAdjustGoal(100)} style={styles.stepperButton}>
              <Text style={styles.stepperText}>+</Text>
            </Pressable>
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
          {!props.hasValidGoal && <Text style={styles.goalError}>{t("calendar.goalError")}</Text>}
        </View>
      </View>

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
  calorieCard: { backgroundColor: palette.green, borderRadius: 20, padding: 12 },
  cardMain: { gap: 8 },
  calorieBottomRow: { flexDirection: "row", alignItems: "stretch", gap: 6 },
  statChip: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#456A4E", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6 },
  statChipValue: { color: palette.white, fontSize: 14, fontWeight: "700" },
  statChipLabel: { color: "#D3E0D2", fontSize: 11, fontWeight: "600" },
  mealChip: { gap: 6 },
  styleChip: { gap: 4, paddingHorizontal: 6 },
  styleChipLabel: { flexShrink: 1 },
  mealChipCaret: { color: "#D3E0D2", fontSize: 11 },
  mealMenu: { borderRadius: 12, backgroundColor: palette.white, padding: 4 },
  mealMenuItem: { minHeight: 40, justifyContent: "center", paddingHorizontal: 12, borderRadius: 9 },
  mealMenuItemSelected: { backgroundColor: palette.softGreen },
  mealMenuText: { color: palette.ink, fontSize: 13, fontWeight: "600" },
  mealMenuTextSelected: { color: palette.green, fontWeight: "800" },
  stepperRow: { flex: 1, flexDirection: "row", alignItems: "stretch", gap: 6, minHeight: 44 },
  stepperButton: { width: 40, borderRadius: 10, backgroundColor: "#E5EEE5", borderWidth: 1, borderColor: "#FFFFFF", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 3, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  stepperText: { color: palette.green, fontSize: 22, lineHeight: 26, fontWeight: "800", includeFontPadding: false },
  goalInputContainer: { width: 92, flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: palette.white, paddingHorizontal: 6 },
  goalInputInvalid: { borderWidth: 1, borderColor: "#F0A899" },
  goalInput: { flex: 1, minWidth: 48, paddingVertical: 7, color: palette.ink, fontSize: 14, fontWeight: "700", textAlign: "right" },
  goalUnit: { color: palette.muted, fontSize: 10, marginLeft: 5 },
  goalError: { color: "#FFE1DA", fontSize: 10, textAlign: "right", marginTop: 7 },
  pressed: { opacity: 0.84 },
  mealsList: { gap: 10, marginTop: 20 },
  emptyCard: { backgroundColor: palette.white, borderRadius: 16, padding: 22, alignItems: "center", marginTop: 20 },
  emptyEmoji: { fontSize: 25 },
  emptyTitle: { color: palette.ink, fontWeight: "700", marginTop: 8 },
  emptyCopy: { color: palette.muted, fontSize: 12, textAlign: "center", marginTop: 5 }
});
