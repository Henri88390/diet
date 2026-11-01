import type { Meal } from "./models";

/** Batch generation may vary meal copy while reusing the underlying recipe identity. */
export function getMenuMealGroupKey(meal: Meal): string {
  const ingredientSignature = meal.ingredients
    .map(({ name, quantity, unit }) => `${name}:${quantity}:${unit}`)
    .join("|");
  if (meal.batch) return `${meal.recipeKey}|${meal.title}|${ingredientSignature}`;
  // Preserve legacy grouping when bans did not change this meal's ingredients.
  return meal.ingredientBanAdjusted
    ? `${meal.recipeKey}|ingredients|${ingredientSignature}`
    : meal.recipeKey;
}
