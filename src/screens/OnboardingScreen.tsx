import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type {
  FruitPreference,
  IngredientBans,
  IngredientCategoryGroup,
  Meal,
  MealsPerDay,
  MealPreferences,
  PlanStyle,
  TypicalBreakfastIngredient,
  WeeklyFrequency
} from "../models";
import { BannedIngredientsSection, BannedMealsSection } from "../components/BanSections";
import { palette } from "../theme";
import { getBudgetStep, stepBudget } from "../budgetPlan";
import { AmountStepper } from "../components/AmountStepper";
import { MAX_DAILY_CALORIE_GOAL, MIN_DAILY_CALORIE_GOAL } from "../sampleData";
import { LanguageDropdown } from "../components/LanguageDropdown";
import type { BudgetWarning } from "../budgetPlan";
import { countries, formatMoney, getCountry, getCurrencySymbol, type CountryCode } from "../countryPricing";
import {
  estimateIngredient,
  isValidPositiveIngredientQuantity
} from "../ingredientEstimates";
import { customBreakfastIngredientOptions, typicalBreakfastPresets } from "../typicalBreakfast";
import { useFoodNames } from "../i18n";
import { useTranslation } from "react-i18next";

type Props = {
  recipes: Meal[];
  bannedMeals: string[];
  mealSubstitutes: Record<string, string>;
  onUnban: (recipeKey: string) => void;
  onMealPress: (meal: Meal) => void;
  bannedIngredients: IngredientBans;
  onToggleIngredientBan: (ingredientId: string) => void;
  onToggleIngredientCategory: (category: IngredientCategoryGroup) => void;
  mealPreferences: MealPreferences;
  onMealPreferencesChange: (preferences: MealPreferences) => void;
  countryCode: CountryCode;
  budgetWarning: BudgetWarning | null;
  onCountryChange: (countryCode: CountryCode) => void;
  goalInput: string;
  onGoalInputChange: (goal: string) => void;
  onAdjustGoal: (amount: number) => void;
  hasValidGoal: boolean;
};

const frequencyOptions: { value: WeeklyFrequency }[] = [
  { value: 0 },
  { value: 7 },
  { value: 1 },
  { value: 2 },
  { value: 3 }
];

const fruitOptions: { value: FruitPreference; labelKey: string }[] = [
  { value: "include", labelKey: "prefs.fruitInclude" },
  { value: "optional", labelKey: "prefs.fruitOptional" },
  { value: "avoid", labelKey: "prefs.fruitAvoid" }
];

const mealsPerDayOptions: MealsPerDay[] = [2, 3, 4, 5];
const planStyleOptions: PlanStyle[] = ["balanced", "highProtein", "lowCost", "batchCooking"];
type PreferenceSection = "settings" | "bannedMeals" | "bannedIngredients";
const sections: PreferenceSection[] = ["settings", "bannedMeals", "bannedIngredients"];

export function OnboardingScreen({
  recipes,
  bannedMeals,
  mealSubstitutes,
  onUnban,
  onMealPress,
  bannedIngredients,
  onToggleIngredientBan,
  onToggleIngredientCategory,
  mealPreferences,
  onMealPreferencesChange,
  countryCode,
  budgetWarning,
  onCountryChange,
  goalInput,
  onGoalInputChange,
  onAdjustGoal,
  hasValidGoal
}: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { food } = useFoodNames();
  const currencyCode = getCountry(countryCode).currencyCode;
  const parsedBudget = Number(mealPreferences.weeklyBudget.replace(",", "."));
  const budgetIsValid = mealPreferences.weeklyBudget.trim() === "" ||
    (Number.isFinite(parsedBudget) && parsedBudget >= 0);
  const [activeSection, setActiveSection] = useState<PreferenceSection>("settings");
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.subTabs}>
        {sections.map((section) => {
          const selected = activeSection === section;
          const label = section === "settings" ? t("prefs.tabGeneral") : section === "bannedMeals" ? t("menu.tabBannedMeals") : t("menu.tabBannedIngredients");
          const count = section === "bannedMeals" ? bannedMeals.length : section === "bannedIngredients" ? bannedIngredients.length : null;
          return <Pressable
            key={section}
            accessibilityRole="button"
            accessibilityLabel={count === null ? label : `${label}, ${count}`}
            accessibilityState={{ selected }}
            onPress={() => setActiveSection(section)}
            style={[styles.subTab, selected && styles.subTabSelected]}
          >
            <Text numberOfLines={1} style={[styles.subTabText, selected && styles.subTabTextSelected]}>{label}</Text>
            {count !== null && (
              <View style={[styles.subTabCount, selected && styles.subTabCountSelected]}>
                <Text style={[styles.subTabCountText, selected && styles.subTabCountTextSelected]}>{count}</Text>
              </View>
            )}
          </Pressable>;
        })}
      </View>
      {activeSection === "settings" && <>
      <View style={styles.profileSection}>
        <View style={[styles.choiceGroup, styles.firstGroup]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.choiceTitle, styles.cardHeaderTitle]}>{t("prefs.planStyle")}</Text>
            <LanguageDropdown />
          </View>
          <View style={styles.planStyles}>
            {planStyleOptions.map((option) => (
              <ChoiceButton
                key={option}
                label={t(`planStyle.${option}`)}
                accessibilityLabel={t("prefs.planStyleA11y", { label: t(`planStyle.${option}`) })}
                selected={mealPreferences.planStyle === option}
                onPress={() => onMealPreferencesChange({ ...mealPreferences, planStyle: option })}
              />
            ))}
          </View>
          {mealPreferences.planStyle === "batchCooking" && (
            <Text style={styles.planStyleHint}>{t("planStyle.batchCookingDesc")}</Text>
          )}
        </View>
        <View style={styles.choiceGroup}>
          <Text style={styles.choiceTitle}>{t("calendar.goalLabel")}</Text>
          <AmountStepper
            value={goalInput}
            onChangeText={onGoalInputChange}
            onStep={(direction) => onAdjustGoal(direction * 100)}
            unit={t("common.kcal")}
            keyboardType="number-pad"
            maxLength={5}
            inputLabel={t("calendar.goalLabel")}
            inputHint={t("calendar.goalHint", { min: MIN_DAILY_CALORIE_GOAL, max: MAX_DAILY_CALORIE_GOAL })}
            decreaseLabel={t("calendar.decrease")}
            increaseLabel={t("calendar.increase")}
            invalid={!hasValidGoal}
          />
          {!hasValidGoal && <Text style={styles.budgetError}>{t("calendar.goalError")}</Text>}
        </View>
        <View style={styles.choiceGroup}>
          <Text style={styles.choiceTitle}>{t("prefs.budget")}</Text>
          <View style={styles.budgetLine}>
            <AmountStepper
              value={mealPreferences.weeklyBudget}
              onChangeText={(weeklyBudget) => onMealPreferencesChange({ ...mealPreferences, weeklyBudget })}
              onStep={(direction) => onMealPreferencesChange({
                ...mealPreferences,
                weeklyBudget: stepBudget(mealPreferences.weeklyBudget, direction * getBudgetStep(currencyCode))
              })}
              unit={getCurrencySymbol(currencyCode)}
              keyboardType="decimal-pad"
              maxLength={9}
              inputLabel={t("prefs.budget")}
              decreaseLabel={t("prefs.budgetDecrease")}
              increaseLabel={t("prefs.budgetIncrease")}
              invalid={!budgetIsValid}
              warning={!!budgetWarning}
            />
            {budgetWarning && (
              <Text style={[styles.budgetWarnText, styles.budgetWarnInline]}>
                {t("calendar.budgetWarning", {
                  cost: formatMoney({ amountMinorUnits: budgetWarning.weeklyCost, currencyCode })
                })}
              </Text>
            )}
          </View>
          {!budgetIsValid && (
            <Text style={styles.budgetError}>{t("prefs.budgetError")}</Text>
          )}
        </View>
        <FrequencyChoice
          title={t("prefs.meatFish")}
          value={mealPreferences.meatPerWeek}
          onChange={(value) => onMealPreferencesChange({ ...mealPreferences, meatPerWeek: value })}
        />
        <FrequencyChoice
          title={t("prefs.dairy")}
          value={mealPreferences.dairyPerWeek}
          onChange={(value) => onMealPreferencesChange({ ...mealPreferences, dairyPerWeek: value })}
        />
        <View style={styles.choiceGroup}>
          <Text style={styles.choiceTitle}>{t("prefs.typicalBreakfast")}</Text>
          <View style={styles.frequencyChoices}>
            <ChoiceButton
              label={t("prefs.noFixedBreakfast")}
              selected={mealPreferences.typicalBreakfast.mode === "none"}
              onPress={() => onMealPreferencesChange({
                ...mealPreferences, typicalBreakfast: { mode: "none" }
              })}
            />
            {typicalBreakfastPresets.map((preset) => {
              const selected = mealPreferences.typicalBreakfast.mode === "preset" &&
                mealPreferences.typicalBreakfast.presetId === preset.id;
              return (
                <View key={preset.id} style={styles.breakfastPreset}>
                  <ChoiceButton
                    label={food(preset.label)}
                    accessibilityLabel={t("prefs.presetA11y", { label: food(preset.label) })}
                    selected={selected}
                    onPress={() => onMealPreferencesChange({
                      ...mealPreferences,
                      typicalBreakfast: { mode: "preset", presetId: preset.id }
                    })}
                  />
                </View>
              );
            })}
            <ChoiceButton
              label={t("prefs.customBreakfast")}
              selected={mealPreferences.typicalBreakfast.mode === "custom"}
              onPress={() => onMealPreferencesChange({
                ...mealPreferences,
                typicalBreakfast: mealPreferences.typicalBreakfast.mode === "custom"
                  ? mealPreferences.typicalBreakfast
                  : {
                    mode: "custom",
                    ingredients: [
                      { name: "Rolled oats", quantity: "50", unit: "g" },
                      { name: "Milk", quantity: "200", unit: "ml" }
                    ]
                  }
              })}
            />
          </View>
          {mealPreferences.typicalBreakfast.mode === "custom" && (
            <CustomBreakfastBuilder
              ingredients={mealPreferences.typicalBreakfast.ingredients}
              countryCode={countryCode}
              onChange={(ingredients) => onMealPreferencesChange({
                ...mealPreferences,
                typicalBreakfast: { mode: "custom", ingredients }
              })}
            />
          )}
        </View>
        <View style={styles.choiceGroup}>
          <Text style={styles.choiceTitle}>{t("prefs.mealsPerDay")}</Text>
          <View style={styles.frequencyChoices}>
            {mealsPerDayOptions.map((option) => (
              <ChoiceButton
                key={option}
                label={t(`mealsPerDay.${option}`)}
                accessibilityLabel={t("prefs.mealsPerDayA11y", { label: t(`mealsPerDay.${option}`) })}
                selected={mealPreferences.mealsPerDay === option}
                onPress={() => onMealPreferencesChange({
                  ...mealPreferences,
                  mealsPerDay: option
                })}
              />
            ))}
          </View>
        </View>
        <View style={styles.choiceGroup}>
          <Text style={styles.choiceTitle}>{t("prefs.fruit")}</Text>
          <View style={styles.fruitChoices}>
            {fruitOptions.map((option) => (
              <ChoiceButton
                key={option.value}
                label={t(option.labelKey)}
                accessibilityLabel={t("prefs.fruitA11y", { label: t(option.labelKey) })}
                selected={mealPreferences.fruitPreference === option.value}
                onPress={() =>
                  onMealPreferencesChange({ ...mealPreferences, fruitPreference: option.value })
                }
              />
            ))}
          </View>
        </View>
        <View style={styles.countrySection}>
          <Text style={styles.choiceTitle}>{t("prefs.country")}</Text>
          <View style={styles.countryChoices}>
            {countries.map((country) => (
              <ChoiceButton
                key={country.code}
                label={`${country.name} · ${country.currencyCode}`}
                accessibilityLabel={t("prefs.countryA11y", { country: country.name, currency: country.currencyCode })}
                selected={country.code === countryCode}
                onPress={() => onCountryChange(country.code)}
              />
            ))}
          </View>
        </View>
      </View>
      </>}
      {activeSection === "bannedMeals" && <BannedMealsSection
        recipes={recipes}
        bannedMeals={bannedMeals}
        mealSubstitutes={mealSubstitutes}
        onUnban={onUnban}
        onMealPress={onMealPress}
      />}
      {activeSection === "bannedIngredients" && <BannedIngredientsSection
        bannedIngredients={bannedIngredients}
        onToggleIngredientBan={onToggleIngredientBan}
        onToggleIngredientCategory={onToggleIngredientCategory}
      />}
    </ScrollView>
  );
}

function CustomBreakfastBuilder({
  ingredients,
  countryCode,
  onChange
}: {
  ingredients: TypicalBreakfastIngredient[];
  countryCode: CountryCode;
  onChange: (ingredients: TypicalBreakfastIngredient[]) => void;
}): React.JSX.Element {
  const { t } = useTranslation();
  const { food, unit } = useFoodNames();
  const selectedNames = new Set(ingredients.map((ingredient) => ingredient.name));
  const available = customBreakfastIngredientOptions.filter((option) => !selectedNames.has(option.name));
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCost = 0;
  let quantityError = false;
  ingredients.forEach((ingredient) => {
    try {
      if (!isValidPositiveIngredientQuantity(ingredient.quantity)) {
        quantityError = true;
        return;
      }
      const estimate = estimateIngredient(ingredient.name, ingredient.quantity, ingredient.unit, countryCode);
      totalCalories += estimate.calories;
      totalProtein += estimate.proteinGrams;
      totalCost += estimate.estimatedCostCents;
    } catch {
      quantityError = true;
    }
  });
  return (
    <View style={styles.customBreakfast}>
      <Text style={styles.customBreakfastTitle}>{t("prefs.buildBreakfast")}</Text>
      <View style={styles.customIngredientChoices}>
        {available.map((option) => (
          <ChoiceButton
            key={option.key}
            label={t("prefs.addIngredient",             { name: food(option.name) })}
                        accessibilityLabel={t("prefs.addIngredientA11y", { name: food(option.name) })}
            selected={false}
            onPress={() => onChange([...ingredients, {
              name: option.name, quantity: option.quantity, unit: option.unit
            }])}
          />
        ))}
      </View>
      {ingredients.map((ingredient, index) => (
        <View key={`${ingredient.name}-${index}`} style={styles.customIngredientRow}>
          <Text style={styles.customIngredientName}>          {food(ingredient.name)}</Text>
          <TextInput
                      accessibilityLabel={t("prefs.quantityA11y", { name: food(ingredient.name) })}
            keyboardType="decimal-pad"
            value={ingredient.quantity}
            onChangeText={(quantity) => onChange(ingredients.map((item, itemIndex) =>
              itemIndex === index ? { ...item, quantity } : item
            ))}
            style={styles.customQuantity}
          />
          <Text style={styles.customUnit}>          {unit(ingredient.unit)}</Text>
          <Pressable
            accessibilityRole="button"
                      accessibilityLabel={t("prefs.removeA11y", { name: food(ingredient.name) })}
            disabled={ingredients.length <= 1}
            onPress={() => onChange(ingredients.filter((_item, itemIndex) => itemIndex !== index))}
            style={styles.removeIngredient}
          >
            <Text style={styles.removeIngredientText}>×</Text>
          </Pressable>
        </View>
      ))}
      <Text style={styles.customPreview}>
        {quantityError || ingredients.length === 0 ? t("prefs.checkQuantities") : `${totalCalories} kcal · ${Math.round(totalProtein * 10) / 10} g protein · ~${formatMoney({
          amountMinorUnits: totalCost, currencyCode: getCountry(countryCode).currencyCode
        }, getCountry(countryCode).locale)}`}
      </Text>
      {(quantityError || ingredients.length === 0) && (
        <Text accessibilityRole="alert" style={styles.quantityError}>
          {t("prefs.quantityError")}
        </Text>
      )}
    </View>
  );
}

function FrequencyChoice({
  title,
  value,
  onChange
}: {
  title: string;
  value: WeeklyFrequency;
  onChange: (value: WeeklyFrequency) => void;
}): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <View style={styles.choiceGroup}>
      <Text style={styles.choiceTitle}>{t("prefs.perWeek", { title })}</Text>
      <View style={styles.frequencyChoices}>
        {frequencyOptions.map((option) => (
          <ChoiceButton
            key={option.value}
            label={option.value === 0 ? t("prefs.never") : option.value === 7 ? t("prefs.everyDay") : t("prefs.timesPerWeek", { count: option.value })}
            accessibilityLabel={option.value === 7
              ? t("prefs.freqEveryDay", { title })
              : option.value === 0
                ? t("prefs.freqNever", { title })
                : t("prefs.freqTimes", { title, count: option.value })}
            selected={value === option.value}
            onPress={() => onChange(option.value)}
          />
        ))}
      </View>
    </View>
  );
}

function ChoiceButton({
  label,
  accessibilityLabel,
  selected,
  onPress
}: {
  label: string;
  accessibilityLabel?: string;
  selected: boolean;
  onPress: () => void;
}): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.choiceButton, selected && styles.choiceButtonSelected]}
    >
      <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingTop: 22, paddingBottom: 36 },
  profileSection: { backgroundColor: palette.white, borderRadius: 17, padding: 15, marginBottom: 27, borderWidth: 1, borderColor: "#F0F0EA" },
  choiceGroup: { marginTop: 15 },
  firstGroup: { marginTop: 0, zIndex: 20 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8, zIndex: 20 },
  cardHeaderTitle: { flex: 1, marginBottom: 0 },
  breakfastPreset: { flexBasis: "48%", flexGrow: 1 },
  customBreakfast: { marginTop: 10, padding: 10, borderRadius: 11, backgroundColor: "#F7F7F3" },
  customBreakfastTitle: { color: palette.ink, fontSize: 12, fontWeight: "700", marginBottom: 8 },
  customIngredientChoices: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  customIngredientRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  customIngredientName: { flex: 1, color: palette.ink, fontSize: 11 },
  customQuantity: { minWidth: 48, borderRadius: 7, backgroundColor: palette.white, paddingHorizontal: 7, paddingVertical: 5, textAlign: "right", color: palette.ink, fontSize: 12 },
  customUnit: { color: palette.muted, fontSize: 10, marginLeft: 5, minWidth: 35 },
  removeIngredient: { width: 26, height: 26, alignItems: "center", justifyContent: "center", marginLeft: 5 },
  removeIngredientText: { color: palette.muted, fontSize: 20 },
  customPreview: { color: palette.green, fontSize: 11, fontWeight: "700", marginTop: 10 },
  quantityError: { color: "#8B3027", fontSize: 10, lineHeight: 14, marginTop: 4 },
  countrySection: { marginTop: 16 },
  countryChoices: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  choiceTitle: { color: palette.ink, fontSize: 13, fontWeight: "700", marginBottom: 8 },
  frequencyChoices: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  fruitChoices: { gap: 7 },
  choiceButton: { backgroundColor: "#F7F7F3", borderWidth: 1, borderColor: "#F1F1EC", borderRadius: 9, paddingHorizontal: 9, paddingVertical: 9, alignItems: "center", justifyContent: "center" },
  choiceButtonSelected: { backgroundColor: palette.softGreen, borderColor: "#C9D9C9" },
  choiceText: { color: palette.muted, fontSize: 11, fontWeight: "500" },
  choiceTextSelected: { color: palette.green, fontWeight: "700" },
  sectionTitle: { color: palette.ink, fontSize: 19, fontWeight: "700", letterSpacing: -0.4 },
  planStyles: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  planStyleHint: { color: palette.muted, fontSize: 11, lineHeight: 16, marginTop: 8 },
  budgetWarnInline: { flex: 1, marginLeft: 10, fontSize: 12, lineHeight: 16 },
  budgetWarnText: { color: "#B36A0B" },
  budgetLine: { flexDirection: "row", alignItems: "center" },
  budgetError: { color: "#8B3027", fontSize: 10, marginTop: 6 },
  subTabs: { flexDirection: "row", gap: 5, padding: 4, marginBottom: 16, backgroundColor: "#ECEAE1", borderRadius: 13 },
  subTab: { flex: 1, gap: 3, alignItems: "center", justifyContent: "center", minHeight: 42, paddingHorizontal: 4, paddingVertical: 5, borderRadius: 10 },
  subTabSelected: { backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line },
  subTabText: { color: palette.muted, fontSize: 10, fontWeight: "700" },
  subTabTextSelected: { color: palette.green },
  subTabCount: { minWidth: 20, height: 14, borderRadius: 7, paddingHorizontal: 5, alignItems: "center", justifyContent: "center", backgroundColor: "#DEDBD0" },
  subTabCountSelected: { backgroundColor: palette.softGreen },
  subTabCountText: { color: palette.muted, fontSize: 9, lineHeight: 12, fontWeight: "800" },
  subTabCountTextSelected: { color: palette.green }
});
