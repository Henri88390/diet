import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type {
  FruitPreference,
  IngredientBans,
  MealsPerDay,
  MealPreferences,
  PlanStyle,
  TypicalBreakfastIngredient,
  WeeklyFrequency
} from "../models";
import { ingredientCatalog, ingredientCategoryOrder } from "../ingredientCatalog";
import { palette } from "../theme";
import { countries, formatMoney, getCountry, type CountryCode } from "../countryPricing";
import {
  estimateIngredient,
  isValidPositiveIngredientQuantity
} from "../ingredientEstimates";
import { customBreakfastIngredientOptions, typicalBreakfastPresets } from "../typicalBreakfast";
import { ArrowButton } from "../components/ArrowButton";
import { LanguageDropdown } from "../components/LanguageDropdown";
import { useFoodNames } from "../i18n";
import { useTranslation } from "react-i18next";

type Props = {
  bannedIngredients: IngredientBans;
  onToggleIngredientBan: (ingredientId: string) => void;
  mealPreferences: MealPreferences;
  onMealPreferencesChange: (preferences: MealPreferences) => void;
  countryCode: CountryCode;
  onCountryChange: (countryCode: CountryCode) => void;
  onContinue: () => void;
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

export function OnboardingScreen({
  bannedIngredients,
  onToggleIngredientBan,
  mealPreferences,
  onMealPreferencesChange,
  countryCode,
  onCountryChange,
  onContinue
}: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { food } = useFoodNames();
  const parsedBudget = Number(mealPreferences.weeklyBudget.replace(",", "."));
  const budgetIsValid = mealPreferences.weeklyBudget.trim() === "" ||
    (Number.isFinite(parsedBudget) && parsedBudget >= 0);
  const typicalBreakfastIsValid = mealPreferences.typicalBreakfast.mode !== "custom" ||
    (mealPreferences.typicalBreakfast.ingredients.length > 0 &&
      mealPreferences.typicalBreakfast.ingredients.every((ingredient) =>
        isValidCustomBreakfastIngredient(ingredient, countryCode)
      ));
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <ArrowButton
          label={t("common.seeMyPlan")}
          disabled={!typicalBreakfastIsValid}
          onPress={onContinue}
          style={{ flex: 1 }}
        />
        <LanguageDropdown />
      </View>
      <View style={styles.profileSection}>
        <View style={styles.choiceGroup}>
          <Text style={styles.choiceTitle}>{t("prefs.planStyle")}</Text>
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
          <Text style={styles.choiceTitle}>{t("prefs.budget")}</Text>
          <View style={styles.budgetRow}>
            <TextInput
              accessibilityLabel={t("prefs.budget")}
              keyboardType="decimal-pad"
              maxLength={9}
              onChangeText={(weeklyBudget) =>
                onMealPreferencesChange({ ...mealPreferences, weeklyBudget })
              }
              style={styles.budgetInput}
              value={mealPreferences.weeklyBudget}
            />
            <Text style={styles.budgetCurrency}>{t("prefs.perWeekCurrency", { currency: getCountry(countryCode).currencyCode })}</Text>
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
      <View style={styles.banSection}>
        <Text style={styles.sectionTitle}>{t("prefs.banIngredients")}</Text>
        {ingredientCategoryOrder.map((category) => (
          <View key={category} style={styles.banCategory}>
            <Text style={styles.banCategoryTitle}>{t(`grocery.category.${category}`, { defaultValue: category })}</Text>
            <View style={styles.banChoices}>
              {ingredientCatalog.filter((ingredient) => ingredient.category === category).map((ingredient) => {
                const isBanned = bannedIngredients.includes(ingredient.id);
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t(isBanned ? "prefs.unban" : "prefs.ban",                     { name: food(ingredient.name) })}
                    accessibilityState={{ selected: isBanned }}
                    key={ingredient.id}
                    onPress={() => onToggleIngredientBan(ingredient.id)}
                    style={[styles.banButton, isBanned && styles.banButtonSelected]}
                  >
                    <Text style={[styles.banText, isBanned && styles.banTextSelected]}>
                                          {food(ingredient.name)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </View>
      <ArrowButton
        label={t("common.seeMyPlan")}
        disabled={!typicalBreakfastIsValid}
        onPress={onContinue}
        style={{ marginTop: 17 }}
      />
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

function isValidCustomBreakfastIngredient(
  ingredient: TypicalBreakfastIngredient,
  countryCode: CountryCode
): boolean {
  if (!isValidPositiveIngredientQuantity(ingredient.quantity)) return false;
  try {
    estimateIngredient(ingredient.name, ingredient.quantity, ingredient.unit, countryCode);
    return true;
  } catch (error) {
    if (error instanceof RangeError) return false;
    throw error;
  }
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
  topRow: { flexDirection: "row", alignItems: "center", marginBottom: 17, zIndex: 20 },
  profileSection: { backgroundColor: palette.white, borderRadius: 17, padding: 15, marginBottom: 27, borderWidth: 1, borderColor: "#F0F0EA" },
  choiceGroup: { marginTop: 15 },
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
  budgetRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#F7F7F3", borderRadius: 10, paddingHorizontal: 11, minHeight: 44 },
  budgetInput: { minWidth: 70, color: palette.ink, fontSize: 15, fontWeight: "700", paddingVertical: 8 },
  budgetCurrency: { color: palette.muted, fontSize: 11, marginLeft: 8 },
  budgetError: { color: "#8B3027", fontSize: 10, marginTop: 6 },
  banSection: { marginBottom: 16 },
  banCategory: { backgroundColor: palette.white, borderRadius: 13, padding: 12, marginTop: 10, borderWidth: 1, borderColor: "#E3E7DE" },
  banCategoryTitle: { color: palette.green, fontSize: 13, fontWeight: "800", marginBottom: 8 },
  banChoices: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  banButton: { backgroundColor: "#F7F7F3", borderWidth: 1, borderColor: "#E7E9E2", borderRadius: 9, paddingHorizontal: 10, paddingVertical: 8 },
  banButtonSelected: { backgroundColor: "#F8E7E4", borderColor: "#DDAFA7" },
  banText: { color: palette.ink, fontSize: 11, fontWeight: "500" },
  banTextSelected: { color: "#8B3027", fontWeight: "700" },
  disclaimer: { color: palette.muted, fontSize: 11, lineHeight: 16, marginTop: 16, textAlign: "center", paddingHorizontal: 8 },
  pressed: { opacity: 0.84 },
});
