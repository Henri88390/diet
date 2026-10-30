export type IngredientCategoryGroup =
  | "Fruit"
  | "Vegetables"
  | "Protein"
  | "Dairy & eggs"
  | "Grains & bakery"
  | "Legumes"
  | "Pantry & seasonings";

export type IngredientOption = {
  id: string;
  name: string;
  category: IngredientCategoryGroup;
  matches: string[];
};

export type IngredientBans = string[];

export type PlanStyle =
  | "balanced"
  | "highProtein"
  | "lowCost"
  | "moreVariety"
  | "simpleIngredients";

export type WeeklyFrequency = 0 | 1 | 2 | 3 | 7;

export type FruitPreference = "include" | "avoid" | "optional";
export type MealsPerDay = 2 | 3 | 4 | 5;

export type MealPreferences = {
  meatPerWeek: WeeklyFrequency;
  dairyPerWeek: WeeklyFrequency;
  fruitPreference: FruitPreference;
  mealsPerDay: MealsPerDay;
  planStyle: PlanStyle;
  weeklyBudget: string;
  bannedIngredients: IngredientBans;
  typicalBreakfast: TypicalBreakfast;
};

export type TypicalBreakfastIngredient = {
  name: string;
  quantity: string;
  unit: string;
};

export type TypicalBreakfast =
  | { mode: "none" }
  | { mode: "preset"; presetId: string }
  | { mode: "custom"; ingredients: TypicalBreakfastIngredient[] };

export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";
export type MealSlot = "Morning" | "Afternoon";

export type IngredientCategory = "main" | "seasoning";

/** Integer amount in the currency's minor unit (all supported currencies use 1/100). */
export type Money = {
  amountMinorUnits: number;
  currencyCode: string;
};

export type MealIngredient = {
  name: string;
  /** Canonical sample portion stored as an integer, decimal, or fraction string. */
  quantity: string;
  unit: string;
  category: IngredientCategory;
  calories: number;
  proteinGrams: number;
  /** Internal legacy numeric alias; currency-aware displays use estimatedCost. */
  estimatedCostCents: number;
  estimatedCost?: Money;
};

export type Meal = {
  id: string;
  type: MealType;
  slot?: MealSlot;
  banConflicts?: string[];
  title: string;
  description: string;
  ingredients: MealIngredient[];
  calories: number;
  proteinGrams: number;
  /** Internal legacy numeric alias; currency-aware displays use estimatedCost. */
  estimatedCostCents: number;
  durationMinutes: number;
  emoji: string;
  /** Currency metadata for legacy internal amounts; use estimatedCost for display. */
  currencyCode?: string;
  currencyLocale?: string;
  estimatedCost?: Money;
};

export type DayPlan = {
  date: string;
  meals: Meal[];
};
