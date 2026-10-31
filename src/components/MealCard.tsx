import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Meal } from "../models";
import { mealAccent, mealBadge, palette } from "../theme";
import { formatMoney } from "../countryPricing";
import { useTranslation } from "react-i18next";
import { useFoodNames } from "../i18n";
import { BatchNote } from "./BatchCooking";

type Props = { meal: Meal; onPress: (meal: Meal) => void };

export function MealCard({ meal, onPress }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { food } = useFoodNames();
  const title = food(meal.title);
  const mealLabel = meal.type === "Snack" && meal.slot
    ? t("snackLabel", { slot: t(`snackSlot.${meal.slot}`, { defaultValue: meal.slot }) })
    : t(`mealType.${meal.type}`);
  const cost = formatMoney(
    meal.estimatedCost ?? { amountMinorUnits: meal.estimatedCostCents, currencyCode: meal.currencyCode ?? "EUR" },
    meal.currencyLocale
  );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("meal.a11y", { label: mealLabel, title, calories: meal.calories, protein: meal.proteinGrams })}
      accessibilityHint={t("meal.hint")}
      onPress={() => onPress(meal)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.typeBadge, { backgroundColor: mealBadge[meal.type].background }]}>
          <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} style={[styles.type, { color: mealBadge[meal.type].text }]}>{mealLabel}</Text>
        </View>
        <Text numberOfLines={2} style={styles.title}>{title}</Text>
      </View>
      <View style={styles.body}>
        <View style={[styles.icon, { backgroundColor: mealAccent[meal.type] }]}>
          <Text style={styles.emoji}>{meal.emoji}</Text>
        </View>
        <View style={styles.details}>
        <View style={styles.ingredientList}>
          {meal.description.split("·").map((part) => part.trim()).filter(Boolean).map((name, index) => (
            <View key={`${name}-${index}`} style={styles.ingredientPill}>
              <Text style={styles.ingredientPillText}>{food(name)}</Text>
            </View>
          ))}
        </View>
        {meal.banConflicts && meal.banConflicts.length > 0 && (
          <Text style={styles.banWarning}>
            {t("meal.banned", { list: meal.banConflicts.map(food).join(", ") })}
          </Text>
        )}
        <View style={styles.metaRow}>
          <View style={styles.chip}><Text style={styles.chipText}>{t("meal.kcalChip", { value: meal.calories })}</Text></View>
          <View style={[styles.chip, styles.chipProtein]}>
            <Text style={[styles.chipText, styles.chipTextProtein]}>{t("meal.proteinChip", { value: meal.proteinGrams })}</Text>
          </View>
          <View style={[styles.chip, styles.chipCost]}>
            <Text style={[styles.chipText, styles.chipTextCost]}>~{cost}</Text>
          </View>
        </View>
        {meal.batch && <BatchNote />}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: palette.white, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: "#F0F0EA" },
  pressed: { opacity: 0.78 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  body: { flexDirection: "row", marginTop: 8 },
  icon: { width: 72, height: 49, borderRadius: 14, alignItems: "center", justifyContent: "center", marginRight: 12 },
  emoji: { fontSize: 24 },
  details: { flex: 1 },
  typeBadge: { width: 72, borderRadius: 8,   paddingVertical: 3, paddingHorizontal: 4, alignItems: "center" },
    type: { fontSize: 10, fontWeight: "700", textAlign: "center" },
  title: { flex: 1, color: palette.ink, fontSize: 14, fontWeight: "700" },
  ingredientList: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
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
