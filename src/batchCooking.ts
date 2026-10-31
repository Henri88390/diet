import type { Meal, MealBatch, MealIngredient } from "./models";
import { estimateIngredient } from "./ingredientEstimates";
import { isIngredientBanned } from "./ingredientCatalog";

/**
 * Batch cooking groups each Monday-based calendar week into a 4-day batch
 * (Mon-Thu) and a 3-day batch (Fri-Sun). The split depends only on the date, so
 * a given date always belongs to the same batch.
 */
const BATCH_LENGTHS = [4, 3] as const;

type Portion = { name: string; quantity: string; unit: string; short: string };

const carbOptions: Portion[] = [
  { name: "Basmati rice, dry", quantity: "75", unit: "g", short: "Rice" },
  { name: "Potatoes", quantity: "300", unit: "g", short: "Potatoes" },
  { name: "Pasta, dry", quantity: "80", unit: "g", short: "Pasta" }
];

const animalProteinOptions: Portion[] = [
  { name: "Chicken breast", quantity: "150", unit: "g", short: "Chicken" },
  { name: "Chicken thigh", quantity: "150", unit: "g", short: "Chicken" },
  { name: "Frozen minced beef", quantity: "120", unit: "g", short: "Beef" }
];
const budgetAnimalProteinOptions = animalProteinOptions.slice(1);

const legumeOptions: Portion[] = [
  { name: "Lentils, dry", quantity: "70", unit: "g", short: "Lentils" },
  { name: "Black beans, drained", quantity: "170", unit: "g", short: "Black beans" },
  { name: "Chickpeas, drained", quantity: "170", unit: "g", short: "Chickpeas" },
  { name: "White beans, drained", quantity: "170", unit: "g", short: "White beans" },
  { name: "Red beans, drained", quantity: "170", unit: "g", short: "Red beans" }
];

type VegetableMix = { short: string; items: Portion[] };
const vegetableOptions: VegetableMix[] = [
  { short: "Mixed vegetables", items: [{ name: "Frozen mixed vegetables", quantity: "180", unit: "g", short: "" }] },
  {
    short: "Carrots",
    items: [
      { name: "Carrots", quantity: "100", unit: "g", short: "" },
      { name: "Green beans", quantity: "100", unit: "g", short: "" }
    ]
  },
  {
    short: "Leafy greens",
    items: [
      { name: "Leafy greens", quantity: "80", unit: "g", short: "" },
      { name: "Chopped tomatoes", quantity: "100", unit: "g", short: "" }
    ]
  }
];
const budgetVegetableOptions = vegetableOptions.slice(0, 2);

const seasonings: Portion[] = [
  { name: "Lemon juice", quantity: "1", unit: "tbsp", short: "" },
  { name: "Dried herbs", quantity: "1/2", unit: "tsp", short: "" },
  { name: "Mustard", quantity: "1", unit: "tsp", short: "" },
  { name: "Garlic", quantity: "1", unit: "clove", short: "" }
];

const OIL: Portion = { name: "Olive oil", quantity: "1", unit: "tsp", short: "" };

function weekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export type BatchWindow = {
  /** Local midnight of the batch's first (prep) day. */
  start: Date;
  /** 3 or 4 days. */
  days: number;
  /** Zero-based position of the requested date inside the batch. */
  dayIndex: number;
  /** Deterministic rotation seed, unique per batch. */
  seed: number;
};

type Segment = { start: Date; days: number; seed: number };
const MIN_BATCH_DAYS = 3;
const MAX_BATCH_DAYS = 4;
let calendarSegments: Segment[] = [];

function dayOffset(date: Date, from: Date): number {
  return Math.round(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) / 86_400_000
  );
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/**
 * Merge a too-short edge batch with its neighbours until at least 6 days are
 * covered, then re-split them into even 3-4 day batches (food shouldn't be kept longer).
 */
function mergeShort(segments: Segment[], edge: "first" | "last"): void {
  let count = 1;
  const span = (): Segment[] => (edge === "first" ? segments.slice(0, count) : segments.slice(-count));
  const total = (): number => span().reduce((sum, segment) => sum + segment.days, 0);
  while (total() < 6 && count < segments.length) count += 1;
  const merged = span();
  const days = total();
  if (days < 6) return;
  const pieces = Math.ceil(days / MAX_BATCH_DAYS);
  let cursor = merged[0].start;
  const rebuilt: Segment[] = Array.from({ length: pieces }, (_, index) => {
    const length = Math.floor(days / pieces) + (index < days % pieces ? 1 : 0);
    const segment = { start: cursor, days: length, seed: merged[0].seed + index * 101 };
    cursor = addDays(cursor, length);
    return segment;
  });
  segments.splice(edge === "first" ? 0 : segments.length - count, count, ...rebuilt);
}

/**
 * Plan batches for the visible calendar: the first batch only runs from today, and
 * no batch (first or last) covers fewer than 3 days when it can be merged instead.
 */
export function setBatchCalendar(start: Date | undefined, end: Date | undefined): void {
  calendarSegments = [];
  if (!start || !end) return;
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const segments: Segment[] = [];
  let cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  while (cursor <= last) {
    const base = getBaseBatchWindow(cursor);
    const days = Math.min(base.days - base.dayIndex, dayOffset(last, cursor) + 1);
    segments.push({ start: cursor, days, seed: base.seed });
    cursor = addDays(cursor, days);
  }
  if (segments.length > 1 && segments[0].days < MIN_BATCH_DAYS) mergeShort(segments, "first");
  if (segments.length > 1 && segments[segments.length - 1].days < MIN_BATCH_DAYS) mergeShort(segments, "last");
  calendarSegments = segments;
}

export function getBatchWindow(date: Date): BatchWindow {
  for (const segment of calendarSegments) {
    const dayIndex = dayOffset(date, segment.start);
    if (dayIndex >= 0 && dayIndex < segment.days) {
      return { start: segment.start, days: segment.days, dayIndex, seed: segment.seed };
    }
  }
  return getBaseBatchWindow(date);
}

function getBaseBatchWindow(date: Date): BatchWindow {
  const weekday = weekdayIndex(date);
  const firstBatch = weekday < BATCH_LENGTHS[0];
  const dayIndex = firstBatch ? weekday : weekday - BATCH_LENGTHS[0];
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate() - dayIndex);
  const monday = new Date(start.getFullYear(), start.getMonth(), start.getDate() - (firstBatch ? 0 : BATCH_LENGTHS[0]));
  // 2024-01-01 is a Monday, so Mondays are exact multiples of 7 days from it.
  const mondayDays = Math.round(
    (Date.UTC(monday.getFullYear(), monday.getMonth(), monday.getDate()) - Date.UTC(2024, 0, 1)) / 86_400_000
  );
  const weekIndex = Math.round(mondayDays / 7);
  return {
    start,
    days: firstBatch ? BATCH_LENGTHS[0] : BATCH_LENGTHS[1],
    dayIndex,
    seed: weekIndex * 2 + (firstBatch ? 0 : 1)
  };
}

/** Local dates of every day in the batch containing `date`. */
export function getBatchDates(date: Date): Date[] {
  const { start, days } = getBatchWindow(date);
  return Array.from({ length: days }, (_, index) =>
    new Date(start.getFullYear(), start.getMonth(), start.getDate() + index)
  );
}

function pick<T>(options: T[], seed: number, isAllowed: (option: T) => boolean): T | undefined {
  for (let offset = 0; offset < options.length; offset += 1) {
    const option = options[(((seed + offset) % options.length) + options.length) % options.length];
    if (isAllowed(option)) return option;
  }
  return undefined;
}

function toIngredient(portion: Portion): MealIngredient {
  const estimate = estimateIngredient(portion.name, portion.quantity, portion.unit);
  return {
    name: portion.name,
    quantity: portion.quantity,
    unit: portion.unit,
    category: estimate.category,
    calories: estimate.calories,
    proteinGrams: estimate.proteinGrams,
    estimatedCostCents: estimate.estimatedCostCents
  };
}

function formatDateKeyLocal(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export type BatchCookingOptions = {
  bannedIngredients: string[];
  /** Weekdays (0 = Monday) on which the dinner should contain meat/fish. */
  meatWeekdays: number[];
  budgetTight: boolean;
};

/**
 * Rebuild lunches and dinners from a small set of components cooked once per
 * batch. Breakfast and snacks keep their existing, already-personalized content.
 * Selection is deterministic, honours bans and the weekly meat preference, and
 * is idempotent so the caller can re-run it in budget mode.
 */
export function applyBatchCooking(meals: Meal[], date: Date, options: BatchCookingOptions): void {
  const targets = meals.filter((meal) => meal.type === "Lunch" || meal.type === "Dinner");
  if (targets.length === 0) return;

  const { start, days, dayIndex, seed } = getBatchWindow(date);
  const banned = options.bannedIngredients;
  const allowed = (name: string): boolean => !isIngredientBanned(name, banned);
  const batchWeekdays = Array.from({ length: days }, (_, index) => (weekdayIndex(start) + index) % 7);

  // Two carbs and two legumes are cooked per batch and combined differently each meal.
  const carbA = pick(carbOptions, seed, (option) => allowed(option.name));
  const carbB = pick(carbOptions, seed + 1, (option) => allowed(option.name) && option !== carbA) ?? carbA;
  const carbs = [carbA, carbB];
  const animalPool = options.budgetTight ? budgetAnimalProteinOptions : animalProteinOptions;
  const animal = options.meatWeekdays.some((weekday) => batchWeekdays.includes(weekday))
    ? pick(animalPool, seed + 1, (option) => allowed(option.name))
    : undefined;
  const legumeA = pick(legumeOptions, seed + 2, (option) => allowed(option.name));
  const legumeB = pick(legumeOptions, seed + 3, (option) => allowed(option.name) && option !== legumeA) ?? legumeA;
  const legumes = [legumeA, legumeB];
  const vegetables = pick(
    options.budgetTight ? budgetVegetableOptions : vegetableOptions,
    seed + 1,
    (option) => option.items.every((item) => allowed(item.name))
  );

  const weekday = weekdayIndex(date);
  const isMeatDinnerDay = animal !== undefined && options.meatWeekdays.includes(weekday);
  const hasLunch = meals.some((meal) => meal.type === "Lunch");
  const batchUsesLegume = legumeA !== undefined && (
    hasLunch || batchWeekdays.some((day) => !(animal !== undefined && options.meatWeekdays.includes(day)))
  );

  const components = [...new Set([
    ...carbs.map((carb) => carb?.name),
    animal?.name,
    ...(batchUsesLegume ? legumes.map((legume) => legume?.name) : []),
    ...(vegetables?.items.map((item) => item.name) ?? [])
  ].filter((name): name is string => Boolean(name)))];
  if (components.length === 0) return;

  const batch: MealBatch = { startDate: formatDateKeyLocal(start), days, components };

  targets.forEach((meal, targetIndex) => {
    // Neighbouring meals get a different carb/legume pairing from the same cooked base.
    const mealNumber = dayIndex * targets.length + targetIndex;
    const carb = carbs[(dayIndex + targetIndex) % 2];
    const legume = legumes[Math.floor(mealNumber / 2) % 2];
    const protein = meal.type === "Dinner" && isMeatDinnerDay ? animal : legume;
    const slot = meal.type === "Lunch" ? 0 : 1;
    const seasoning = pick(seasonings, dayIndex * 2 + slot + seed, (option) => allowed(option.name));
    const portions = [
      carb,
      protein,
      ...(vegetables?.items ?? []),
      allowed(OIL.name) ? OIL : undefined,
      seasoning
    ].filter((portion): portion is Portion => portion !== undefined);

    const nameParts = [carb?.short, protein?.short, vegetables?.short]
      .filter((part): part is string => Boolean(part))
      .slice(0, 2);
    const foods = portions
      .filter((portion) => !/oil|herbs|garlic|mustard|lemon juice/i.test(portion.name))
      .slice(0, 3)
      .map((portion) => portion.name.replace(/,\s*(?:drained|cooked|uncooked|dry)$/i, ""));

    if (nameParts.length === 0) return;

    meal.ingredients = portions.map(toIngredient);
    meal.title = nameParts.length >= 2
      ? `${nameParts[0]} & ${nameParts[1].charAt(0).toLowerCase()}${nameParts[1].slice(1)} bowl`
      : `${nameParts[0]} bowl`;
    meal.description = foods.join(" · ");
    meal.emoji = "🍱";
    meal.durationMinutes = 10;
    meal.batch = batch;
    meal.calories = meal.ingredients.reduce((sum, ingredient) => sum + ingredient.calories, 0);
    meal.proteinGrams = Math.round(meal.ingredients.reduce((sum, ingredient) => sum + ingredient.proteinGrams, 0) * 10) / 10;
    meal.estimatedCostCents = meal.ingredients.reduce((sum, ingredient) => sum + ingredient.estimatedCostCents, 0);
  });
}
