import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Meal } from "../models";
import { mealAccent, mealBadge, mealTypeIcon, palette } from "../theme";
import { formatMoney } from "../countryPricing";
import { useTranslation } from "react-i18next";
import { useFoodNames } from "../i18n";
import { BatchNote } from "./BatchCooking";
import { MealStatChips } from "./MealStatChips";
import { BannedIngredientsChip } from "./BannedIngredientsChip";

type Props = { meal: Meal; onPress: (meal: Meal) => void; footer?: React.ReactNode; corner?: React.ReactNode };

export function MealCard({ meal, onPress, footer, corner }: Props): React.JSX.Element {
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
      {corner ? <View style={styles.corner}>{corner}</View> : (
        <View accessible={false} style={[styles.typeIcon, { backgroundColor: mealBadge[meal.type].background }]}>
          <Text style={styles.typeIconText}>{mealTypeIcon[meal.type]}</Text>
        </View>
      )}
      <View style={styles.body}>
        <View style={[styles.icon, { backgroundColor: mealAccent[meal.type] }]}>
          <Text style={styles.emoji}>{meal.emoji}</Text>
        </View>
        <View style={styles.details}>
        <View style={[styles.headerRow, corner ? styles.headerRowWide : null]}>
          <Text numberOfLines={2} style={styles.title}>{title}</Text>
        </View>
        {meal.banConflicts && meal.banConflicts.length > 0 && (
          <Text style={styles.banWarning}>
            {t("meal.banned", { list: meal.banConflicts.map(food).join(", ") })}
          </Text>
        )}
        <BannedIngredientsChip meal={meal} exclude={meal.banConflicts} />
        {meal.isReplaced && <View style={styles.replacedChip}><Text style={styles.replacedChipText}>{t("mealActions.replaced")}</Text></View>}
        <MealStatChips style={styles.metaRow} calories={meal.calories} proteinGrams={meal.proteinGrams} cost={cost} />
        {meal.batch && <BatchNote />}
        {footer}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: palette.white, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: "#F0F0EA" },
  pressed: { opacity: 0.78 },
  headerRow: { flexDirection: "row", alignItems: "center", paddingRight: 30 },
  headerRowWide: { paddingRight: 64 },
  body: { flexDirection: "row", alignItems: "center" },
  typeIcon: { position: "absolute", top: 8, right: 8, width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", zIndex: 1 },
  typeIconText: { fontSize: 14 },
  corner: { position: "absolute", top: 8, right: 8, zIndex: 1 },
  icon: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", marginRight: 12 },
  emoji: { fontSize: 24 },
  details: { flex: 1 },
  title: { flex: 1, color: palette.ink, fontSize: 14, fontWeight: "700" },
  metaRow: { marginTop: 6 },
  banWarning: { color: "#8B3027", fontSize: 10, lineHeight: 14, marginTop: 5 },
  replacedChip: { alignSelf: "flex-start", marginTop: 5, borderRadius: 7, paddingHorizontal: 7, paddingVertical: 2, backgroundColor: "#F1EEE4" },
  replacedChipText: { color: palette.muted, fontSize: 9, fontWeight: "700" }
});
