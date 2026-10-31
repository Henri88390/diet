import type { MealPreferences } from "./models";
import type { CountryCode } from "./countryPricing";
import { buildSevenDayShoppingEstimate } from "./groceryEstimate";

export type BudgetSacrifice = "swaps" | "fruit" | "meat" | "dairy" | "protein" | "breakfast" | "variety";

export type BudgetPlan = {
  /** "off" when the budget isn't a positive number. */
  status: "off" | "ok" | "compromised" | "impossible";
  sacrificed: BudgetSacrifice[];
  /** Weekly cost (minor units) of the plan that is actually generated. */
  weeklyCost: number;
  /** Budget in minor units; 0 when off. */
  budget: number;
  /** Preferences to generate the plan from: the user's, adjusted by the compromises. */
  preferences: MealPreferences;
};

export type BudgetWarning = {
  budget: number;
  weeklyCost: number;
};

type LadderStep = {
  sacrifice: BudgetSacrifice;
  apply: (preferences: MealPreferences) => MealPreferences | null;
};

/** Compromises ordered from least to most painful; each is only kept if it lowers the weekly cost. */
const ladder: LadderStep[] = [
  { sacrifice: "fruit", apply: (p) => (p.fruitPreference === "avoid" ? null : { ...p, fruitPreference: "avoid" }) },
  { sacrifice: "meat", apply: (p) => (p.meatPerWeek > 3 ? { ...p, meatPerWeek: 3 } : null) },
  { sacrifice: "meat", apply: (p) => (p.meatPerWeek > 1 ? { ...p, meatPerWeek: 1 } : null) },
  { sacrifice: "meat", apply: (p) => (p.meatPerWeek > 0 ? { ...p, meatPerWeek: 0 } : null) },
  { sacrifice: "dairy", apply: (p) => (p.dairyPerWeek > 3 ? { ...p, dairyPerWeek: 3 } : null) },
  { sacrifice: "dairy", apply: (p) => (p.dairyPerWeek > 1 ? { ...p, dairyPerWeek: 1 } : null) },
  { sacrifice: "protein", apply: (p) => (p.planStyle === "highProtein" ? { ...p, planStyle: "lowCost" } : null) },
  { sacrifice: "variety", apply: (p) => (p.planStyle === "balanced" ? { ...p, planStyle: "lowCost" } : null) },
  { sacrifice: "protein", apply: (p) => ((p.budgetRelaxation ?? 0) < 1 ? { ...p, budgetRelaxation: 1 } : null) },
  { sacrifice: "breakfast", apply: (p) => (p.typicalBreakfast.mode !== "none" ? { ...p, typicalBreakfast: { mode: "none" } } : null) },
  { sacrifice: "variety", apply: (p) => ((p.budgetRelaxation ?? 0) < 2 ? { ...p, budgetRelaxation: 2 } : null) }
];

// Roughly 1 EUR per tap; PLN is 5 by request.
const BUDGET_STEPS: Record<string, number> = { EUR: 1, PLN: 5, GBP: 1, USD: 1, AUD: 2 };

export function getBudgetStep(currencyCode: string): number {
  return BUDGET_STEPS[currencyCode] ?? 1;
}

/** Moves the typed weekly budget by delta (never below 0); a blank or invalid input counts as 0. */
export function stepBudget(budgetInput: string, delta: number): string {
  const current = Number(budgetInput.trim().replace(",", "."));
  const base = Number.isFinite(current) ? current : 0;
  return String(Math.max(0, Math.round((base + delta) * 100) / 100));
}

export function parseBudgetMinorUnits(budgetInput: string): number | null {
  const amount = Number(budgetInput.trim().replace(",", "."));
  return Number.isFinite(amount) && amount > 0 ? Math.round(amount * 100) : null;
}

/**
 * Find the least painful set of compromises that keeps the 7-day shopping total
 * within budget at the applied calorie goals. If nothing fits, the cheapest plan
 * found is returned with status "impossible".
 */
export function getBudgetPlan(
  today: Date,
  preferences: MealPreferences,
  appliedGoals: Record<string, number>,
  countryCode: CountryCode
): BudgetPlan {
  const budget = parseBudgetMinorUnits(preferences.weeklyBudget);
  if (budget === null) {
    return { status: "off", sacrificed: [], weeklyCost: 0, budget: 0, preferences };
  }
  const costOf = (candidate: MealPreferences): number =>
    buildSevenDayShoppingEstimate(today, candidate, appliedGoals, countryCode).estimatedTotal.amountMinorUnits;

  // Without any budget fitting: if this already fits, nothing needs to be sacrificed.
  const unfitted: MealPreferences = { ...preferences, weeklyBudget: "", budgetRelaxation: 0 };
  const unfittedCost = costOf(unfitted);
  if (unfittedCost <= budget) {
    return { status: "ok", sacrificed: [], weeklyCost: unfittedCost, budget, preferences: unfitted };
  }

  const sacrificed = new Set<BudgetSacrifice>();
  let current: MealPreferences = { ...preferences, budgetRelaxation: 0 };
  let cost = costOf(current);
  if (cost !== unfittedCost) sacrificed.add("swaps");

  for (const step of ladder) {
    if (cost <= budget) break;
    const next = step.apply(current);
    if (!next) continue;
    const nextCost = costOf(next);
    if (nextCost >= cost) continue;
    current = next;
    cost = nextCost;
    sacrificed.add(step.sacrifice);
  }

  const status = cost > budget ? "impossible" : sacrificed.size > 0 ? "compromised" : "ok";
  return { status, sacrificed: [...sacrificed], weeklyCost: cost, budget, preferences: current };
}
