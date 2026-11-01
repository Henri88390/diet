import type { Translation } from "./i18n-en";

export const ru: Translation = {
  common: {
    cancel: "Отмена",
    kcal: "ккал",
    language: "Язык",
    languageA11y: "Язык: {{language}}. Изменить",
    languageOption: "Язык: {{language}}"
  },
  tabs: {
    preferences: "Предпочтения",
    meals: "Питание",
    menu: "\u041c\u0435\u043d\u044e",
    groceries: "Покупки"
  },
  mealType: { Breakfast: "Завтрак", Lunch: "Обед", Dinner: "Ужин", Snack: "Перекус" },
  snackSlot: { Morning: "утренний", Afternoon: "дневной" },
  snackLabel: "Перекус ({{slot}})",
  planStyle: {
    balanced: "Сбалансированный",
    highProtein: "Больше белка",
    lowCost: "Дешевле",
    batchCooking: "Готовка впрок",
    batchCookingDesc: "Приготовьте несколько базовых продуктов один раз и используйте их для обедов и ужинов в течение 3–4 дней."
  },
  batch: {
    note: "Готовка впрок · из вашей заготовки",
    prepTitle: "Заготовка",
    prepSubtitle_one: "Готовить: {{day}} · хватит на {{count}} день",
    prepSubtitle_few: "Готовить: {{day}} · хватит на {{count}} дня",
    prepSubtitle_many: "Готовить: {{day}} · хватит на {{count}} дней",
    prepSubtitle_other: "Готовить: {{day}} · хватит на {{count}} дня",
    prepToday_one: "Готовить сегодня · хватит на {{count}} день",
    prepToday_few: "Готовить сегодня · хватит на {{count}} дня",
    prepToday_many: "Готовить сегодня · хватит на {{count}} дней",
    prepToday_other: "Готовить сегодня · хватит на {{count}} дня",
    raw: "сырое",
    cooked: "готовое"
  },
  mealsPerDay: {
    "2": "2 приёма пищи",
    "3": "3 приёма пищи",
    "4": "3 приёма + 1 перекус",
    "5": "3 приёма + 2 перекуса"
  },
  prefs: {
    tabGeneral: "Общие",
    planStyle: "Стиль плана питания",
    planStyleA11y: "Стиль плана питания: {{label}}",
    budget: "Недельный бюджет на еду",
    budgetDecrease: "Уменьшить недельный бюджет",
    budgetIncrease: "Увеличить недельный бюджет",
    budgetError: "Введите неотрицательную сумму или оставьте бюджет пустым.",
    meatFish: "Мясо / рыба",
    dairy: "Молочные продукты",
    perWeek: "{{title}} в неделю",
    never: "Никогда",
    everyDay: "Каждый день",
    timesPerWeek: "{{count}} / нед.",
    freqNever: "{{title}}: никогда",
    freqEveryDay: "{{title}}: каждый день",
    freqTimes: "{{title}}: {{count}} раз в неделю",
    typicalBreakfast: "Обычный завтрак",
    noFixedBreakfast: "Без постоянного завтрака",
    presetA11y: "Готовый завтрак: {{label}}",
    customBreakfast: "Свой завтрак",
    buildBreakfast: "Составьте свой обычный завтрак",
    addIngredient: "+ {{name}}",
    addIngredientA11y: "Добавить «{{name}}» в свой завтрак",
    quantityA11y: "Количество: {{name}}",
    removeA11y: "Удалить «{{name}}»",
    checkQuantities: "Проверьте количества",
    quantityError: "Добавьте ингредиент и укажите положительное количество для каждого.",
    mealsPerDay: "Приёмов пищи в день",
    mealsPerDayA11y: "Приёмов пищи в день: {{label}}",
    fruit: "Фрукты",
    fruitInclude: "Включать в приёмы пищи",
    fruitOptional: "По желанию",
    fruitAvoid: "Исключить фрукты",
    fruitA11y: "Предпочтение по фруктам: {{label}}",
    country: "Страна и валюта",
    countryA11y: "Страна: {{country}}, валюта {{currency}}",
    ban: "Исключить «{{name}}»",
    unban: "Снова разрешить «{{name}}»"
  },
  calendar: {
    goToToday: "Перейти к сегодняшнему дню",
    todayHint: "Выбирает план питания на сегодня и показывает его",
    today: "Сегодня",
    budgetWarning: "Бюджет слишком мал: минимально возможный бюджет — {{cost}} в неделю.",
    budgetCompromised: "Чтобы уложиться в недельный бюджет, пришлось пойти на компромиссы.",
    decrease: "Уменьшить цель по калориям на 100",
    increase: "Увеличить цель по калориям на 100",
    goalLabel: "Дневная цель по калориям",
    goalHint: "Введите целое число от {{min}} до {{max}} килокалорий",
    goalError: "Введите целое число от 500 до 10 000 ккал.",
    emptyTitle: "Немного места для импровизации",
    emptyCopy: "На этот день пока нет запланированных блюд. Выберите другой день, чтобы увидеть идеи.",
    planningDates: "Даты планирования",
    dateHint: "Выбирает эту дату, чтобы увидеть план питания"
  },
  mealActions: {
    replace: "\u0417\u0430\u043c\u0435\u043d\u0438\u0442\u044c", ban: "\u0418\u0441\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u0431\u043b\u044e\u0434\u043e", scopeTitle: "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043e\u0431\u043b\u0430\u0441\u0442\u044c \u0437\u0430\u043c\u0435\u043d\u044b", thisDay: "\u0422\u043e\u043b\u044c\u043a\u043e \u044d\u0442\u043e \u0431\u043b\u044e\u0434\u043e", allOccurrences: "\u0412\u0441\u0435 \u0432\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u044f",
    replaced: "\u0417\u0430\u043c\u0435\u043d\u0435\u043d\u043e", revert: "Вернуть исходное блюдо", batchUnavailable: "\u0411\u043b\u044e\u0434\u0430 \u0434\u043b\u044f \u0437\u0430\u0433\u043e\u0442\u043e\u0432\u043a\u0438 \u043d\u0435\u043b\u044c\u0437\u044f \u0438\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u0437\u0434\u0435\u0441\u044c.", typicalUnavailable: "\u041f\u0440\u0438\u0432\u044b\u0447\u043d\u044b\u0439 \u0437\u0430\u0432\u0442\u0440\u0430\u043a \u043d\u0430\u0441\u0442\u0440\u0430\u0438\u0432\u0430\u0435\u0442\u0441\u044f \u0432 \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0430\u0445."
  },
  picker: {
    scopeTitle: "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043e\u0431\u043b\u0430\u0441\u0442\u044c \u0437\u0430\u043c\u0435\u043d\u044b", banTitle: "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0437\u0430\u043c\u0435\u043d\u0438\u0442\u0435\u043b\u044c", replaceTitle: "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0437\u0430\u043c\u0435\u043d\u0443", thisDay: "\u0422\u043e\u043b\u044c\u043a\u043e \u044d\u0442\u043e \u0431\u043b\u044e\u0434\u043e", allOccurrences: "\u0412\u0441\u0435 \u0432\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u044f", singleOccurrence: "Это блюдо встречается в плане только один раз.",
    automatic: "\u041f\u043e\u0445\u043e\u0436\u0438\u0435 \u043a\u0430\u043b\u043e\u0440\u0438\u0438 (\u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u0438)", automaticHint: "\u0411\u0443\u0434\u0435\u0442 \u0432\u044b\u0431\u0440\u0430\u043d\u043e \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e\u0435 \u0431\u043b\u044e\u0434\u043e \u0441 \u043d\u0430\u0438\u0431\u043e\u043b\u0435\u0435 \u0431\u043b\u0438\u0437\u043a\u043e\u0439 \u043a\u0430\u043b\u043e\u0440\u0438\u0439\u043d\u043e\u0441\u0442\u044c\u044e.", noAlternatives: "\u041d\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0445 \u0430\u043b\u044c\u0442\u0435\u0440\u043d\u0430\u0442\u0438\u0432.", confirmTitle: "Подтвердите замену", confirmBanTitle: "Подтвердите исключение", confirmDay: "Заменить {{current}} на {{substitute}} только в этот день?", confirmAll: "Заменить все вхождения {{current}} на {{substitute}}?", confirmBan: "Исключить {{current}} и везде заменить на {{substitute}}?", confirmBanAuto: "Исключить {{current}} и везде заменить рецептом с ближайшей калорийностью?", confirmAction: "Заменить", confirmBanAction: "Исключить и заменить", back: "Назад"
  },
  menu: {
    title: "\u041c\u0435\u043d\u044e", empty: "\u041d\u0430 \u044d\u0442\u043e\u0442 \u043f\u0435\u0440\u0438\u043e\u0434 \u0431\u043b\u044e\u0434\u0430 \u043d\u0435 \u0437\u0430\u043f\u043b\u0430\u043d\u0438\u0440\u043e\u0432\u0430\u043d\u044b.", occurrences: "\u00d7{{count}}", showAll: "\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u0432\u0441\u0435", showLess: "\u0421\u0432\u0435\u0440\u043d\u0443\u0442\u044c",
    ban: "\u0418\u0441\u043a\u043b\u044e\u0447\u0438\u0442\u044c", replaceAll: "\u0417\u0430\u043c\u0435\u043d\u0438\u0442\u044c \u0432\u0435\u0437\u0434\u0435", batchUnavailable: "\u0411\u043b\u044e\u0434\u0430 \u0434\u043b\u044f \u0437\u0430\u0433\u043e\u0442\u043e\u0432\u043a\u0438 \u043d\u0435\u043b\u044c\u0437\u044f \u0438\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u0437\u0434\u0435\u0441\u044c.", typicalUnavailable: "\u041f\u0440\u0438\u0432\u044b\u0447\u043d\u044b\u0439 \u0437\u0430\u0432\u0442\u0440\u0430\u043a \u043d\u0430\u0441\u0442\u0440\u0430\u0438\u0432\u0430\u0435\u0442\u0441\u044f \u0432 \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0430\u0445.",
    substitute: "\u2192 {{name}}", unban: "\u0412\u0435\u0440\u043d\u0443\u0442\u044c", unbanConfirmTitle: "Вернуть блюдо?", unbanConfirmMessage: "{{name}} снова будет доступно в вашем плане.", noBanned: "\u041d\u0435\u0442 \u0438\u0441\u043a\u043b\u044e\u0447\u0451\u043d\u043d\u044b\u0445 \u0431\u043b\u044e\u0434.", noBannedHint: "Нажмите «Исключить» у блюда на вкладке «Меню» или в его деталях, чтобы убрать его из плана.",
    tabBannedMeals: "Исключенные блюда", tabBannedIngredients: "Исключенные ингредиенты",
    banCategory: "Исключить: {{name}}", unbanCategory: "Разрешить: {{name}}", banCategoryConfirmTitle: "Исключить эту категорию?", banCategoryConfirmMessage: "Все ингредиенты из категории «{{name}}» будут исключены. Блюда будут скорректированы автоматически, а при возврате категории восстановятся."
  },
  ingredientBan: {
    banAction: "Исключить ингредиент",
    chooseTitle: "Выберите действие", mealChoice: "Для {{name}}", skipAction: "Пропустить ингредиент",
    optionalReplacement: "Необязательная замена", noReplacement: "Без замены", replaceMealAction: "Заменить блюдо", automaticHint: "Выбрать блюдо с близкой калорийностью или указать ниже.",
    reviewTitle: "Проверить другие блюда", reviewHint: "Другие затронутые рецепты по умолчанию заменяются автоматически.", affectedCount: "{{count}} запланированных порций", chooseMeal: "Выбрать блюдо",
    restricted: "Замена блюда недоступна; используется обычная автозамена ингредиента.", noAffected: "В текущем плане нет других блюд с этим ингредиентом.", reviewContinue: "Проверить затронутые блюда", applyAction: "Применить исключение",
    applyEverywhere: "Использовать {{replacement}} во всех блюдах", applyEverywhereHint: "По возможности заменить {{ingredient}} на {{replacement}} во всех других блюдах с этим ингредиентом.",
    reviewHintEverywhere: "Блюда, в которых можно использовать {{replacement}} вместо {{ingredient}}, сохранят рецепт. Вы всё ещё можете выбрать другое блюдо.",
    useReplacement: "Использовать {{replacement}}", useReplacementHint: "Оставить это блюдо и заменить {{ingredient}} на {{replacement}}.",
    omitIngredient: "Оставить блюдо без: {{ingredient}}", omitIngredientHint: "То же блюдо, только без: {{ingredient}}."
  },
  meal: {
    a11y: "{{label}}: {{title}}, {{calories}} килокалорий, {{protein}} г белка",
    hint: "Открывает детали блюда и примерные количества ингредиентов",
    kcalChip: "{{value}} ккал",
    proteinChip: "{{value}} г белка",
    banned: "Нужна замена исключённого ингредиента: {{list}}"
  },
  details: {
    eyebrow: "{{label}} · ПРИМЕР БЛЮДА",
    close: "Закрыть детали блюда",
    kcal: "ккал",
    protein: "белок",
    estCost: "оценка цены",
    banWarning: "Не найдена разрешённая замена для: {{list}}. Проверьте исключения или выберите другое блюдо.",
    mainIngredients: "Основные ингредиенты",
    mainHelper: "Основные продукты для этой примерной порции",
    seasonings: "Специи и добавки для готовки",
    seasoningsHelper: "Показаны отдельно от основных ингредиентов",
    disclaimer: "Питательность и стоимость рассчитаны по модельным количествам ингредиентов и ценам за единицу; калорийность подгоняется под выбранную дневную цель. Стоимость округляется до наименьшей денежной единицы, поэтому очень маленькая порция может показываться как ноль. Порции и значения примерные: это не проверенные рецепты, региональные цены, рекомендации по питанию или медицинские советы."
  },
  grocery: {
    title: "Список покупок",
    startDate: "Дата начала",
    endDate: "Дата окончания",
    dateA11y: "{{label}}: {{date}}. Изменить дату",
    days_one: "{{count}} день",
    days_few: "{{count}} дня",
    days_many: "{{count}} дней",
    days_other: "{{count}} дня",
    weeklyList: "список на неделю",
    selectedRange: "выбранный период",
    estimatedTotal: "Ориентировочная сумма",
    progress: "Куплено {{checked}} из {{total}}",
    reset: "Сбросить",
    resetA11y: "Снять отметки со всех пунктов списка",
    empty: "На эти даты ингредиенты пока не запланированы.",
    previousMonth: "Предыдущий месяц",
    nextMonth: "Следующий месяц",
    category: {
      "Fruit": "Фрукты",
      "Vegetables": "Овощи",
      "Meat & fish": "Мясо и рыба",
      "Protein": "Белок",
      "Dairy & eggs": "Молочные продукты и яйца",
      "Grains & bakery": "Крупы и выпечка",
      "Legumes": "Бобовые",
      "Pantry & seasonings": "Бакалея и специи",
      "Other": "Прочее"
    }
  }
};
