import type { Translation } from "./i18n-en";

export const de: Translation = {
  common: {
    cancel: "Abbrechen",
    kcal: "kcal",
    language: "Sprache",
    languageA11y: "Sprache: {{language}}. Ändern",
    languageOption: "Sprache: {{language}}"
  },
  tabs: {
    preferences: "Einstellungen",
    meals: "Mahlzeiten",
    menu: "Men\u00fc",
    groceries: "Einkauf"
  },
  mealType: { Breakfast: "Frühstück", Lunch: "Mittagessen", Dinner: "Abendessen", Snack: "Snack" },
  snackSlot: { Morning: "Vormittags", Afternoon: "Nachmittags" },
  snackLabel: "Snack {{slot}}",
  planStyle: {
    balanced: "Ausgewogen",
    highProtein: "Mehr Eiweiß",
    lowCost: "Günstiger",
    batchCooking: "Vorkochen",
    batchCookingDesc: "Wenige Basiszutaten einmal vorkochen und für Mittag- und Abendessen an 3–4 Tagen wiederverwenden."
  },
  batch: {
    note: "Vorkochen · aus deiner Vorbereitung",
    prepTitle: "Vorkochen",
    prepSubtitle_one: "Kochen am {{day}} · reicht für {{count}} Tag",
    prepSubtitle_other: "Kochen am {{day}} · reicht für {{count}} Tage",
    prepToday_one: "Heute kochen · reicht für {{count}} Tag",
    prepToday_other: "Heute kochen · reicht für {{count}} Tage",
    raw: "roh",
    cooked: "vorgegart"
  },
  mealsPerDay: {
    "2": "2 Mahlzeiten",
    "3": "3 Mahlzeiten",
    "4": "3 Mahlzeiten + 1 Snack",
    "5": "3 Mahlzeiten + 2 Snacks"
  },
  prefs: {
    planStyle: "Stil des Ernährungsplans",
    planStyleA11y: "Stil des Ernährungsplans: {{label}}",
    budget: "Wöchentliches Lebensmittelbudget",
    budgetDecrease: "Wochenbudget verringern",
    budgetIncrease: "Wochenbudget erhöhen",
    budgetError: "Gib einen nicht negativen Betrag ein oder lass das Budget leer.",
    meatFish: "Fleisch / Fisch",
    dairy: "Milchprodukte",
    perWeek: "{{title}} pro Woche",
    never: "Nie",
    everyDay: "Täglich",
    timesPerWeek: "{{count}} / Wo.",
    freqNever: "{{title}}: nie",
    freqEveryDay: "{{title}}: täglich",
    freqTimes: "{{title}}: {{count}} Mal pro Woche",
    typicalBreakfast: "Typisches Frühstück",
    noFixedBreakfast: "Kein festes Frühstück",
    presetA11y: "Frühstücksvorlage: {{label}}",
    customBreakfast: "Eigenes Frühstück",
    buildBreakfast: "Stelle dein übliches Frühstück zusammen",
    addIngredient: "+ {{name}}",
    addIngredientA11y: "{{name}} zum eigenen Frühstück hinzufügen",
    quantityA11y: "Menge {{name}}",
    removeA11y: "{{name}} entfernen",
    checkQuantities: "Mengen prüfen",
    quantityError: "Füge eine Zutat hinzu und gib für jede Zutat eine positive Menge ein.",
    mealsPerDay: "Mahlzeiten pro Tag",
    mealsPerDayA11y: "Mahlzeiten pro Tag: {{label}}",
    fruit: "Obst",
    fruitInclude: "Zu den Mahlzeiten einplanen",
    fruitOptional: "Optional",
    fruitAvoid: "Obst vermeiden",
    fruitA11y: "Obstpräferenz: {{label}}",
    country: "Land und Währung",
    countryA11y: "Land: {{country}}, Währung {{currency}}",
    banIngredients: "Zutaten ausschließen",
    ban: "{{name}} ausschließen",
    unban: "{{name}} wieder zulassen"
  },
  calendar: {
    goToToday: "Zu heute springen",
    todayHint: "Wählt den heutigen Essensplan aus und zeigt ihn an",
    today: "Heute",
    budgetWarning: "Budget zu niedrig: das niedrigste mögliche Budget beträgt {{cost}} pro Woche.",
    budgetCompromised: "Um im Wochenbudget zu bleiben, wurden Kompromisse gemacht.",
    decrease: "Kalorienziel um 100 verringern",
    increase: "Kalorienziel um 100 erhöhen",
    goalLabel: "Tägliches Kalorienziel",
    goalHint: "Gib eine ganze Zahl von {{min}} bis {{max}} Kilokalorien ein",
    goalError: "Gib ein ganzzahliges Ziel von 500 bis 10.000 kcal ein.",
    emptyTitle: "Etwas Raum zum Improvisieren",
    emptyCopy: "Für diesen Tag sind noch keine Mahlzeiten geplant. Wähle einen anderen Tag für Essensideen.",
    planningDates: "Planungsdaten",
    dateHint: "Wählt dieses Datum aus, um den Essensplan zu sehen"
  },
  mealActions: {
    replace: "Ersetzen", ban: "Mahlzeit meiden", scopeTitle: "Umfang des Ersatzes waehlen", thisDay: "Nur dieser Tag", allOccurrences: "Alle Vorkommen",
    replaced: "Ersetzt", revert: "Diesen Tag zuruecksetzen", batchUnavailable: "Mahlzeiten aus dem Batch-Kochen koennen hier nicht geaendert werden.", typicalUnavailable: "Dein typisches Fruehstueck wird unter Einstellungen verwaltet."
  },
  picker: {
    scopeTitle: "Umfang des Ersatzes waehlen", banTitle: "Ersatz auswaehlen", replaceTitle: "Ersatz waehlen", thisDay: "Nur dieser Tag", allOccurrences: "Alle Vorkommen",
    automatic: "Aehnliche Kalorien (automatisch)", automaticHint: "Das verfuegbare Rezept mit den aehnlichsten Kalorien wird verwendet.", noAlternatives: "Keine Alternativen verfuegbar.", confirmTitle: "Ersetzen bestätigen", confirmBanTitle: "Sperren bestätigen", confirmDay: "{{current}} nur an diesem Tag durch {{substitute}} ersetzen?", confirmAll: "Jedes Vorkommen von {{current}} durch {{substitute}} ersetzen?", confirmBan: "{{current}} sperren und überall durch {{substitute}} ersetzen?", confirmBanAuto: "{{current}} sperren und überall durch das Rezept mit den ähnlichsten Kalorien ersetzen?", confirmAction: "Ersetzen", confirmBanAction: "Sperren und ersetzen", back: "Zurück"
  },
  menu: {
    title: "Men\u00fc", empty: "Fuer diesen Zeitraum sind keine Mahlzeiten geplant.", occurrences: "\u00d7{{count}}", showAll: "Alle anzeigen", showLess: "Weniger anzeigen",
    ban: "Meiden", replaceAll: "Alle ersetzen", batchUnavailable: "Mahlzeiten aus dem Batch-Kochen koennen hier nicht geaendert werden.", typicalUnavailable: "Dein typisches Fruehstueck wird unter Einstellungen verwaltet.", bannedTitle: "Gemiedene Mahlzeiten",
    substitute: "\u2192 {{name}}", unban: "Wieder aufnehmen", unbanConfirmTitle: "Mahlzeit wieder aufnehmen?", unbanConfirmMessage: "{{name}} ist wieder in deinem Plan verfügbar.", noBanned: "Keine gemiedenen Mahlzeiten."
  },
  meal: {
    a11y: "{{label}}: {{title}}, {{calories}} Kilokalorien, {{protein}} Gramm Eiweiß",
    hint: "Öffnet Mahlzeitendetails und beispielhafte Zutatenmengen",
    kcalChip: "{{value}} kcal",
    proteinChip: "{{value}} g Eiweiß",
    banned: "Ersatz nötig für ausgeschlossene Zutat: {{list}}"
  },
  details: {
    eyebrow: "{{label}} · BEISPIELMAHLZEIT",
    close: "Mahlzeitendetails schließen",
    kcal: "kcal",
    protein: "Eiweiß",
    estCost: "gesch. Kosten",
    banWarning: "Für {{list}} wurde kein erlaubter Ersatz gefunden. Prüfe die Ausschlüsse oder wähle eine andere Mahlzeit.",
    mainIngredients: "Hauptzutaten",
    mainHelper: "Grundnahrungsmittel für diese Beispielportion",
    seasonings: "Gewürze & Zutaten zum Kochen",
    seasoningsHelper: "Getrennt von den Hauptzutaten angezeigt",
    total: "Summe",
    totalValue: "{{kcal}} kcal · {{protein}} g Eiweiß · ~{{cost}}",
    disclaimer: "Nährwerte und Kosten beruhen auf modellierten Zutatenmengen und Stückpreisen; die Kalorienwerte werden an das gewählte Tagesziel angepasst. Kosten werden auf die kleinste Währungseinheit gerundet, sodass eine sehr kleine Portion als null angezeigt werden kann. Portionen und Werte sind Richtwerte – keine geprüften Rezeptmengen, regionalen Preise, Ernährungsempfehlungen oder medizinischen Ratschläge."
  },
  grocery: {
    title: "Einkaufsliste",
    startDate: "Startdatum",
    endDate: "Enddatum",
    dateA11y: "{{label}}: {{date}}. Datum ändern",
    days_one: "{{count}} Tag",
    days_other: "{{count}} Tage",
    weeklyList: "Wochenliste",
    selectedRange: "gewählter Zeitraum",
    estimatedTotal: "Geschätzte Summe",
    progress: "{{checked}} von {{total}} gekauft",
    reset: "Zurücksetzen",
    resetA11y: "Häkchen bei allen Artikeln der Einkaufsliste entfernen",
    empty: "Für diese Tage sind noch keine Zutaten geplant.",
    previousMonth: "Vorheriger Monat",
    nextMonth: "Nächster Monat",
    category: {
      "Fruit": "Obst",
      "Vegetables": "Gemüse",
      "Meat & fish": "Fleisch & Fisch",
      "Protein": "Protein",
      "Dairy & eggs": "Milchprodukte & Eier",
      "Grains & bakery": "Getreide & Backwaren",
      "Legumes": "Hülsenfrüchte",
      "Pantry & seasonings": "Vorrat & Gewürze",
      "Other": "Sonstiges"
    }
  }
};
