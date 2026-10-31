import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Meal } from "../models";
import { mealAccent, palette } from "../theme";
import { formatMoney } from "../countryPricing";

type Props = { meal: Meal; onPress: (meal: Meal) => void };

export function MealCard({ meal, onPress }: Props): React.JSX.Element {
  const mealLabel = meal.type === "Snack" && meal.slot
    ? `${meal.slot} snack`
    : meal.type;
  const cost = formatMoney(
    meal.estimatedCost ?? { amountMinorUnits: meal.estimatedCostCents, currencyCode: meal.currencyCode ?? "EUR" },
    meal.currencyLocale
  );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${mealLabel}: ${meal.title}, ${meal.calories} kilocalories, ${meal.proteinGrams} grams protein`}
      accessibilityHint="Opens meal details and illustrative ingredient quantities"
      onPress={() => onPress(meal)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={[styles.icon, { backgroundColor: mealAccent[meal.type] }]}>
        <Text style={styles.emoji}>{meal.emoji}</Text>
      </View>
      <View style={styles.details}>
        <View style={styles.titleRow}>
          <Text style={styles.type}>{mealLabel}</Text>
        </View>
        <Text style={styles.title}>{meal.title}</Text>
        <View style={styles.ingredientList}>
          {meal.description.split("·").map((part) => part.trim()).filter(Boolean).map((name, index) => (
            <View key={`${name}-${index}`} style={styles.ingredientPill}>
              <Text style={styles.ingredientPillText}>{name}</Text>
            </View>
          ))}
        </View>
        {meal.banConflicts && meal.banConflicts.length > 0 && (
          <Text style={styles.banWarning}>
            Needs a replacement for banned: {meal.banConflicts.join(", ")}
          </Text>
        )}
        <View style={styles.metaRow}>
          <View style={styles.chip}><Text style={styles.chipText}>{meal.calories} kcal</Text></View>
          <View style={[styles.chip, styles.chipProtein]}>
            <Text style={[styles.chipText, styles.chipTextProtein]}>{meal.proteinGrams} g protein</Text>
          </View>
          <View style={[styles.chip, styles.chipCost]}>
            <Text style={[styles.chipText, styles.chipTextCost]}>~{cost}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", backgroundColor: palette.white, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: "#F0F0EA" },
  pressed: { opacity: 0.78 },
  icon: { width: 49, height: 49, borderRadius: 14, alignItems: "center", justifyContent: "center", marginRight: 12 },
  emoji: { fontSize: 24 },
  details: { flex: 1, paddingTop: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  type: { color: palette.green, fontSize: 10, fontWeight: "700", letterSpacing: 0.35 },
  title: { color: palette.ink, fontSize: 14, fontWeight: "700", marginTop: 5 },
  ingredientList: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  ingredientPill: { borderRadius: 9, paddingHorizontal: 9, paddingVertical: 4, backgroundColor: "#F4F4ED", borderWidth: 1, borderColor: "#E8EAE2" },
  ingredientPillText: { color: palette.ink, fontSize: 11, fontWeight: "500" },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 9 },
  chip: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: "#F1EEE4" },
  chipProtein: { backgroundColor: palette.softGreen },
  chipCost: { backgroundColor: "#F6E9D8" },
  chipText: { color: palette.ink, fontSize: 10, fontWeight: "700" },
  chipTextProtein: { color: palette.green },
  chipTextCost: { color: "#8A5A1F" },
  banWarning: { color: "#8B3027", fontSize: 10, lineHeight: 14, marginTop: 5 }
});
