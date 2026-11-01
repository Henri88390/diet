import React from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { useTranslation } from "react-i18next";
import { palette } from "../theme";

type Props = {
  calories: number;
  proteinGrams: number;
  /** Already formatted, without the "~" prefix. */
  cost: string;
  style?: StyleProp<ViewStyle>;
};

/** The kcal / protein / cost chips shown on meal cards. */
export function MealStatChips({ calories, proteinGrams, cost, style }: Props): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <View style={[styles.row, style]}>
      <View style={styles.chip}><Text style={styles.chipText}>{t("meal.kcalChip", { value: calories })}</Text></View>
      <View style={[styles.chip, styles.chipProtein]}>
        <Text style={[styles.chipText, styles.chipTextProtein]}>{t("meal.proteinChip", { value: proteinGrams })}</Text>
      </View>
      <View style={[styles.chip, styles.chipCost]}>
        <Text style={[styles.chipText, styles.chipTextCost]}>~{cost}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: "#F1EEE4" },
  chipProtein: { backgroundColor: palette.softGreen },
  chipCost: { backgroundColor: "#F6E9D8" },
  chipText: { color: palette.ink, fontSize: 10, fontWeight: "700" },
  chipTextProtein: { color: palette.green },
  chipTextCost: { color: "#8A5A1F" }
});
