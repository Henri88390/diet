import type { Translation } from "./i18n-en";

export const es: Translation = {
  common: {
    cancel: "Cancelar",
    kcal: "kcal",
    language: "Idioma",
    languageA11y: "Idioma: {{language}}. Cambiar",
    languageOption: "Idioma: {{language}}"
  },
  tabs: {
    preferences: "Preferencias",
    meals: "Comidas",
    menu: "Men\u00fa",
    groceries: "Compra"
  },
  mealType: { Breakfast: "Desayuno", Lunch: "Almuerzo", Dinner: "Cena", Snack: "Merienda" },
  snackSlot: { Morning: "de la mañana", Afternoon: "de la tarde" },
  snackLabel: "Merienda {{slot}}",
  planStyle: {
    balanced: "Equilibrado",
    highProtein: "Más proteína",
    lowCost: "Más económico",
    batchCooking: "Cocina por lotes",
    batchCookingDesc: "Cocina unos pocos ingredientes base una sola vez y reutilízalos en comidas y cenas durante 3–4 días."
  },
  batch: {
    note: "Cocina por lotes · de tu preparación",
    prepTitle: "Preparación por lotes",
    prepSubtitle_one: "Cocinar el {{day}} · cubre {{count}} día",
    prepSubtitle_other: "Cocinar el {{day}} · cubre {{count}} días",
    prepToday_one: "Cocinar hoy · cubre {{count}} día",
    prepToday_other: "Cocinar hoy · cubre {{count}} días",
    raw: "crudo",
    cooked: "ya cocido"
  },
  mealsPerDay: {
    "2": "2 comidas",
    "3": "3 comidas",
    "4": "3 comidas + 1 merienda",
    "5": "3 comidas + 2 meriendas"
  },
  prefs: {
    planStyle: "Estilo del plan de comidas",
    planStyleA11y: "Estilo del plan de comidas: {{label}}",
    budget: "Presupuesto semanal de comida",
    budgetDecrease: "Reducir el presupuesto semanal",
    budgetIncrease: "Aumentar el presupuesto semanal",
    budgetError: "Introduce un importe no negativo o deja el presupuesto en blanco.",
    meatFish: "Carne / pescado",
    dairy: "Lácteos",
    perWeek: "{{title}} por semana",
    never: "Nunca",
    everyDay: "Todos los días",
    timesPerWeek: "{{count}} / sem.",
    freqNever: "{{title}}: nunca",
    freqEveryDay: "{{title}}: todos los días",
    freqTimes: "{{title}}: {{count}} veces por semana",
    typicalBreakfast: "Desayuno habitual",
    noFixedBreakfast: "Sin desayuno fijo",
    presetA11y: "Desayuno predefinido: {{label}}",
    customBreakfast: "Desayuno personalizado",
    buildBreakfast: "Crea tu desayuno habitual",
    addIngredient: "+ {{name}}",
    addIngredientA11y: "Añadir {{name}} al desayuno personalizado",
    quantityA11y: "Cantidad de {{name}}",
    removeA11y: "Quitar {{name}}",
    checkQuantities: "Revisa las cantidades",
    quantityError: "Añade un ingrediente e introduce una cantidad positiva para cada uno.",
    mealsPerDay: "Comidas al día",
    mealsPerDayA11y: "Comidas al día: {{label}}",
    fruit: "Fruta",
    fruitInclude: "Incluir en las comidas",
    fruitOptional: "Opcional",
    fruitAvoid: "Evitar la fruta",
    fruitA11y: "Preferencia de fruta: {{label}}",
    country: "País y moneda",
    countryA11y: "País: {{country}}, moneda {{currency}}",
    banIngredients: "Excluir ingredientes",
    ban: "Excluir {{name}}",
    unban: "Volver a permitir {{name}}"
  },
  calendar: {
    goToToday: "Ir a hoy",
    todayHint: "Selecciona el plan de comidas de hoy y lo muestra",
    today: "Hoy",
    budgetWarning: "Presupuesto demasiado bajo: el presupuesto mínimo posible es de {{cost}} por semana.",
    budgetCompromised: "Para ajustarse al presupuesto semanal se hicieron algunas concesiones.",
    decrease: "Reducir el objetivo de calorías en 100",
    increase: "Aumentar el objetivo de calorías en 100",
    goalLabel: "Objetivo diario de calorías",
    goalHint: "Introduce un número entero de {{min}} a {{max}} kilocalorías",
    goalError: "Introduce un objetivo entero de 500 a 10.000 kcal.",
    emptyTitle: "Un poco de espacio para improvisar",
    emptyCopy: "Aún no hay comidas planificadas para este día. Elige otro día para ver ideas de comidas.",
    planningDates: "Fechas de planificación",
    dateHint: "Selecciona esta fecha para ver su plan de comidas"
  },
  mealActions: {
    replace: "Reemplazar", ban: "Excluir comida", scopeTitle: "Elige el alcance del cambio", thisDay: "Solo este dia", allOccurrences: "Todas las apariciones",
    replaced: "Reemplazado", revert: "Restaurar este dia", batchUnavailable: "Las comidas preparadas por lotes no se pueden cambiar aqui.", typicalUnavailable: "Tu desayuno habitual se configura en Preferencias."
  },
  picker: {
    scopeTitle: "Elige el alcance del cambio", banTitle: "Elige un sustituto", replaceTitle: "Elige un reemplazo", thisDay: "Solo este dia", allOccurrences: "Todas las apariciones",
    automatic: "Calorias similares (automatico)", automaticHint: "Se usara la receta disponible con las calorias mas similares.", noAlternatives: "No hay alternativas disponibles.", confirmTitle: "Confirmar sustitución", confirmBanTitle: "Confirmar exclusión", confirmDay: "¿Sustituir {{current}} por {{substitute}} solo este día?", confirmAll: "¿Sustituir todas las apariciones de {{current}} por {{substitute}}?", confirmBan: "¿Excluir {{current}} y sustituirlo en todas partes por {{substitute}}?", confirmBanAuto: "¿Excluir {{current}} y sustituirlo en todas partes por la receta con calorías más parecidas?", confirmAction: "Sustituir", confirmBanAction: "Excluir y sustituir", back: "Atrás"
  },
  menu: {
    title: "Men\u00fa", empty: "No hay comidas previstas para este periodo.", occurrences: "\u00d7{{count}}", showAll: "Mostrar todas", showLess: "Mostrar menos",
    ban: "Excluir", replaceAll: "Reemplazar todas", batchUnavailable: "Las comidas preparadas por lotes no se pueden cambiar aqui.", typicalUnavailable: "Tu desayuno habitual se configura en Preferencias.", bannedTitle: "Comidas excluidas",
    substitute: "\u2192 {{name}}", unban: "Restaurar", unbanConfirmTitle: "¿Restaurar esta comida?", unbanConfirmMessage: "{{name}} volverá a estar disponible en tu plan.", noBanned: "No hay comidas excluidas."
  },
  meal: {
    a11y: "{{label}}: {{title}}, {{calories}} kilocalorías, {{protein}} gramos de proteína",
    hint: "Abre los detalles de la comida y cantidades orientativas de ingredientes",
    kcalChip: "{{value}} kcal",
    proteinChip: "{{value}} g de proteína",
    banned: "Necesita un sustituto para el ingrediente excluido: {{list}}"
  },
  details: {
    eyebrow: "{{label}} · COMIDA DE EJEMPLO",
    close: "Cerrar detalles de la comida",
    kcal: "kcal",
    protein: "proteína",
    estCost: "coste est.",
    banWarning: "No se encontró un sustituto permitido para: {{list}}. Revisa las exclusiones o elige otra comida.",
    mainIngredients: "Ingredientes principales",
    mainHelper: "Alimentos base de esta porción de ejemplo",
    seasonings: "Condimentos y añadidos de cocina",
    seasoningsHelper: "Se muestran por separado de los ingredientes principales",
    total: "Total",
    totalValue: "{{kcal}} kcal · {{protein}} g de proteína · ~{{cost}}",
    disclaimer: "La nutrición y los costes usan cantidades de ingredientes y precios unitarios modelados; las calorías se ajustan al objetivo diario elegido. Los costes se redondean a la unidad monetaria mínima, por lo que una porción muy pequeña puede mostrarse como cero. Las porciones y los valores son orientativos: no son cantidades de recetas verificadas, precios regionales, recomendaciones nutricionales ni consejo médico."
  },
  grocery: {
    title: "Lista de la compra",
    startDate: "Fecha de inicio",
    endDate: "Fecha de fin",
    dateA11y: "{{label}}: {{date}}. Cambiar fecha",
    days_one: "{{count}} día",
    days_many: "{{count}} días",
    days_other: "{{count}} días",
    weeklyList: "lista semanal",
    selectedRange: "rango de fechas seleccionado",
    estimatedTotal: "Total estimado",
    progress: "{{checked}} de {{total}} comprados",
    reset: "Restablecer",
    resetA11y: "Desmarcar todos los artículos de la lista",
    empty: "Aún no hay ingredientes planificados para estas fechas.",
    previousMonth: "Mes anterior",
    nextMonth: "Mes siguiente",
    category: {
      "Fruit": "Fruta",
      "Vegetables": "Verduras",
      "Meat & fish": "Carne y pescado",
      "Protein": "Proteínas",
      "Dairy & eggs": "Lácteos y huevos",
      "Grains & bakery": "Cereales y panadería",
      "Legumes": "Legumbres",
      "Pantry & seasonings": "Despensa y condimentos",
      "Other": "Otros"
    }
  }
};
