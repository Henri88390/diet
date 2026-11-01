import type { Translation } from "./i18n-en";

export const fr: Translation = {
  common: {
    cancel: "Annuler",
    kcal: "kcal",
    language: "Langue",
    languageA11y: "Langue : {{language}}. Modifier",
    languageOption: "Langue : {{language}}"
  },
  tabs: {
    preferences: "Préférences",
    meals: "Repas",
    menu: "Menu",
    groceries: "Courses"
  },
  mealType: { Breakfast: "Petit-déjeuner", Lunch: "Déjeuner", Dinner: "Dîner", Snack: "Collation" },
  snackSlot: { Morning: "Matin", Afternoon: "Après-midi" },
  snackLabel: "Collation : {{slot}}",
  planStyle: {
    balanced: "Équilibré",
    highProtein: "Plus de protéines",
    lowCost: "Moins cher",
    batchCooking: "Batch cooking",
    batchCookingDesc: "Cuisinez quelques ingrédients de base en une seule fois, puis réutilisez-les pour vos déjeuners et dîners pendant 3 à 4 jours."
  },
  batch: {
    note: "Batch cooking · issu de votre préparation",
    prepTitle: "Préparation en lot",
    prepSubtitle_one: "À cuisiner {{day}} · couvre {{count}} jour",
    prepSubtitle_other: "À cuisiner {{day}} · couvre {{count}} jours",
    prepToday_one: "À cuisiner aujourd'hui · couvre {{count}} jour",
    prepToday_other: "À cuisiner aujourd'hui · couvre {{count}} jours",
    raw: "cru",
    cooked: "déjà cuit"
  },
  mealsPerDay: {
    "2": "2 repas",
    "3": "3 repas",
    "4": "3 repas + 1 collation",
    "5": "3 repas + 2 collations"
  },
  prefs: {
    planStyle: "Style du plan de repas",
    planStyleA11y: "Style du plan de repas : {{label}}",
    budget: "Budget alimentaire hebdomadaire",
    budgetDecrease: "Diminuer le budget hebdomadaire",
    budgetIncrease: "Augmenter le budget hebdomadaire",
    budgetError: "Saisissez un montant positif ou laissez le budget vide.",
    meatFish: "Viande / poisson",
    dairy: "Produits laitiers",
    perWeek: "{{title}} par semaine",
    never: "Jamais",
    everyDay: "Tous les jours",
    timesPerWeek: "{{count}} / sem.",
    freqNever: "{{title}} : jamais",
    freqEveryDay: "{{title}} : tous les jours",
    freqTimes: "{{title}} : {{count}} fois par semaine",
    typicalBreakfast: "Petit-déjeuner habituel",
    noFixedBreakfast: "Pas de petit-déjeuner fixe",
    presetA11y: "Petit-déjeuner prédéfini : {{label}}",
    customBreakfast: "Petit-déjeuner personnalisé",
    buildBreakfast: "Composez votre petit-déjeuner habituel",
    addIngredient: "+ {{name}}",
    addIngredientA11y: "Ajouter {{name}} au petit-déjeuner personnalisé",
    quantityA11y: "Quantité de {{name}}",
    removeA11y: "Retirer {{name}}",
    checkQuantities: "Vérifiez les quantités",
    quantityError: "Ajoutez un ingrédient et saisissez une quantité positive pour chaque élément.",
    mealsPerDay: "Repas par jour",
    mealsPerDayA11y: "Repas par jour : {{label}}",
    fruit: "Fruits",
    fruitInclude: "Inclure dans les repas",
    fruitOptional: "Facultatif",
    fruitAvoid: "Éviter les fruits",
    fruitA11y: "Préférence pour les fruits : {{label}}",
    country: "Pays et devise",
    countryA11y: "Pays : {{country}}, devise {{currency}}",
    banIngredients: "Ingrédients exclus",
    ban: "Exclure {{name}}",
    unban: "Ne plus exclure {{name}}"
  },
  calendar: {
    goToToday: "Aller à aujourd'hui",
    todayHint: "Sélectionne le plan de repas d'aujourd'hui et l'affiche",
    today: "Aujourd'hui",
    budgetWarning: "Budget trop bas : le budget minimum possible est de {{cost}} par semaine.",
    budgetCompromised: "Pour respecter votre budget hebdomadaire, des compromis ont été faits.",
    decrease: "Diminuer l'objectif calorique de 100",
    increase: "Augmenter l'objectif calorique de 100",
    goalLabel: "Objectif calorique quotidien",
    goalHint: "Saisissez un nombre entier de {{min}} à {{max}} kilocalories",
    goalError: "Saisissez un objectif entier de 500 à 10 000 kcal.",
    emptyTitle: "Un peu de place pour improviser",
    emptyCopy: "Aucun repas prévu pour ce jour. Choisissez un autre jour pour voir des idées de repas.",
    planningDates: "Dates de planification",
    dateHint: "Sélectionne cette date pour voir son plan de repas"
  },
  mealActions: {
    replace: "Remplacer", ban: "Bannir le repas", scopeTitle: "Choisir la portee du remplacement", thisDay: "Ce jour uniquement", allOccurrences: "Toutes les occurrences",
    replaced: "Remplace", revert: "Retablir ce jour", batchUnavailable: "Les repas prepares en lot ne peuvent pas etre modifies ici.", bannedUnavailable: "Ce repas est exclu. Réautorisez-le dans l'onglet Menu pour l'utiliser à nouveau.", typicalUnavailable: "Votre petit-dejeuner habituel se gere dans Preferences."
  },
  picker: {
    scopeTitle: "Choisir la portee du remplacement", banTitle: "Choisir un substitut", replaceTitle: "Choisir un remplacement", thisDay: "Ce jour uniquement", allOccurrences: "Toutes les occurrences",
    automatic: "Calories similaires (automatique)", automaticHint: "La recette disponible aux calories les plus proches sera utilisee.", noAlternatives: "Aucune alternative disponible.", confirmTitle: "Confirmer le remplacement", confirmBanTitle: "Confirmer l'exclusion", confirmDay: "Remplacer {{current}} par {{substitute}} pour ce jour uniquement ?", confirmAll: "Remplacer toutes les occurrences de {{current}} par {{substitute}} ?", confirmBan: "Exclure {{current}} et le remplacer partout par {{substitute}} ?", confirmBanAuto: "Exclure {{current}} et le remplacer partout par la recette la plus proche en calories ?", confirmAction: "Remplacer", confirmBanAction: "Exclure et remplacer", back: "Retour"
  },
  menu: {
    title: "Menu", empty: "Aucun repas n'est prevu pour cette periode.", occurrences: "\u00d7{{count}}", showAll: "Tout afficher", showLess: "Afficher moins",
    ban: "Bannir", replaceAll: "Tout remplacer", batchUnavailable: "Les repas prepares en lot ne peuvent pas etre modifies ici.", typicalUnavailable: "Votre petit-dejeuner habituel se gere dans Preferences.", bannedTitle: "Repas bannis",
    substitute: "\u2192 {{name}}", unban: "Retablir", noBanned: "Aucun repas banni."
  },
  meal: {
    a11y: "{{label}} : {{title}}, {{calories}} kilocalories, {{protein}} grammes de protéines",
    hint: "Ouvre les détails du repas et les quantités indicatives d'ingrédients",
    kcalChip: "{{value}} kcal",
    proteinChip: "{{value}} g de protéines",
    banned: "Nécessite un remplacement pour l'ingrédient exclu : {{list}}"
  },
  details: {
    eyebrow: "{{label}} · REPAS EXEMPLE",
    close: "Fermer les détails du repas",
    kcal: "kcal",
    protein: "protéines",
    estCost: "coût estimé",
    banWarning: "Aucun substitut autorisé trouvé pour : {{list}}. Vérifiez les exclusions ou choisissez un autre repas.",
    mainIngredients: "Ingrédients principaux",
    mainHelper: "Aliments de base de cette portion exemple",
    seasonings: "Assaisonnements et ajouts de cuisson",
    seasoningsHelper: "Affichés séparément des ingrédients principaux",
    total: "Total",
    totalValue: "{{kcal}} kcal · {{protein}} g de protéines · ~{{cost}}",
    disclaimer: "La nutrition et les coûts reposent sur des quantités d'ingrédients et des prix unitaires modélisés ; les calories sont ajustées à l'objectif quotidien choisi. Les coûts sont arrondis à la plus petite unité monétaire, une très petite portion peut donc s'afficher à zéro. Les portions et valeurs sont indicatives : ce ne sont ni des recettes vérifiées, ni des prix régionaux, ni des conseils nutritionnels ou médicaux."
  },
  grocery: {
    title: "Liste de courses",
    startDate: "Date de début",
    endDate: "Date de fin",
    dateA11y: "{{label}} : {{date}}. Modifier la date",
    days_one: "{{count}} jour",
    days_many: "{{count}} jours",
    days_other: "{{count}} jours",
    weeklyList: "liste hebdomadaire",
    selectedRange: "période sélectionnée",
    estimatedTotal: "Total estimé",
    progress: "{{checked}} sur {{total}} achetés",
    reset: "Réinitialiser",
    resetA11y: "Décocher tous les articles de la liste",
    empty: "Aucun ingrédient n'est encore prévu pour ces dates.",
    previousMonth: "Mois précédent",
    nextMonth: "Mois suivant",
    category: {
      "Fruit": "Fruits",
      "Vegetables": "Légumes",
      "Meat & fish": "Viande et poisson",
      "Protein": "Protéines",
      "Dairy & eggs": "Produits laitiers et œufs",
      "Grains & bakery": "Céréales et boulangerie",
      "Legumes": "Légumineuses",
      "Pantry & seasonings": "Épicerie et assaisonnements",
      "Other": "Autres"
    }
  }
};
