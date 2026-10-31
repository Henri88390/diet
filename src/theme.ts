export const palette = {
  ink: "#20251F",
  muted: "#686F64",
  paper: "#F7F7F2",
  white: "#FFFFFF",
  green: "#315B43",
  softGreen: "#E5EEE5",
  line: "#EAECE5",
  orange: "#F4E5D5"
};

export const mealAccent = {
  Breakfast: "#F5E9CE",
  Lunch: "#E0EBDE",
  Dinner: "#F0E2D9",
  Snack: "#E9E5F3"
} as const;

export const mealTypeIcon = { Breakfast: "🌅", Lunch: "☀️", Dinner: "🌙", Snack: "🍎" } as const;

export const mealBadge = {
  Breakfast: { background: "#F8E8B8", text: "#7A5A0E" },
  Lunch: { background: "#CFE5CB", text: "#2B5A33" },
  Dinner: { background: "#F2D4C3", text: "#8A4222" },
  Snack: { background: "#DDD5F0", text: "#54418A" }
} as const;
