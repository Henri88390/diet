import type { Meal } from "./models";

/** Batch generation may vary meal copy while reusing the underlying recipe identity. */
export function getMenuMealGroupKey(meal: Meal): string {
  if (!meal.batch) return meal.recipeKey;
  const ingredientSignature = meal.ingredients
    .map(({ name, quantity, unit }) => `${name}:${quantity}:${unit}`)
    .join("|");
  return `${meal.recipeKey}|${meal.title}|${ingredientSignature}`;
}
