import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { MealAlternativePicker } from "./src/components/MealAlternativePicker";
import { TopTabBar } from "./src/components/TopTabBar";
import { CalendarScreen } from "./src/screens/CalendarScreen";
import { GroceryScreen } from "./src/screens/GroceryScreen";
import { MenuScreen } from "./src/screens/MenuScreen";
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
  getPersonalizedDayPlan,
  getRecipeAlternatives,
  getRecipeCatalog,
  getDisplayedRecipeSourceKeys,
  applyGlobalMealReplacement,
  removeMealBan
} from "./src/sampleData";
import { DEFAULT_COUNTRY, getCountry, type CountryCode } from "./src/countryPricing";
import { repriceMeals } from "./src/ingredientEstimates";
import { getBatchPrep, getCalendarDayPlans } from "./src/groceryEstimate";
import { getBudgetPlan } from "./src/budgetPlan";
import { setBatchCalendar } from "./src/batchCooking";
import { palette } from "./src/theme";

const tabOrder = ["preferences", "meals", "menu", "groceries"] as const;
// Memoized so tab changes and modal state only re-render what actually changed.
const MemoOnboardingScreen = memo(OnboardingScreen);
const MemoCalendarScreen = memo(CalendarScreen);
const MemoMenuScreen = memo(MenuScreen);
const MemoGroceryScreen = memo(GroceryScreen);
const MemoTopTabBar = memo(TopTabBar);

// Stable function identity that always calls the latest implementation.
function useStableCallback<Args extends unknown[], Result>(callback: (...args: Args) => Result): (...args: Args) => Result {
  const ref = useRef(callback);
  ref.current = callback;
  return useCallback((...args: Args) => ref.current(...args), []);
}
function createsSubstitutionCycle(sourceKeys: string[], substituteKey: string, substitutions: Record<string, string>): boolean {
  const visited = new Set<string>();
  let current: string | undefined = substituteKey;
  while (current) {
    if (sourceKeys.includes(current) || visited.has(current)) return true;
    visited.add(current);
    current = substitutions[current];
  }
  return false;
}
type PickerRequest = {
  mode: "scope" | "ban" | "replace";
  meal: Meal;
  targetRecipeKeys: string[];
  targetOccurrenceKeys?: string[];
  occurrenceKey?: string;
};

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
    bannedMeals: [],
    mealSubstitutes: {},
    mealOccurrenceOverrides: {},
    typicalBreakfast: { mode: "none" }
  });
  const [today, setToday] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState("2000");
  const [goalInput, setGoalInput] = useState("2000");
  const [appliedGoals, setAppliedGoals] = useState<Record<string, number>>({});
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [pickerRequest, setPickerRequest] = useState<PickerRequest | null>(null);
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
  const budgetWarning = useMemo(() => budgetPlan.status === "impossible"
    ? { budget: budgetPlan.budget, weeklyCost: budgetPlan.weeklyCost }
    : null, [budgetPlan]);
  const selectedDateKey = formatDateKey(selectedDate);
  const appliedGoal = appliedGoals[selectedDateKey];
  const selectedGoal = appliedGoal ?? DEFAULT_DAILY_CALORIE_GOAL;
  const meals = useMemo(() => {
    const personalizedPlan = getPersonalizedDayPlan(selectedDate, planPreferences, countryCode, selectedGoal);
    const unpricedMeals = personalizedPlan.meals.length > 0 ? scaleMealPlan(personalizedPlan.meals, selectedGoal) : [];
    return repriceMeals(unpricedMeals, countryCode);
    // Keyed by selectedDateKey so a new Date object for the same day does not recompute.
  }, [selectedDateKey, planPreferences, countryCode, selectedGoal]);
  const batchPrep = useMemo(
    () => getBatchPrep(selectedDate, planPreferences, appliedGoals, countryCode, today, dates[dates.length - 1]),
    [selectedDateKey, planPreferences, appliedGoals, countryCode, today, dates]
  );
  const menuDays = useMemo(() => {
    const plans = getCalendarDayPlans(dates[0], dates[dates.length - 1], planPreferences, appliedGoals, countryCode);
    return plans.map((dayMeals, index) => ({ dateKey: formatDateKey(dates[index]), meals: dayMeals }));
  }, [dates, planPreferences, appliedGoals, countryCode]);
  const recipeCatalog = useMemo(() => repriceMeals(getRecipeCatalog(), countryCode), [countryCode]);
  const pickerOptions = useMemo(() => pickerRequest && pickerRequest.mode !== "scope"
    ? repriceMeals(getRecipeAlternatives(pickerRequest.meal.type, pickerRequest.meal.recipeKey, mealPreferences.bannedMeals)
      .filter((meal) => pickerRequest.occurrenceKey || !createsSubstitutionCycle(
        pickerRequest.targetRecipeKeys, meal.recipeKey, mealPreferences.mealSubstitutes
      )), countryCode)
    : [], [pickerRequest, mealPreferences.bannedMeals, mealPreferences.mealSubstitutes, countryCode]);
  const parsedGoal = Number(goalInput);
  const hasValidGoal =
    goalInput.length > 0 &&
    /^\d+$/.test(goalInput) &&
    Number.isInteger(parsedGoal) &&
    parsedGoal >= MIN_DAILY_CALORIE_GOAL &&
    parsedGoal <= MAX_DAILY_CALORIE_GOAL;

  const requestReplacement = useStableCallback((meal: Meal): void => {
    const displayedMeals = menuDays.map((day) => day.meals);
    const targetRecipeKeys = getDisplayedRecipeSourceKeys(displayedMeals, meal.recipeKey);
    const targetOccurrenceKeys = menuDays.flatMap((day) => day.meals
      .filter((displayedMeal) => displayedMeal.recipeKey === meal.recipeKey && displayedMeal.occurrenceKey)
      .map((displayedMeal) => displayedMeal.occurrenceKey!));
    setPickerRequest({
      mode: meal.occurrenceKey ? "scope" : "replace",
      meal,
      targetRecipeKeys: targetRecipeKeys.length > 0 ? targetRecipeKeys : [meal.sourceRecipeKey ?? meal.recipeKey],
      targetOccurrenceKeys
    });
  });

  const requestBan = useStableCallback((meal: Meal): void => {
    setPickerRequest({ mode: "ban", meal, targetRecipeKeys: [meal.recipeKey] });
  });

  const requestMenuReplacement = useStableCallback((meal: Meal, sourceRecipeKeys: string[]): void => {
    const targetOccurrenceKeys = menuDays.flatMap((day) => day.meals
      .filter((displayedMeal) => displayedMeal.recipeKey === meal.recipeKey && displayedMeal.occurrenceKey)
      .map((displayedMeal) => displayedMeal.occurrenceKey!));
    setPickerRequest({
      mode: "replace",
      meal,
      targetRecipeKeys: sourceRecipeKeys.length > 0 ? sourceRecipeKeys : [meal.recipeKey],
      targetOccurrenceKeys
    });
  });

  function applyPickerChoice(recipeKey: string | null): void {
    if (!pickerRequest) return;
    if (pickerRequest.mode === "ban") {
      const target = pickerRequest.targetRecipeKeys[0];
      setMealPreferences((current) => ({
        ...current,
        bannedMeals: current.bannedMeals.includes(target) ? current.bannedMeals : [...current.bannedMeals, target],
        mealSubstitutes: recipeKey
          ? { ...current.mealSubstitutes, [target]: recipeKey }
          : Object.fromEntries(Object.entries(current.mealSubstitutes).filter(([key]) => key !== target))
      }));
    } else if (pickerRequest.mode === "replace") {
      if (pickerRequest.occurrenceKey) {
        setMealPreferences((current) => ({
          ...current,
          mealOccurrenceOverrides: { ...current.mealOccurrenceOverrides, [pickerRequest.occurrenceKey!]: recipeKey ?? pickerRequest.meal.recipeKey }
        }));
      } else if (recipeKey) {
        setMealPreferences((current) => applyGlobalMealReplacement(
          current,
          pickerRequest.targetRecipeKeys,
          pickerRequest.meal.recipeKey,
          recipeKey,
          pickerRequest.targetOccurrenceKeys
        ));
      }
    }
    setPickerRequest(null);
    setSelectedMeal(null);
  }

  const unbanMeal = useStableCallback((recipeKey: string): void => {
    setMealPreferences((current) => removeMealBan(current, recipeKey));
  });

  function revertOccurrence(meal: Meal): void {
    if (!meal.occurrenceKey) return;
    setMealPreferences((current) => ({
      ...current,
      mealOccurrenceOverrides: Object.fromEntries(Object.entries(current.mealOccurrenceOverrides)
        .filter(([key]) => key !== meal.occurrenceKey))
    }));
    setSelectedMeal(null);
  }

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

  const adjustGoal = useStableCallback((amount: number): void => {
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
  });

  const toggleIngredientBan = useStableCallback((ingredientId: string): void => {
    setMealPreferences((current) => ({
      ...current,
      bannedIngredients: current.bannedIngredients.includes(ingredientId)
        ? current.bannedIngredients.filter((id) => id !== ingredientId)
        : [...current.bannedIngredients, ingredientId]
    }));
  });

  const changeDailyGoalInput = useStableCallback((value: string): void => {
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
  });

  const goToToday = useStableCallback((): void => {
    const currentDate = new Date();
    setToday(currentDate);
    setSelectedDate(currentDate);
  });

  const tabPosition = useMemo(() => pageWidth > 0
    ? scrollX.interpolate({
        inputRange: [0, pageWidth * (tabOrder.length - 1)],
        outputRange: [0, tabOrder.length - 1],
        extrapolate: "clamp"
      })
    : scrollX, [pageWidth, scrollX]);
  const tabLabels = useMemo(() => tabOrder.map((tab) => t(`tabs.${tab}`)), [t]);
  const pagerScrollHandler = useMemo(() => Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: true, listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => handlePagerScrollRef.current(event) }
  ), [scrollX]);

  const selectTab = useStableCallback((index: number): void => {
    setActiveTab(index);
    pagerRef.current?.scrollTo({ x: index * pageWidth, animated: true });
  });

  const handlePagerScrollRef = useRef(handlePagerScroll);
  handlePagerScrollRef.current = handlePagerScroll;

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

  const pageStyle = useMemo(() => ({ width: pageWidth || windowWidth }), [pageWidth, windowWidth]);
  const currencyCode = getCountry(countryCode).currencyCode;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <StatusBar barStyle="dark-content" />
        <MemoTopTabBar
          labels={tabLabels}
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
          onScroll={pagerScrollHandler}
          style={styles.pager}
        >
          <View style={pageStyle}>
            <MemoOnboardingScreen
              bannedIngredients={mealPreferences.bannedIngredients}
              onToggleIngredientBan={toggleIngredientBan}
              mealPreferences={mealPreferences}
              onMealPreferencesChange={setMealPreferences}
              countryCode={countryCode}
              budgetWarning={budgetWarning}
              onCountryChange={setCountryCode}
              goalInput={goalInput}
              onGoalInputChange={changeDailyGoalInput}
              onAdjustGoal={adjustGoal}
              hasValidGoal={hasValidGoal}
            />
          </View>
          <View style={pageStyle}>
            <MemoCalendarScreen
              dates={dates}
              today={today}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onTodayPress={goToToday}
              meals={meals}
              batchPrep={batchPrep}
              onMealPress={setSelectedMeal}
              planStyle={mealPreferences.planStyle}
              budgetWarning={budgetWarning}
              budgetStatus={budgetPlan.status}
              currencyCode={currencyCode}
              onDateStripTouchChange={setPagerSwipeBlocked}
            />
          </View>
          <View style={pageStyle}>
            <MemoMenuScreen
              days={menuDays}
              recipes={recipeCatalog}
              bannedMeals={mealPreferences.bannedMeals}
              mealSubstitutes={mealPreferences.mealSubstitutes}
              planStyle={mealPreferences.planStyle}
              onBan={requestBan}
              onReplaceAll={requestMenuReplacement}
              onUnban={unbanMeal}
              onMealPress={setSelectedMeal}
            />
          </View>
          <View style={pageStyle}>
            <MemoGroceryScreen
              today={today}
              preferences={planPreferences}
              appliedGoals={appliedGoals}
              countryCode={countryCode}
            />
          </View>
        </Animated.ScrollView>
      </SafeAreaView>
      <MealDetailsModal
        meal={pickerRequest ? null : selectedMeal}
        onClose={() => setSelectedMeal(null)}
        onReplace={requestReplacement}
        onBan={requestBan}
        canRevert={Boolean(selectedMeal?.occurrenceKey && mealPreferences.mealOccurrenceOverrides[selectedMeal.occurrenceKey])}
        onRevert={revertOccurrence}
        restrictionReason={selectedMeal && mealPreferences.bannedMeals.includes(selectedMeal.recipeKey)
          ? t("mealActions.bannedUnavailable")
          : selectedMeal?.isTypicalBreakfast
          ? t("mealActions.typicalUnavailable")
          : selectedMeal?.batch ? t("mealActions.batchUnavailable") : null}
      />
      <MealAlternativePicker
        visible={pickerRequest !== null}
        mode={pickerRequest?.mode ?? "replace"}
        scope={pickerRequest?.occurrenceKey ? "day" : "all"}
        meal={pickerRequest?.meal ?? null}
        options={pickerOptions}
        onClose={() => setPickerRequest(null)}
        onScope={(scope) => setPickerRequest((current) => current ? {
          ...current,
          mode: "replace",
          occurrenceKey: scope === "day" ? current.meal.occurrenceKey : undefined
        } : null)}
        onSelect={applyPickerChoice}
      />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.paper },
  pager: { flex: 1 }
});
