const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");

require.extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: filename
  });
  module._compile(outputText, filename);
};

const {
  DEFAULT_DAILY_CALORIE_GOAL,
  formatDateKey,
  getPersonalizedDayPlan,
  getDailyCalories,
  getDailyProtein,
  getMealsInDisplayOrder,
  scaleMealPlan
} =
  require("../src/sampleData.ts");
const {
  buildSevenDayShoppingEstimate,
  buildShoppingEstimate,
  getSevenCalendarDayPlans,
  getCalendarDayPlans,
  isCalendarDateAvailable,
  getCalendarMonthNavigationAvailability,
  getShoppingCategory,
  getBatchPrep,
  formatShoppingQuantity,
  toShoppingUnit,
  toAggregationUnit
} = require("../src/groceryEstimate.ts");
const { countries, getCountry, formatMoney } = require("../src/countryPricing.ts");
const { typicalBreakfastPresets } = require("../src/typicalBreakfast.ts");
const {
  ingredientCatalog,
  ingredientCategoryOrder,
  isIngredientBanned,
  isWholePieceIngredient
} = require("../src/ingredientCatalog.ts");
const {
  estimateIngredient,
  getIngredientAggregationAmount,
  isValidPositiveIngredientQuantity,
  PRICE_ESTIMATE_REFERENCE
} = require("../src/ingredientEstimates.ts");
const { en } = require("../src/i18n-en.ts");
const { fr } = require("../src/i18n-fr.ts");
const { de } = require("../src/i18n-de.ts");
const { es } = require("../src/i18n-es.ts");
const { ru } = require("../src/i18n-ru.ts");
const { pl } = require("../src/i18n-pl.ts");
const appSource = fs.readFileSync(require.resolve("../App.tsx"), "utf8");
const grocerySource = fs.readFileSync(
  require.resolve("../src/components/WeeklyGroceryList.tsx"), "utf8"
);
const preferencesSource = fs.readFileSync(
  require.resolve("../src/screens/OnboardingScreen.tsx"), "utf8"
);
const mealDetailsSource = fs.readFileSync(
  require.resolve("../src/components/MealDetailsModal.tsx"), "utf8"
);
const dateStripSource = fs.readFileSync(
  require.resolve("../src/components/CalendarDateStrip.tsx"), "utf8"
);
const calendarSource = fs.readFileSync(
  require.resolve("../src/screens/CalendarScreen.tsx"), "utf8"
);

const preferences = {
  meatPerWeek: 2,
  dairyPerWeek: 7,
  fruitPreference: "optional",
  mealsPerDay: 3,
  planStyle: "balanced",
  weeklyBudget: "45",
  bannedIngredients: [],
  typicalBreakfast: { mode: "none" }
};
const today = new Date(2026, 9, 30, 18, 30);
const dateKeys = Array.from({ length: 7 }, (_, index) => {
  const date = new Date(2026, 9, 30 + index);
  return formatDateKey(date);
});
const appliedGoals = { [dateKeys[0]]: 2500, [dateKeys[3]]: 1800 };
const plans = getSevenCalendarDayPlans(today, preferences, appliedGoals, "DE");

assert.equal(plans.length, 7, "shopping window contains exactly seven days");
assert.equal(plans[0][0].currencyCode, "EUR", "selected country currency propagates to meal plans");
assert.equal(
  getDailyCalories(plans[0]),
  2500,
  "shopping list uses applied portions for today"
);
assert.equal(
  getDailyCalories(plans[3]),
  1800,
  "shopping list uses applied portions for a later day"
);
assert.equal(
  getDailyCalories(plans[1]),
  DEFAULT_DAILY_CALORIE_GOAL,
  "dates without an applied goal use the 2,000 kcal default"
);
assert.ok(plans.flat().every((meal) => Number.isFinite(meal.proteinGrams)),
  "every planned meal carries a calculated protein total");
assert.equal(getDailyProtein(plans[0]),
  Math.round(plans[0].reduce((sum, meal) => sum + meal.proteinGrams, 0) * 10) / 10,
  "daily protein is summed from the displayed meals");
assert.match(appSource, /dates\.map\(\(date\) => \[formatDateKey\(date\), goal\]\)/,
  "applying an updated calorie target writes it to every visible calendar date");

const defaultEstimate = buildSevenDayShoppingEstimate(today, preferences, appliedGoals, "DE");
assert.ok(defaultEstimate.items.length > 0, "calendar meals produce a nonempty shopping list");
assert.ok(defaultEstimate.items.some((item) => item.name === "Lentils, dry"),
  "grocery aggregation retains the generic dry lentil ingredient");
assert.ok(defaultEstimate.items.some((item) => item.name === "Basmati rice, dry"),
  "grocery aggregation retains dry basmati rice");
assert.ok(defaultEstimate.items.some((item) => item.name === "Pasta, dry"),
  "grocery aggregation retains dry pasta");
assert.ok(defaultEstimate.items.every((item) => !/red lentils|lentils, cooked|rice, cooked/i.test(item.name)),
  "grocery aggregation does not reintroduce cooked or red lentil variants");
assert.match(defaultEstimate.startDate, /2026/);
assert.match(defaultEstimate.endDate, /2026/);
const dateOptions = { month: "short", day: "numeric", year: "numeric" };
assert.equal(
  defaultEstimate.startDate,
  new Date(2026, 9, 30).toLocaleDateString("en-GB", dateOptions),
  "date range uses the English month abbreviation and starts on the selected date"
);
assert.equal(
  defaultEstimate.endDate,
  new Date(2026, 10, 5).toLocaleDateString("en-GB", dateOptions),
  "default weekly range ends six days after today"
);
assert.notEqual(defaultEstimate.startDate, defaultEstimate.endDate,
  "date range has distinct local start and end dates");
assert.equal(defaultEstimate.estimatedTotal.currencyCode, "EUR");
assert.equal(
  defaultEstimate.estimatedTotal.amountMinorUnits,
  defaultEstimate.items.reduce((sum, item) => sum + item.estimatedCost.amountMinorUnits, 0),
  "shopping total is the sum of ingredient line estimates"
);
assert.match(defaultEstimate.startDate, /\bOct\b/, "month label displays Oct rather than locale-specific Okt");

const oneDayEstimate = buildShoppingEstimate(
  new Date(2026, 9, 30, 18),
  new Date(2026, 9, 30, 23),
  preferences,
  appliedGoals,
  "DE"
);
assert.equal(oneDayEstimate.startDate, oneDayEstimate.endDate, "a selected single day has matching range labels");
assert.equal(oneDayEstimate.items.reduce((sum, item) => sum + item.estimatedCost.amountMinorUnits, 0),
  oneDayEstimate.estimatedTotal.amountMinorUnits, "single-day category input retains total reconciliation");
assert.equal(getCalendarDayPlans(
  new Date(2026, 9, 30), new Date(2026, 9, 30), preferences, appliedGoals, "DE"
).length, 1, "custom date ranges include both selected endpoints");
const availableStart = new Date(2026, 9, 30);
const availableEnd = new Date(2026, 10, 29);
assert.equal(isCalendarDateAvailable(new Date(2026, 9, 29), availableStart, availableEnd), false,
  "past dates cannot be selected in the grocery date picker");
assert.equal(isCalendarDateAvailable(availableStart, availableStart, availableEnd), true,
  "today is a selectable shopping date");
assert.equal(isCalendarDateAvailable(availableEnd, availableStart, availableEnd), true,
  "the last calendar-planning date is selectable");
assert.equal(isCalendarDateAvailable(new Date(2026, 10, 30), availableStart, availableEnd), false,
  "dates beyond the calendar planning horizon cannot be selected");
assert.equal(isCalendarDateAvailable(availableStart, availableStart, availableEnd, preferences), true,
  "dates with planned meals remain selectable");
assert.equal(isCalendarDateAvailable(availableStart, availableStart, availableEnd, {
  ...preferences,
  bannedIngredients: ingredientCatalog.map((ingredient) => ingredient.id)
}), false, "dates without any usable planned food are not selectable");
assert.deepEqual(getCalendarMonthNavigationAvailability(
  new Date(2026, 9, 1), availableStart, availableEnd
), { previous: false, next: true }, "date-picker month navigation respects available boundaries");
assert.deepEqual(getCalendarMonthNavigationAvailability(
  new Date(2026, 10, 1), availableStart, availableEnd
), { previous: true, next: false }, "the next month arrow disables beyond the last recipe date");
assert.throws(
  () => getCalendarDayPlans(
    new Date(2026, 9, 30), new Date(2027, 0, 28), preferences, appliedGoals, "DE"
  ),
  RangeError,
  "custom shopping ranges are capped at 90 days"
);
const maximumRange = getCalendarDayPlans(
  new Date(2026, 0, 1), new Date(2026, 2, 31), preferences, {}, "DE"
);
assert.equal(maximumRange.length, 90, "the maximum 90-day range is accepted inclusively");
assert.equal(
  getDailyCalories(maximumRange[89]),
  getDailyCalories(scaleMealPlan(
    getPersonalizedDayPlan(new Date(2026, 2, 31), preferences).meals,
    DEFAULT_DAILY_CALORIE_GOAL
  )),
  "the final day of a 90-day range is included"
);
assert.equal(getShoppingCategory("Frozen berries"), "Fruit");
assert.equal(getShoppingCategory("Chicken breast"), "Meat & fish");
assert.equal(getShoppingCategory("Olive oil"), "Pantry & seasonings");
assert.equal(getShoppingCategory("Chia seeds"), "Pantry & seasonings");
assert.equal(getShoppingCategory("Hummus"), "Legumes");
assert.equal(getShoppingCategory("Frozen mixed vegetables"), "Vegetables");
assert.equal(getShoppingCategory("Cherry tomatoes"), "Vegetables");
assert.equal(getShoppingCategory("Carrots"), "Vegetables");
assert.equal(getShoppingCategory("Potatoes"), "Vegetables");
assert.equal(getShoppingCategory("Lentils, dry"), "Legumes");
assert.equal(getShoppingCategory("Black beans, drained"), "Legumes");
assert.equal(getShoppingCategory("Red beans, drained"), "Legumes",
  "red beans appear in the legumes grocery category");
assert.equal(isIngredientBanned("Red beans, drained", ["red-beans"]), true,
  "red beans match the red-bean ban choice");
assert.ok(estimateIngredient("Red beans, drained", "100", "g", "PL").estimatedCostCents > 0,
  "red beans receive the selected country's modeled grocery estimate");
assert.ok(estimateIngredient("Red beans, drained", "100", "g").proteinGrams > 0,
  "red beans receive an independent protein estimate");
assert.equal(getShoppingCategory("Pasta, dry"), "Grains & bakery");
assert.equal(getShoppingCategory("Cottage cheese"), "Dairy & eggs");
assert.equal(getShoppingCategory("Skyr"), "Dairy & eggs");
assert.deepEqual(
  ingredientCatalog.filter((ingredient) =>
    ["cottage-cheese", "skyr", "bread", "basmati-rice", "pasta", "lentils-dry"].includes(ingredient.id)
  ).map(({ id, name, category }) => ({ id, name, category })),
  [
    { id: "cottage-cheese", name: "Cottage cheese", category: "Dairy & eggs" },
    { id: "skyr", name: "Skyr", category: "Dairy & eggs" },
    { id: "bread", name: "Bread", category: "Grains & bakery" },
    { id: "basmati-rice", name: "Basmati rice", category: "Grains & bakery" },
    { id: "pasta", name: "Pasta", category: "Grains & bakery" },
    { id: "lentils-dry", name: "Lentils (dry)", category: "Legumes" }
  ],
  "new options keep the requested generic names and grocery categories"
);
assert.equal(isIngredientBanned("Cottage cheese", ["cottage-cheese"]), true,
  "cottage cheese participates in ingredient-ban matching");
assert.equal(isIngredientBanned("Skyr", ["skyr"]), true,
  "skyr participates in ingredient-ban matching");
assert.equal(isIngredientBanned("Lentils, dry", ["lentils-dry"]), true,
  "generic dry lentils remain matchable by the existing ban contract");
assert.equal(isIngredientBanned("Basmati rice, dry", ["basmati-rice"]), true,
  "generic basmati rice matches its dry recipe ingredient");
assert.equal(isIngredientBanned("Pasta, dry", ["pasta"]), true,
  "generic pasta matches its dry recipe ingredient");
assert.equal(estimateIngredient("Cottage cheese", "100", "g").calories, 98);
assert.equal(estimateIngredient("Skyr", "100", "g").calories, 63);
assert.ok(estimateIngredient("Cottage cheese", "100", "g").estimatedCostCents > 0);
assert.ok(estimateIngredient("Skyr", "100", "g").estimatedCostCents > 0);
assert.ok(estimateIngredient("Bread", "2", "slices").estimatedCostCents > 0,
  "generic bread has a unit estimate");
assert.ok(estimateIngredient("Pasta, dry", "80", "g").estimatedCostCents > 0,
  "generic dry pasta has a unit estimate");
assert.ok(estimateIngredient("Basmati rice, dry", "75", "g").estimatedCostCents > 0,
  "dry basmati rice has a unit estimate");
assert.ok(estimateIngredient("Lentils, dry", "75", "g").estimatedCostCents > 0,
  "generic dry lentils have a unit estimate");
assert.throws(() => estimateIngredient("Lentils, cooked", "100", "g"), RangeError,
  "cooked lentil variants are no longer part of recipe estimates");
assert.throws(() => estimateIngredient("Rice, cooked", "100", "g"), RangeError,
  "cooked rice variants are no longer part of recipe estimates");
for (let offset = 0; offset < 7; offset += 1) {
  const date = new Date(2026, 9, 26 + offset);
  const day = getPersonalizedDayPlan(date, {
    ...preferences,
    meatPerWeek: 7,
    dairyPerWeek: 7,
    planStyle: "lowCost",
    weeklyBudget: "1000"
  });
  assert.ok(day.meals.flatMap((meal) => meal.ingredients).every(
    (ingredient) => !/red lentils|lentils, cooked|rice, cooked/i.test(ingredient.name)
  ), "personalized recipes and substitutions retain dry rather than cooked lentil/rice variants");
}
const dryLentilSubstitution = getPersonalizedDayPlan(new Date(2026, 9, 26), {
  ...preferences,
  bannedIngredients: ["chicken-breast", "black-beans", "chickpeas"]
});
assert.ok(dryLentilSubstitution.meals.flatMap((meal) => meal.ingredients)
  .some((ingredient) => ingredient.name === "Lentils, dry"),
  "ban substitution falls back to generic dry lentils rather than cooked red lentils");
assert.match(grocerySource, /categoryTitle/);
assert.match(grocerySource, /categoryHeader/);
assert.match(grocerySource, /hasCustomRange/,
  "user-selected grocery date ranges are preserved when today rolls over");
assert.match(appSource, /setGoalInput\(selectedGoal\)/,
  "changing selected dates synchronizes the calorie input to that date's saved goal or default");
assert.match(calendarSource, /mealsPerDayLabel/,
  "calendar meals chip reflects the selected meal and snack preference");
assert.doesNotMatch(calendarSource, /\{meals\.length\}\s*\/\s*3/,
  "calendar no longer hard-codes a three-meal count");
const mealCardSource = fs.readFileSync(require.resolve("../src/components/MealCard.tsx"), "utf8");
assert.match(mealCardSource, /meal\.proteinGrams/,
  "every meal card displays its calculated protein");
assert.match(mealDetailsSource, /meal\.proteinGrams/,
  "meal details include calculated protein");
assert.match(calendarSource, /getDailyProtein/,
  "calendar daily summary uses protein from displayed meals");
assert.match(grocerySource, /if \(!isSameDay\(startDate, newStartDate\)\) setStartDate\(newStartDate\)/,
  "default start date is only replaced when the calendar day changes");
assert.match(grocerySource, /if \(!isSameDay\(endDate, newEndDate\)\) setEndDate\(newEndDate\)/,
  "default end date is only replaced when the calendar day changes");

const flatIngredients = plans.flat().flatMap((meal) => meal.ingredients);
const expectedAmounts = new Map();
for (const ingredient of flatIngredients) {
  const name = /^carrots?$/i.test(ingredient.name) ? "Carrots"
    : /^potato(?:es)?$/i.test(ingredient.name) ? "Potatoes"
      : /^eggs?$/i.test(ingredient.name) ? "Eggs" : ingredient.name;
  const amount = getIngredientAggregationAmount(
    ingredient.name,
    ingredient.quantity,
    ingredient.unit
  );
  const key = `${name.toLowerCase()}|${amount.unit}`;
  expectedAmounts.set(key, (expectedAmounts.get(key) ?? 0) + amount.quantity);
}
for (const [key, expected] of expectedAmounts) {
  const line = defaultEstimate.items.find((item) => item.key === key);
  assert.ok(line, `shopping list contains actual meal ingredient ${key}`);
  const amount = line.unit === "kg" ? line.quantity * 1000
    : line.unit === "L" ? line.quantity * 1000 : line.quantity;
  assert.ok(Math.abs(amount - expected) < 0.00001, `aggregated amount is accurate for ${key}`);
}
assert.equal(
  defaultEstimate.items.filter((item) => /^eggs?$/i.test(item.name)).length,
  1,
  "singular and plural egg ingredient names share one shopping-list row"
);
assert.equal(
  defaultEstimate.items.filter((item) => /^potatoes?$/i.test(item.name)).length,
  1,
  "singular and plural potato names and compatible weight/count amounts share one shopping-list row"
);

const highPortionDay = getSevenCalendarDayPlans(
  today, preferences, { [dateKeys[0]]: 10000 }, "DE"
)[0];
assert.equal(getDailyCalories(highPortionDay), 10000, "grocery list reflects updated meal portions exactly");
assert.ok(highPortionDay.every((meal) => meal.proteinGrams >= 0),
  "scaled meals retain non-negative protein from adjusted ingredient quantities");

const repeatBreakfastPreferences = {
  ...preferences,
  typicalBreakfast: { mode: "preset", presetId: "oatmeal-milk" }
};
for (const preset of typicalBreakfastPresets) {
  const presetCalories = preset.ingredients.reduce((sum, ingredient) =>
    sum + estimateIngredient(ingredient.name, ingredient.quantity, ingredient.unit).calories, 0);
  const presetProtein = preset.ingredients.reduce((sum, ingredient) =>
    sum + estimateIngredient(ingredient.name, ingredient.quantity, ingredient.unit).proteinGrams, 0);
  const presetCost = preset.ingredients.reduce((sum, ingredient) =>
    sum + estimateIngredient(ingredient.name, ingredient.quantity, ingredient.unit).estimatedCostCents, 0);
  assert.ok(presetCalories >= 600 && presetCalories <= 700,
    `${preset.label} standard portion previews around 650 kcal`);
  assert.ok(presetProtein > 0 && presetCost > 0,
    `${preset.label} standard portion has protein and cost estimates`);
  const presetPlan = getPersonalizedDayPlan(today, {
    ...preferences,
    fruitPreference: "include",
    typicalBreakfast: { mode: "preset", presetId: preset.id }
  });
  const plannedBreakfast = presetPlan.meals.find((meal) => meal.type === "Breakfast");
  assert.deepEqual(plannedBreakfast.ingredients.map(({ name, quantity, unit }) =>
    ({ name, quantity, unit })), preset.ingredients,
  `${preset.label} plan uses the same standard portion shown in its preview`);
}
const fixedBreakfastPreferenceOverride = getPersonalizedDayPlan(today, {
  ...preferences,
  fruitPreference: "avoid",
  dairyPerWeek: 0,
  typicalBreakfast: { mode: "preset", presetId: "oatmeal-milk" }
}).meals.find((meal) => meal.type === "Breakfast");
assert.deepEqual(fixedBreakfastPreferenceOverride.ingredients.map(({ name, quantity, unit }) =>
  ({ name, quantity, unit })), typicalBreakfastPresets[0].ingredients,
"selected typical breakfast takes precedence over automatic fruit and dairy frequency preferences");
const repeatedBreakfasts = Array.from({ length: 7 }, (_, index) => {
  const date = new Date(2026, 9, 26 + index);
  return getPersonalizedDayPlan(date, repeatBreakfastPreferences).meals
    .find((meal) => meal.type === "Breakfast");
});
assert.ok(repeatedBreakfasts.every((meal) =>
  meal.title === repeatedBreakfasts[0].title &&
  JSON.stringify(meal.ingredients.map(({ name, quantity, unit }) => ({ name, quantity, unit }))) ===
    JSON.stringify(repeatedBreakfasts[0].ingredients.map(({ name, quantity, unit }) => ({ name, quantity, unit })))
), "a selected preset breakfast repeats identically on every date");
const breadJamPlan = getPersonalizedDayPlan(today, {
  ...preferences,
  typicalBreakfast: { mode: "preset", presetId: "bread-jam" }
});
assert.ok(breadJamPlan.meals.find((meal) => meal.type === "Breakfast")
  .ingredients.some((ingredient) => ingredient.name === "Jam"),
"bread-and-jam preset is modeled as a repeating breakfast");
const customBreakfastPreferences = {
  ...preferences,
  typicalBreakfast: {
    mode: "custom",
    ingredients: [
      { name: "Rolled oats", quantity: "60", unit: "g" },
      { name: "Milk", quantity: "200", unit: "ml" }
    ]
  }
};
const customBreakfastPlan = getPersonalizedDayPlan(today, customBreakfastPreferences);
const customBreakfast = customBreakfastPlan.meals.find((meal) => meal.type === "Breakfast");
assert.equal(customBreakfast.title, "Custom typical breakfast");
assert.ok(customBreakfast.calories > 0 && customBreakfast.proteinGrams > 0 &&
  customBreakfast.estimatedCostCents > 0,
"custom breakfast ingredients have live-model calorie, protein, and cost estimates");
assert.equal(isValidPositiveIngredientQuantity("1/2"), true,
  "custom breakfast accepts positive fractional quantities");
assert.equal(isValidPositiveIngredientQuantity("1/0"), false,
  "custom breakfast rejects fractions with a zero denominator");
assert.equal(isValidPositiveIngredientQuantity("0"), false,
  "custom breakfast quantities must be positive");
assert.equal(isValidPositiveIngredientQuantity(""), false,
  "custom breakfast requires a quantity");
const invalidCustomBreakfast = getPersonalizedDayPlan(today, {
  ...customBreakfastPreferences,
  typicalBreakfast: {
    mode: "custom",
    ingredients: [{ name: "Rolled oats", quantity: "1/0", unit: "g" }]
  }
}).meals.find((meal) => meal.type === "Breakfast");
assert.notEqual(invalidCustomBreakfast.title, "Custom typical breakfast",
  "invalid custom quantities do not silently create a partial typical breakfast plan");
const budgetAdjustedCustomBreakfast = getPersonalizedDayPlan(today, {
  ...preferences,
  weeklyBudget: "0",
  typicalBreakfast: {
    mode: "custom",
    ingredients: [
      { name: "Frozen berries", quantity: "100", unit: "g" },
      { name: "Rolled oats", quantity: "50", unit: "g" }
    ]
  }
}).meals.find((meal) => meal.type === "Breakfast");
assert.ok(budgetAdjustedCustomBreakfast.ingredients.some((ingredient) => ingredient.name === "Frozen berries"),
"budget substitutions preserve the explicitly selected typical breakfast");
assert.ok(getPersonalizedDayPlan(today, {
  ...preferences,
  weeklyBudget: "0",
  typicalBreakfast: {
    mode: "custom",
    ingredients: [
      { name: "Frozen berries", quantity: "100", unit: "g" },
      { name: "Rolled oats", quantity: "50", unit: "g" }
    ]
  }
}).meals.some((meal) => meal.type !== "Breakfast" &&
  meal.ingredients.some((ingredient) => ingredient.name === "Frozen mixed vegetables")),
"budget substitutions still apply to non-breakfast meals when the typical breakfast is protected");
const scaledCustomPlan = scaleMealPlan(customBreakfastPlan.meals, 2500);
const scaledCustomBreakfast = scaledCustomPlan.find((meal) => meal.type === "Breakfast");
assert.equal(getDailyCalories(scaledCustomPlan), 2500,
  "custom typical breakfast participates in daily calorie scaling");
assert.ok(scaledCustomPlan.every((meal) => Math.abs(meal.proteinGrams -
  Math.round(meal.ingredients.reduce((sum, ingredient) =>
    sum + ingredient.proteinGrams, 0) * 10) / 10) < 1e-9),
"scaled meal protein remains the sum of ingredient-rate estimates");
assert.ok(Math.abs(scaledCustomBreakfast.proteinGrams -
  Math.round(scaledCustomBreakfast.ingredients.reduce((sum, ingredient) =>
    sum + ingredient.proteinGrams, 0) * 10) / 10) < 1e-9,
"scaled custom breakfast protein follows its scaled ingredient quantities");
const customBreakfastPreview = customBreakfast.ingredients.reduce((preview, ingredient) => {
  const estimate = estimateIngredient(ingredient.name, ingredient.quantity, ingredient.unit, "PL");
  return {
    calories: preview.calories + estimate.calories,
    proteinGrams: preview.proteinGrams + estimate.proteinGrams,
    costMinorUnits: preview.costMinorUnits + estimate.estimatedCostCents
  };
}, { calories: 0, proteinGrams: 0, costMinorUnits: 0 });
assert.ok(customBreakfastPreview.calories > 0 && customBreakfastPreview.proteinGrams > 0 &&
  customBreakfastPreview.costMinorUnits > 0,
"custom ingredient preview values use the existing country-aware estimate model");
assert.equal(getPersonalizedDayPlan(today, {
  ...repeatBreakfastPreferences,
  mealsPerDay: 2
}).meals.find((meal) => meal.type === "Breakfast").title, "Oatmeal with milk",
"typical breakfast remains present with the two-meal schedule");
assert.equal(getPersonalizedDayPlan(today, {
  ...repeatBreakfastPreferences,
  mealsPerDay: 5
}).meals.filter((meal) => meal.type === "Snack").length, 2,
"typical breakfast preference preserves the existing five-meal schedule");
const bannedCustomBreakfast = getPersonalizedDayPlan(today, {
  ...customBreakfastPreferences,
  typicalBreakfast: {
    mode: "custom",
    ingredients: [{ name: "Red beans, drained", quantity: "100", unit: "g" }]
  },
  bannedIngredients: ["red-beans"]
}).meals.find((meal) => meal.type === "Breakfast");
assert.ok(bannedCustomBreakfast.ingredients.every((ingredient) =>
  !isIngredientBanned(ingredient.name, ["red-beans"])
), "custom breakfast respects ingredient bans");
const redBeanGroceries = buildShoppingEstimate(
  today, today,
  { ...preferences, typicalBreakfast: {
    mode: "custom",
    ingredients: [{ name: "Red beans, drained", quantity: "120", unit: "g" }]
  } },
  {}, "PL"
);
assert.ok(redBeanGroceries.items.some((item) => item.name === "Red beans, drained" &&
  item.estimatedCost.currencyCode === "PLN"),
"red beans appear in grocery estimates using selected-country currency");
assert.equal(formatShoppingQuantity(2.1, "kg", "en-GB"), "2.1 kg");
assert.equal(formatShoppingQuantity(2.1, "kg", "de-DE"), "2,1 kg");
assert.deepEqual(toShoppingUnit(2100, "g"), { quantity: 2.1, unit: "kg" });
assert.deepEqual(toShoppingUnit(2100, "ml"), { quantity: 2.1, unit: "L" });
assert.deepEqual(toAggregationUnit(2, "tbsp"), { quantity: 6, unit: "tsp" });
assert.deepEqual(
  getIngredientAggregationAmount("Potato", "1", "large"),
  { quantity: 250, unit: "g" },
  "a counted potato uses the same modeled 250 g conversion as its ingredient estimate"
);
const potatoShoppingItem = defaultEstimate.items.find((item) => item.key === "potatoes|g");
assert.ok(potatoShoppingItem, "potato shopping entry is present");
const expectedPotatoShoppingAmount = toShoppingUnit(expectedAmounts.get("potatoes|g"), "g");
assert.equal(potatoShoppingItem.quantity, expectedPotatoShoppingAmount.quantity,
  "potato amounts aggregate across grams and counted potatoes after calorie scaling");
assert.equal(potatoShoppingItem.unit, expectedPotatoShoppingAmount.unit,
  "potato weight uses the same shopper-friendly unit conversion as other groceries");

const pounds = buildSevenDayShoppingEstimate(today, preferences, {}, "GB");
const zloty = buildSevenDayShoppingEstimate(today, preferences, {}, "PL");
assert.equal(pounds.estimatedTotal.currencyCode, "GBP");
assert.equal(zloty.estimatedTotal.currencyCode, "PLN");
const gbPlans = getSevenCalendarDayPlans(today, preferences, {}, "GB");
assert.equal(gbPlans[0][0].estimatedCost.currencyCode, "GBP");
assert.ok(gbPlans.flat().flatMap((meal) => meal.ingredients).every(
  (ingredient) => ingredient.estimatedCost.currencyCode === "GBP"
), "ingredient and meal estimates share the selected country's currency");
assert.notEqual(
  pounds.estimatedTotal.amountMinorUnits,
  buildSevenDayShoppingEstimate(today, preferences, {}, "DE").estimatedTotal.amountMinorUnits,
  "country-specific modeled factors affect country costs"
);
assert.equal(countries.length, 11, "explicit supported country list is present");
assert.match(PRICE_ESTIMATE_REFERENCE, /not researched retailer prices/i);
assert.match(preferencesSource, /prefs\.country/);
assert.doesNotMatch(preferencesSource, /MADE FOR YOUR EVERYDAY|Good food,|your way\.|I’ll do this later/,
  "onboarding removes the requested hero copy and skip action");
assert.doesNotMatch(preferencesSource, /breakfastEstimate|estimatePresetBreakfast/,
  "standard breakfast choices do not display a cost, calorie, or protein preview");
assert.match(mealDetailsSource, /formatMoney/);
assert.match(appSource, /PanResponder/);
assert.match(appSource, /Animated\.timing/);
assert.match(appSource, /Easing\.out\(Easing\.cubic\)/);
assert.match(dateStripSource, /onTouchStart/);
assert.doesNotMatch(grocerySource, /optimizer|protein|calorie goal|weekly budget/i);

const sampleRate = estimateIngredient("Frozen berries", "75", "g");
const germanyRate = estimateIngredient("Frozen berries", "75", "g", "DE");
assert.equal(sampleRate.estimatedCostCents, germanyRate.estimatedCostCents);
assert.ok(
  estimateIngredient("Frozen berries", "75", "g", "PL").estimatedCostCents >
    estimateIngredient("Frozen berries", "75", "g", "FR").estimatedCostCents,
  "Polish minor-unit amounts include a synthetic local-currency scale instead of treating euro cents as grosz"
);
assert.equal(
  estimateIngredient("Chicken breast", "300", "g", "PL").estimatedCostCents,
  1242,
  "Polish chicken estimate uses the user's roughly 12 PLN per 300 g sanity check"
);
assert.equal(
  estimateIngredient("Eggs", "9.5", "large", "PL").estimatedCostCents,
  1197,
  "Polish egg estimate is approximately 12 PLN for 9.5 eggs rather than 2.94 PLN"
);
assert.equal(
  formatMoney({ amountMinorUnits: 1234, currencyCode: "GBP" }, "en-GB"),
  "£12.34",
  "shared money formatter uses the provided currency"
);

const missingGoalPlans = getSevenCalendarDayPlans(today, preferences, {}, "DE");
assert.equal(missingGoalPlans.length, 7);
assert.ok(missingGoalPlans.every((day) => getDailyCalories(day) === DEFAULT_DAILY_CALORIE_GOAL),
  "every day without an applied goal uses the 2,000 kcal default");
assert.equal(getDailyCalories(scaleMealPlan(
  getPersonalizedDayPlan(today, preferences).meals,
  DEFAULT_DAILY_CALORIE_GOAL
)), DEFAULT_DAILY_CALORIE_GOAL, "the personalized plan scales to the daily default before display");
for (const mealsPerDay of [2, 3, 4, 5]) {
  const day = getPersonalizedDayPlan(today, { ...preferences, mealsPerDay });
  assert.equal(day.meals.length, mealsPerDay, `${mealsPerDay}-meal preference produces that many meals`);
  assert.equal(day.meals.filter((meal) => meal.type === "Snack").length, Math.max(0, mealsPerDay - 3),
    `${mealsPerDay}-meal preference adds the expected snack count`);
  assert.equal(getDailyCalories(scaleMealPlan(day.meals, DEFAULT_DAILY_CALORIE_GOAL)),
    DEFAULT_DAILY_CALORIE_GOAL, `${mealsPerDay}-meal plan scales to the default calorie target`);
  const scaled = scaleMealPlan(day.meals, DEFAULT_DAILY_CALORIE_GOAL);
  [1200, 1850, 2400, 3200].forEach((goal) => {
    scaleMealPlan(day.meals, goal).forEach((meal) => meal.ingredients
      .filter((item) => isWholePieceIngredient(item.name) && item.unit !== "g" && item.unit !== "ml")
      .forEach((item) => assert.match(item.quantity, /^[1-9]\d*$/, `eggs and fruit stay whole (${item.name} ${item.quantity})`)));
  });
  const mains = scaled.filter((meal) => meal.type !== "Snack");
  assert.ok(Math.max(...mains.map((meal) => meal.calories)) -
    Math.min(...mains.map((meal) => meal.calories)) <= 1,
  `${mealsPerDay}-meal plan distributes calories evenly across main meals`);
  assert.ok(day.meals.every((meal) =>
    !/wholegrain|wholemeal/i.test([
      meal.title,
      meal.description,
      ...meal.ingredients.map((ingredient) => ingredient.name)
    ].join(" "))
  ), `${mealsPerDay}-meal personalized plans contain no wholegrain/wholemeal names`);
}
const breadSliceEstimate = estimateIngredient("Bread", "2", "slices");
assert.equal(breadSliceEstimate.estimatedCostCents, 24,
  "generic bread slices receive the standard per-slice modeled estimate");
assert.equal(breadSliceEstimate.calories, 190,
  "generic bread slices receive the standard per-slice calorie estimate");
const breadRollEstimate = estimateIngredient("Bread", "1", "roll");
assert.equal(breadRollEstimate.estimatedCostCents, 12,
  "generic bread supports the roll unit used by generated meals");
assert.equal(breadRollEstimate.calories, 95,
  "generic bread rolls receive a finite calorie estimate");
assert.deepEqual(getIngredientAggregationAmount("Bread", "1", "roll"),
  { quantity: 1, unit: "roll" },
  "generic bread rolls remain valid for grocery aggregation");
assert.equal(estimateIngredient("Bread roll", "1", "roll").estimatedCostCents, 30,
  "the recipe's named bread roll retains its modeled roll estimate");
assert.equal(estimateIngredient("Wrap", "1", "large").estimatedCostCents, 38,
  "generic wraps remain estimable after removing legacy wholemeal-specific rate patterns");
const fiveMealDay = getPersonalizedDayPlan(today, { ...preferences, mealsPerDay: 5 });
assert.deepEqual(getMealsInDisplayOrder(fiveMealDay.meals).map((meal) => meal.slot ?? meal.type),
  ["Breakfast", "Morning", "Lunch", "Afternoon", "Dinner"],
  "snacks appear in their morning and afternoon positions in the calendar");
for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
  const date = new Date(today);
  date.setDate(date.getDate() + dayOffset);
  const generated = getPersonalizedDayPlan(date, { ...preferences, mealsPerDay: 5 });
  assert.ok(generated.meals.every((meal) =>
    !/wholegrain|wholemeal/i.test([
      meal.title,
      meal.description,
      ...meal.ingredients.map((ingredient) => ingredient.name)
    ].join(" "))
  ), `generated personalized plan for ${formatDateKey(date)} contains no wholegrain/wholemeal names`);
}
const fruitAvoidingSnack = getPersonalizedDayPlan(today, {
  ...preferences,
  mealsPerDay: 4,
  fruitPreference: "avoid"
}).meals.find((meal) => meal.type === "Snack");
assert.ok(fruitAvoidingSnack && fruitAvoidingSnack.ingredients.every(
  (ingredient) => !/\b(apple|banana|berries|berry|fruit)\b/i.test(ingredient.name)
), "snack ingredients respect the avoid-fruit preference");
const snackEstimate = buildShoppingEstimate(
  today, today, { ...preferences, mealsPerDay: 4 }, {}, "DE"
);
assert.ok(snackEstimate.items.some((item) => /banana|hummus/i.test(item.name)),
  "snack ingredients are included in the grocery estimate");
assert.deepEqual(
  scaleMealPlan(getPersonalizedDayPlan(today, preferences).meals, 2000).map((meal) => meal.calories),
  scaleMealPlan(getPersonalizedDayPlan(today, preferences).meals, 2000).map((meal) => meal.calories),
  "portion scaling stays deterministic"
);
assert.equal(getCountry("GB").currencyCode, "GBP");
assert.equal(getCountry("US").currencyCode, "USD");
assert.equal(getCountry("AU").currencyCode, "AUD");
assert.equal(buildSevenDayShoppingEstimate(today, preferences, {}, "US").estimatedTotal.currencyCode, "USD");
assert.equal(buildSevenDayShoppingEstimate(today, preferences, {}, "AU").estimatedTotal.currencyCode, "AUD");
assert.ok(ingredientCatalog.length >= 50, "ban list includes all modeled planner ingredients");
assert.ok(ingredientCategoryOrder.every((category) =>
  ingredientCatalog.some((ingredient) => ingredient.category === category)
), "ban list groups options across all ingredient categories");
assert.match(preferencesSource, /planStyle\.\$\{option\}/);
assert.match(preferencesSource, /prefs\.budget/);
assert.match(preferencesSource, /prefs\.banIngredients/);
assert.match(preferencesSource, /CustomBreakfastBuilder/,
  "preferences include a custom typical-breakfast builder");
assert.doesNotMatch(preferencesSource, /ingredient\.name\}\{isBanned \? " · Banned"/,
  "banned ingredients are indicated only by their selected styling, without an extra label");
assert.match(grocerySource, /fontSize: 13, fontWeight: "800"/,
  "shopping list category headings have stronger visual emphasis");

const highProteinPlan = getPersonalizedDayPlan(new Date(2026, 9, 26), {
  ...preferences,
  planStyle: "highProtein",
  meatPerWeek: 0,
  dairyPerWeek: 0,
  weeklyBudget: "1000"
});
assert.ok(highProteinPlan.meals[0].ingredients.some((ingredient) => /^eggs?$/i.test(ingredient.name)),
  "higher-protein style selects additional protein-rich food");
const budgetDay = new Date(2026, 10, 6);
const unrestrictedBudgetPlan = getPersonalizedDayPlan(budgetDay, {
  ...preferences,
  meatPerWeek: 7,
  planStyle: "balanced",
  weeklyBudget: "1000"
});
const constrainedBudgetPlan = getPersonalizedDayPlan(budgetDay, {
  ...preferences,
  meatPerWeek: 7,
  planStyle: "balanced",
  weeklyBudget: "0"
});
assert.ok(unrestrictedBudgetPlan.meals.flatMap((meal) => meal.ingredients)
  .some((ingredient) => /beef mince/i.test(ingredient.name)));
assert.ok(constrainedBudgetPlan.meals.flatMap((meal) => meal.ingredients)
  .some((ingredient) => /frozen minced beef/i.test(ingredient.name)),
  "a tight weekly budget selects a modeled lower-cost frozen red meat option");
const chickenBannedPlan = getPersonalizedDayPlan(budgetDay, {
  ...preferences,
  meatPerWeek: 7,
  bannedIngredients: ["chicken-breast"],
  weeklyBudget: "1000"
});
assert.ok(chickenBannedPlan.meals.flatMap((meal) => meal.ingredients)
  .every((ingredient) => !/chicken breast/i.test(ingredient.name)),
  "banned ingredients are removed or substituted throughout the meal plan");
assert.ok(ingredientCatalog.some((ingredient) => ingredient.id === "beef-mince"));
assert.ok(ingredientCatalog.some((ingredient) => ingredient.id === "frozen-beef-mince"));
assert.ok(ingredientCatalog.some((ingredient) => ingredient.id === "pork-mince"));
assert.equal(estimateIngredient("Frozen minced beef", "100", "g", "DE").estimatedCostCents, 100,
  "frozen minced beef has its own modeled ingredient estimate");
assert.equal(getShoppingCategory("Frozen minced beef"), "Meat & fish",
  "frozen minced beef appears in the protein grocery category");
const redMeatDay = getPersonalizedDayPlan(new Date(2026, 9, 27), {
  ...preferences,
  meatPerWeek: 2,
  dairyPerWeek: 0,
  weeklyBudget: "1000"
});
assert.ok(redMeatDay.meals.flatMap((meal) => meal.ingredients)
  .some((ingredient) => /frozen minced beef/i.test(ingredient.name)),
  "weekly meat rotation includes frozen minced beef as an available protein choice");
const allFoodsBanned = getPersonalizedDayPlan(budgetDay, {
  ...preferences,
  bannedIngredients: ingredientCatalog.map((ingredient) => ingredient.id)
});
assert.ok(allFoodsBanned.meals.every((meal) => meal.ingredients.length === 0 || (meal.banConflicts?.length ?? 0) > 0),
  "unresolved substitutions are surfaced when every food is banned");
assert.equal(getDailyCalories(scaleMealPlan(allFoodsBanned.meals, DEFAULT_DAILY_CALORIE_GOAL)), 0,
  "an entirely banned plan remains safe to render without falsely allocating calories");

assert.equal(en.prefs.banIngredients, "Ban ingredients");
assert.equal(en.prefs.budget, "Weekly food budget");
assert.equal(en.planStyle.lowCost, "Lower cost");
assert.equal(en.prefs.country, "Country and currency");

const { hasFoodTranslation, translateTitle } = require("../src/foodNames.ts");
const flattenKeys = (node, prefix = "") => Object.entries(node).flatMap(([key, value]) =>
  typeof value === "string"
    ? [`${prefix}${key.replace(/_(zero|one|two|few|many|other)$/, "")}`]
    : flattenKeys(value, `${prefix}${key}.`));
const untranslatedFoods = [
  ...ingredientCatalog.map((ingredient) => ingredient.name),
  ...typicalBreakfastPresets.map((preset) => preset.label),
  ...typicalBreakfastPresets.flatMap((preset) => preset.ingredients.map((ingredient) => ingredient.name)),
  ...plans.flat().map((meal) => meal.title).filter((title) => translateTitle(title, "fr") === title),
  ...plans.flat().flatMap((meal) => meal.ingredients.map((ingredient) => ingredient.name))
].filter((name) => !hasFoodTranslation(name));
assert.deepEqual([...new Set(untranslatedFoods)], [], "every displayed food name has a translation");
const englishKeys = new Set(flattenKeys(en));
for (const [code, locale] of Object.entries({ fr, de, es, ru, pl })) {
  const keys = new Set(flattenKeys(locale));
  assert.deepEqual([...englishKeys].filter((key) => !keys.has(key)), [],
    `${code} locale has every English translation key`);
  assert.deepEqual([...keys].filter((key) => !englishKeys.has(key)), [],
    `${code} locale has no unknown translation keys`);
}

// ---- Batch cooking plan style ----
const meatPattern = /\b(chicken|beef|pork|turkey|lamb|ham|bacon|sausage|fish|tuna|salmon|sardines?)\b/i;
const batchPreferences = {
  ...preferences,
  planStyle: "batchCooking",
  meatPerWeek: 2,
  weeklyBudget: "1000"
};
const batchDay = (date, prefs = batchPreferences, goal = DEFAULT_DAILY_CALORIE_GOAL) =>
  scaleMealPlan(getPersonalizedDayPlan(date, prefs).meals, goal);
const batchMonday = new Date(2026, 10, 2);
const batchWeek = Array.from({ length: 7 }, (_, index) => new Date(2026, 10, 2 + index));

assert.deepEqual(
  getPersonalizedDayPlan(batchMonday, batchPreferences),
  getPersonalizedDayPlan(new Date(2026, 10, 2, 17), batchPreferences),
  "batch cooking plans are deterministic and independent of the time of day"
);
assert.ok(en.planStyle.batchCooking && en.planStyle.batchCookingDesc,
  "the batch cooking style has a label and description");
assert.match(preferencesSource, /"batchCooking"/, "preferences offer the batch cooking style");
assert.match(calendarSource, /"batchCooking"/, "calendar style menu offers the batch cooking style");
assert.ok(getPersonalizedDayPlan(batchMonday, preferences).meals.every((meal) => !meal.batch),
  "other plan styles never carry batch metadata");
assert.equal(getBatchPrep(batchMonday, preferences, {}, "DE"), null,
  "other plan styles have no batch prep summary");

// Days group into a 4-day (Mon-Thu) and a 3-day (Fri-Sun) batch.
const batchLunches = batchWeek.map((date) =>
  getPersonalizedDayPlan(date, batchPreferences).meals.find((meal) => meal.type === "Lunch"));
batchLunches.forEach((lunch, index) => {
  assert.ok(lunch.batch, "lunch is assembled from a batch");
  assert.equal(lunch.batch.startDate, index < 4 ? "2026-11-02" : "2026-11-06",
    "a date always falls in the same Monday-anchored batch");
  assert.equal(lunch.batch.days, index < 4 ? 4 : 3, "a week splits into 4 + 3 days");
});
assert.deepEqual(batchLunches[0].batch, batchLunches[3].batch, "batch components are shared inside a batch");
assert.notDeepEqual(batchLunches[0].batch.components, batchLunches[4].batch.components,
  "consecutive batches rotate their components");
assert.equal(
  getPersonalizedDayPlan(new Date(2026, 10, 9), batchPreferences).meals[1].batch.startDate, "2026-11-09",
  "the next Monday starts a new batch"
);

// A small cooked base is shared by the batch, but meals combine it differently.
[[0, 4], [4, 7]].forEach(([from, to]) => {
  const days = batchWeek.slice(from, to).map((date) => batchDay(date));
  const components = batchLunches[from].batch.components.filter((name) => !meatPattern.test(name));
  assert.ok(components.length >= 4, "a batch cooks carbs, legumes and a vegetable mix");
  const batchMeals = days.flatMap((meals) => meals.filter((meal) => meal.type !== "Breakfast" && meal.type !== "Snack"));
  components.forEach((name) => assert.ok(
    batchMeals.filter((meal) => meal.ingredients.some((ingredient) => ingredient.name === name)).length >= 2,
    `batch component ${name} is reused in at least two meals of its batch`));
  batchMeals.forEach((meal) => assert.ok(
    meal.ingredients.some((ingredient) => components.includes(ingredient.name)),
    "every batch meal is built from the cooked base"));
  assert.ok(new Set(batchMeals.map((meal) => meal.title)).size >= 3,
    "batch meals combine the cooked base into varied dishes");
  days.slice(1).forEach((meals, index) => {
    const lunch = (list) => list.find((meal) => meal.type === "Lunch");
    assert.notEqual(lunch(meals).title, lunch(days[index]).title, "consecutive lunches are not the same dish");
  });
});

// Calories, protein, meals per day and duplicates.
for (const mealsPerDay of [2, 3, 4, 5]) {
  for (const goal of [1800, 2000, 2500]) {
    batchWeek.forEach((date) => {
      const meals = batchDay(date, { ...batchPreferences, mealsPerDay }, goal);
      assert.equal(meals.length, mealsPerDay, "batch plans keep the meals-per-day preference");
      assert.equal(getDailyCalories(meals), goal, "batch plans hit the daily calorie goal exactly");
      assert.ok(getDailyProtein(meals) >= 45, `batch plans keep a sensible protein level (${getDailyProtein(meals)} g)`);
      meals.forEach((meal) => {
        const names = meal.ingredients.map((ingredient) => ingredient.name.toLowerCase());
        assert.equal(new Set(names).size, names.length, "no duplicate ingredient inside a meal");
      });
    });
  }
}

// Meat preference, bans and budget.
const meatDinners = (prefs, dates) => dates.filter((date) =>
  getPersonalizedDayPlan(date, prefs).meals.find((meal) => meal.type === "Dinner")
    .ingredients.some((ingredient) => meatPattern.test(ingredient.name))).length;
assert.equal(meatDinners({ ...batchPreferences, meatPerWeek: 0 }, batchWeek), 0, "meat never appears when set to never");
assert.equal(meatDinners({ ...batchPreferences, meatPerWeek: 2 }, batchWeek), 2, "meat appears the requested number of days");
assert.equal(meatDinners({ ...batchPreferences, meatPerWeek: 7 }, batchWeek), 7, "meat appears every day when requested");
assert.ok(batchWeek.every((date) => getPersonalizedDayPlan(date, { ...batchPreferences, meatPerWeek: 0 }).meals
  .filter((meal) => meal.type !== "Breakfast")
  .every((meal) => meal.ingredients.every((ingredient) => !meatPattern.test(ingredient.name)))),
"no meat in lunches or dinners when meat is set to never");
const batchBans = ["basmati-rice", "lentils-dry", "chicken-breast", "frozen-vegetables", "olive-oil", "potato"];
for (let weekOffset = 0; weekOffset < 6; weekOffset += 1) {
  for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
    const date = new Date(2026, 10, 2 + weekOffset * 7 + dayOffset);
    for (const bans of [batchBans, ingredientCatalog.map((ingredient) => ingredient.id)]) {
      const meals = getPersonalizedDayPlan(date, { ...batchPreferences, meatPerWeek: 7, bannedIngredients: bans }).meals;
      assert.ok(meals.every((meal) => meal.ingredients.every((ingredient) => !isIngredientBanned(ingredient.name, bans))),
        "batch plans never contain banned ingredients");
      meals.forEach((meal) => {
        const names = meal.ingredients.map((ingredient) => ingredient.name.toLowerCase());
        assert.equal(new Set(names).size, names.length, "no duplicate ingredient inside a banned-ingredient batch meal");
      });
    }
  }
}
const tightBudgetMeals = batchWeek.flatMap((date) =>
  getPersonalizedDayPlan(date, { ...batchPreferences, meatPerWeek: 7, weeklyBudget: "0" }).meals);
assert.ok(tightBudgetMeals.every((meal) => meal.ingredients.every((ingredient) =>
  !/chicken breast|leafy greens|beef mince|pork mince/i.test(ingredient.name))),
"a tight budget uses the lower-cost batch components");
assert.ok(tightBudgetMeals.filter((meal) => meal.batch).every((meal) =>
  meal.batch.components.some((name) => meal.ingredients.some((ingredient) => ingredient.name === name))),
"budget adjustments keep batch metadata consistent with the meal ingredients");

// Batch prep summary and shopping list.
const prepPlans = getCalendarDayPlans(new Date(2026, 10, 2), new Date(2026, 10, 5), batchPreferences, {}, "DE");
const prep = getBatchPrep(new Date(2026, 10, 4), batchPreferences, {}, "DE");
assert.equal(prep.startDate, "2026-11-02");
assert.equal(prep.days, 4);
assert.deepEqual(prep.items.map((item) => item.name), batchLunches[0].batch.components,
  "the prep summary lists every batch component");
const prepCarb = prep.items[0];
const carbTotal = prepPlans.flat().flatMap((meal) => meal.ingredients)
  .filter((ingredient) => ingredient.name === prepCarb.name)
  .reduce((sum, ingredient) => sum + getIngredientAggregationAmount(ingredient.name, ingredient.quantity, ingredient.unit).quantity, 0);
assert.ok(Math.abs(prepCarb.quantity * (prepCarb.unit === "kg" ? 1000 : 1) - carbTotal) < 1e-6,
  "prep totals add up every portion in the batch");
assert.deepEqual(getBatchPrep(new Date(2026, 10, 2), batchPreferences, {}, "DE"), getBatchPrep(new Date(2026, 10, 5), batchPreferences, {}, "DE"),
  "every day of a batch shows the same prep summary");
const midBatchPrep = getBatchPrep(new Date(2026, 10, 7), batchPreferences, {}, "DE", new Date(2026, 10, 7, 9));
assert.equal(midBatchPrep.startDate, "2026-11-07", "a running batch is prepped today, never in the past");
assert.equal(midBatchPrep.days, 2, "a running batch only covers the remaining days");
assert.equal(getBatchPrep(new Date(2026, 10, 6), batchPreferences, {}, "DE", new Date(2026, 10, 2), new Date(2026, 10, 6)).days, 1,
  "the last calendar day is still covered by a batch prep");
{
  const { setBatchCalendar, getBatchWindow } = require("../src/batchCooking.ts");
  // Calendar ends on Monday 2026-11-09: the Fri-Sun batch grows to 4 days instead of leaving a 1-day batch.
  setBatchCalendar(new Date(2026, 10, 2), new Date(2026, 10, 9));
  const extended = getBatchPrep(new Date(2026, 10, 7), batchPreferences, {}, "DE", new Date(2026, 10, 2), new Date(2026, 10, 9));
  assert.equal(extended.days, 4, "a lone final calendar day joins the previous batch");
  assert.equal(extended.startDate, "2026-11-06");
  assert.equal(getBatchWindow(new Date(2026, 10, 9)).dayIndex, 3, "the final day is not its own cook day");
  assert.equal(getBatchWindow(new Date(2026, 10, 2)).days, 4, "earlier batches are unchanged");
  // Today Wednesday 11/4: the 2 left days merge with the next batches and re-split into 3-day batches.
  setBatchCalendar(new Date(2026, 10, 4), new Date(2026, 10, 15));
  assert.deepEqual([4, 7, 10, 13].map((day) => getBatchWindow(new Date(2026, 10, day)).days), [3, 3, 3, 3]);
  // Today Saturday 11/7: the 2 left days merge with Mon-Thu (6) and split into 3 + 3.
  setBatchCalendar(new Date(2026, 10, 7), new Date(2026, 10, 15));
  assert.deepEqual([7, 10, 13].map((day) => getBatchWindow(new Date(2026, 10, day)).days), [3, 3, 3]);
  for (let offset = 0; offset < 14; offset += 1) {
    const today = new Date(2026, 10, 2 + offset);
    setBatchCalendar(today, new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30));
    for (let day = 0; day <= 30; day += 1) {
      const window = getBatchWindow(new Date(today.getFullYear(), today.getMonth(), today.getDate() + day));
      assert.ok(window.days >= 3 && window.days <= 4, "every calendar batch covers 3-4 days");
    }
  }
  setBatchCalendar(undefined, undefined);
}
assert.equal(getBatchPrep(new Date(2026, 10, 6), batchPreferences, {}, "DE", new Date(2026, 10, 2), new Date(2026, 10, 7)).days, 2,
  "a batch is clipped to the last calendar day");
assert.equal(getBatchPrep(new Date(2026, 10, 5), batchPreferences, {}, "DE", new Date(2026, 10, 7)).startDate, "2026-11-02",
  "past dates keep their original batch prep day");
const batchShopping = buildShoppingEstimate(new Date(2026, 10, 2), new Date(2026, 10, 5), batchPreferences, {}, "DE");
assert.ok(prep.items.every((item) => batchShopping.items.some((entry) => entry.name === item.name)),
  "the shopping list aggregates the batch components");

// Translations.
const batchTitles = new Set();
const batchIngredientNames = new Set();
for (let weekOffset = 0; weekOffset < 12; weekOffset += 1) {
  for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
    const date = new Date(2026, 10, 2 + weekOffset * 7 + dayOffset);
    for (const prefs of [
      { ...batchPreferences, meatPerWeek: 7 }, { ...batchPreferences, meatPerWeek: 0 },
      { ...batchPreferences, meatPerWeek: 3, weeklyBudget: "0" },
      { ...batchPreferences, bannedIngredients: ["lentils-dry", "carrot"] }
    ]) {
      getPersonalizedDayPlan(date, prefs).meals.filter((meal) => meal.batch).forEach((meal) => {
        batchTitles.add(meal.title);
        meal.description.split("·").forEach((part) => batchIngredientNames.add(part.trim()));
        meal.ingredients.forEach((ingredient) => batchIngredientNames.add(ingredient.name));
      });
    }
  }
}
for (const title of batchTitles) {
  for (const language of ["fr", "de", "es", "ru", "pl"]) {
    assert.ok(hasFoodTranslation(title) || translateTitle(title, language) !== title,
      `batch title "${title}" is translated to ${language}`);
  }
}
assert.deepEqual([...batchIngredientNames].filter((name) => name && !hasFoodTranslation(name)), [],
  "every batch ingredient and description part has a translation");
assert.equal(translateTitle("Rice & lentils bowl", "fr"), "Bol: Riz & lentilles",
  "generated batch bowl titles are composed from translated foods");
assert.equal(translateTitle("Rice & lentils bowl", "ru"), "Боул: Рис & чечевица");

// Budget plan.
{
  const { getBudgetPlan } = require("../src/budgetPlan.ts");
  const goalsFor = (goal) => Object.fromEntries(dateKeys.map((key) => [key, goal]));
  const soft = { ...preferences, weeklyBudget: "300" };
  const plan = (prefs, goal = 2000) => getBudgetPlan(today, prefs, goalsFor(goal), "DE");
  assert.equal(plan(soft).status, "ok", "a comfortable budget needs no compromise");
  assert.deepEqual(plan(soft).sacrificed, []);
  assert.equal(plan({ ...soft, weeklyBudget: "" }).status, "off", "a blank budget is not enforced");
  assert.equal(plan({ ...soft, weeklyBudget: "0" }).status, "off", "a zero budget is not enforced");

  for (const goal of [1500, 2000, 2800]) {
    const tight = { ...soft, weeklyBudget: "20", fruitPreference: "include", meatPerWeek: 7, planStyle: "highProtein" };
    const result = plan(tight, goal);
    assert.ok(["compromised", "impossible"].includes(result.status), `a tight budget needs compromises at ${goal} kcal`);
    assert.ok(result.sacrificed.length > 0, `compromises are reported at ${goal} kcal`);
    const cost = buildSevenDayShoppingEstimate(today, result.preferences, goalsFor(goal), "DE").estimatedTotal.amountMinorUnits;
    assert.equal(result.weeklyCost, cost, "the reported cost matches the generated plan");
    if (result.status === "compromised") assert.ok(result.weeklyCost <= result.budget, "a compromised plan fits the budget");
    getSevenCalendarDayPlans(today, result.preferences, goalsFor(goal), "DE").forEach((day) => {
      assert.ok(day.length > 0, "every day still has meals");
      assert.ok(Math.abs(getDailyCalories(day) - goal) <= goal * 0.02, `calories stay at the ${goal} kcal goal`);
    });
  }

  const impossible = plan({ ...soft, weeklyBudget: "5" });
  assert.equal(impossible.status, "impossible", "a budget below the cheapest plan is reported as impossible");
  assert.ok(impossible.weeklyCost > impossible.budget, "the cheapest achievable cost is reported");
  assert.ok(getSevenCalendarDayPlans(today, impossible.preferences, goalsFor(2000), "DE").every((day) => day.length > 0),
    "an impossible budget still produces a plan");
}

console.log("Domain checks passed: seven-day calendar shopping aggregation, applied portions, modeled country pricing, currency formatting, and navigation contracts.");
