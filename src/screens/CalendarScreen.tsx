import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { Meal } from "../models";
import { getDailyCalories, getDailyProtein, getMealsInDisplayOrder, MAX_DAILY_CALORIE_GOAL, MIN_DAILY_CALORIE_GOAL } from "../sampleData";
import { palette } from "../theme";
import { CalendarDateStrip } from "../components/CalendarDateStrip";
import { MealCard } from "../components/MealCard";
import { ArrowButton } from "../components/ArrowButton";

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
  goalChanged: boolean;
  appliedGoal?: number;
  updateDisabled: boolean;
  onAdjustGoal: (amount: number) => void;
  onUpdateMealPlan: () => void;
  onMealPress: (meal: Meal) => void;
  onEditPreferences: () => void;
  onOpenGroceries: () => void;
  onDateStripTouchChange: (touching: boolean) => void;
};

export function CalendarScreen(props: Props): React.JSX.Element {
  const meals = getMealsInDisplayOrder(props.meals);
  const calories = getDailyCalories(meals);
  const protein = getDailyProtein(meals);
  const snackCount = meals.filter((meal) => meal.type === "Snack").length;
  const mealCountLabel = snackCount > 0
    ? `${meals.length - snackCount} meals + ${snackCount} ${snackCount === 1 ? "snack" : "snacks"}`
    : `${meals.length} meals`;
  const parsedGoal = Number(props.goalInput);
  const monthLabel = props.selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <ArrowButton variant="compact" direction="left" label="Preferences" accessibilityLabel="Edit ingredient preferences" onPress={props.onEditPreferences} />
        <ArrowButton variant="compact" label="Weekly grocery estimate" accessibilityLabel="Open weekly grocery estimate" onPress={props.onOpenGroceries} />
      </View>
      <View style={styles.dateHeading}>
        <View style={styles.dateHeadingRow}>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go to today"
            accessibilityHint="Selects today's meal plan and brings today into view"
            onPress={props.onTodayPress}
            style={({ pressed }) => [styles.todayButton, pressed && styles.pressed]}
          >
            <Text style={styles.todayButtonText}>Today</Text>
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
        <View style={styles.calorieBottomRow}>
          <Text style={styles.calorieTotal}>{calories.toLocaleString()}</Text>
          <Text style={styles.calorieUnit}> kcal</Text>
          <Text style={styles.proteinTotal}>· {protein} g protein</Text>
          <View style={styles.mealCount}><Text style={styles.mealCountText}>{mealCountLabel}</Text></View>
        </View>
        <View style={styles.goalRow}>
          <View style={styles.goalLabelContainer}>
            <Text style={styles.goalLabel}>Daily calorie goal</Text>
          </View>
          <View style={styles.goalControls}>
            <View style={styles.stepperRow}>
              <Pressable accessibilityRole="button" accessibilityLabel="Decrease calorie goal by 100" onPress={() => props.onAdjustGoal(-100)} style={styles.stepperButton}>
                <Text style={styles.stepperText}>−100</Text>
              </Pressable>
              <View style={[styles.goalInputContainer, !props.hasValidGoal && styles.goalInputInvalid]}>
                <TextInput
                  accessibilityLabel="Daily calorie goal"
                  accessibilityHint={`Enter a whole number from ${MIN_DAILY_CALORIE_GOAL} to ${MAX_DAILY_CALORIE_GOAL} kilocalories`}
                  keyboardType="number-pad"
                  onChangeText={props.setGoalInput}
                  style={styles.goalInput}
                  value={props.goalInput}
                />
                <Text style={styles.goalUnit}>kcal</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Increase calorie goal by 100" onPress={() => props.onAdjustGoal(100)} style={styles.stepperButton}>
                <Text style={styles.stepperText}>+100</Text>
              </Pressable>
            </View>
          </View>
        </View>
        {!props.hasValidGoal && <Text style={styles.goalError}>Enter a whole-number goal from 500 to 10,000 kcal.</Text>}
        {props.goalChanged && props.hasValidGoal && (
          <Text style={styles.pendingGoal}>
            Goal changed to {parsedGoal.toLocaleString()} kcal. All planned days stay unchanged until you update them.
          </Text>
        )}
        <ArrowButton
          variant="light"
          label="Update meal plan"
          disabled={props.updateDisabled}
          onPress={props.onUpdateMealPlan}
          style={{ marginTop: 10 }}
        />
      </View>

      {meals.length > 0 ? (
        <View style={styles.mealsList}>{meals.map((meal) => <MealCard key={meal.id} meal={meal} onPress={props.onMealPress} />)}</View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>🍽️</Text>
          <Text style={styles.emptyTitle}>A little room to improvise</Text>
          <Text style={styles.emptyCopy}>No meals planned for this day yet. Pick another day to see meal ideas.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 22, paddingTop: 22, paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  greeting: { marginTop: 13, color: palette.ink, fontSize: 24, fontWeight: "700", letterSpacing: -0.7 },        dateHeading: { marginTop: 26, marginBottom: 12 },
  dateHeadingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  monthLabel: { color: palette.ink, fontSize: 16, fontWeight: "700" },
  todayButton: { minHeight: 34, justifyContent: "center", paddingHorizontal: 13, borderRadius: 10, borderWidth: 1, borderColor: "#C9D9C9", backgroundColor: palette.softGreen },
  todayButtonText: { color: palette.green, fontSize: 12, fontWeight: "700" },
  hint: { color: palette.muted, fontSize: 12, marginTop: 4 },
  weekLabel: { color: palette.green, fontSize: 10, fontWeight: "600", marginTop: 4 },
  groceryLink: { alignSelf: "flex-end", flexDirection: "row", alignItems: "center", marginTop: 10, marginBottom: 2, paddingVertical: 8, paddingLeft: 10 },
  groceryLinkText: { color: palette.green, fontSize: 11, fontWeight: "700" },
  groceryLinkArrow: { color: palette.green, fontSize: 14, marginLeft: 6 },
  calorieCard: { backgroundColor: palette.green, borderRadius: 20, paddingHorizontal: 19, paddingTop: 18, paddingBottom: 15 },
  calorieTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  calorieEyebrow: { color: "#C5D6C5", fontSize: 9, fontWeight: "700", letterSpacing: 1.25 },
  calorieDate: { color: palette.white, fontSize: 15, fontWeight: "600", marginTop: 6 },
  calorieIcon: { height: 35, width: 35, borderRadius: 12, backgroundColor: "#52735B", alignItems: "center", justifyContent: "center" },
  calorieIconText: { color: "#E5D9A6", fontSize: 20 },
  calorieBottomRow: { flexDirection: "row", alignItems: "center" },
  calorieTotal: { color: palette.white, fontSize: 35, lineHeight: 39, fontWeight: "700", letterSpacing: -1 },
  calorieUnit: { color: "#D3E0D2", fontSize: 12, marginLeft: 6 },
  mealCount: { marginLeft: "auto", backgroundColor: "#456A4E", borderRadius: 9, paddingHorizontal: 10, paddingVertical: 6 },
  mealCountText: { color: palette.white, fontSize: 10, fontWeight: "600" },
  calorieFootnote: { color: "#C5D6C5", fontSize: 10, marginTop: 9 },
  proteinTotal: { color: "#D3E0D2", fontSize: 12, fontWeight: "600", marginLeft: 8 },
  goalRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 15, paddingTop: 13, borderTopWidth: 1, borderTopColor: "#52735B" },
  goalLabelContainer: { flex: 1, paddingRight: 8 },
  goalLabel: { color: palette.white, fontSize: 12, fontWeight: "600" },
  goalHelper: { color: "#C5D6C5", fontSize: 9, marginTop: 3 },
  goalControls: { alignItems: "flex-end" },
  stepperRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  stepperButton: { minWidth: 43, minHeight: 36, paddingHorizontal: 5, borderRadius: 8, backgroundColor: "#456A4E", alignItems: "center", justifyContent: "center" },
  stepperText: { color: palette.white, fontSize: 10, fontWeight: "700" },
  goalInputContainer: { flexDirection: "row", alignItems: "center", borderRadius: 9, backgroundColor: palette.white, paddingHorizontal: 9, minWidth: 96 },
  goalInputInvalid: { borderWidth: 1, borderColor: "#F0A899" },
  goalInput: { minWidth: 48, paddingVertical: 7, color: palette.ink, fontSize: 14, fontWeight: "700", textAlign: "right" },
  goalUnit: { color: palette.muted, fontSize: 10, marginLeft: 5 },
  goalError: { color: "#FFE1DA", fontSize: 10, textAlign: "right", marginTop: 7 },
  goalDifference: { color: palette.white, fontSize: 11, fontWeight: "600", marginTop: 12 },
  pendingGoal: { color: "#F6E2B8", fontSize: 10, lineHeight: 15, marginTop: 5 },
  pressed: { opacity: 0.84 },
  scalingNote: { color: "#C5D6C5", fontSize: 9, lineHeight: 13, marginTop: 8 },
  appliedConfirmation: { color: "#DCE7DB", fontSize: 10, lineHeight: 14, marginTop: 7, textAlign: "center" },
  mealsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 25, marginBottom: 13 },
  sectionTitle: { color: palette.ink, fontSize: 19, fontWeight: "700", letterSpacing: -0.4 },
  mealHelper: { color: palette.muted, fontSize: 12, marginTop: 5, lineHeight: 17 },
  mealCountSubtle: { color: palette.muted, fontSize: 11, paddingBottom: 2 },
  mealsList: { gap: 10, marginTop: 20 },
  emptyCard: { backgroundColor: palette.white, borderRadius: 16, padding: 22, alignItems: "center", marginTop: 20 },
  emptyEmoji: { fontSize: 25 },
  emptyTitle: { color: palette.ink, fontWeight: "700", marginTop: 8 },
  emptyCopy: { color: palette.muted, fontSize: 12, textAlign: "center", marginTop: 5 },
  footerNote: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 22, gap: 7 },
  footerSparkle: { color: "#9DAD91", fontSize: 13 },
  footerText: { color: palette.muted, fontSize: 10 }
});
