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
  /** Names containing one of these are a different food (e.g. "peanut butter" is not butter). */
  excludes?: string[];
};

export type IngredientBans = string[];

export type PlanStyle =
  | "balanced"
  | "highProtein"
  | "lowCost"
  | "batchCooking";

export type WeeklyFrequency = 0 | 1 | 2 | 3 | 7;

export type FruitPreference = "include" | "avoid" | "optional";
export type MealsPerDay = 2 | 3 | 4 | 5;

export type IngredientBanChoice = {
  ingredientId: string;
  recipeKey: string;
  /** Optional date/meal slot when the choice applies to only one occurrence. */
  occurrenceKey?: string;
  action: "skip" | "replaceMeal";
  /** Catalog ingredient ID, or null to leave the ingredient out. */
  replacementIngredient?: string | null;
  /** When the replacement is not allowed for an occurrence, use the automatic substitute instead of skipping. */
  fallbackToAutomatic?: boolean;
  /** Null or omitted selects the closest-calorie automatic recipe. */
  replacementMealKey?: string | null;
};

export type MealPreferences = {
  meatPerWeek: WeeklyFrequency;
  dairyPerWeek: WeeklyFrequency;
  fruitPreference: FruitPreference;
  mealsPerDay: MealsPerDay;
  planStyle: PlanStyle;
  weeklyBudget: string;
  /** Internal, set by the budget planner: 1 relaxes the protein floor, 2 also reduces food variety. */
  budgetRelaxation?: 0 | 1 | 2;
  bannedIngredients: IngredientBans;
  /** Per-recipe choices, discarded when their ingredient ban is removed. */
  ingredientBanChoices?: Record<string, IngredientBanChoice>;
  bannedMeals: string[];
  mealSubstitutes: Record<string, string>;
  mealOccurrenceOverrides: Record<string, string>;
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

/** Batch-cooking membership: which prep session a meal is assembled from. */
export type MealBatch = {
  /** Date key (YYYY-MM-DD) of the batch's first day, the prep day. */
  startDate: string;
  /** Number of calendar days (3 or 4) the batch covers. */
  days: number;
  /** Ingredient names cooked in bulk and reused across the batch. */
  components: string[];
};

export type RemovedBannedIngredient = {
  /** Banned catalog ingredient that removed it; unbanning this ID restores it. */
  ingredientId: string;
  /** Original recipe ingredient name. */
  name: string;
  /** Ingredient used instead, or null when it was left out. */
  replacement: string | null;
};

export type Meal = {
  id: string;
  /** Stable recipe identity shared by recurring copies. */
  recipeKey: string;
  sourceRecipeKey?: string;
  occurrenceKey?: string;
  /** Occurrences represented by a Menu variant card with occurrence-specific choices. */
  occurrenceKeys?: string[];
  /** Internal marker: bans changed this occurrence's effective ingredient list. */
  ingredientBanAdjusted?: boolean;
  /** Internal marker: at least one effective ingredient choice is occurrence-scoped. */
  ingredientBanOccurrenceScoped?: boolean;
  /** Banned ingredients this kept meal originally used. */
  removedBannedIngredients?: RemovedBannedIngredient[];
  isReplaced?: boolean;
  isTypicalBreakfast?: boolean;
  type: MealType;
  slot?: MealSlot;
  batch?: MealBatch;
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
