import type { IngredientCategory, Meal } from "./models";
import { DEFAULT_COUNTRY, getCountry, type CountryCode } from "./countryPricing";

export const PRICE_ESTIMATE_REFERENCE =
  "Illustrative modeled ingredient rates only · not researched retailer prices, Lidl quotes, or live prices.";

type PriceAndNutritionRate = {
  pattern: RegExp;
  basis: "g" | "ml" | "each";
  centsPerBasisUnit: number;
  caloriesPerBasisUnit: number;
  proteinGramsPerBasisUnit: number;
  gramsPerEach?: number;
  /** Grams represented by a teaspoon; tablespoon portions are 3 teaspoons. */
  gramsPerTeaspoon?: number;
};

/**
 * Modeled retail unit rates for illustrative portions, not verified prices.
 * Rates are normalized by grams, millilitres, or a typical counted item.
 */
const rates: PriceAndNutritionRate[] = [
  { pattern: /frozen berries/i, basis: "g", centsPerBasisUnit: 0.7, caloriesPerBasisUnit: 0.5, proteinGramsPerBasisUnit: 0.01 },
  { pattern: /frozen peas/i, basis: "g", centsPerBasisUnit: 0.25, caloriesPerBasisUnit: 0.81, proteinGramsPerBasisUnit: 0.054 },
  { pattern: /frozen white fish/i, basis: "g", centsPerBasisUnit: 0.9, caloriesPerBasisUnit: 0.82, proteinGramsPerBasisUnit: 0.18 },
  { pattern: /frozen mixed vegetables/i, basis: "g", centsPerBasisUnit: 0.22, caloriesPerBasisUnit: 0.45, proteinGramsPerBasisUnit: 0.03 },
  { pattern: /rolled oats/i, basis: "g", centsPerBasisUnit: 0.18, caloriesPerBasisUnit: 3.89, proteinGramsPerBasisUnit: 0.169 },
  { pattern: /plain yogurt/i, basis: "g", centsPerBasisUnit: 35 / 150, caloriesPerBasisUnit: 0.6, proteinGramsPerBasisUnit: 0.035, gramsPerTeaspoon: 5 },
  { pattern: /cottage cheese/i, basis: "g", centsPerBasisUnit: 0.7, caloriesPerBasisUnit: 0.98, proteinGramsPerBasisUnit: 0.11 },
  { pattern: /\bskyr\b/i, basis: "g", centsPerBasisUnit: 0.8, caloriesPerBasisUnit: 0.63, proteinGramsPerBasisUnit: 0.11 },
  { pattern: /coconut oil/i, basis: "ml", centsPerBasisUnit: 1.3, caloriesPerBasisUnit: 8.0, proteinGramsPerBasisUnit: 0 },
  { pattern: /\bmilk\b/i, basis: "ml", centsPerBasisUnit: 0.13, caloriesPerBasisUnit: 0.61, proteinGramsPerBasisUnit: 0.034 },
  { pattern: /chickpeas, drained/i, basis: "g", centsPerBasisUnit: 0.28, caloriesPerBasisUnit: 1.64, proteinGramsPerBasisUnit: 0.089 },
  { pattern: /red beans, drained/i, basis: "g", centsPerBasisUnit: 0.28, caloriesPerBasisUnit: 1.27, proteinGramsPerBasisUnit: 0.087 },
  { pattern: /black beans, drained|white beans, drained/i, basis: "g", centsPerBasisUnit: 0.28, caloriesPerBasisUnit: 1.27, proteinGramsPerBasisUnit: 0.087 },
  { pattern: /lentils, dry/i, basis: "g", centsPerBasisUnit: 0.24, caloriesPerBasisUnit: 3.52, proteinGramsPerBasisUnit: 0.246 },
  { pattern: /cooked chicken/i, basis: "g", centsPerBasisUnit: 1.15, caloriesPerBasisUnit: 1.65, proteinGramsPerBasisUnit: 0.31 },
  { pattern: /frozen (?:minced beef|ground beef)/i, basis: "g", centsPerBasisUnit: 1.0, caloriesPerBasisUnit: 2.5, proteinGramsPerBasisUnit: 0.26 },
  { pattern: /beef mince|ground beef/i, basis: "g", centsPerBasisUnit: 1.35, caloriesPerBasisUnit: 2.5, proteinGramsPerBasisUnit: 0.26 },
  { pattern: /pork mince|ground pork/i, basis: "g", centsPerBasisUnit: 0.95, caloriesPerBasisUnit: 2.42, proteinGramsPerBasisUnit: 0.25 },
  { pattern: /chicken breast/i, basis: "g", centsPerBasisUnit: 1.15, caloriesPerBasisUnit: 1.2, proteinGramsPerBasisUnit: 0.225 },
  { pattern: /chicken thigh/i, basis: "g", centsPerBasisUnit: 0.9, caloriesPerBasisUnit: 2.09, proteinGramsPerBasisUnit: 0.26 },
  { pattern: /canned tuna/i, basis: "g", centsPerBasisUnit: 0.65, caloriesPerBasisUnit: 1.25, proteinGramsPerBasisUnit: 0.26 },
  { pattern: /canned sardines/i, basis: "g", centsPerBasisUnit: 0.58, caloriesPerBasisUnit: 2.08, proteinGramsPerBasisUnit: 0.25 },
  { pattern: /\btofu\b/i, basis: "g", centsPerBasisUnit: 0.6, caloriesPerBasisUnit: 1.44, proteinGramsPerBasisUnit: 0.155 },
  { pattern: /eggs?\b/i, basis: "each", centsPerBasisUnit: 35, caloriesPerBasisUnit: 72, proteinGramsPerBasisUnit: 6.3 },
  { pattern: /bread roll/i, basis: "each", centsPerBasisUnit: 30, caloriesPerBasisUnit: 150, proteinGramsPerBasisUnit: 5 },
  { pattern: /\bbread\b/i, basis: "each", centsPerBasisUnit: 12, caloriesPerBasisUnit: 95, proteinGramsPerBasisUnit: 3.5 },
  { pattern: /\bwrap\b/i, basis: "each", centsPerBasisUnit: 38, caloriesPerBasisUnit: 175, proteinGramsPerBasisUnit: 5 },
  { pattern: /basmati rice, dry/i, basis: "g", centsPerBasisUnit: 0.16, caloriesPerBasisUnit: 3.65, proteinGramsPerBasisUnit: 0.071 },
  { pattern: /brown rice/i, basis: "g", centsPerBasisUnit: 0.25, caloriesPerBasisUnit: 3.62, proteinGramsPerBasisUnit: 0.075 },
  { pattern: /couscous/i, basis: "g", centsPerBasisUnit: 0.3, caloriesPerBasisUnit: 3.76, proteinGramsPerBasisUnit: 0.128 },
  { pattern: /pasta, dry/i, basis: "g", centsPerBasisUnit: 0.18, caloriesPerBasisUnit: 3.5, proteinGramsPerBasisUnit: 0.13 },
  { pattern: /sweet potato/i, basis: "g", centsPerBasisUnit: 0.3, caloriesPerBasisUnit: 0.86, proteinGramsPerBasisUnit: 0.016 },
  { pattern: /\bpotato(?:es)?\b/i, basis: "g", centsPerBasisUnit: 0.17, caloriesPerBasisUnit: 0.77, proteinGramsPerBasisUnit: 0.02, gramsPerEach: 250 },
  { pattern: /carrots?/i, basis: "g", centsPerBasisUnit: 0.14, caloriesPerBasisUnit: 0.41, proteinGramsPerBasisUnit: 0.009, gramsPerEach: 65 },
  { pattern: /frozen tomatoes|cherry tomatoes|chopped tomatoes|tomatoes/i, basis: "g", centsPerBasisUnit: 0.3, caloriesPerBasisUnit: 0.18, proteinGramsPerBasisUnit: 0.009 },
  { pattern: /cucumber/i, basis: "g", centsPerBasisUnit: 0.25, caloriesPerBasisUnit: 0.15, proteinGramsPerBasisUnit: 0.007 },
  { pattern: /baby spinach|leafy greens/i, basis: "g", centsPerBasisUnit: 0.45, caloriesPerBasisUnit: 0.23, proteinGramsPerBasisUnit: 0.029 },
  { pattern: /lettuce/i, basis: "g", centsPerBasisUnit: 0.25, caloriesPerBasisUnit: 0.15, proteinGramsPerBasisUnit: 0.014 },
  { pattern: /green beans/i, basis: "g", centsPerBasisUnit: 0.32, caloriesPerBasisUnit: 0.31, proteinGramsPerBasisUnit: 0.018 },
  { pattern: /sweetcorn/i, basis: "g", centsPerBasisUnit: 0.22, caloriesPerBasisUnit: 0.86, proteinGramsPerBasisUnit: 0.033 },
  { pattern: /onion/i, basis: "g", centsPerBasisUnit: 0.12, caloriesPerBasisUnit: 0.4, proteinGramsPerBasisUnit: 0.011, gramsPerEach: 110 },
  { pattern: /bell peppers?/i, basis: "g", centsPerBasisUnit: 0.4, caloriesPerBasisUnit: 0.26, proteinGramsPerBasisUnit: 0.01, gramsPerEach: 150 },
  { pattern: /broccoli/i, basis: "g", centsPerBasisUnit: 0.35, caloriesPerBasisUnit: 0.34, proteinGramsPerBasisUnit: 0.028 },
  { pattern: /cabbage/i, basis: "g", centsPerBasisUnit: 0.12, caloriesPerBasisUnit: 0.25, proteinGramsPerBasisUnit: 0.013 },
  { pattern: /mushrooms?/i, basis: "g", centsPerBasisUnit: 0.5, caloriesPerBasisUnit: 0.22, proteinGramsPerBasisUnit: 0.031 },
  { pattern: /zucchini|courgettes?/i, basis: "g", centsPerBasisUnit: 0.3, caloriesPerBasisUnit: 0.17, proteinGramsPerBasisUnit: 0.012, gramsPerEach: 200 },
  { pattern: /apple/i, basis: "each", centsPerBasisUnit: 35, caloriesPerBasisUnit: 95, proteinGramsPerBasisUnit: 0.5 },
  { pattern: /banana/i, basis: "each", centsPerBasisUnit: 22, caloriesPerBasisUnit: 105, proteinGramsPerBasisUnit: 1.3 },
  { pattern: /\boranges?\b/i, basis: "each", centsPerBasisUnit: 30, caloriesPerBasisUnit: 62, proteinGramsPerBasisUnit: 1.2 },
  { pattern: /\bpears?\b/i, basis: "each", centsPerBasisUnit: 40, caloriesPerBasisUnit: 100, proteinGramsPerBasisUnit: 0.6 },
  { pattern: /raisins/i, basis: "g", centsPerBasisUnit: 0.8, caloriesPerBasisUnit: 2.99, proteinGramsPerBasisUnit: 0.031, gramsPerTeaspoon: 4 },
  { pattern: /lemon juice/i, basis: "ml", centsPerBasisUnit: 0.25, caloriesPerBasisUnit: 0.22, proteinGramsPerBasisUnit: 0.003 },
  { pattern: /^water$/i, basis: "ml", centsPerBasisUnit: 0, caloriesPerBasisUnit: 0, proteinGramsPerBasisUnit: 0 },
  { pattern: /olive oil/i, basis: "ml", centsPerBasisUnit: 0.8, caloriesPerBasisUnit: 8.2, proteinGramsPerBasisUnit: 0 },
  { pattern: /sesame oil/i, basis: "ml", centsPerBasisUnit: 1.1, caloriesPerBasisUnit: 8.2, proteinGramsPerBasisUnit: 0 },
  { pattern: /vegetable oil/i, basis: "ml", centsPerBasisUnit: 0.45, caloriesPerBasisUnit: 8.2, proteinGramsPerBasisUnit: 0 },
  { pattern: /sunflower oil/i, basis: "ml", centsPerBasisUnit: 0.3, caloriesPerBasisUnit: 8.2, proteinGramsPerBasisUnit: 0 },
  { pattern: /rapeseed oil|canola oil/i, basis: "ml", centsPerBasisUnit: 0.3, caloriesPerBasisUnit: 8.2, proteinGramsPerBasisUnit: 0 },
  { pattern: /peanut oil/i, basis: "ml", centsPerBasisUnit: 0.7, caloriesPerBasisUnit: 8.2, proteinGramsPerBasisUnit: 0 },
  { pattern: /peanut butter/i, basis: "g", centsPerBasisUnit: 0.6, caloriesPerBasisUnit: 5.88, proteinGramsPerBasisUnit: 0.25, gramsPerTeaspoon: 5 },
  { pattern: /peanuts/i, basis: "g", centsPerBasisUnit: 0.6, caloriesPerBasisUnit: 5.67, proteinGramsPerBasisUnit: 0.26, gramsPerTeaspoon: 3 },
  { pattern: /sunflower seeds/i, basis: "g", centsPerBasisUnit: 0.7, caloriesPerBasisUnit: 5.84, proteinGramsPerBasisUnit: 0.21, gramsPerTeaspoon: 3 },
  { pattern: /\bbutter\b/i, basis: "g", centsPerBasisUnit: 1.0, caloriesPerBasisUnit: 7.17, proteinGramsPerBasisUnit: 0.009, gramsPerTeaspoon: 5 },
  { pattern: /vinegar/i, basis: "ml", centsPerBasisUnit: 0.15, caloriesPerBasisUnit: 0.2, proteinGramsPerBasisUnit: 0 },
  { pattern: /\bsalt\b/i, basis: "g", centsPerBasisUnit: 0.05, caloriesPerBasisUnit: 0, proteinGramsPerBasisUnit: 0, gramsPerTeaspoon: 6 },
  { pattern: /black pepper/i, basis: "g", centsPerBasisUnit: 2.5, caloriesPerBasisUnit: 2.5, proteinGramsPerBasisUnit: 0.1, gramsPerTeaspoon: 2.3 },
  { pattern: /paprika/i, basis: "g", centsPerBasisUnit: 2, caloriesPerBasisUnit: 2.8, proteinGramsPerBasisUnit: 0.14, gramsPerTeaspoon: 2.3 },
  { pattern: /curry powder/i, basis: "g", centsPerBasisUnit: 1.5, caloriesPerBasisUnit: 3.25, proteinGramsPerBasisUnit: 0.14, gramsPerTeaspoon: 2 },
  { pattern: /\bsugar\b/i, basis: "g", centsPerBasisUnit: 0.12, caloriesPerBasisUnit: 4, proteinGramsPerBasisUnit: 0, gramsPerTeaspoon: 4 },
  { pattern: /\bflour\b/i, basis: "g", centsPerBasisUnit: 0.1, caloriesPerBasisUnit: 3.64, proteinGramsPerBasisUnit: 0.1, gramsPerTeaspoon: 3 },
  { pattern: /vegetable stock/i, basis: "ml", centsPerBasisUnit: 0.06, caloriesPerBasisUnit: 0.05, proteinGramsPerBasisUnit: 0.002 },
  { pattern: /soy sauce/i, basis: "ml", centsPerBasisUnit: 0.25, caloriesPerBasisUnit: 0.53, proteinGramsPerBasisUnit: 0.08 },
  { pattern: /plain mustard/i, basis: "g", centsPerBasisUnit: 0.5, caloriesPerBasisUnit: 0.66, proteinGramsPerBasisUnit: 0.04, gramsPerTeaspoon: 5 },
  { pattern: /mustard/i, basis: "g", centsPerBasisUnit: 0.5, caloriesPerBasisUnit: 0.66, proteinGramsPerBasisUnit: 0.04, gramsPerTeaspoon: 5 },
  { pattern: /dried herbs/i, basis: "g", centsPerBasisUnit: 0.35, caloriesPerBasisUnit: 2.5, proteinGramsPerBasisUnit: 0.1, gramsPerTeaspoon: 0.8 },
  { pattern: /ground cinnamon/i, basis: "g", centsPerBasisUnit: 1.2, caloriesPerBasisUnit: 2.5, proteinGramsPerBasisUnit: 0.04, gramsPerTeaspoon: 2.6 },
  { pattern: /garlic/i, basis: "g", centsPerBasisUnit: 0.35, caloriesPerBasisUnit: 1.49, proteinGramsPerBasisUnit: 0.064, gramsPerEach: 4 },
  { pattern: /chives/i, basis: "g", centsPerBasisUnit: 0.6, caloriesPerBasisUnit: 0.3, proteinGramsPerBasisUnit: 0.03, gramsPerTeaspoon: 1 },
  { pattern: /baking powder/i, basis: "g", centsPerBasisUnit: 0.4, caloriesPerBasisUnit: 0.53, proteinGramsPerBasisUnit: 0, gramsPerTeaspoon: 4 },
  { pattern: /salsa/i, basis: "g", centsPerBasisUnit: 0.4, caloriesPerBasisUnit: 0.36, proteinGramsPerBasisUnit: 0.015, gramsPerTeaspoon: 5 },
  { pattern: /cheddar/i, basis: "g", centsPerBasisUnit: 0.85, caloriesPerBasisUnit: 4.03, proteinGramsPerBasisUnit: 0.25 },
  { pattern: /mozzarella/i, basis: "g", centsPerBasisUnit: 0.9, caloriesPerBasisUnit: 2.8, proteinGramsPerBasisUnit: 0.22 },
  { pattern: /parmesan/i, basis: "g", centsPerBasisUnit: 1.8, caloriesPerBasisUnit: 4.31, proteinGramsPerBasisUnit: 0.38 },
  { pattern: /hummus/i, basis: "g", centsPerBasisUnit: 0.55, caloriesPerBasisUnit: 2.4, proteinGramsPerBasisUnit: 0.08, gramsPerTeaspoon: 5 },
  { pattern: /chia seeds/i, basis: "g", centsPerBasisUnit: 0.9, caloriesPerBasisUnit: 4.86, proteinGramsPerBasisUnit: 0.17, gramsPerTeaspoon: 4 },
  { pattern: /honey/i, basis: "g", centsPerBasisUnit: 0.45, caloriesPerBasisUnit: 3.04, proteinGramsPerBasisUnit: 0, gramsPerTeaspoon: 7 },
  { pattern: /jam/i, basis: "g", centsPerBasisUnit: 0.35, caloriesPerBasisUnit: 2.5, proteinGramsPerBasisUnit: 0, gramsPerTeaspoon: 7 }
];

const seasoningPattern =
  /\b(oil|butter|herbs?|garlic|black pepper|spice|cinnamon|soy sauce|mustard|salsa|chives?|lemon juice|stock|baking powder|vinegar|salt|paprika|curry powder)\b/i;
const countedUnits = new Set(["each", "large", "medium", "slice", "slices", "roll", "clove"]);

export function getIngredientCategory(name: string): IngredientCategory {
  return seasoningPattern.test(name) && !/peanut butter/i.test(name) ? "seasoning" : "main";
}

function parseQuantity(quantity: string): number {
  const normalized = quantity.trim();
  const fraction = /^(\d+)\s*\/\s*(\d+)$/.exec(normalized);
  let parsed: number;
  if (fraction) {
    const numerator = Number(fraction[1]);
    const denominator = Number(fraction[2]);
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
      throw new RangeError(`Invalid ingredient quantity "${quantity}".`);
    }
    parsed = numerator / denominator;
  } else if (/^(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(normalized)) {
    parsed = Number(normalized.replace(",", "."));
  } else {
    throw new RangeError(`Invalid ingredient quantity "${quantity}".`);
  }
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new RangeError(`Invalid ingredient quantity "${quantity}".`);
  }
  return parsed;
}

export function isValidPositiveIngredientQuantity(quantity: string): boolean {
  try {
    return parseQuantity(quantity) > 0;
  } catch (error) {
    if (error instanceof RangeError) return false;
    throw error;
  }
}

function getBasisQuantity(
  quantity: number,
  unit: string,
  rate: PriceAndNutritionRate
): number {
  const normalizedUnit = unit.toLowerCase();
  if (normalizedUnit === "g" && rate.basis === "g") return quantity;
  if (normalizedUnit === "ml" && rate.basis === "ml") return quantity;
  if (normalizedUnit === "tsp" || normalizedUnit === "tbsp") {
    const teaspoons = quantity * (normalizedUnit === "tbsp" ? 3 : 1);
    if (rate.basis === "ml") return teaspoons * 5;
    if (rate.basis === "g") return teaspoons * (rate.gramsPerTeaspoon ?? 1);
  }
  if (countedUnits.has(normalizedUnit) && rate.basis === "each") return quantity;
  if (countedUnits.has(normalizedUnit) && rate.gramsPerEach !== undefined && rate.basis === "g") {
    return quantity * rate.gramsPerEach;
  }
  throw new RangeError(`Unsupported quantity unit "${unit}" for ingredient estimate.`);
}

/** Normalize measured amounts using the same conversions as the estimate model. */
export function getIngredientAggregationAmount(
  name: string,
  quantity: string,
  unit: string
): { quantity: number; unit: string } {
  const rate = rates.find((candidate) => candidate.pattern.test(name));
  if (!rate) throw new RangeError(`No illustrative unit estimate is configured for "${name}".`);
  const parsedQuantity = parseQuantity(quantity);
  const normalizedUnit = unit.toLowerCase();
  if (rate.basis === "each") {
    return {
      quantity: getBasisQuantity(parsedQuantity, unit, rate),
      unit: normalizedUnit === "slice" ? "slices" : normalizedUnit
    };
  }
  return {
    quantity: getBasisQuantity(parsedQuantity, unit, rate),
    unit: rate.basis
  };
}

/** Recalculate per-portion values from the displayed ingredient quantity. */
export function estimateIngredient(
  name: string,
  quantity: string,
  unit: string,
  countryCode: CountryCode = DEFAULT_COUNTRY
): { category: IngredientCategory; calories: number; proteinGrams: number; estimatedCostCents: number } {
  const rate = rates.find((candidate) => candidate.pattern.test(name));
  if (!rate) throw new RangeError(`No illustrative unit estimate is configured for "${name}".`);
  const basisQuantity = getBasisQuantity(parseQuantity(quantity), unit, rate);
  const rawCost = basisQuantity * rate.centsPerBasisUnit *
    getCountry(countryCode).modeledPriceFactor;
  const rawCalories = basisQuantity * rate.caloriesPerBasisUnit;
  const rawProtein = basisQuantity * rate.proteinGramsPerBasisUnit;
  if (!Number.isFinite(basisQuantity) || !Number.isFinite(rawCost) || !Number.isFinite(rawCalories) || !Number.isFinite(rawProtein)) {
    throw new RangeError(`Ingredient estimate is not finite for "${name}".`);
  }
  return {
    category: getIngredientCategory(name),
    calories: Math.max(0, Math.round(rawCalories)),
    proteinGrams: Math.max(0, Math.round(rawProtein * 10) / 10),
    estimatedCostCents: Math.round(rawCost)
  };
}

/** Reprice displayed meals with one selected market and currency model. */
export function repriceMeals(meals: Meal[], countryCode: CountryCode): Meal[] {
  const country = getCountry(countryCode);
  return meals.map((meal) => {
    const ingredients = meal.ingredients.map((ingredient) => {
      const estimate = estimateIngredient(ingredient.name, ingredient.quantity, ingredient.unit, countryCode);
      return { ...ingredient, estimatedCostCents: estimate.estimatedCostCents, proteinGrams: estimate.proteinGrams };
    });
    return {
      ...meal,
      currencyCode: country.currencyCode,
      currencyLocale: country.locale,
      estimatedCost: {
        amountMinorUnits: ingredients.reduce((sum, ingredient) =>
          sum + ingredient.estimatedCostCents, 0),
        currencyCode: country.currencyCode
      },
      ingredients: ingredients.map((ingredient) => ({
        ...ingredient,
        estimatedCost: {
          amountMinorUnits: ingredient.estimatedCostCents,
          currencyCode: country.currencyCode
        }
      })),
      estimatedCostCents: ingredients.reduce((sum, ingredient) =>
        sum + ingredient.estimatedCostCents, 0),
      proteinGrams: Math.round(ingredients.reduce((sum, ingredient) => sum + ingredient.proteinGrams, 0) * 10) / 10
    };
  });
}
