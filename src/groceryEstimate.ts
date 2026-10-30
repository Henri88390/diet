import type { Meal, MealPreferences, Money } from "./models";
import { getCountry, type CountryCode } from "./countryPricing";
import { getIngredientAggregationAmount, repriceMeals } from "./ingredientEstimates";
import {
  DEFAULT_DAILY_CALORIE_GOAL,
  getPersonalizedDayPlan,
  scaleMealPlan
} from "./sampleData";

export type ShoppingListItem = {
  key: string;
  name: string;
  quantity: number;
  unit: string;
  estimatedCost: Money;
};

export type SevenDayShoppingEstimate = {
  startDate: string;
  endDate: string;
  items: ShoppingListItem[];
  estimatedTotal: Money;
};

export type ShoppingEstimate = SevenDayShoppingEstimate;

export type ShoppingCategory =
  | "Fruit"
  | "Vegetables"
  | "Meat & fish"
  | "Dairy & eggs"
  | "Grains & bakery"
  | "Legumes"
  | "Pantry & seasonings"
  | "Other";

export function isCalendarDateAvailable(
  date: Date,
  minDate: Date,
  maxDate: Date,
  preferences?: MealPreferences
): boolean {
  const day = startOfDay(date).getTime();
  if (day < startOfDay(minDate).getTime() || day > startOfDay(maxDate).getTime()) return false;
  return preferences === undefined ||
    getPersonalizedDayPlan(date, preferences).meals.some((meal) => meal.ingredients.length > 0);
}

export function getCalendarMonthNavigationAvailability(
  month: Date,
  minDate: Date,
  maxDate: Date
): { previous: boolean; next: boolean } {
  const lastDayOfPreviousMonth = new Date(month.getFullYear(), month.getMonth(), 0);
  const firstDayOfNextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);
  return {
    previous: lastDayOfPreviousMonth >= startOfDay(minDate),
    next: firstDayOfNextMonth <= startOfDay(maxDate)
  };
}

function startOfDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

export function toShoppingUnit(quantity: number, unit: string): { quantity: number; unit: string } {
  const normalizedUnit = unit.toLowerCase();
  if (normalizedUnit === "kg") {
    return { quantity, unit: "kg" };
  }
  if (normalizedUnit === "g" && quantity >= 1000) {
    return { quantity: quantity / 1000, unit: "kg" };
  }
  if (normalizedUnit === "l") return { quantity, unit: "L" };
  if (normalizedUnit === "ml" && quantity >= 1000) {
    return { quantity: quantity / 1000, unit: "L" };
  }
  if (normalizedUnit === "slice") return { quantity, unit: "slices" };
  return { quantity, unit };
}

/** Normalize only compatible kitchen measures; never infer weight from volume. */
export function toAggregationUnit(quantity: number, unit: string): { quantity: number; unit: string } {
  const normalizedUnit = unit.toLowerCase();
  if (normalizedUnit === "kg") return { quantity: quantity * 1000, unit: "g" };
  if (normalizedUnit === "l") return { quantity: quantity * 1000, unit: "ml" };
  if (normalizedUnit === "tbsp") return { quantity: quantity * 3, unit: "tsp" };
  if (normalizedUnit === "slice" || normalizedUnit === "slices") {
    return { quantity, unit: "slices" };
  }
  return { quantity, unit: normalizedUnit };
}

function canonicalIngredientName(name: string): string {
  const trimmed = name.trim();
  if (/^carrots?$/i.test(trimmed)) return "Carrots";
  if (/^potato(?:es)?$/i.test(trimmed)) return "Potatoes";
  if (/^eggs?$/i.test(trimmed)) return "Eggs";
  return trimmed;
}

export function getShoppingCategory(name: string): ShoppingCategory {
  if (/\b(apple|banana|berries|berry|fruit)\b/i.test(name)) return "Fruit";
  if (/\b(oil|herb|garlic|pepper|spice|cinnamon|soy sauce|mustard|salsa|chive|lemon juice|stock|honey|jam|baking powder|chia seeds)\b/i.test(name)) {
    return "Pantry & seasonings";
  }
  if (/\b(vegetables?|spinach|tomato(?:es)?|cucumbers?|lettuce|carrots?|potato(?:es)?|onions?|green beans|sweetcorn)\b/i.test(name)) {
    return "Vegetables";
  }
  if (/\b(chicken|beef|pork|turkey|lamb|ham|bacon|sausage|fish|tuna|salmon|sardines?)\b/i.test(name)) {
    return "Meat & fish";
  }
  if (/\b(yogurt|milk|cheese|cheddar|parmesan|skyr|butter|cream|egg|eggs)\b/i.test(name)) {
    return "Dairy & eggs";
  }
  if (/\b(lentils|beans|chickpeas|hummus)\b/i.test(name)) return "Legumes";
  if (/\b(oats|rice|pasta|bread|wrap|roll|potato)\b/i.test(name)) {
    return "Grains & bakery";
  }
  return "Other";
}

/** Rebuild the same personalized and applied-portion meals shown by Calendar. */
export function getSevenCalendarDayPlans(
  today: Date,
  preferences: MealPreferences,
  appliedGoals: Record<string, number>,
  countryCode: CountryCode
): Meal[][] {
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return getCalendarDayPlans(start, end, preferences, appliedGoals, countryCode);
}

export function getCalendarDayPlans(
  startDate: Date,
  endDate: Date,
  preferences: MealPreferences,
  appliedGoals: Record<string, number>,
  countryCode: CountryCode
): Meal[][] {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  const days = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  if (!Number.isInteger(days) || days < 1 || days > 90) {
    throw new RangeError("Shopping date range must include between 1 and 90 calendar days.");
  }
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const plan = getPersonalizedDayPlan(date, preferences, countryCode);
    const meals = scaleMealPlan(
      plan.meals,
      appliedGoals[plan.date] ?? DEFAULT_DAILY_CALORIE_GOAL
    );
    return repriceMeals(meals, countryCode);
  });
}

export function buildShoppingEstimate(
  startDate: Date,
  endDate: Date,
  preferences: MealPreferences,
  appliedGoals: Record<string, number>,
  countryCode: CountryCode
): ShoppingEstimate {
  const dayPlans = getCalendarDayPlans(
    startDate,
    endDate,
    preferences,
    appliedGoals,
    countryCode
  );
  const amounts = new Map<string, { name: string; unit: string; quantity: number; cost: number }>();

  dayPlans.flat().forEach((meal) => meal.ingredients.forEach((ingredient) => {
    const name = canonicalIngredientName(ingredient.name);
    const amount = getIngredientAggregationAmount(
      ingredient.name,
      ingredient.quantity,
      ingredient.unit
    );
    const key = `${name.toLowerCase()}|${amount.unit}`;
    const current = amounts.get(key) ?? {
      name,
      unit: amount.unit,
      quantity: 0,
      cost: 0
    };
    current.quantity += amount.quantity;
    current.cost += ingredient.estimatedCost?.amountMinorUnits ?? ingredient.estimatedCostCents;
    amounts.set(key, current);
  }));

  const items = [...amounts.entries()]
    .map(([key, item]) => {
      const amount = toShoppingUnit(item.quantity, item.unit);
      return {
        key,
        name: item.name,
        quantity: amount.quantity,
        unit: amount.unit,
        estimatedCost: { amountMinorUnits: item.cost, currencyCode: getCountry(countryCode).currencyCode }
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name) || a.unit.localeCompare(b.unit));

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  const currencyCode = getCountry(countryCode).currencyCode;
  return {
    startDate: start.toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" }),
    endDate: end.toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" }),
    items,
    estimatedTotal: {
      amountMinorUnits: items.reduce((sum, item) => sum + item.estimatedCost.amountMinorUnits, 0),
      currencyCode
    }
  };
}

export function buildSevenDayShoppingEstimate(
  today: Date,
  preferences: MealPreferences,
  appliedGoals: Record<string, number>,
  countryCode: CountryCode
): SevenDayShoppingEstimate {
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return buildShoppingEstimate(start, end, preferences, appliedGoals, countryCode);
}

export function formatShoppingQuantity(quantity: number, unit: string, locale: string): string {
  const formatted = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(quantity);
  return `${formatted} ${unit}`;
}
