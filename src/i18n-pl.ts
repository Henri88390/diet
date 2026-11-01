import type { Translation } from "./i18n-en";

export const pl: Translation = {
  common: {
    cancel: "Anuluj",
    kcal: "kcal",
    language: "Język",
    languageA11y: "Język: {{language}}. Zmień",
    languageOption: "Język: {{language}}"
  },
  tabs: {
    preferences: "Preferencje",
    meals: "Posiłki",
    menu: "Menu",
    groceries: "Zakupy"
  },
  mealType: { Breakfast: "Śniadanie", Lunch: "Obiad", Dinner: "Kolacja", Snack: "Przekąska" },
  snackSlot: { Morning: "poranna", Afternoon: "popołudniowa" },
  snackLabel: "Przekąska {{slot}}",
  planStyle: {
    balanced: "Zbilansowany",
    highProtein: "Więcej białka",
    lowCost: "Taniej",
    batchCooking: "Gotowanie na zapas",
    batchCookingDesc: "Ugotuj kilka podstawowych składników jednorazowo i wykorzystaj je w obiadach i kolacjach przez 3–4 dni."
  },
  batch: {
    note: "Gotowanie na zapas · z twojego przygotowania",
    prepTitle: "Przygotowanie na zapas",
    prepSubtitle_one: "Gotuj: {{day}} · wystarczy na {{count}} dzień",
    prepSubtitle_few: "Gotuj: {{day}} · wystarczy na {{count}} dni",
    prepSubtitle_many: "Gotuj: {{day}} · wystarczy na {{count}} dni",
    prepSubtitle_other: "Gotuj: {{day}} · wystarczy na {{count}} dnia",
    prepToday_one: "Gotuj dziś · wystarczy na {{count}} dzień",
    prepToday_few: "Gotuj dziś · wystarczy na {{count}} dni",
    prepToday_many: "Gotuj dziś · wystarczy na {{count}} dni",
    prepToday_other: "Gotuj dziś · wystarczy na {{count}} dnia",
    raw: "surowe",
    cooked: "gotowe"
  },
  mealsPerDay: {
    "2": "2 posiłki",
    "3": "3 posiłki",
    "4": "3 posiłki + 1 przekąska",
    "5": "3 posiłki + 2 przekąski"
  },
  prefs: {
    tabGeneral: "Ogólne",
    planStyle: "Styl planu posiłków",
    planStyleA11y: "Styl planu posiłków: {{label}}",
    budget: "Tygodniowy budżet na jedzenie",
    budgetDecrease: "Zmniejsz budżet tygodniowy",
    budgetIncrease: "Zwiększ budżet tygodniowy",
    budgetError: "Wpisz nieujemną kwotę lub zostaw budżet pusty.",
    meatFish: "Mięso / ryby",
    dairy: "Nabiał",
    perWeek: "{{title}} tygodniowo",
    never: "Nigdy",
    everyDay: "Codziennie",
    timesPerWeek: "{{count}} / tydz.",
    freqNever: "{{title}}: nigdy",
    freqEveryDay: "{{title}}: codziennie",
    freqTimes: "{{title}}: {{count}} razy w tygodniu",
    typicalBreakfast: "Typowe śniadanie",
    noFixedBreakfast: "Bez stałego śniadania",
    presetA11y: "Gotowe śniadanie: {{label}}",
    customBreakfast: "Własne śniadanie",
    buildBreakfast: "Ułóż swoje zwykłe śniadanie",
    addIngredient: "+ {{name}}",
    addIngredientA11y: "Dodaj {{name}} do własnego śniadania",
    quantityA11y: "Ilość: {{name}}",
    removeA11y: "Usuń {{name}}",
    checkQuantities: "Sprawdź ilości",
    quantityError: "Dodaj składnik i wpisz dodatnią ilość dla każdego z nich.",
    mealsPerDay: "Posiłki dziennie",
    mealsPerDayA11y: "Posiłki dziennie: {{label}}",
    fruit: "Owoce",
    fruitInclude: "Uwzględniaj w posiłkach",
    fruitOptional: "Opcjonalnie",
    fruitAvoid: "Unikaj owoców",
    fruitA11y: "Preferencja owoców: {{label}}",
    country: "Kraj i waluta",
    countryA11y: "Kraj: {{country}}, waluta {{currency}}",
    ban: "Wyklucz {{name}}",
    unban: "Zezwól ponownie na {{name}}"
  },
  calendar: {
    goToToday: "Przejdź do dzisiaj",
    todayHint: "Wybiera dzisiejszy plan posiłków i pokazuje go",
    today: "Dzisiaj",
    budgetWarning: "Budżet zbyt niski: najniższy możliwy budżet to {{cost}} tygodniowo.",
    budgetCompromised: "Aby zmieścić się w tygodniowym budżecie, wprowadzono kompromisy.",
    decrease: "Zmniejsz cel kalorii o 100",
    increase: "Zwiększ cel kalorii o 100",
    goalLabel: "Dzienny cel kalorii",
    goalHint: "Wpisz liczbę całkowitą od {{min}} do {{max}} kilokalorii",
    goalError: "Wpisz całkowity cel od 500 do 10 000 kcal.",
    emptyTitle: "Trochę miejsca na improwizację",
    emptyCopy: "Na ten dzień nie zaplanowano jeszcze posiłków. Wybierz inny dzień, aby zobaczyć pomysły.",
    planningDates: "Daty planowania",
    dateHint: "Wybiera tę datę, aby zobaczyć plan posiłków"
  },
  mealActions: {
    replace: "Zamien", ban: "Zablokuj posilek", scopeTitle: "Wybierz zakres zmiany", thisDay: "Tylko ten posilek", allOccurrences: "Wszystkie wystapienia",
    replaced: "Zamieniono", revert: "Przywróć oryginalny posiłek", batchUnavailable: "Posilkow przygotowanych z wyprzedzeniem nie mozna tu zmieniac.", typicalUnavailable: "Typowe sniadanie zmienisz w Preferencjach."
  },
  picker: {
    scopeTitle: "Wybierz zakres zmiany", banTitle: "Wybierz alternatywe", replaceTitle: "Wybierz zamiennik", thisDay: "Tylko ten posilek", allOccurrences: "Wszystkie wystapienia", singleOccurrence: "Ten posiłek występuje w planie tylko raz.",
    automatic: "Podobna kalorycznosc (automatycznie)", automaticHint: "Zostanie uzyty dostepny przepis o najbardziej zblizonej kalorycznosci.", noAlternatives: "Brak dostepnych alternatyw.", confirmTitle: "Potwierdź zamianę", confirmBanTitle: "Potwierdź wykluczenie", confirmDay: "Zamienić {{current}} na {{substitute}} tylko w tym dniu?", confirmAll: "Zamienić wszystkie wystąpienia {{current}} na {{substitute}}?", confirmBan: "Wykluczyć {{current}} i wszędzie zastąpić przez {{substitute}}?", confirmBanAuto: "Wykluczyć {{current}} i wszędzie zastąpić przepisem o najbardziej zbliżonej kaloryczności?", confirmAction: "Zamień", confirmBanAction: "Wyklucz i zamień", back: "Wstecz"
  },
  menu: {
    title: "Menu", empty: "Brak zaplanowanych posilkow w tym zakresie dat.", occurrences: "\u00d7{{count}}", showAll: "Pokaz wszystkie", showLess: "Pokaz mniej",
    ban: "Zablokuj", replaceAll: "Zamien wszystkie", batchUnavailable: "Posilkow przygotowanych z wyprzedzeniem nie mozna tu zmieniac.", typicalUnavailable: "Typowe sniadanie zmienisz w Preferencjach.",
    substitute: "\u2192 {{name}}", unban: "Przywroc", unbanConfirmTitle: "Przywrócić posiłek?", unbanConfirmMessage: "{{name}} będzie znów dostępny w Twoim planie.", noBanned: "Brak zablokowanych posilkow.", noBannedHint: "Dotknij „Zablokuj” przy posiłku w karcie Menu lub w jego szczegółach, aby usunąć go z planu.",
    tabBannedMeals: "Wykluczone posiłki", tabBannedIngredients: "Wykluczone składniki",
    banCategory: "Wyklucz: {{name}}", unbanCategory: "Przywróć: {{name}}", banCategoryConfirmTitle: "Wykluczyć tę kategorię?", banCategoryConfirmMessage: "Wszystkie składniki z kategorii {{name}} zostaną wykluczone. Posiłki zostaną automatycznie dostosowane, a przywrócenie kategorii przywróci je."
  },
  ingredientBan: {
    banAction: "Wyklucz składnik",
    chooseTitle: "Wybierz działanie", mealChoice: "Dla: {{name}}", skipAction: "Pomiń składnik",
    optionalReplacement: "Opcjonalny składnik zastępczy", noReplacement: "Bez zamiennika", replaceMealAction: "Zastąp posiłek", automaticHint: "Wybierz posiłek o najbardziej zbliżonej kaloryczności lub wskaż go poniżej.",
    reviewTitle: "Sprawdź inne posiłki", reviewHint: "Pozostałe dotknięte przepisy są domyślnie zastępowane automatycznie.", affectedCount: "{{count}} zaplanowane porcje", chooseMeal: "Wybierz posiłek",
    restricted: "Nie można zastąpić posiłku; używany jest zwykły automatyczny zamiennik składnika.", noAffected: "W bieżącym planie nie ma innych posiłków z tym składnikiem.", reviewContinue: "Sprawdź dotknięte posiłki", applyAction: "Zastosuj wykluczenie",
    applyEverywhere: "Użyj {{replacement}} we wszystkich posiłkach", applyEverywhereHint: "Zastąp {{ingredient}} składnikiem {{replacement}} we wszystkich innych posiłkach, w których występuje, jeśli to możliwe.",
    reviewHintEverywhere: "Posiłki, w których można użyć {{replacement}} zamiast {{ingredient}}, zachowują przepis. Nadal możesz wybrać posiłek zastępczy.",
    useReplacement: "Użyj {{replacement}}", useReplacementHint: "Zachowaj ten posiłek i zastąp {{ingredient}} składnikiem {{replacement}}.",
    omitIngredient: "Zostaw posiłek bez: {{ingredient}}", omitIngredientHint: "Ten sam posiłek, tylko bez składnika: {{ingredient}}."
  },
  meal: {
    a11y: "{{label}}: {{title}}, {{calories}} kilokalorii, {{protein}} gramów białka",
    hint: "Otwiera szczegóły posiłku i orientacyjne ilości składników",
    kcalChip: "{{value}} kcal",
    proteinChip: "{{value}} g białka",
    banned: "Wymaga zamiennika wykluczonego składnika: {{list}}"
  },
  details: {
    eyebrow: "{{label}} · PRZYKŁADOWY POSIŁEK",
    close: "Zamknij szczegóły posiłku",
    kcal: "kcal",
    protein: "białko",
    estCost: "szac. koszt",
    banWarning: "Nie znaleziono dozwolonego zamiennika dla: {{list}}. Sprawdź wykluczenia lub wybierz inny posiłek.",
    mainIngredients: "Główne składniki",
    mainHelper: "Podstawowe produkty w tej przykładowej porcji",
    seasonings: "Przyprawy i dodatki do gotowania",
    seasoningsHelper: "Pokazane osobno od głównych składników",
    disclaimer: "Wartości odżywcze i koszty opierają się na modelowych ilościach składników i cenach jednostkowych; kalorie są dopasowywane do wybranego dziennego celu. Koszty są zaokrąglane do najmniejszej jednostki waluty, więc bardzo mała porcja może wyświetlić się jako zero. Porcje i wartości są orientacyjne – to nie zweryfikowane przepisy, ceny regionalne, zalecenia żywieniowe ani porady medyczne."
  },
  grocery: {
    title: "Lista zakupów",
    startDate: "Data początkowa",
    endDate: "Data końcowa",
    dateA11y: "{{label}}: {{date}}. Zmień datę",
    days_one: "{{count}} dzień",
    days_few: "{{count}} dni",
    days_many: "{{count}} dni",
    days_other: "{{count}} dnia",
    weeklyList: "lista tygodniowa",
    selectedRange: "wybrany zakres dat",
    estimatedTotal: "Szacunkowa suma",
    progress: "Kupiono {{checked}} z {{total}}",
    reset: "Resetuj",
    resetA11y: "Odznacz wszystkie pozycje listy zakupów",
    empty: "Na te dni nie zaplanowano jeszcze składników.",
    previousMonth: "Poprzedni miesiąc",
    nextMonth: "Następny miesiąc",
    category: {
      "Fruit": "Owoce",
      "Vegetables": "Warzywa",
      "Meat & fish": "Mięso i ryby",
      "Protein": "Białko",
      "Dairy & eggs": "Nabiał i jajka",
      "Grains & bakery": "Zboża i pieczywo",
      "Legumes": "Rośliny strączkowe",
      "Pantry & seasonings": "Spiżarnia i przyprawy",
      "Other": "Inne"
    }
  }
};
