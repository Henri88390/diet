import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, AppState, Easing, PanResponder, StatusBar, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "./src/i18n";
import { MealDetailsModal } from "./src/components/MealDetailsModal";
import { CalendarScreen } from "./src/screens/CalendarScreen";
import { GroceryScreen } from "./src/screens/GroceryScreen";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import type {
  Meal,
  MealPreferences
} from "./src/models";
import {
  formatDateKey,
  getSelectedDateAfterTodayRefresh,
  getPlanningDates,
  DEFAULT_DAILY_CALORIE_GOAL,
  MAX_DAILY_CALORIE_GOAL,
  MIN_DAILY_CALORIE_GOAL,
  scaleMealPlan,
  getPersonalizedDayPlan
} from "./src/sampleData";
import { DEFAULT_COUNTRY, type CountryCode } from "./src/countryPricing";
import { repriceMeals } from "./src/ingredientEstimates";
import { getBatchPrep } from "./src/groceryEstimate";
import { setBatchCalendar } from "./src/batchCooking";
import { palette } from "./src/theme";

type Screen = "preferences" | "calendar" | "groceries";

export default function App(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>("preferences");
  const [mealPreferences, setMealPreferences] = useState<MealPreferences>({
    meatPerWeek: 2,
    dairyPerWeek: 7,
    fruitPreference: "optional",
    mealsPerDay: 3,
    planStyle: "balanced",
    weeklyBudget: "45",
    bannedIngredients: [],
    typicalBreakfast: { mode: "none" }
  });
  const [today, setToday] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState("2000");
  const [goalInput, setGoalInput] = useState("2000");
  const [appliedGoals, setAppliedGoals] = useState<Record<string, number>>({});
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [countryCode, setCountryCode] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [navigationDirection, setNavigationDirection] = useState(1);
  const [screenSwipeBlocked, setScreenSwipeBlocked] = useState(false);
  const swipeBlockedRef = useRef(false);
  const screenTransition = useRef(new Animated.Value(0)).current;

  const dates = useMemo(() => getPlanningDates(today), [today]);
  setBatchCalendar(dates[0], dates[dates.length - 1]);
  const selectedDateKey = formatDateKey(selectedDate);
  const appliedGoal = appliedGoals[selectedDateKey];
  const personalizedPlan = getPersonalizedDayPlan(selectedDate, mealPreferences, countryCode);
  const unpricedMeals = scaleMealPlan(
    personalizedPlan.meals,
    appliedGoals[selectedDateKey] ?? DEFAULT_DAILY_CALORIE_GOAL
  );
  const meals = repriceMeals(unpricedMeals, countryCode);
  const batchPrep = getBatchPrep(selectedDate, mealPreferences, appliedGoals, countryCode, today, dates[dates.length - 1]);
  const parsedGoal = Number(goalInput);
  const hasValidGoal =
    goalInput.length > 0 &&
    /^\d+$/.test(goalInput) &&
    Number.isInteger(parsedGoal) &&
    parsedGoal >= MIN_DAILY_CALORIE_GOAL &&
    parsedGoal <= MAX_DAILY_CALORIE_GOAL;

  useEffect(() => {
    const selectedGoal = String(appliedGoal ?? DEFAULT_DAILY_CALORIE_GOAL);
    setDailyCalorieGoal(selectedGoal);
    setGoalInput(selectedGoal);
  }, [selectedDateKey, appliedGoal]);

  useEffect(() => {
    function refreshToday(): void {
      const currentDate = new Date();
      const currentDateKey = formatDateKey(currentDate);
      setToday((previousDate) =>
        formatDateKey(previousDate) === currentDateKey ? previousDate : currentDate
      );
      setSelectedDate((previousDate) => {
        return getSelectedDateAfterTodayRefresh(previousDate, today, currentDate);
      });
    }

    const interval = setInterval(refreshToday, 60_000);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refreshToday();
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [today]);

  function adjustGoal(amount: number): void {
    const currentValue = Number(goalInput);
    const baseValue = goalInput.length > 0 && /^\d+$/.test(goalInput) && Number.isInteger(currentValue)
      ? currentValue
      : Number(dailyCalorieGoal);
    const nextValue = Math.min(
      MAX_DAILY_CALORIE_GOAL,
      Math.max(MIN_DAILY_CALORIE_GOAL, baseValue + amount)
    );
    const nextGoal = String(nextValue);
    changeDailyGoalInput(nextGoal);
  }

  function toggleIngredientBan(ingredientId: string): void {
    setMealPreferences((current) => ({
      ...current,
      bannedIngredients: current.bannedIngredients.includes(ingredientId)
        ? current.bannedIngredients.filter((id) => id !== ingredientId)
        : [...current.bannedIngredients, ingredientId]
    }));
  }

  function changeDailyGoalInput(value: string): void {
    setGoalInput(value);
    const goal = Number(value);
    if (
      /^\d+$/.test(value) &&
      Number.isInteger(goal) &&
      goal >= MIN_DAILY_CALORIE_GOAL &&
      goal <= MAX_DAILY_CALORIE_GOAL
    ) {
      setAppliedGoals(Object.fromEntries(dates.map((date) => [formatDateKey(date), goal])));
      setDailyCalorieGoal(value);
    }
  }

  function goToToday(): void {
    const currentDate = new Date();
    setToday(currentDate);
    setSelectedDate(currentDate);
  }

  const screenOrder: Screen[] = ["preferences", "calendar", "groceries"];
  const goToAdjacentScreen = useCallback((direction: -1 | 1) => {
    const currentIndex = screenOrder.indexOf(screen);
    const next = screenOrder[currentIndex + direction];
    if (!next) return;
    setNavigationDirection(direction);
    setScreen(next);
  }, [screen]);

  function navigateTo(next: Screen): void {
    const currentIndex = screenOrder.indexOf(screen);
    const nextIndex = screenOrder.indexOf(next);
    setNavigationDirection(nextIndex >= currentIndex ? 1 : -1);
    setScreen(next);
  }

  function handleDateStripTouch(touching: boolean): void {
    swipeBlockedRef.current = touching;
    setScreenSwipeBlocked(touching);
  }

  useEffect(() => {
    screenTransition.setValue(navigationDirection * 72);
    Animated.timing(screenTransition, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    }).start();
  }, [screen, navigationDirection, screenTransition]);

  useEffect(() => {
    swipeBlockedRef.current = screenSwipeBlocked;
  }, [screenSwipeBlocked]);

  useEffect(() => {
    swipeBlockedRef.current = false;
    setScreenSwipeBlocked(false);
  }, [screen]);

  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_event, gesture) =>
      !swipeBlockedRef.current &&
      Math.abs(gesture.dx) > 40 &&
      Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.4,
    onPanResponderRelease: (_event, gesture) => {
      if (Math.abs(gesture.dx) > 75 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.4) {
        goToAdjacentScreen(gesture.dx < 0 ? 1 : -1);
      }
    }
  }), [goToAdjacentScreen]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <StatusBar barStyle="dark-content" />
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.screenContent,
            {
              opacity: screenTransition.interpolate({ inputRange: [-72, 0, 72], outputRange: [0.88, 1, 0.88] }),
              transform: [{ translateX: screenTransition }]
            }
          ]}
        >
          {screen === "preferences" ? (
            <OnboardingScreen
              bannedIngredients={mealPreferences.bannedIngredients}
              onToggleIngredientBan={toggleIngredientBan}
              mealPreferences={mealPreferences}
              onMealPreferencesChange={(next) => setMealPreferences(next)}
              countryCode={countryCode}
              onCountryChange={setCountryCode}
              onContinue={() => navigateTo("calendar")}
            />
          ) : screen === "groceries" ? (
            <GroceryScreen
              today={today}
              preferences={mealPreferences}
              appliedGoals={appliedGoals}
              countryCode={countryCode}
              onBackToCalendar={() => navigateTo("calendar")}
            />
          ) : (
            <CalendarScreen
              dates={dates}
              today={today}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onTodayPress={goToToday}
              meals={meals}
              batchPrep={batchPrep}
              dailyCalorieGoal={dailyCalorieGoal}
              goalInput={goalInput}
              setGoalInput={changeDailyGoalInput}
              hasValidGoal={hasValidGoal}
              onAdjustGoal={adjustGoal}
              onMealPress={setSelectedMeal}
              mealsPerDay={mealPreferences.mealsPerDay}
              onMealsPerDayChange={(mealsPerDay) => setMealPreferences((current) => ({ ...current, mealsPerDay }))}
              planStyle={mealPreferences.planStyle}
              onPlanStyleChange={(planStyle) => setMealPreferences((current) => ({ ...current, planStyle }))}
              onEditPreferences={() => navigateTo("preferences")}
              onOpenGroceries={() => navigateTo("groceries")}
              onDateStripTouchChange={handleDateStripTouch}
            />
          )}
        </Animated.View>
      </SafeAreaView>
      <MealDetailsModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.paper },
  screenContent: { flex: 1 }
});
