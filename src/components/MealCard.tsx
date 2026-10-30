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
          <Text style={styles.calories}>{meal.calories} kcal</Text>
        </View>
        <Text style={styles.title}>{meal.title}</Text>
        <Text style={styles.description}>{meal.description}</Text>
        {meal.banConflicts && meal.banConflicts.length > 0 && (
          <Text style={styles.banWarning}>
            Needs a replacement for banned: {meal.banConflicts.join(", ")}
          </Text>
        )}
        <View style={styles.metaRow}>
          <Text style={styles.cost}>~{cost}</Text>
          <Text style={styles.protein}>{meal.proteinGrams} g protein</Text>
          <Text style={styles.duration}>◷ {meal.durationMinutes} min</Text>
        </View>
        <Text style={styles.hint}>Tap for ingredient estimates →</Text>
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
  calories: { color: palette.ink, fontSize: 10, fontWeight: "700" },
  title: { color: palette.ink, fontSize: 14, fontWeight: "700", marginTop: 5 },
  description: { color: palette.muted, fontSize: 11, marginTop: 3 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 9 },
  cost: { color: palette.green, fontSize: 11, fontWeight: "700" },
  protein: { color: palette.ink, fontSize: 10, fontWeight: "600", marginLeft: 10 },
  duration: { color: palette.muted, fontSize: 9, marginLeft: "auto" },
  hint: { color: palette.green, fontSize: 10, fontWeight: "600", marginTop: 8 },
  banWarning: { color: "#8B3027", fontSize: 10, lineHeight: 14, marginTop: 5 }
});
