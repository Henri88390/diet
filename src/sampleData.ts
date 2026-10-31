import type {
  DayPlan,
  Meal,
  MealIngredient,
  MealPreferences,
  MealType,
  TypicalBreakfastIngredient,
  WeeklyFrequency
} from "./models";
import {
  estimateIngredient,
  getIngredientCategory,
  isValidPositiveIngredientQuantity
} from "./ingredientEstimates";
import { isIngredientBanned } from "./ingredientCatalog";
import { applyBatchCooking } from "./batchCooking";
import type { CountryCode } from "./countryPricing";
import { typicalBreakfastPresets } from "./typicalBreakfast";

type IngredientTemplate = Omit<MealIngredient, "category" | "calories" | "proteinGrams" | "estimatedCostCents">;
type MealTemplate = Omit<Meal, "ingredients" | "proteinGrams"> & { ingredients: IngredientTemplate[] };

// Legacy meal-level totals on these templates are replaced by ingredient-rate
// calculations in materializeMeal; quantities and unit estimates are authoritative.
const mealTemplates: MealTemplate[][] = [
  [
    { id: "monday-b", type: "Breakfast", title: "Berry overnight oats", description: "Oats · yogurt · frozen berries", ingredients: [{ name: "Rolled oats", quantity: "50", unit: "g" }, { name: "Plain yogurt", quantity: "120", unit: "g" }, { name: "Frozen berries", quantity: "75", unit: "g" }, { name: "Milk", quantity: "60", unit: "ml" }], calories: 360, estimatedCostCents: 95, durationMinutes: 5, emoji: "🫐" },
    { id: "monday-l", type: "Lunch", title: "Chickpea crunch bowl", description: "Chickpeas · cucumber · lemon", ingredients: [{ name: "Chickpeas, drained", quantity: "150", unit: "g" }, { name: "Cucumber", quantity: "100", unit: "g" }, { name: "Cherry tomatoes", quantity: "100", unit: "g" }, { name: "Lemon juice", quantity: "1", unit: "tbsp" }, { name: "Olive oil", quantity: "1", unit: "tsp" }], calories: 485, estimatedCostCents: 135, durationMinutes: 20, emoji: "🥗" },
    { id: "monday-d", type: "Dinner", title: "One-pan tomato chicken", description: "Chicken · tomatoes · basmati rice", ingredients: [{ name: "Chicken breast", quantity: "150", unit: "g" }, { name: "Chopped tomatoes", quantity: "150", unit: "g" }, { name: "Basmati rice, dry", quantity: "75", unit: "g" }, { name: "Onion", quantity: "1/2", unit: "medium" }, { name: "Olive oil", quantity: "1", unit: "tsp" }], calories: 610, estimatedCostCents: 185, durationMinutes: 30, emoji: "🍅" }
  ],
  [
    { id: "tuesday-b", type: "Breakfast", title: "Egg & spinach toast", description: "Eggs · spinach · bread", ingredients: [{ name: "Eggs", quantity: "2", unit: "large" }, { name: "Baby spinach", quantity: "30", unit: "g" }, { name: "Bread", quantity: "2", unit: "slices" }, { name: "Olive oil", quantity: "1", unit: "tsp" }], calories: 390, estimatedCostCents: 110, durationMinutes: 12, emoji: "🍳" },
    { id: "tuesday-l", type: "Lunch", title: "Chicken wrap", description: "Chicken · lettuce · yogurt dressing", ingredients: [{ name: "Chicken breast", quantity: "120", unit: "g" }, { name: "Wrap", quantity: "1", unit: "large" }, { name: "Lettuce", quantity: "30", unit: "g" }, { name: "Plain yogurt", quantity: "2", unit: "tbsp" }, { name: "Cucumber", quantity: "50", unit: "g" }], calories: 470, estimatedCostCents: 145, durationMinutes: 10, emoji: "🌯" },
    { id: "tuesday-d", type: "Dinner", title: "Lentil tomato soup", description: "Lentils · tomatoes · carrots", ingredients: [{ name: "Lentils, dry", quantity: "75", unit: "g" }, { name: "Chopped tomatoes", quantity: "150", unit: "g" }, { name: "Carrot", quantity: "1", unit: "medium" }, { name: "Vegetable stock", quantity: "350", unit: "ml" }, { name: "Onion", quantity: "1/2", unit: "medium" }], calories: 560, estimatedCostCents: 125, durationMinutes: 35, emoji: "🥣" }
  ],
  [
    { id: "wednesday-b", type: "Breakfast", title: "Apple cinnamon porridge", description: "Oats · apple · milk", ingredients: [{ name: "Rolled oats", quantity: "50", unit: "g" }, { name: "Apple", quantity: "1", unit: "medium" }, { name: "Milk", quantity: "200", unit: "ml" }, { name: "Ground cinnamon", quantity: "1/4", unit: "tsp" }], calories: 370, estimatedCostCents: 75, durationMinutes: 10, emoji: "🍎" },
    { id: "wednesday-l", type: "Lunch", title: "Egg & potato salad", description: "Eggs · potatoes · green beans", ingredients: [{ name: "Eggs", quantity: "2", unit: "large" }, { name: "Potatoes", quantity: "200", unit: "g" }, { name: "Green beans", quantity: "100", unit: "g" }, { name: "Plain yogurt", quantity: "1", unit: "tbsp" }, { name: "Mustard", quantity: "1", unit: "tsp" }], calories: 490, estimatedCostCents: 120, durationMinutes: 25, emoji: "🥔" },
    { id: "wednesday-d", type: "Dinner", title: "Bean & vegetable basmati rice stir-fry", description: "Canned beans · frozen vegetables · basmati rice", ingredients: [{ name: "Black beans, drained", quantity: "150", unit: "g" }, { name: "Frozen mixed vegetables", quantity: "180", unit: "g" }, { name: "Basmati rice, dry", quantity: "75", unit: "g" }, { name: "Soy sauce", quantity: "1", unit: "tbsp" }, { name: "Vegetable oil", quantity: "1", unit: "tsp" }], calories: 590, estimatedCostCents: 160, durationMinutes: 25, emoji: "🥦" }
  ],
  [
    { id: "thursday-b", type: "Breakfast", title: "Yogurt & banana bowl", description: "Plain yogurt · banana · oats", ingredients: [{ name: "Plain yogurt", quantity: "170", unit: "g" }, { name: "Banana", quantity: "1", unit: "medium" }, { name: "Rolled oats", quantity: "30", unit: "g" }, { name: "Honey", quantity: "1", unit: "tsp" }], calories: 350, estimatedCostCents: 85, durationMinutes: 5, emoji: "🍌" },
    { id: "thursday-l", type: "Lunch", title: "Tomato & white bean toast", description: "White beans · tomatoes · toast", ingredients: [{ name: "White beans, drained", quantity: "150", unit: "g" }, { name: "Tomatoes", quantity: "120", unit: "g" }, { name: "Bread", quantity: "2", unit: "slices" }, { name: "Olive oil", quantity: "1", unit: "tsp" }, { name: "Garlic", quantity: "1", unit: "clove" }], calories: 480, estimatedCostCents: 105, durationMinutes: 15, emoji: "🍞" },
    { id: "thursday-d", type: "Dinner", title: "Chicken & sweet potato tray", description: "Chicken · sweet potato · carrots", ingredients: [{ name: "Chicken thigh", quantity: "150", unit: "g" }, { name: "Sweet potato", quantity: "200", unit: "g" }, { name: "Carrot", quantity: "1", unit: "medium" }, { name: "Olive oil", quantity: "1", unit: "tsp" }, { name: "Dried herbs", quantity: "1/2", unit: "tsp" }], calories: 620, estimatedCostCents: 195, durationMinutes: 40, emoji: "🍠" }
  ],
  [
    { id: "friday-b", type: "Breakfast", title: "Savory breakfast burrito", description: "Eggs · beans · salsa", ingredients: [{ name: "Eggs", quantity: "2", unit: "large" }, { name: "Black beans, drained", quantity: "80", unit: "g" }, { name: "Wrap", quantity: "1", unit: "large" }, { name: "Salsa", quantity: "2", unit: "tbsp" }, { name: "Cheddar", quantity: "20", unit: "g" }], calories: 410, estimatedCostCents: 115, durationMinutes: 15, emoji: "🌯" },
    { id: "friday-l", type: "Lunch", title: "Carrot & lentil soup", description: "Lentils · carrots · bread", ingredients: [{ name: "Lentils, dry", quantity: "65", unit: "g" }, { name: "Carrots", quantity: "2", unit: "medium" }, { name: "Vegetable stock", quantity: "350", unit: "ml" }, { name: "Bread roll", quantity: "1", unit: "roll" }, { name: "Onion", quantity: "1/2", unit: "medium" }], calories: 455, estimatedCostCents: 100, durationMinutes: 30, emoji: "🥕" },
    { id: "friday-d", type: "Dinner", title: "Tomato & spinach pasta", description: "Pasta · spinach · tomato", ingredients: [{ name: "Pasta, dry", quantity: "80", unit: "g" }, { name: "Baby spinach", quantity: "50", unit: "g" }, { name: "Chopped tomatoes", quantity: "150", unit: "g" }, { name: "Parmesan", quantity: "15", unit: "g" }, { name: "Olive oil", quantity: "1", unit: "tsp" }], calories: 590, estimatedCostCents: 135, durationMinutes: 25, emoji: "🍝" }
  ],
  [
    { id: "saturday-b", type: "Breakfast", title: "Banana oat pancakes", description: "Oats · banana · egg", ingredients: [{ name: "Rolled oats", quantity: "50", unit: "g" }, { name: "Banana", quantity: "1", unit: "medium" }, { name: "Egg", quantity: "1", unit: "large" }, { name: "Milk", quantity: "60", unit: "ml" }, { name: "Baking powder", quantity: "1/2", unit: "tsp" }], calories: 400, estimatedCostCents: 95, durationMinutes: 20, emoji: "🥞" },
    { id: "saturday-l", type: "Lunch", title: "Loaded baked potato", description: "Potato · beans · yogurt", ingredients: [{ name: "Potato", quantity: "1", unit: "large" }, { name: "Black beans, drained", quantity: "100", unit: "g" }, { name: "Plain yogurt", quantity: "2", unit: "tbsp" }, { name: "Sweetcorn", quantity: "50", unit: "g" }, { name: "Chives", quantity: "1", unit: "tsp" }], calories: 500, estimatedCostCents: 105, durationMinutes: 50, emoji: "🥔" },
    { id: "saturday-d", type: "Dinner", title: "Easy veggie basmati rice", description: "Basmati rice · eggs · mixed vegetables", ingredients: [{ name: "Basmati rice, dry", quantity: "60", unit: "g" }, { name: "Eggs", quantity: "2", unit: "large" }, { name: "Frozen mixed vegetables", quantity: "120", unit: "g" }, { name: "Soy sauce", quantity: "1", unit: "tbsp" }, { name: "Sesame oil", quantity: "1", unit: "tsp" }], calories: 610, estimatedCostCents: 125, durationMinutes: 20, emoji: "🍚" }
  ],
  [
    { id: "sunday-b", type: "Breakfast", title: "Berry yogurt oats", description: "Oats · yogurt · frozen berries", ingredients: [{ name: "Rolled oats", quantity: "40", unit: "g" }, { name: "Plain yogurt", quantity: "150", unit: "g" }, { name: "Frozen berries", quantity: "80", unit: "g" }, { name: "Chia seeds", quantity: "1", unit: "tsp" }], calories: 365, estimatedCostCents: 90, durationMinutes: 5, emoji: "🍓" },
    { id: "sunday-l", type: "Lunch", title: "Roasted veg & hummus bowl", description: "Chickpeas · frozen mixed vegetables · basmati rice", ingredients: [{ name: "Chickpeas, drained", quantity: "100", unit: "g" }, { name: "Frozen mixed vegetables", quantity: "180", unit: "g" }, { name: "Basmati rice, dry", quantity: "65", unit: "g" }, { name: "Hummus", quantity: "2", unit: "tbsp" }, { name: "Olive oil", quantity: "1", unit: "tsp" }], calories: 495, estimatedCostCents: 140, durationMinutes: 30, emoji: "🥙" },
    { id: "sunday-d", type: "Dinner", title: "Lemony chicken & greens", description: "Chicken · greens · potatoes", ingredients: [{ name: "Chicken breast", quantity: "150", unit: "g" }, { name: "Potatoes", quantity: "200", unit: "g" }, { name: "Leafy greens", quantity: "100", unit: "g" }, { name: "Lemon juice", quantity: "1", unit: "tbsp" }, { name: "Olive oil", quantity: "1", unit: "tsp" }], calories: 625, estimatedCostCents: 185, durationMinutes: 35, emoji: "🍋" }
  ]
];

export const MIN_DAILY_CALORIE_GOAL = 500;
export const MAX_DAILY_CALORIE_GOAL = 10000;
export const DEFAULT_DAILY_CALORIE_GOAL = 2000;
export const PLANNING_HORIZON_DAYS = 30;

/**
 * Disable applying when the selected day's currently displayed plan already
 * represents the requested goal. Unapplied days compare against the default
 * daily target, not the day's unscaled sample-template calories.
 */
export function shouldDisableMealPlanUpdate(
  goal: number,
  hasValidGoal: boolean,
  baselineCalories: number,
  appliedGoal: number | undefined,
  hasMeals: boolean
): boolean {
  if (!hasValidGoal || !hasMeals) return true;
  return goal === (appliedGoal ?? baselineCalories);
}

function applyTypicalBreakfast(
  meals: Meal[],
  typicalBreakfast: MealPreferences["typicalBreakfast"] = { mode: "none" }
): void {
  if (typicalBreakfast.mode === "none") return;
  if (
    typicalBreakfast.mode === "custom" &&
    (typicalBreakfast.ingredients.length === 0 ||
      typicalBreakfast.ingredients.some((ingredient) =>
        !isValidPositiveIngredientQuantity(ingredient.quantity)
      ))
  ) return;
  const breakfastIndex = meals.findIndex((meal) => meal.type === "Breakfast");
  if (breakfastIndex < 0) return;
  const preset = typicalBreakfast.mode === "preset"
    ? typicalBreakfastPresets.find((candidate) => candidate.id === typicalBreakfast.presetId)
    : undefined;
  const ingredients: TypicalBreakfastIngredient[] = typicalBreakfast.mode === "custom"
    ? typicalBreakfast.ingredients
    : preset?.ingredients ?? typicalBreakfastPresets[0].ingredients;
  const current = meals[breakfastIndex];
  const replacement: Meal = {
    ...current,
    title: typicalBreakfast.mode === "custom" ? "Custom typical breakfast" : (preset?.title ?? typicalBreakfastPresets[0].title),
    description: ingredients.map(({ name }) => name).join(" · "),
    emoji: typicalBreakfast.mode === "custom" ? "🥣" : (preset?.emoji ?? "🥣"),
    ingredients: ingredients.map((ingredient) => ({
      ...ingredient,
      category: getIngredientCategory(ingredient.name),
      calories: 0,
      proteinGrams: 0,
      estimatedCostCents: 0
    }))
  };
  refreshMealEstimates(replacement);
  meals[breakfastIndex] = replacement;
}

/** Scale sample portions and all linked estimates from a canonical day. */
export function scaleMealPlan(meals: Meal[], goal: number): Meal[] {
  if (
    !Number.isInteger(goal) ||
    goal < MIN_DAILY_CALORIE_GOAL ||
    goal > MAX_DAILY_CALORIE_GOAL
  ) {
    throw new RangeError(
      `Daily calorie goal must be an integer from ${MIN_DAILY_CALORIE_GOAL} to ${MAX_DAILY_CALORIE_GOAL}.`
    );
  }

  if (meals.length === 0) {
    throw new RangeError("Cannot scale a day with no meals.");
  }

  if (meals.some((meal) => !Number.isFinite(meal.calories) || meal.calories < 0)) {
    throw new RangeError("Meal calorie estimates must be finite and non-negative.");
  }

  const sourceTotal = getDailyCalories(meals);
  if (!Number.isFinite(sourceTotal)) {
    throw new RangeError("Meal calorie estimates must be finite.");
  }

  const activeIndexes = meals.map((meal, index) => ({ meal, index }))
    .filter(({ meal }) => meal.ingredients.length > 0 && meal.calories > 0)
    .map(({ index }) => index);
  if (sourceTotal <= 0 || activeIndexes.length === 0) {
    return meals.map((meal) => ({ ...meal, calories: 0, proteinGrams: 0 }));
  }
  const snackCount = activeIndexes.filter((index) => meals[index].type === "Snack").length;
  const mainIndexes = activeIndexes.filter((index) => meals[index].type !== "Snack");
  const remainderIndexes = mainIndexes.length > 0 ? mainIndexes : activeIndexes;
  const mainMealCount = mainIndexes.length;
  const snackTarget = Math.floor(goal * Math.min(0.1, 0.3 / Math.max(1, snackCount)));
  const mainTarget = Math.floor((goal - snackTarget * snackCount) / Math.max(1, mainMealCount));
  const exactTargets = meals.map((meal, index) => !activeIndexes.includes(index)
    ? 0
    : meal.type === "Snack"
    ? snackTarget
    : mainTarget);
  const targetRemainder = goal - exactTargets.reduce((sum, value) => sum + value, 0);
  for (let index = 0; index < targetRemainder; index += 1) {
    exactTargets[remainderIndexes[index % remainderIndexes.length]] += 1;
  }

  const scaled = meals.map((meal, index) => {
    const exactCalories = exactTargets[index];
    const roundedDown = Math.floor(exactCalories);
    return {
      meal: { ...meal, calories: roundedDown },
      remainder: exactCalories - roundedDown,
      index
    };
  });

  let caloriesRemaining = goal - scaled.reduce((total, item) => total + item.meal.calories, 0);
  const remainderOrder = [...scaled].sort(
    (first, second) => second.remainder - first.remainder || first.index - second.index
  );
  for (let index = 0; index < caloriesRemaining; index += 1) {
    remainderOrder[index].meal.calories += 1;
  }

  return scaled.map((item) => {
    const sourceMeal = meals[item.index];
    const portionScale = sourceMeal.calories > 0
      ? item.meal.calories / sourceMeal.calories
      : goal / sourceTotal;
    const ingredients = sourceMeal.ingredients.map((ingredient) => ({
      ...ingredient,
      quantity: formatScaledQuantity(parseQuantity(ingredient.quantity) * portionScale, ingredient.unit)
    }));

    const quantityEstimates = ingredients.map((ingredient) =>
      estimateIngredient(ingredient.name, ingredient.quantity, ingredient.unit)
    );
    distributeToTotal(
      quantityEstimates.map((estimate, index) => ({
        weight: estimate.calories,
        index
      })),
      item.meal.calories
    ).forEach((value, index) => {
      ingredients[index].calories = value;
    });
    ingredients.forEach((ingredient, index) => {
      const estimate = quantityEstimates[index];
      ingredient.category = estimate.category;
      ingredient.estimatedCostCents = estimate.estimatedCostCents;
      ingredient.proteinGrams = estimate.proteinGrams;
    });

    return {
      ...item.meal,
      estimatedCostCents: ingredients.reduce((sum, ingredient) => sum + ingredient.estimatedCostCents, 0),
      proteinGrams: ingredients.reduce((sum, ingredient) => sum + ingredient.proteinGrams, 0),
      ingredients
    };
  });
}

function distributeToTotal(
  entries: { weight: number; index: number }[],
  total: number
): number[] {
  const weightTotal = entries.reduce((sum, entry) => sum + entry.weight, 0);
  if (entries.length === 0) return [];
  const allocations = entries.map(({ weight, index }) => {
    const exact = weightTotal > 0 ? (weight / weightTotal) * total : total / entries.length;
    const value = Math.floor(exact);
    return { index, value, remainder: exact - value };
  });
  const remaining = total - allocations.reduce((sum, allocation) => sum + allocation.value, 0);
  const remainderOrder = [...allocations].sort(
    (first, second) => second.remainder - first.remainder || first.index - second.index
  );
  for (let index = 0; index < remaining; index += 1) {
    remainderOrder[index].value += 1;
  }
  const result = Array.from({ length: entries.length }, () => 0);
  allocations.forEach((allocation) => {
    result[allocation.index] = allocation.value;
  });
  return result;
}

function parseQuantity(quantity: string): number {
  const normalized = quantity.trim();
  const fraction = /^(\d+)\s*\/\s*(\d+)$/.exec(normalized);
  let value: number;
  if (fraction) {
    const numerator = Number(fraction[1]);
    const denominator = Number(fraction[2]);
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
      throw new RangeError(`Invalid ingredient quantity "${quantity}".`);
    }
    value = numerator / denominator;
  } else if (/^(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(normalized)) {
    value = Number(normalized.replace(",", "."));
  } else {
    throw new RangeError(`Invalid ingredient quantity "${quantity}".`);
  }
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`Invalid ingredient quantity "${quantity}".`);
  }
  return value;
}

/** Round scaled portions to kitchen-friendly amounts and format decimals by locale. */
export function formatScaledQuantity(quantity: number, unit: string): string {
  if (!Number.isFinite(quantity) || quantity <= 0) return "0";
  if (unit === "g" || unit === "ml") {
    return new Intl.NumberFormat(undefined, { useGrouping: false, maximumFractionDigits: 0 }).format(
      Math.max(1, Math.round(quantity))
    );
  }
  const roundedToHalf = Math.max(1, Math.round(quantity * 2)) / 2;
  if (roundedToHalf === 0.5) return "1/2";
  return new Intl.NumberFormat(undefined, {
    useGrouping: false,
    minimumFractionDigits: Number.isInteger(roundedToHalf) ? 0 : 1,
    maximumFractionDigits: 1
  }).format(roundedToHalf);
}

export function getWeekDates(referenceDate = new Date()): Date[] {
  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);
  const mondayOffset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

/** The selectable planning window starts today and ends 30 days later. */
export function getPlanningDateWindow(referenceDate = new Date()): { start: Date; end: Date } {
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  const end = new Date(today);
  end.setDate(end.getDate() + PLANNING_HORIZON_DAYS);
  return { start, end };
}

/** Every selectable date, inclusive, for the current-week-through-horizon strip. */
export function getPlanningDates(referenceDate = new Date()): Date[] {
  const { start, end } = getPlanningDateWindow(referenceDate);
  const dates: Date[] = [];
  for (const date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    dates.push(new Date(date));
  }
  return dates;
}

/**
 * Keep an explicitly selected date when it remains in range, but advance a
 * selection that was following "today" and discard dates before this week's
 * Monday after a day/week rollover.
 */
export function getSelectedDateAfterTodayRefresh(
  selectedDate: Date,
  previousToday: Date,
  currentDate: Date
): Date {
  const currentDay = new Date(currentDate);
  currentDay.setHours(0, 0, 0, 0);
  if (
    formatDateKey(selectedDate) === formatDateKey(previousToday) ||
    selectedDate < currentDay
  ) {
    return currentDay;
  }
  return selectedDate;
}

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDayPlan(date: Date): DayPlan {
  const meals = mealTemplates[(date.getDay() + 6) % 7] ?? [];
  const materializedMeals = meals.map(materializeMeal);
  materializedMeals.forEach((meal) => {
    if (meal.type !== "Breakfast") {
      addSeasoningIfNeeded(meal);
      refreshMealEstimates(meal);
    }
  });
  return { date: formatDateKey(date), meals: materializedMeals };
}

/**
 * Assign frequency choices to stable weekdays in each Monday-based calendar
 * week. A week always receives exactly the requested number of assigned days.
 */
export function getWeeklyAssignmentDays(frequency: WeeklyFrequency): number[] {
  const assignments: Record<WeeklyFrequency, number[]> = {
    0: [],
    1: [2],
    2: [1, 4],
    3: [0, 2, 4],
    7: [0, 1, 2, 3, 4, 5, 6]
  };
  return [...assignments[frequency]];
}

/**
 * Produce a deterministic, personalized copy of a canonical sample day.
 * Weekly frequencies are expressed as days with the chosen food per week.
 */
export function getPersonalizedDayPlan(
  date: Date,
  preferences: MealPreferences,
  countryCode: CountryCode = "DE"
): DayPlan {
  const basePlan = getDayPlan(date);
  const weekday = (date.getDay() + 6) % 7;
  const meatDay = getWeeklyAssignmentDays(preferences.meatPerWeek).includes(weekday);
  const dairyDay = getWeeklyAssignmentDays(preferences.dairyPerWeek).includes(weekday);
  const meals = basePlan.meals.map((meal) => ({
    ...meal,
    ingredients: meal.ingredients.map((ingredient) => ({ ...ingredient }))
  }));

  meals.forEach((meal) => {
    meal.ingredients = meal.ingredients.map((ingredient) => {
      if (isMeat(ingredient.name) && !(meatDay && meal.type === "Dinner")) {
        return replaceIngredient(ingredient, plantProteinReplacement(ingredient.name));
      }
      if (isDairy(ingredient.name) && !(dairyDay && meal.type === "Breakfast")) {
        return replaceIngredient(ingredient, dairyAlternative(ingredient.name, meal.type));
      }
      if (preferences.fruitPreference === "avoid" && isFruit(ingredient.name)) {
        return replaceIngredient(ingredient, "Rolled oats");
      }
      return ingredient;
    });
    refreshMealCopy(meal, preferences.fruitPreference);
  });

  if (meatDay) ensureDinnerMeat(meals, weekday);
  if (dairyDay) ensureBreakfastDairy(meals);

  if (preferences.fruitPreference === "include" && preferences.typicalBreakfast.mode === "none") {
    const breakfast = meals.find((meal) => meal.type === "Breakfast");
    if (breakfast && !breakfast.ingredients.some((ingredient) => isFruit(ingredient.name))) {
      breakfast.ingredients.push({
        name: "Frozen berries",
        quantity: "80",
        unit: "g",
        category: "main",
        calories: 40,
        proteinGrams: 0,
        estimatedCostCents: 28
      });
      breakfast.title = `Berry-topped ${breakfast.title.toLowerCase()}`;
      breakfast.description = appendDescription(breakfast.description, "frozen berries");
    }
  }

  meals.forEach((meal) => {
    if (meal.type === "Lunch" || meal.type === "Dinner") addSeasoningIfNeeded(meal);
    refreshMealEstimates(meal);
  });

  if (preferences.mealsPerDay === 2) {
    const lunchIndex = meals.findIndex((meal) => meal.type === "Lunch");
    if (lunchIndex >= 0) meals.splice(lunchIndex, 1);
  } else if (preferences.mealsPerDay > 3) {
    const snackCount = preferences.mealsPerDay - 3;
    for (let index = 0; index < snackCount; index += 1) {
      meals.push(createSnackMeal(date, index === 0 ? "Morning" : "Afternoon", preferences));
    }
  }

  applyPlanStyle(meals, preferences, countryCode, date);
  applyTypicalBreakfast(meals, preferences.typicalBreakfast);
  if (isWeeklyBudgetTight(meals, preferences.weeklyBudget, countryCode)) {
    const mealsForBudgetAdjustment = (preferences.typicalBreakfast.mode === "none"
      ? meals
      : meals.filter((meal) => meal.type !== "Breakfast")
    ).filter((meal) => !meal.batch);
    applyLowCostChoices(mealsForBudgetAdjustment);
  }
  applyIngredientBans(meals, preferences.bannedIngredients);
  meals.forEach(mergeDuplicateIngredients);
  meals.forEach(refreshMealEstimates);
  return { date: basePlan.date, meals };
}

/** Substitutions can reintroduce an ingredient the meal already has (e.g. olive oil). */
function mergeDuplicateIngredients(meal: Meal): void {
  const merged: MealIngredient[] = [];
  meal.ingredients.forEach((ingredient) => {
    const existing = merged.find((item) => item.name.toLowerCase() === ingredient.name.toLowerCase());
    if (!existing) {
      merged.push(ingredient);
      return;
    }
    if (getIngredientCategory(ingredient.name) !== "seasoning" && existing.unit === ingredient.unit) {
      existing.quantity = formatScaledQuantity(
        parseQuantity(existing.quantity) + parseQuantity(ingredient.quantity),
        existing.unit
      );
    }
  });
  if (merged.length === meal.ingredients.length) return;
  meal.ingredients = merged;
  const seen = new Set<string>();
  meal.description = meal.description
    .split("·")
    .map((part) => part.trim())
    .filter((part) => {
      const key = part.toLowerCase();
      if (!part || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join(" · ");
}

function applyPlanStyle(
  meals: Meal[],
  preferences: MealPreferences,
  countryCode: CountryCode,
  date: Date
): void {
  if (preferences.planStyle === "batchCooking") {
    const options = {
      bannedIngredients: preferences.bannedIngredients,
      meatWeekdays: getWeeklyAssignmentDays(preferences.meatPerWeek),
      budgetTight: isWeeklyBudgetTight(meals, preferences.weeklyBudget, countryCode)
    };
    applyBatchCooking(meals, date, options);
    // Re-run with cheaper components if the batch itself pushes past the budget.
    if (!options.budgetTight && isWeeklyBudgetTight(meals, preferences.weeklyBudget, countryCode)) {
      applyBatchCooking(meals, date, { ...options, budgetTight: true });
    }
  }
  if (preferences.planStyle === "lowCost") applyLowCostChoices(meals);
  if (preferences.planStyle === "highProtein") applyHighProteinChoices(meals, preferences, countryCode);
}

/**
 * Daily portions are rescaled to the calorie goal, so extra protein only
 * sticks if calorie-dense starches and oils shrink while protein grows.
 */
function applyHighProteinChoices(
  meals: Meal[],
  preferences: MealPreferences,
  countryCode: CountryCode
): void {
  const budgetTight = isWeeklyBudgetTight(meals, preferences.weeklyBudget, countryCode);
  const starchOrFat = /rolled oats|basmati rice|pasta, dry|^bread|wrap|bread roll|potato|olive oil|vegetable oil|honey|jam|chia/i;
  const proteinFood = /beans|chickpeas|lentils|hummus|cottage cheese|skyr|yogurt/i;

  function addOrIncrease(meal: Meal, name: string, quantity: number, unit: string): void {
    const existing = meal.ingredients.find((ingredient) => ingredient.name === name);
    if (existing) {
      existing.quantity = String(Number(existing.quantity) + quantity);
      return;
    }
    const estimate = estimateIngredient(name, String(quantity), unit);
    meal.ingredients.push({
      name, quantity: String(quantity), unit, category: estimate.category,
      calories: estimate.calories, proteinGrams: estimate.proteinGrams,
      estimatedCostCents: estimate.estimatedCostCents
    });
  }

  meals.forEach((meal) => {
    if (meal.type === "Snack") return;
    let hasMeatOrFish = false;
    meal.ingredients.forEach((ingredient) => {
      const quantity = Number(ingredient.quantity);
      if (!Number.isFinite(quantity)) return;
      if (isMeat(ingredient.name) && ingredient.unit === "g") {
        hasMeatOrFish = true;
        ingredient.quantity = String(Math.round(quantity * 1.5));
      } else if (proteinFood.test(ingredient.name) && ingredient.unit === "g") {
        ingredient.quantity = String(Math.round(quantity * 1.5));
      } else if (starchOrFat.test(ingredient.name)) {
        const shrunk = quantity * 0.65;
        ingredient.quantity = ingredient.unit === "g" || ingredient.unit === "ml"
          ? String(Math.round(shrunk))
          : String(Math.max(0.5, Math.round(shrunk * 2) / 2));
      }
    });

    if (meal.type === "Breakfast") {
      addOrIncrease(meal, "Eggs", 2, "large");
      if (!budgetTight) addOrIncrease(meal, "Skyr", 120, "g");
    } else if (!hasMeatOrFish) {
      if (budgetTight) addOrIncrease(meal, "Black beans, drained", 100, "g");
      else addOrIncrease(meal, "Canned tuna, drained", 90, "g");
    }
    refreshMealEstimates(meal);
  });
}

function applyLowCostChoices(meals: Meal[]): void {
  meals.forEach((meal) => {
    let replacedIngredient = false;
    meal.ingredients = meal.ingredients.map((ingredient) => {
      if (/beef mince|ground beef/i.test(ingredient.name)) {
        replacedIngredient = true;
        return replaceIngredient(ingredient, "Frozen minced beef");
      }
      if (/pork mince|ground pork/i.test(ingredient.name)) {
        replacedIngredient = true;
        return replaceIngredient(ingredient, "Frozen minced beef");
      }
      if (/chicken breast/i.test(ingredient.name)) {
        replacedIngredient = true;
        return replaceIngredient(ingredient, "Chicken thigh");
      }
      if (/frozen berries/i.test(ingredient.name)) {
        replacedIngredient = true;
        return replaceIngredient(ingredient, "Banana");
      }
      if (/parmesan|cheddar/i.test(ingredient.name)) {
        replacedIngredient = true;
        return replaceIngredient(ingredient, "Hummus");
      }
      if (/baby spinach|leafy greens/i.test(ingredient.name)) {
        replacedIngredient = true;
        return replaceIngredient(ingredient, "Frozen mixed vegetables");
      }
      return ingredient;
    });
    if (replacedIngredient) {
      const firstFood = meal.ingredients.find((ingredient) => ingredient.category === "main")?.name ?? "everyday ingredients";
      meal.title = `Lower-cost ${meal.type.toLowerCase()} with ${firstFood}`;
      meal.description = describeMealIngredients(meal);
    }
    refreshMealEstimates(meal);
  });
}

function isWeeklyBudgetTight(
  meals: Meal[],
  budgetInput: string,
  countryCode: CountryCode
): boolean {
  if (!budgetInput.trim()) return false;
  const weeklyBudget = Number(budgetInput.replace(",", "."));
  if (!Number.isFinite(weeklyBudget) || weeklyBudget < 0) return false;
  const mealCost = meals.reduce((total, meal) => total + meal.ingredients.reduce(
    (sum, ingredient) => sum + estimateIngredient(
      ingredient.name, ingredient.quantity, ingredient.unit, countryCode
    ).estimatedCostCents,
    0
  ), 0);
  const baselineCalories = getDailyCalories(meals);
  const scaledCost = baselineCalories > 0
    ? mealCost * (DEFAULT_DAILY_CALORIE_GOAL / baselineCalories)
    : mealCost;
  return scaledCost > (weeklyBudget * 100) / 7;
}

function applyIngredientBans(meals: Meal[], bannedIds: string[]): void {
  if (bannedIds.length === 0) return;
  meals.forEach((meal) => {
    const conflicts: string[] = [];
    let replacedIngredient = false;
    const occupiedNames = new Set(
      meal.ingredients
        .filter((ingredient) => !isIngredientBanned(ingredient.name, bannedIds))
        .map((ingredient) => ingredient.name.toLowerCase())
    );
    meal.ingredients = meal.ingredients.flatMap((ingredient) => {
      if (!isIngredientBanned(ingredient.name, bannedIds)) return [ingredient];
      const replacement = getBanReplacement(ingredient, bannedIds, occupiedNames);
      if (!replacement) {
        conflicts.push(ingredient.name);
        return [];
      }
      replacedIngredient = true;
      occupiedNames.add(replacement.name.toLowerCase());
      return [replacement];
    });
    if (replacedIngredient || conflicts.length > 0) {
      const foods = meal.ingredients
        .filter((ingredient) => ingredient.category === "main")
        .slice(0, 3)
        .map((ingredient) => ingredient.name.replace(/,\s*(?:drained|cooked|uncooked|dry)$/i, ""));
      meal.title = foods.length > 0 ? `${foods.join(" & ")} meal` : "Adjusted meal";
      meal.description = foods.join(" · ");
    }
    if (conflicts.length > 0) meal.banConflicts = conflicts;
    refreshMealEstimates(meal);
  });
}

function getBanReplacement(
  ingredient: MealIngredient,
  bannedIds: string[],
  occupiedNames: Set<string>
): MealIngredient | null {
  const choices: Array<[string, string, string]> =
    /jam/i.test(ingredient.name)
      ? [["Honey", "1", "tsp"], ["Rolled oats", "20", "g"]]
      : /meat|fish|chicken|tuna|sardine|beans|chickpeas|lentils|hummus/i.test(ingredient.name)
    ? [["Black beans, drained", "100", "g"], ["Chickpeas, drained", "100", "g"], ["Lentils, dry", "100", "g"]]
    : isDairy(ingredient.name) || isEgg(ingredient.name)
      ? [["Rolled oats", "30", "g"], ["Hummus", "1", "tbsp"], ["Water", "100", "ml"]]
      : isFruit(ingredient.name)
        ? [["Rolled oats", "30", "g"], ["Black beans, drained", "80", "g"]]
        : /oil|herb|garlic|pepper|spice|cinnamon|soy sauce|mustard|salsa|chive|lemon juice|stock|honey|baking powder/i.test(ingredient.name)
          ? []
          : /rice|pasta|bread|wrap|roll|oat|potato/i.test(ingredient.name)
            ? [["Basmati rice, dry", "60", "g"], ["Pasta, dry", "60", "g"], ["Potatoes", "150", "g"]]
            : [["Frozen mixed vegetables", "100", "g"], ["Carrots", "1", "medium"], ["Tomatoes", "100", "g"]];
  const replacement = choices.find(([name]) =>
    !isIngredientBanned(name, bannedIds) &&
    !occupiedNames.has(name.toLowerCase())
  );
  if (!replacement) return null;
  const [name, quantity, unit] = replacement;
  return {
    ...ingredient,
    name,
    quantity,
    unit,
    category: getIngredientCategory(name)
  };
}

function isEgg(name: string): boolean {
  return /\beggs?\b/i.test(name);
}

function createSnackMeal(
  date: Date,
  slot: "Morning" | "Afternoon",
  preferences: MealPreferences
): Meal {
  const includeFruit = preferences.fruitPreference === "include" ||
    (preferences.fruitPreference === "optional" &&
      (date.getDay() + (slot === "Afternoon" ? 1 : 0)) % 2 === 0);
  const ingredients: IngredientTemplate[] = includeFruit
    ? [
      { name: "Banana", quantity: "1", unit: "medium" },
      { name: "Rolled oats", quantity: "20", unit: "g" }
    ]
    : [
      { name: "Bread", quantity: "1", unit: "slices" },
      { name: "Hummus", quantity: "1", unit: "tbsp" }
    ];
  return materializeMeal({
    id: `${formatDateKey(date)}-${slot.toLowerCase()}-snack`,
    type: "Snack",
    slot,
    title: includeFruit ? "Banana & oat snack" : "Hummus toast snack",
    description: includeFruit ? "Banana · oats" : "Bread · hummus",
    ingredients,
    calories: 0,
    estimatedCostCents: 0,
    durationMinutes: 3,
    emoji: includeFruit ? "🍌" : "🍞"
  });
}

function isMeat(name: string): boolean {
  return /\b(chicken|beef|pork|turkey|lamb|ham|bacon|sausage|fish|tuna|salmon|sardines?)\b/i.test(name);
}

function isDairy(name: string): boolean {
  if (/\b(soy yogurt|soy drink|oat drink)\b/i.test(name)) return false;
  return /\b(yogurt|milk|cheese|cheddar|parmesan|cottage cheese|skyr|butter|cream)\b/i.test(name);
}

function isFruit(name: string): boolean {
  return /\b(apple|banana|berries|berry|strawberr(?:y|ies)|blueberr(?:y|ies)|fruit)\b/i.test(name);
}

function replaceIngredient(ingredient: MealIngredient, replacementName: string): MealIngredient {
  const replacementUnit = /banana|apple/i.test(replacementName)
    ? "medium"
    : /hummus/i.test(replacementName)
      ? "tbsp"
      : /chickpeas|beans|lentils|chicken|beef|minced|ground pork|tuna|sardines|oats/i.test(replacementName)
        ? "g"
        : /water/i.test(replacementName) ? "ml"
          : /olive oil/i.test(replacementName) ? "tsp"
            : ingredient.unit;
  return {
    ...ingredient,
    name: replacementName,
    unit: replacementUnit,
    quantity: replacementQuantity(replacementName, ingredient)
  };
}

function replacementQuantity(name: string, original: MealIngredient): string {
  if (/banana|apple/i.test(name)) return "1";
  if (/hummus/i.test(name)) return "1";
  if (/chickpeas|beans|lentils|chicken|beef|minced|ground pork|tuna|sardines/i.test(name)) {
    return original.unit === "g" ? original.quantity : "100";
  }
  if (/water/i.test(name)) return original.unit === "ml" ? original.quantity : "100";
  if (/olive oil/i.test(name)) return "1";
  if (/rolled oats/i.test(name)) return original.unit === "g" ? original.quantity : "30";
  return original.quantity;
}

function plantProteinReplacement(originalName: string): string {
  return /tuna|salmon|sardines/i.test(originalName)
    ? "Lentils, dry"
    : "Black beans, drained";
}

function dairyAlternative(name: string, mealType: MealType): string {
  if (/milk/i.test(name)) return "Water";
  if (mealType === "Breakfast" && /yogurt/i.test(name)) return "Rolled oats";
  if (mealType === "Breakfast") return "Black beans, drained";
  return "Olive oil";
}

function ensureDinnerMeat(meals: Meal[], weekday: number): void {
  const dinner = meals.find((meal) => meal.type === "Dinner");
  if (!dinner) return;
  const previousTitle = dinner.title;
  const proteinIndex = dinner.ingredients.findIndex((ingredient) =>
    isMeat(ingredient.name) || /lentil|bean|chickpea|hummus/i.test(ingredient.name)
  );
  const animalProtein = animalProteinForWeekday(weekday);
  if (proteinIndex >= 0) {
    dinner.ingredients[proteinIndex] = replaceIngredient(
      dinner.ingredients[proteinIndex],
      animalProtein
    );
  } else {
    dinner.ingredients.unshift({
      name: animalProtein,
      quantity: "100",
      unit: "g",
      category: "main",
      calories: 150,
      proteinGrams: 22.5,
      estimatedCostCents: 90
    });
  }
  dinner.title = meatRecipeTitle(previousTitle, animalProtein);
  dinner.description = describeMealIngredients(dinner);
}

function describeMealIngredients(meal: Meal): string {
  const seasoningPattern = /oil|herb|garlic|pepper|spice|cinnamon|soy sauce|mustard|salsa|chive|lemon juice|stock/i;
  return meal.ingredients
    .filter((ingredient) => !seasoningPattern.test(ingredient.name))
    .slice(0, 3)
    .map((ingredient) => ingredient.name.replace(/,\s*(?:drained|cooked|uncooked|dry)$/i, ""))
    .join(" · ");
}

function meatRecipeTitle(title: string, animalProtein: string): string {
  const protein = animalProtein.replace(/,.*$/, "").replace(/\b(canned|in water|in oil)\b/gi, "").trim();
  if (/rice stir-fry|fried rice/i.test(title)) return `${protein} & vegetable rice`;
  if (/soup/i.test(title)) return `${protein} & tomato soup`;
  if (/pasta/i.test(title)) return `${protein}, tomato & spinach pasta`;
  if (/sweet potato/i.test(title)) return `${protein} & sweet potato tray`;
  if (/greens/i.test(title)) return `Lemony ${protein} & greens`;
  if (/tomato/i.test(title)) return `One-pan tomato ${protein.toLowerCase()}`;
  if (/potato/i.test(title)) return `${protein} & potato bowl`;
  if (/stir-fry/i.test(title)) return `${protein} & vegetable stir-fry`;
  return `${protein} ${title.toLowerCase()}`;
}

function animalProteinForWeekday(weekday: number): string {
  const proteins = [
    "Chicken breast",
    "Frozen minced beef",
    "Canned tuna, drained",
    "Chicken thigh",
    "Beef mince",
    "Canned sardines, drained",
    "Pork mince"
  ];
  return proteins[weekday] ?? "Chicken breast";
}

function refreshMealCopy(meal: Meal, fruitPreference: MealPreferences["fruitPreference"]): void {
  const hasOats = meal.ingredients.some((ingredient) => /\boats\b/i.test(ingredient.name));
  const hasWater = meal.ingredients.some((ingredient) => /^water$/i.test(ingredient.name));
  const hasOliveOil = meal.ingredients.some((ingredient) => /olive oil/i.test(ingredient.name));
  const hasDairy = meal.ingredients.some((ingredient) => isDairy(ingredient.name));
  const hasBeans = meal.ingredients.some((ingredient) => /beans|chickpeas/i.test(ingredient.name));
  if (hasOats && !hasDairy) {
    meal.title = /yogurt.*oats|oats.*yogurt/i.test(meal.title)
      ? "Oats bowl"
      : meal.title.replace(/yogurt/gi, "oat");
    meal.description = meal.description.replace(/yogurt/gi, "rolled oats");
  } else if (hasOliveOil && !hasDairy) {
    meal.title = meal.title.replace(/yogurt/gi, "olive oil");
    meal.description = meal.description.replace(/yogurt/gi, "olive oil");
  }
  if (hasWater) {
    meal.title = meal.title.replace(/milk/gi, "water");
    meal.description = meal.description.replace(/milk/gi, "water");
  }
  if (hasBeans && !hasDairy) {
    meal.title = meal.title.replace(/cheddar|parmesan|cheese/gi, "beans");
    meal.description = meal.description.replace(/cheddar|parmesan|cheese/gi, "beans");
  } else if (hasOliveOil && !hasDairy) {
    meal.title = meal.title.replace(/cheddar|parmesan|cheese/gi, "olive oil");
    meal.description = meal.description.replace(/cheddar|parmesan|cheese/gi, "olive oil");
  }
  if (meal.ingredients.some((ingredient) => /chickpeas|beans/i.test(ingredient.name))) {
    meal.title = meal.title.replace(/chicken/gi, "bean");
    meal.description = meal.description.replace(/chicken/gi, "beans");
    meal.title = meal.title.replace(/leftover bean wrap/i, "Bean & lettuce wrap");
  }
  if (fruitPreference === "avoid") {
    const formerFruit = /\b(apple|banana|berries|berry|fruit)\b/i.test(`${meal.title} ${meal.description}`);
    if (formerFruit) {
      if (/pancake/i.test(meal.title)) {
        meal.title = "Oat pancakes";
      } else if (/porridge/i.test(meal.title)) {
        meal.title = "Cinnamon porridge";
      } else if (/yogurt oats|oats.*oats/i.test(meal.title)) {
        meal.title = meal.ingredients.some((ingredient) => isDairy(ingredient.name))
          ? "Yogurt & oats"
          : "Oats bowl";
      } else if (/overnight oats/i.test(meal.title)) {
        meal.title = "Overnight oats";
      } else if (/banana/i.test(meal.title)) {
        meal.title = "Oat bowl";
      } else {
        meal.title = meal.title.replace(/apple|banana|berries|berry|fruit/gi, "oat");
      }
      meal.description = meal.description
        .replace(/(?:frozen|seasonal)\s+(?:berries|berry|fruit)/gi, "rolled oats")
        .replace(/apple|banana|berries|berry|fruit/gi, "rolled oats");
    }
  }
}

function ensureBreakfastDairy(meals: Meal[]): void {
  const breakfast = meals.find((meal) => meal.type === "Breakfast");
  if (!breakfast || breakfast.ingredients.some((ingredient) => isDairy(ingredient.name))) return;
  breakfast.ingredients.push({
    name: "Plain yogurt",
    quantity: "100",
    unit: "g",
    category: "main",
    calories: 60,
    proteinGrams: 3.5,
    estimatedCostCents: 18
  });
  breakfast.title = `Yogurt with ${breakfast.title.toLowerCase()}`;
  breakfast.description = appendDescription(breakfast.description, "plain yogurt");
}

function addSeasoningIfNeeded(meal: Meal): void {
  if (!meal.ingredients.some((ingredient) => /\b(oil|butter)\b/i.test(ingredient.name))) {
    meal.ingredients.push({
      name: "Olive oil",
      quantity: "1",
      unit: "tsp",
      category: "seasoning",
      calories: 40,
      proteinGrams: 0,
      estimatedCostCents: 4
    });
    meal.description = appendDescription(meal.description, "olive oil");
  }
  if (!meal.ingredients.some((ingredient) =>
    /herb|garlic|pepper|spice|cinnamon|soy sauce|mustard|salsa|chive|lemon juice/i.test(ingredient.name)
  )) {
    meal.ingredients.push({
      name: "Dried herbs",
      quantity: "1/2",
      unit: "tsp",
      category: "seasoning",
      calories: 2,
      proteinGrams: 0,
      estimatedCostCents: 2
    });
    meal.description = appendDescription(meal.description, "dried herbs");
  }
}

function appendDescription(description: string, addition: string): string {
  return description.toLowerCase().includes(addition.toLowerCase())
    ? description
    : `${description} · ${addition}`;
}

function refreshMealEstimates(meal: Meal): void {
  meal.ingredients.forEach((ingredient) => {
    const estimate = estimateIngredient(ingredient.name, ingredient.quantity, ingredient.unit);
    ingredient.category = estimate.category;
    ingredient.calories = estimate.calories;
    ingredient.proteinGrams = estimate.proteinGrams;
    ingredient.estimatedCostCents = estimate.estimatedCostCents;
  });
  meal.calories = meal.ingredients.reduce((sum, ingredient) => sum + ingredient.calories, 0);
  meal.proteinGrams = Math.round(meal.ingredients.reduce(
    (sum, ingredient) => sum + ingredient.proteinGrams, 0
  ) * 10) / 10;
  meal.estimatedCostCents = meal.ingredients.reduce(
    (sum, ingredient) => sum + ingredient.estimatedCostCents,
    0
  );
}

function materializeMeal(template: MealTemplate): Meal {
  const meal: Meal = {
    ...template,
    proteinGrams: 0,
    ingredients: template.ingredients.map((ingredient) => ({
      ...ingredient,
      category: "main" as const,
      calories: 0,
      proteinGrams: 0,
      estimatedCostCents: 0
    }))
  };
  refreshMealEstimates(meal);
  return meal;
}

export function getDailyCalories(meals: Meal[]): number {
  return meals.reduce((total, meal) => total + meal.calories, 0);
}

export function getDailyProtein(meals: Meal[]): number {
  return Math.round(meals.reduce((total, meal) => total + meal.proteinGrams, 0) * 10) / 10;
}

export function getMealsInDisplayOrder(meals: Meal[]): Meal[] {
  const displayRank = (meal: Meal): number => {
    if (meal.type === "Breakfast") return 0;
    if (meal.type === "Lunch") return 2;
    if (meal.type === "Dinner") return 4;
    return meal.slot === "Morning" ? 1 : 3;
  };
  return [...meals].sort(
    (first, second) => displayRank(first) - displayRank(second)
  );
}
