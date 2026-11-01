import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  AppState,
  StatusBar,
  StyleSheet,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import "./src/i18n";
import { MealDetailsModal } from "./src/components/MealDetailsModal";
import { TopTabBar } from "./src/components/TopTabBar";
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
import { DEFAULT_COUNTRY, getCountry, type CountryCode } from "./src/countryPricing";
import { repriceMeals } from "./src/ingredientEstimates";
import { getBatchPrep } from "./src/groceryEstimate";
import { getBudgetPlan } from "./src/budgetPlan";
import { setBatchCalendar } from "./src/batchCooking";
import { palette } from "./src/theme";

const tabOrder = ["preferences", "meals", "groceries"] as const;

export default function App(): React.JSX.Element {
  const { t } = useTranslation();
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
  const [activeTab, setActiveTab] = useState(0);
  const activeTabRef = useRef(0);
  const [pagerSwipeBlocked, setPagerSwipeBlocked] = useState(false);
  const { width: windowWidth } = useWindowDimensions();
  const [pageWidth, setPageWidth] = useState(windowWidth);
  const pagerRef = useRef<ScrollViewInstance>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const dates = useMemo(() => getPlanningDates(today), [today]);
  setBatchCalendar(dates[0], dates[dates.length - 1]);
  const budgetPlan = useMemo(
    () => getBudgetPlan(today, mealPreferences, appliedGoals, countryCode),
    [today, mealPreferences, appliedGoals, countryCode]
  );
  const planPreferences = budgetPlan.preferences;
  const budgetWarning = budgetPlan.status === "impossible"
    ? { budget: budgetPlan.budget, weeklyCost: budgetPlan.weeklyCost }
    : null;
  const selectedDateKey = formatDateKey(selectedDate);
  const appliedGoal = appliedGoals[selectedDateKey];
  const personalizedPlan = getPersonalizedDayPlan(
    selectedDate,
    planPreferences,
    countryCode,
    appliedGoals[selectedDateKey] ?? DEFAULT_DAILY_CALORIE_GOAL
  );
  const unpricedMeals = scaleMealPlan(
    personalizedPlan.meals,
    appliedGoals[selectedDateKey] ?? DEFAULT_DAILY_CALORIE_GOAL
  );
  const meals = repriceMeals(unpricedMeals, countryCode);
  const batchPrep = getBatchPrep(selectedDate, planPreferences, appliedGoals, countryCode, today, dates[dates.length - 1]);
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

  const tabPosition = pageWidth > 0
    ? scrollX.interpolate({
        inputRange: [0, pageWidth * (tabOrder.length - 1)],
        outputRange: [0, tabOrder.length - 1],
        extrapolate: "clamp"
      })
    : scrollX;

  function selectTab(index: number): void {
    setActiveTab(index);
    pagerRef.current?.scrollTo({ x: index * pageWidth, animated: true });
  }

  function handlePagerScroll(event: NativeSyntheticEvent<NativeScrollEvent>): void {
    if (pageWidth <= 0) return;
    const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    const clamped = Math.max(0, Math.min(tabOrder.length - 1, index));
    if (clamped !== activeTabRef.current) {
      activeTabRef.current = clamped;
      setActiveTab(clamped);
    }
  }

  function handlePagerLayout(event: LayoutChangeEvent): void {
    const width = event.nativeEvent.layout.width;
    if (width === pageWidth) return;
    setPageWidth(width);
    requestAnimationFrame(() => pagerRef.current?.scrollTo({ x: activeTabRef.current * width, animated: false }));
  }

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const pageStyle = { width: pageWidth || windowWidth };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <StatusBar barStyle="dark-content" />
        <TopTabBar
          labels={tabOrder.map((tab) => t(`tabs.${tab}`))}
          activeIndex={activeTab}
          position={tabPosition}
          onTabPress={selectTab}
        />
        <Animated.ScrollView
          ref={pagerRef}
          horizontal
          pagingEnabled
          bounces={false}
          overScrollMode="never"
          directionalLockEnabled
          scrollEnabled={!pagerSwipeBlocked}
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          onLayout={handlePagerLayout}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true, listener: handlePagerScroll }
          )}
          style={styles.pager}
        >
          <View style={pageStyle}>
            <OnboardingScreen
              bannedIngredients={mealPreferences.bannedIngredients}
              onToggleIngredientBan={toggleIngredientBan}
              mealPreferences={mealPreferences}
              onMealPreferencesChange={(next) => setMealPreferences(next)}
              countryCode={countryCode}
              budgetWarning={budgetWarning}
              onCountryChange={setCountryCode}
            />
          </View>
          <View style={pageStyle}>
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
              fruitPreference={mealPreferences.fruitPreference}
              onFruitPreferenceChange={(fruitPreference) => setMealPreferences((current) => ({ ...current, fruitPreference }))}
              weeklyBudget={mealPreferences.weeklyBudget}
              onWeeklyBudgetChange={(weeklyBudget) => setMealPreferences((current) => ({ ...current, weeklyBudget }))}
              budgetWarning={budgetWarning}
              budgetStatus={budgetPlan.status}
              currencyCode={getCountry(countryCode).currencyCode}
              onDateStripTouchChange={setPagerSwipeBlocked}
            />
          </View>
          <View style={pageStyle}>
            <GroceryScreen
              today={today}
              preferences={planPreferences}
              appliedGoals={appliedGoals}
              countryCode={countryCode}
            />
          </View>
        </Animated.ScrollView>
      </SafeAreaView>
      <MealDetailsModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.paper },
  pager: { flex: 1 }
});
