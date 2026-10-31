# Meal Planner

This is an Expo + React Native sample meal-planning app. It has local food
preferences, a calendar with selectable meal counts, editable portion targets,
and a combined shopping list. The default is three meals and 2,000 kcal per
day; two meals keeps breakfast and dinner, while four or five meals adds one or
two snacks. Preference, calendar, grocery, and portion state are held in memory
and reset when the app restarts.

The shopping list defaults to seven local calendar dates beginning today,
including today, and lets the user choose a different start and end date.
Ranges are limited to 90 days. It uses the personalized meals shown by the
calendar and any portion updates saved for those dates. Ingredient amounts are
aggregated into shopping categories and converted to larger units where
appropriate (for example, grams to kilograms); the displayed total is the sum
of modeled ingredient line costs. It is a portion-cost estimate, not the
checkout cost of buying full packages.

The country selector supports Germany, France, Spain, Italy, the Netherlands,
Belgium, Austria, Poland, the United Kingdom, the United States, and Australia.
It updates currency and the modeled prices shown on both meal details and the
shopping list. All listed markets use a shared synthetic ingredient-rate model
with illustrative country multipliers. Poland's multiplier was adjusted to
address the user's reported examples of roughly PLN 12 for 300 g of chicken
breast and 9.5 eggs. This is a user-provided sanity check, not an independently
verified Lidl price. Other ingredient/country rates, including US and Australian
rates, remain unverified synthetic assumptions; they are not retailer quotes,
researched local price indices, or verified Lidl prices. No live retailer data
is used. Values should not be presented as researched country prices.

## Run locally

```sh
npm install
npm start
```

Use the Expo CLI prompts to open the app on an Android or iOS simulator/device.
`npm run typecheck` checks the TypeScript project. `npm run check:domain` runs
targeted checks for date-range ingredient aggregation, today-inclusive default
bounds, applied portions, country/currency formatting, and navigation contracts.

## Scope and nutrition note

Meal, ingredient, calorie, and price information is illustrative sample data,
not verified recipe nutrition, live prices, or medical guidance. Ingredient
amounts are modeled from sample recipes and can change when a daily calorie
goal is applied. Country price adjustments apply to modeled per-gram,
per-millilitre, or per-item assumptions; costs are rounded to the currency's
minor unit. They do not account for package sizes, package waste, promotions,
or store availability. The selected currency is displayed using a shared
`Money` contract containing integer minor units and an ISO currency code.

The user may swipe between the adjacent Preferences → Calendar → Grocery
screens in either direction; transitions animate in the swipe direction, or
users can use the existing screen actions. The calendar
date strip retains its own horizontal scrolling and is excluded from page
swipe recognition. Navigation uses React Native's built-in responder and
animation APIs; no gesture or router dependency is added.

Meal examples are deterministic copies of sample calendar data personalized
from the selected meal count, plan style, weekly budget, banned ingredients,
meat/fish, dairy, and fruit preferences. Style choices favor higher-protein
foods, lower modeled costs, a wider rotation of legumes, or a small shared
ingredient set for simpler meals and groceries. A budget below the
modeled weekly estimate triggers lower-cost ingredient choices, but is a target
and is not guaranteed: estimates are not current retailer prices. Ingredient
bans are honored when a suitable listed substitute is available; meals with
no suitable remaining replacement are explicitly flagged. Calorie updates are
applied to every date in the visible planning window. Main meals are divided
nearly evenly, with snacks receiving a smaller share, while preserving the
requested daily total. Unapplied plans use the 2,000 kcal default. The sample
does not calculate personalized nutrition or validate dietary needs.
The optional typical breakfast can keep the existing varied breakfast plan,
repeat a sample preset, or use a custom in-memory ingredient list. Meal and daily
protein figures are modeled from illustrative per-ingredient protein rates and
scale with portions; they are not verified nutrition data or dietary guidance.
Standard typical-breakfast presets use larger sample portions. Selecting a
repeating breakfast disables the automatic fruit addition to that meal and
takes precedence over fruit and dairy frequency preferences. Ingredient bans
still apply.
The protein catalog includes poultry, canned fish, beef and pork mince, and a
modeled frozen minced beef option for lower-cost substitutions. Its costs and
availability are illustrative assumptions, not verified supermarket data.

## App structure

The Expo entry remains the root `App.tsx`, with app-level state and screen
composition there. Preference, calendar, and grocery screens, reusable
calendar-date, meal-card, meal-detail, and shopping-list components, shared
country/currency helpers, and local plan/date helpers live under `src/`.
There is no backend or database in this starter.
