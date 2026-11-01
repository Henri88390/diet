export type Translation = { [key: string]: string | Translation };

export const en: Translation = {
  common: {
    cancel: "Cancel",
    kcal: "kcal",
    language: "Language",
    languageA11y: "Language: {{language}}. Change",
    languageOption: "Language: {{language}}"
  },
  tabs: {
    preferences: "Preferences",
    meals: "Meals",
    menu: "Menu",
    groceries: "Groceries"
  },
  mealType: {
    Breakfast: "Breakfast",
    Lunch: "Lunch",
    Dinner: "Dinner",
    Snack: "Snack"
  },
  snackSlot: {
    Morning: "Morning",
    Afternoon: "Afternoon"
  },
  snackLabel: "{{slot}} snack",
  planStyle: {
    balanced: "Balanced",
    highProtein: "Higher protein",
    lowCost: "Lower cost",
    batchCooking: "Batch cooking",
    batchCookingDesc: "Cook a few base ingredients once, then reuse them for lunches and dinners over 3–4 days."
  },
  batch: {
    note: "Batch cooking · from your batch prep",
    prepTitle: "Batch prep",
    prepSubtitle_one: "Cook on {{day}} · covers {{count}} day",
    prepSubtitle_other: "Cook on {{day}} · covers {{count}} days",
    prepToday_one: "Cook today · covers {{count}} day",
    prepToday_other: "Cook today · covers {{count}} days",
    raw: "raw",
    cooked: "pre-cooked"
  },
  mealsPerDay: {
    "2": "2 meals",
    "3": "3 meals",
    "4": "3 meals + 1 snack",
    "5": "3 meals + 2 snacks"
  },
  prefs: {
    planStyle: "Meal plan style",
    planStyleA11y: "Meal plan style: {{label}}",
    budget: "Weekly food budget",
    budgetDecrease: "Decrease weekly budget",
    budgetIncrease: "Increase weekly budget",
    budgetError: "Enter a non-negative amount or leave the budget blank.",
    meatFish: "Meat / fish",
    dairy: "Dairy",
    perWeek: "{{title}} per week",
    never: "Never",
    everyDay: "Every day",
    timesPerWeek: "{{count}} / wk",
    freqNever: "{{title}}: never",
    freqEveryDay: "{{title}}: every day",
    freqTimes: "{{title}}: {{count}} times per week",
    typicalBreakfast: "Typical breakfast",
    noFixedBreakfast: "No fixed breakfast",
    presetA11y: "Typical breakfast preset: {{label}}",
    customBreakfast: "Custom breakfast",
    buildBreakfast: "Build your usual breakfast",
    addIngredient: "+ {{name}}",
    addIngredientA11y: "Add {{name}} to custom breakfast",
    quantityA11y: "{{name}} quantity",
    removeA11y: "Remove {{name}}",
    checkQuantities: "Check quantities",
    quantityError: "Add an ingredient and enter a positive quantity for each item.",
    mealsPerDay: "Meals per day",
    mealsPerDayA11y: "Meals per day: {{label}}",
    fruit: "Fruit",
    fruitInclude: "Include with meals",
    fruitOptional: "Optional",
    fruitAvoid: "Avoid fruit",
    fruitA11y: "Fruit preference: {{label}}",
    country: "Country and currency",
    countryA11y: "Country: {{country}}, currency {{currency}}",
    banIngredients: "Ban ingredients",
    ban: "Ban {{name}}",
    unban: "Unban {{name}}"
  },
  calendar: {
    goToToday: "Go to today",
    todayHint: "Selects today's meal plan and brings today into view",
    today: "Today",
    budgetWarning: "Budget too low: lowest possible budget is {{cost}} per week.",
    budgetCompromised: "To stay within your weekly budget, some compromises were made.",
    decrease: "Decrease calorie goal by 100",
    increase: "Increase calorie goal by 100",
    goalLabel: "Daily calorie goal",
    goalHint: "Enter a whole number from {{min}} to {{max}} kilocalories",
    goalError: "Enter a whole-number goal from 500 to 10,000 kcal.",
    emptyTitle: "A little room to improvise",
    emptyCopy: "No meals planned for this day yet. Pick another day to see meal ideas.",
    planningDates: "Planning dates",
    dateHint: "Selects this date to view its meal plan"
  },
  mealActions: {
    replace: "Replace", ban: "Ban meal", scopeTitle: "Choose how to replace", thisDay: "This day only", allOccurrences: "All occurrences",
    replaced: "Replaced", revert: "Revert this day", batchUnavailable: "Batch-cooked meals cannot be changed here.", typicalUnavailable: "Your typical breakfast is managed in Preferences."
  },
  picker: {
    scopeTitle: "Choose how to replace", banTitle: "Choose a substitute", replaceTitle: "Choose a replacement", thisDay: "This day only", allOccurrences: "All occurrences",
    automatic: "Similar calories (automatic)", automaticHint: "The closest available recipe by calories will be used.", noAlternatives: "No alternatives available.", confirmTitle: "Confirm replacement", confirmBanTitle: "Confirm ban", confirmDay: "Replace {{current}} with {{substitute}} on this day only?", confirmAll: "Replace every occurrence of {{current}} with {{substitute}}?", confirmBan: "Ban {{current}} and replace it everywhere with {{substitute}}?", confirmBanAuto: "Ban {{current}} and replace it everywhere with the recipe closest in calories?", confirmAction: "Replace", confirmBanAction: "Ban and replace", back: "Back"
  },
  menu: {
    title: "Menu", empty: "No meals are planned in this date range.", occurrences: "\u00d7{{count}}", showAll: "Show all", showLess: "Show less",
    ban: "Ban", replaceAll: "Replace all", batchUnavailable: "Batch-cooked meals cannot be changed here.", typicalUnavailable: "Your typical breakfast is managed in Preferences.", bannedTitle: "Banned meals",
    substitute: "\u2192 {{name}}", unban: "Unban", unbanConfirmTitle: "Unban meal?", unbanConfirmMessage: "{{name}} will be available again in your plan.", noBanned: "No banned meals."
  },
  meal: {
    a11y: "{{label}}: {{title}}, {{calories}} kilocalories, {{protein}} grams protein",
    hint: "Opens meal details and illustrative ingredient quantities",
    kcalChip: "{{value}} kcal",
    proteinChip: "{{value}} g protein",
    banned: "Needs a replacement for banned: {{list}}"
  },
  details: {
    eyebrow: "{{label}} · SAMPLE MEAL",
    close: "Close meal details",
    kcal: "kcal",
    protein: "protein",
    estCost: "est. cost",
    banWarning: "No allowed substitute was found for: {{list}}. Review the bans or choose another meal.",
    mainIngredients: "Main ingredients",
    mainHelper: "Core foods for this sample portion",
    seasonings: "Seasonings & cooking additions",
    seasoningsHelper: "Shown separately from the main ingredients",
    total: "Total",
    totalValue: "{{kcal}} kcal · {{protein}} g protein · ~{{cost}}",
    disclaimer: "Nutrition and costs use modeled ingredient quantities and unit estimates; scaled calorie values are reconciled to the selected daily goal. Costs are rounded to the nearest minor currency unit, so a very small positive portion may display as zero. Portions and values are illustrative, not verified recipe amounts, regional prices, nutrition guidance, or medical advice."
  },
  grocery: {
    title: "Shopping list",
    startDate: "Start date",
    endDate: "End date",
    dateA11y: "{{label}}: {{date}}. Change date",
    days_one: "{{count}} day",
    days_other: "{{count}} days",
    weeklyList: "weekly list",
    selectedRange: "selected date range",
    estimatedTotal: "Estimated total",
    progress: "{{checked}} of {{total}} bought",
    reset: "Reset",
    resetA11y: "Uncheck all shopping list items",
    empty: "No ingredients are planned for these dates yet.",
    previousMonth: "Previous month",
    nextMonth: "Next month",
    category: {
      "Fruit": "Fruit",
      "Vegetables": "Vegetables",
      "Meat & fish": "Meat & fish",
      "Protein": "Protein",
      "Dairy & eggs": "Dairy & eggs",
      "Grains & bakery": "Grains & bakery",
      "Legumes": "Legumes",
      "Pantry & seasonings": "Pantry & seasonings",
      "Other": "Other"
    }
  }
};
