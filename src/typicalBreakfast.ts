import type { TypicalBreakfastIngredient } from "./models";

export type TypicalBreakfastPreset = {
  id: string;
  label: string;
  title: string;
  description: string;
  emoji: string;
  ingredients: TypicalBreakfastIngredient[];
};

export const typicalBreakfastPresets: TypicalBreakfastPreset[] = [
  {
    id: "oatmeal-milk",
    label: "Oatmeal + milk",
    title: "Oatmeal with milk",
    description: "Rolled oats · milk",
    emoji: "🥣",
    ingredients: [
      { name: "Rolled oats", quantity: "100", unit: "g" },
      { name: "Milk", quantity: "400", unit: "ml" }
    ]
  },
  {
    id: "bread-jam",
    label: "Bread + jam",
    title: "Bread with jam",
    description: "Bread · jam",
    emoji: "🍞",
    ingredients: [
      { name: "Bread", quantity: "5", unit: "slices" },
      { name: "Jam", quantity: "40", unit: "g" },
      { name: "Milk", quantity: "100", unit: "ml" }
    ]
  },
  {
    id: "yogurt-fruit-oats",
    label: "Yogurt, fruit + oats",
    title: "Yogurt, fruit & oats",
    description: "Plain yogurt · banana · rolled oats",
    emoji: "🍌",
    ingredients: [
      { name: "Plain yogurt", quantity: "250", unit: "g" },
      { name: "Banana", quantity: "1", unit: "medium" },
      { name: "Rolled oats", quantity: "95", unit: "g" },
      { name: "Honey", quantity: "1", unit: "tsp" }
    ]
  },
  {
    id: "eggs-toast",
    label: "Eggs + toast",
    title: "Eggs on toast",
    description: "Eggs · bread",
    emoji: "🍳",
    ingredients: [
      { name: "Eggs", quantity: "3", unit: "large" },
      { name: "Bread", quantity: "4", unit: "slices" },
      { name: "Milk", quantity: "80", unit: "ml" }
    ]
  }
];

export const customBreakfastIngredientOptions: Array<TypicalBreakfastIngredient & { key: string }> = [
  { key: "oats", name: "Rolled oats", quantity: "50", unit: "g" },
  { key: "milk", name: "Milk", quantity: "200", unit: "ml" },
  { key: "bread", name: "Bread", quantity: "2", unit: "slices" },
  { key: "jam", name: "Jam", quantity: "20", unit: "g" },
  { key: "eggs", name: "Eggs", quantity: "2", unit: "large" },
  { key: "yogurt", name: "Plain yogurt", quantity: "150", unit: "g" },
  { key: "banana", name: "Banana", quantity: "1", unit: "medium" },
  { key: "berries", name: "Frozen berries", quantity: "75", unit: "g" },
  { key: "red-beans", name: "Red beans, drained", quantity: "100", unit: "g" },
  { key: "hummus", name: "Hummus", quantity: "1", unit: "tbsp" },
  { key: "honey", name: "Honey", quantity: "1", unit: "tsp" },
  { key: "chia", name: "Chia seeds", quantity: "1", unit: "tbsp" },
  { key: "apple", name: "Apple", quantity: "1", unit: "medium" },
  { key: "skyr", name: "Skyr", quantity: "150", unit: "g" }
];
