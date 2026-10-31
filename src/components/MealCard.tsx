import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Meal } from "../models";
import { mealAccent, mealBadge, palette } from "../theme";
import { formatMoney } from "../countryPricing";
import { useTranslation } from "react-i18next";
import { useFoodNames } from "../i18n";
import { BatchNote } from "./BatchCooking";

type Props = { meal: Meal; onPress: (meal: Meal) => void };

const mealTypeIcon = { Breakfast: "🌅", Lunch: "☀️", Dinner: "🌙", Snack: "🍎" } as const;

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
      <View accessible={false} style={[styles.typeIcon, { backgroundColor: mealBadge[meal.type].background }]}>
        <Text style={styles.typeIconText}>{mealTypeIcon[meal.type]}</Text>
      </View>
      <View style={styles.body}>
        <View style={[styles.icon, { backgroundColor: mealAccent[meal.type] }]}>
          <Text style={styles.emoji}>{meal.emoji}</Text>
        </View>
        <View style={styles.details}>
        <View style={styles.headerRow}>
          <Text numberOfLines={2} style={styles.title}>{title}</Text>
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
  headerRow: { flexDirection: "row", alignItems: "center", paddingRight: 30 },
  body: { flexDirection: "row", alignItems: "center" },
  typeIcon: { position: "absolute", top: 8, right: 8, width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", zIndex: 1 },
  typeIconText: { fontSize: 14 },
  icon: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", marginRight: 12 },
  emoji: { fontSize: 24 },
  details: { flex: 1 },
  title: { flex: 1, color: palette.ink, fontSize: 14, fontWeight: "700" },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  chip: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: "#F1EEE4" },
  chipProtein: { backgroundColor: palette.softGreen },
  chipCost: { backgroundColor: "#F6E9D8" },
  chipText: { color: palette.ink, fontSize: 10, fontWeight: "700" },
  chipTextProtein: { color: palette.green },
  chipTextCost: { color: "#8A5A1F" },
  banWarning: { color: "#8B3027", fontSize: 10, lineHeight: 14, marginTop: 5 }
});
