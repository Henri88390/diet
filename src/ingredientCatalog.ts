import type { IngredientCategoryGroup, IngredientOption } from "./models";

export const ingredientCatalog: IngredientOption[] = [
  { id: "apple", name: "Apple", category: "Fruit", matches: ["apple"] },
  { id: "banana", name: "Banana", category: "Fruit", matches: ["banana"] },
  { id: "frozen-berries", name: "Frozen berries", category: "Fruit", matches: ["frozen berries"] },
  { id: "orange", name: "Orange", category: "Fruit", matches: ["orange"] },
  { id: "pear", name: "Pear", category: "Fruit", matches: ["pear"], excludes: ["pearl"] },
  { id: "raisins", name: "Raisins", category: "Fruit", matches: ["raisins"] },
  { id: "bell-pepper", name: "Bell pepper", category: "Vegetables", matches: ["bell pepper"] },
  { id: "broccoli", name: "Broccoli", category: "Vegetables", matches: ["broccoli"] },
  { id: "cabbage", name: "Cabbage", category: "Vegetables", matches: ["cabbage"] },
  { id: "carrot", name: "Carrot", category: "Vegetables", matches: ["carrot"] },
  { id: "cucumber", name: "Cucumber", category: "Vegetables", matches: ["cucumber"] },
  { id: "frozen-peas", name: "Frozen peas", category: "Vegetables", matches: ["frozen peas"] },
  { id: "frozen-vegetables", name: "Frozen mixed vegetables", category: "Vegetables", matches: ["frozen mixed vegetables"] },
  { id: "green-beans", name: "Green beans", category: "Vegetables", matches: ["green beans"] },
  { id: "leafy-greens", name: "Spinach and leafy greens", category: "Vegetables", matches: ["baby spinach", "leafy greens"] },
  { id: "lettuce", name: "Lettuce", category: "Vegetables", matches: ["lettuce"] },
  { id: "mushrooms", name: "Mushrooms", category: "Vegetables", matches: ["mushrooms"] },
  { id: "onion", name: "Onion", category: "Vegetables", matches: ["onion"] },
  { id: "potato", name: "Potato", category: "Vegetables", matches: ["potato"] },
  { id: "sweet-potato", name: "Sweet potato", category: "Vegetables", matches: ["sweet potato"] },
  { id: "sweetcorn", name: "Sweetcorn", category: "Vegetables", matches: ["sweetcorn"] },
  { id: "tomato", name: "Tomato", category: "Vegetables", matches: ["tomato"] },
  { id: "zucchini", name: "Zucchini", category: "Vegetables", matches: ["zucchini", "courgette"] },
  { id: "garlic", name: "Garlic", category: "Pantry & seasonings", matches: ["garlic"] },
  { id: "chicken-breast", name: "Chicken breast", category: "Protein", matches: ["chicken breast"] },
  { id: "chicken-thigh", name: "Chicken thigh", category: "Protein", matches: ["chicken thigh"] },
  { id: "cooked-chicken", name: "Cooked chicken", category: "Protein", matches: ["cooked chicken"] },
  { id: "beef-mince", name: "Beef mince", category: "Protein", matches: ["beef mince", "ground beef"] },
  { id: "frozen-beef-mince", name: "Frozen minced beef", category: "Protein", matches: ["frozen minced beef", "frozen ground beef"] },
  { id: "pork-mince", name: "Pork mince", category: "Protein", matches: ["pork mince", "ground pork"] },
  { id: "canned-sardines", name: "Canned sardines", category: "Protein", matches: ["canned sardines"] },
  { id: "canned-tuna", name: "Canned tuna", category: "Protein", matches: ["canned tuna"] },
  { id: "frozen-white-fish", name: "Frozen white fish", category: "Protein", matches: ["frozen white fish"] },
  { id: "tofu", name: "Tofu", category: "Protein", matches: ["tofu"] },
  { id: "egg", name: "Eggs", category: "Dairy & eggs", matches: ["egg"] },
  { id: "cottage-cheese", name: "Cottage cheese", category: "Dairy & eggs", matches: ["cottage cheese"] },
  { id: "milk", name: "Milk", category: "Dairy & eggs", matches: ["milk"] },
  { id: "plain-yogurt", name: "Plain yogurt", category: "Dairy & eggs", matches: ["plain yogurt"] },
  { id: "skyr", name: "Skyr", category: "Dairy & eggs", matches: ["skyr"] },
  { id: "cheddar", name: "Cheddar", category: "Dairy & eggs", matches: ["cheddar"] },
  { id: "mozzarella", name: "Mozzarella", category: "Dairy & eggs", matches: ["mozzarella"] },
  { id: "parmesan", name: "Parmesan", category: "Dairy & eggs", matches: ["parmesan"] },
  { id: "butter", name: "Butter", category: "Dairy & eggs", matches: ["butter"], excludes: ["peanut butter"] },
  { id: "oats", name: "Rolled oats", category: "Grains & bakery", matches: ["rolled oats"] },
  { id: "bread", name: "Bread", category: "Grains & bakery", matches: ["bread", "roll"] },
  { id: "wrap", name: "Wrap", category: "Grains & bakery", matches: ["wrap"] },
  { id: "basmati-rice", name: "Basmati rice", category: "Grains & bakery", matches: ["basmati rice"] },
  { id: "brown-rice", name: "Brown rice", category: "Grains & bakery", matches: ["brown rice"] },
  { id: "couscous", name: "Couscous", category: "Grains & bakery", matches: ["couscous"] },
  { id: "pasta", name: "Pasta", category: "Grains & bakery", matches: ["pasta"] },
  { id: "chickpeas", name: "Chickpeas", category: "Legumes", matches: ["chickpeas, drained"] },
  { id: "hummus", name: "Hummus", category: "Legumes", matches: ["hummus"] },
  { id: "black-beans", name: "Black beans", category: "Legumes", matches: ["black beans, drained"] },
  { id: "red-beans", name: "Red beans", category: "Legumes", matches: ["red beans, drained"] },
  { id: "white-beans", name: "White beans", category: "Legumes", matches: ["white beans, drained"] },
  { id: "lentils-dry", name: "Lentils (dry)", category: "Legumes", matches: ["lentils, dry"] },
  { id: "olive-oil", name: "Olive oil", category: "Pantry & seasonings", matches: ["olive oil"] },
  { id: "sunflower-oil", name: "Sunflower oil", category: "Pantry & seasonings", matches: ["sunflower oil"] },
  { id: "rapeseed-oil", name: "Rapeseed (canola) oil", category: "Pantry & seasonings", matches: ["rapeseed oil", "canola oil"] },
  { id: "peanut-oil", name: "Peanut oil", category: "Pantry & seasonings", matches: ["peanut oil"] },
  { id: "coconut-oil", name: "Coconut oil", category: "Pantry & seasonings", matches: ["coconut oil"] },
  { id: "sesame-oil", name: "Sesame oil", category: "Pantry & seasonings", matches: ["sesame oil"] },
  { id: "vegetable-oil", name: "Vegetable oil", category: "Pantry & seasonings", matches: ["vegetable oil"] },
  { id: "vegetable-stock", name: "Vegetable stock", category: "Pantry & seasonings", matches: ["vegetable stock"] },
  { id: "soy-sauce", name: "Soy sauce", category: "Pantry & seasonings", matches: ["soy sauce"] },
  { id: "mustard", name: "Mustard", category: "Pantry & seasonings", matches: ["mustard"] },
  { id: "vinegar", name: "Vinegar", category: "Pantry & seasonings", matches: ["vinegar"] },
  { id: "salt", name: "Salt", category: "Pantry & seasonings", matches: ["salt"], excludes: ["unsalted"] },
  { id: "black-pepper", name: "Black pepper", category: "Pantry & seasonings", matches: ["black pepper"] },
  { id: "paprika", name: "Ground paprika", category: "Pantry & seasonings", matches: ["ground paprika"] },
  { id: "curry-powder", name: "Curry powder", category: "Pantry & seasonings", matches: ["curry powder"] },
  { id: "dried-herbs", name: "Dried herbs", category: "Pantry & seasonings", matches: ["dried herbs"] },
  { id: "cinnamon", name: "Ground cinnamon", category: "Pantry & seasonings", matches: ["ground cinnamon"] },
  { id: "lemon-juice", name: "Lemon juice", category: "Pantry & seasonings", matches: ["lemon juice"] },
  { id: "salsa", name: "Salsa", category: "Pantry & seasonings", matches: ["salsa"] },
  { id: "chives", name: "Chives", category: "Pantry & seasonings", matches: ["chives"] },
  { id: "flour", name: "Flour", category: "Pantry & seasonings", matches: ["flour"] },
  { id: "baking-powder", name: "Baking powder", category: "Pantry & seasonings", matches: ["baking powder"] },
  { id: "honey", name: "Honey", category: "Pantry & seasonings", matches: ["honey"] },
  { id: "jam", name: "Jam", category: "Pantry & seasonings", matches: ["jam"] },
  { id: "sugar", name: "Sugar", category: "Pantry & seasonings", matches: ["sugar"] },
  { id: "peanut-butter", name: "Peanut butter", category: "Pantry & seasonings", matches: ["peanut butter"] },
  { id: "chia-seeds", name: "Chia seeds", category: "Pantry & seasonings", matches: ["chia seeds"] },
  { id: "sunflower-seeds", name: "Sunflower seeds", category: "Pantry & seasonings", matches: ["sunflower seeds"] },
  { id: "peanuts", name: "Peanuts", category: "Pantry & seasonings", matches: ["peanuts"] },
  { id: "water", name: "Water", category: "Pantry & seasonings", matches: ["water"] }
];

export const ingredientCategoryOrder: IngredientCategoryGroup[] = [
  "Fruit", "Vegetables", "Protein", "Dairy & eggs", "Grains & bakery",
  "Legumes", "Pantry & seasonings"
];

/** Eggs and fruit are counted as whole pieces in the kitchen, so they are never split. */
export function isWholePieceIngredient(name: string): boolean {
  const normalized = name.toLowerCase();
  return /\beggs?\b/.test(normalized) || ingredientCatalog.some((option) =>
    option.category === "Fruit" && matchingTerms(option, normalized).length > 0
  );
}

function matchingTerms(option: IngredientOption, normalized: string): string[] {
  if (option.excludes?.some((term) => normalized.includes(term))) return [];
  return option.matches.filter((match) => normalized.includes(match.toLowerCase()));
}

export function isIngredientBanned(name: string, bannedIds: string[]): boolean {
  const normalized = name.toLowerCase();
  return ingredientCatalog.some((option) =>
    bannedIds.includes(option.id) && matchingTerms(option, normalized).length > 0
  );
}

/** Prefer the most specific match (e.g. sweet potato over potato). */
export function getIngredientCatalogId(name: string, allowedIds?: string[]): string | undefined {
  const normalized = name.toLowerCase();
  return ingredientCatalog.flatMap((option) =>
    allowedIds && !allowedIds.includes(option.id) ? [] : matchingTerms(option, normalized)
      .map((match) => ({ id: option.id, length: match.length }))
  ).sort((a, b) => b.length - a.length || a.id.localeCompare(b.id))[0]?.id;
}
