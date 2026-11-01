import React from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { useTranslation } from "react-i18next";
import { useFoodNames } from "../i18n";
import type { Meal } from "../models";

type Props = { meal: Meal; exclude?: string[]; style?: StyleProp<ViewStyle> };

/** Compact card marker for banned ingredients removed from a kept meal. */
export function BannedIngredientsChip({ meal, exclude = [], style }: Props): React.JSX.Element | null {
  const { t } = useTranslation();
  const { food } = useFoodNames();
  const names = [...new Set((meal.removedBannedIngredients ?? [])
    .map((item) => item.name)
    .filter((name) => !exclude.includes(name)))];
  if (names.length === 0) return null;
  return (
    <View style={[styles.chip, style]}>
      <Text style={styles.icon}>⊘</Text>
      <Text numberOfLines={2} style={styles.text}>{t("meal.bannedIngredients", { list: names.map(food).join(", ") })}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    maxWidth: "100%",
    marginTop: 5,
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: "#F8E9E5"
  },
  icon: { color: "#A23A2B", fontSize: 10, fontWeight: "800" },
  text: { flexShrink: 1, color: "#A23A2B", fontSize: 9, fontWeight: "700" }
});
