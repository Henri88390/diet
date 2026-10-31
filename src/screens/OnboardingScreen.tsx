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

type Props = {
  bannedIngredients: IngredientBans;
  onToggleIngredientBan: (ingredientId: string) => void;
  mealPreferences: MealPreferences;
  onMealPreferencesChange: (preferences: MealPreferences) => void;
  countryCode: CountryCode;
  onCountryChange: (countryCode: CountryCode) => void;
  onContinue: () => void;
};

const frequencyOptions: { value: WeeklyFrequency; label: string }[] = [
  { value: 0, label: "Never" },
  { value: 7, label: "Every day" },
  { value: 1, label: "1 / wk" },
  { value: 2, label: "2 / wk" },
  { value: 3, label: "3 / wk" }
];

const fruitOptions: { value: FruitPreference; label: string }[] = [
  { value: "include", label: "Include with meals" },
  { value: "optional", label: "Optional" },
  { value: "avoid", label: "Avoid fruit" }
];

const mealsPerDayOptions: { value: MealsPerDay; label: string }[] = [
  { value: 2, label: "2 meals" },
  { value: 3, label: "3 meals" },
  { value: 4, label: "3 + 1 snack" },
  { value: 5, label: "3 + 2 snacks" }
];
const planStyleOptions: { value: PlanStyle; label: string; description: string }[] = [
  { value: "balanced", label: "Balanced", description: "A practical mix of foods and costs" },
  { value: "highProtein", label: "Higher protein", description: "Favors protein-rich ingredients" },
  { value: "lowCost", label: "Lower cost", description: "Prefers lower-cost ingredient choices" },
  { value: "moreVariety", label: "More ingredient variety", description: "Rotates ingredients more often" },
  { value: "simpleIngredients", label: "Simple ingredients", description: "Repeats familiar ingredients to keep meals and groceries simple" }
];

export function OnboardingScreen({
  bannedIngredients,
  onToggleIngredientBan,
  mealPreferences,
  onMealPreferencesChange,
  countryCode,
  onCountryChange,
  onContinue
}: Props): React.JSX.Element {
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
      <ArrowButton
        label="See my plan"
        disabled={!typicalBreakfastIsValid}
        onPress={onContinue}
        style={{ marginBottom: 17 }}
      />
      <View style={styles.profileSection}>
        <View style={styles.choiceGroup}>
          <Text style={styles.choiceTitle}>Meal plan style</Text>
          <View style={styles.planStyles}>
            {planStyleOptions.map((option) => (
              <ChoiceButton
                key={option.value}
                label={option.label}
                accessibilityLabel={`Meal plan style: ${option.label}`}
                selected={mealPreferences.planStyle === option.value}
                onPress={() => onMealPreferencesChange({ ...mealPreferences, planStyle: option.value })}
              />
            ))}
          </View>
        </View>
        <View style={styles.choiceGroup}>
          <Text style={styles.choiceTitle}>Weekly food budget</Text>
          <View style={styles.budgetRow}>
            <TextInput
              accessibilityLabel="Weekly food budget"
              keyboardType="decimal-pad"
              maxLength={9}
              onChangeText={(weeklyBudget) =>
                onMealPreferencesChange({ ...mealPreferences, weeklyBudget })
              }
              style={styles.budgetInput}
              value={mealPreferences.weeklyBudget}
            />
            <Text style={styles.budgetCurrency}>{getCountry(countryCode).currencyCode} / week</Text>
          </View>
          {!budgetIsValid && (
            <Text style={styles.budgetError}>Enter a non-negative amount or leave the budget blank.</Text>
          )}
        </View>
        <FrequencyChoice
          title="Meat / fish"
          value={mealPreferences.meatPerWeek}
          onChange={(value) => onMealPreferencesChange({ ...mealPreferences, meatPerWeek: value })}
        />
        <FrequencyChoice
          title="Dairy"
          value={mealPreferences.dairyPerWeek}
          onChange={(value) => onMealPreferencesChange({ ...mealPreferences, dairyPerWeek: value })}
        />
        <View style={styles.choiceGroup}>
          <Text style={styles.choiceTitle}>Typical breakfast</Text>
          <View style={styles.frequencyChoices}>
            <ChoiceButton
              label="No fixed breakfast"
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
                    label={preset.label}
                    accessibilityLabel={`Typical breakfast preset: ${preset.label}`}
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
              label="Custom breakfast"
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
          <Text style={styles.choiceTitle}>Meals per day</Text>
          <View style={styles.frequencyChoices}>
            {mealsPerDayOptions.map((option) => (
              <ChoiceButton
                key={option.value}
                label={option.label}
                accessibilityLabel={`Meals per day: ${option.label}`}
                selected={mealPreferences.mealsPerDay === option.value}
                onPress={() => onMealPreferencesChange({
                  ...mealPreferences,
                  mealsPerDay: option.value
                })}
              />
            ))}
          </View>
        </View>
        <View style={styles.choiceGroup}>
          <Text style={styles.choiceTitle}>Fruit</Text>
          <View style={styles.fruitChoices}>
            {fruitOptions.map((option) => (
              <ChoiceButton
                key={option.value}
                label={option.label}
                accessibilityLabel={`Fruit preference: ${option.label}`}
                selected={mealPreferences.fruitPreference === option.value}
                onPress={() =>
                  onMealPreferencesChange({ ...mealPreferences, fruitPreference: option.value })
                }
              />
            ))}
          </View>
        </View>
        <View style={styles.countrySection}>
          <Text style={styles.choiceTitle}>Country and currency</Text>
          <View style={styles.countryChoices}>
            {countries.map((country) => (
              <ChoiceButton
                key={country.code}
                label={`${country.name} · ${country.currencyCode}`}
                accessibilityLabel={`Country: ${country.name}, currency ${country.currencyCode}`}
                selected={country.code === countryCode}
                onPress={() => onCountryChange(country.code)}
              />
            ))}
          </View>
        </View>
      </View>
      <View style={styles.banSection}>
        <Text style={styles.sectionTitle}>Ban ingredients</Text>
        {ingredientCategoryOrder.map((category) => (
          <View key={category} style={styles.banCategory}>
            <Text style={styles.banCategoryTitle}>{category}</Text>
            <View style={styles.banChoices}>
              {ingredientCatalog.filter((ingredient) => ingredient.category === category).map((ingredient) => {
                const isBanned = bannedIngredients.includes(ingredient.id);
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${isBanned ? "Unban" : "Ban"} ${ingredient.name}`}
                    accessibilityState={{ selected: isBanned }}
                    key={ingredient.id}
                    onPress={() => onToggleIngredientBan(ingredient.id)}
                    style={[styles.banButton, isBanned && styles.banButtonSelected]}
                  >
                    <Text style={[styles.banText, isBanned && styles.banTextSelected]}>
                      {ingredient.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </View>
      <ArrowButton
        label="See my plan"
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
      <Text style={styles.customBreakfastTitle}>Build your usual breakfast</Text>
      <View style={styles.customIngredientChoices}>
        {available.map((option) => (
          <ChoiceButton
            key={option.key}
            label={`+ ${option.name}`}
            accessibilityLabel={`Add ${option.name} to custom breakfast`}
            selected={false}
            onPress={() => onChange([...ingredients, {
              name: option.name, quantity: option.quantity, unit: option.unit
            }])}
          />
        ))}
      </View>
      {ingredients.map((ingredient, index) => (
        <View key={`${ingredient.name}-${index}`} style={styles.customIngredientRow}>
          <Text style={styles.customIngredientName}>{ingredient.name}</Text>
          <TextInput
            accessibilityLabel={`${ingredient.name} quantity`}
            keyboardType="decimal-pad"
            value={ingredient.quantity}
            onChangeText={(quantity) => onChange(ingredients.map((item, itemIndex) =>
              itemIndex === index ? { ...item, quantity } : item
            ))}
            style={styles.customQuantity}
          />
          <Text style={styles.customUnit}>{ingredient.unit}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove ${ingredient.name}`}
            disabled={ingredients.length <= 1}
            onPress={() => onChange(ingredients.filter((_item, itemIndex) => itemIndex !== index))}
            style={styles.removeIngredient}
          >
            <Text style={styles.removeIngredientText}>×</Text>
          </Pressable>
        </View>
      ))}
      <Text style={styles.customPreview}>
        {quantityError || ingredients.length === 0 ? "Check quantities" : `${totalCalories} kcal · ${Math.round(totalProtein * 10) / 10} g protein · ~${formatMoney({
          amountMinorUnits: totalCost, currencyCode: getCountry(countryCode).currencyCode
        }, getCountry(countryCode).locale)}`}
      </Text>
      {(quantityError || ingredients.length === 0) && (
        <Text accessibilityRole="alert" style={styles.quantityError}>
          Add an ingredient and enter a positive quantity for each item.
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
  return (
    <View style={styles.choiceGroup}>
      <Text style={styles.choiceTitle}>{title} per week</Text>
      <View style={styles.frequencyChoices}>
        {frequencyOptions.map((option) => (
          <ChoiceButton
            key={option.value}
            label={option.label}
            accessibilityLabel={`${title}: ${option.value === 7 ? "every day" : option.value === 0 ? "never" : `${option.value} times per week`}`}
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
  planStyles: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
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
