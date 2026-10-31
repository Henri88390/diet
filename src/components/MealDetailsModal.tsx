import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Meal } from "../models";
import { palette } from "../theme";
import { formatMoney } from "../countryPricing";
import { useTranslation } from "react-i18next";
import { useFoodNames } from "../i18n";
import { BatchNote } from "./BatchCooking";

type Props = { meal: Meal | null; onClose: () => void };

export function MealDetailsModal({ meal, onClose }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { food } = useFoodNames();
  const currencyCode = meal?.currencyCode ?? "EUR";
  const currencyLocale = meal?.currencyLocale;
  const formatCost = (minorUnits: number): string =>
    formatMoney({ amountMinorUnits: minorUnits, currencyCode }, currencyLocale);
  const ingredientCalories = meal?.ingredients.reduce((sum, item) => sum + item.calories, 0) ?? 0;
  const ingredientCost = meal?.ingredients.reduce(
    (sum, item) => sum + (item.estimatedCost?.amountMinorUnits ?? item.estimatedCostCents),
    0
  ) ?? 0;
  const mainIngredients = meal?.ingredients.filter((item) => item.category === "main") ?? [];
  const seasonings = meal?.ingredients.filter((item) => item.category === "seasoning") ?? [];
  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={meal !== null}>
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel={t("details.close")} onPress={onClose} style={StyleSheet.absoluteFill} />
        {meal && (
          <View accessibilityViewIsModal style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <View style={styles.heading}>
                <Text accessibilityRole="header" style={styles.title}>{food(meal.title)}</Text>
              </View>
            </View>
            <View style={styles.summary}>
              <View style={styles.statTile}>
                <Text style={styles.statValue}>{meal.calories}</Text>
                <Text style={styles.statLabel}>{t("details.kcal")}</Text>
              </View>
              <View style={[styles.statTile, styles.statTileProtein]}>
                <Text style={[styles.statValue, styles.statValueProtein]}>{meal.proteinGrams} g</Text>
                <Text style={styles.statLabel}>{t("details.protein")}</Text>
              </View>
              <View style={[styles.statTile, styles.statTileCost]}>
                <Text style={[styles.statValue, styles.statValueCost]}>
                  ~{formatCost(meal.estimatedCost?.amountMinorUnits ?? meal.estimatedCostCents)}
                </Text>
                <Text style={styles.statLabel}>{t("details.estCost")}</Text>
              </View>
            </View>
            {meal.batch && (
              <View style={styles.batchNote}>
                <BatchNote />
              </View>
            )}
            {meal.banConflicts && meal.banConflicts.length > 0 && (
              <Text style={styles.banWarning}>
                {t("details.banWarning", { list: meal.banConflicts.map(food).join(", ") })}
              </Text>
            )}
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionTitle}>{t("details.mainIngredients")}</Text>
              {mainIngredients.map((ingredient, index) => (
                <IngredientRow key={`${ingredient.name}-${index}`} ingredient={ingredient} formatCost={formatCost} />
              ))}
              {seasonings.length > 0 && (
                <View style={styles.seasoningGroup}>
                  <Text style={styles.seasoningTitle}>{t("details.seasonings")}</Text>
                  {seasonings.map((ingredient, index) => (
                    <IngredientRow key={`${ingredient.name}-${index}`} ingredient={ingredient} formatCost={formatCost} />
                  ))}
                </View>
              )}
              <View style={[styles.ingredient, styles.totalCard]}>
                <Text style={styles.ingredientName}>{t("details.total")}</Text>
                <View style={styles.chips}>
                  <View style={styles.chip}><Text style={styles.chipText}>{t("meal.kcalChip", { value: ingredientCalories })}</Text></View>
                  <View style={[styles.chip, styles.chipProtein]}>
                    <Text style={[styles.chipText, styles.chipTextProtein]}>{t("meal.proteinChip", { value: meal.proteinGrams })}</Text>
                  </View>
                  <View style={[styles.chip, styles.chipCost]}>
                    <Text style={[styles.chipText, styles.chipTextCost]}>~{formatCost(ingredientCost)}</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        )}
      </View>
    </Modal>
  );
}

function IngredientRow({
  ingredient,
  formatCost
}: {
  ingredient: Meal["ingredients"][number];
  formatCost: (value: number) => string;
}): React.JSX.Element {
  const { t } = useTranslation();
  const { food, unit } = useFoodNames();
  return (
    <View style={styles.ingredient}>
      <View style={styles.ingredientTop}>
        <Text style={styles.ingredientName}>{food(ingredient.name)}</Text>
        <Text style={styles.quantity}>{ingredient.quantity} {unit(ingredient.unit)}</Text>
      </View>
      <View style={styles.chips}>
        <View style={styles.chip}><Text style={styles.chipText}>{t("meal.kcalChip", { value: ingredient.calories })}</Text></View>
        <View style={[styles.chip, styles.chipProtein]}>
          <Text style={[styles.chipText, styles.chipTextProtein]}>{t("meal.proteinChip", { value: ingredient.proteinGrams })}</Text>
        </View>
        <View style={[styles.chip, styles.chipCost]}>
          <Text style={[styles.chipText, styles.chipTextCost]}>
            ~{formatCost(ingredient.estimatedCost?.amountMinorUnits ?? ingredient.estimatedCostCents)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(25, 32, 26, 0.42)" },
  sheet: { maxHeight: "88%", backgroundColor: palette.paper, borderTopLeftRadius: 25, borderTopRightRadius: 25, paddingHorizontal: 21, paddingTop: 10, paddingBottom: 24 },
  handle: { width: 38, height: 4, borderRadius: 2, backgroundColor: "#D6D9D0", alignSelf: "center", marginBottom: 16 },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  heading: { flex: 1, paddingRight: 12 },
  title: { color: palette.ink, fontSize: 21, fontWeight: "700" },
  summary: { flexDirection: "row", gap: 8, marginTop: 15 },
  statTile: { flex: 1, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 8, alignItems: "center", backgroundColor: "#F1EEE4" },
  statTileProtein: { backgroundColor: palette.softGreen },
  statTileCost: { backgroundColor: "#F6E9D8" },
  statValue: { color: palette.ink, fontSize: 16, fontWeight: "800" },
  statValueProtein: { color: palette.green },
  statValueCost: { color: "#8A5A1F" },
  statLabel: { color: palette.muted, fontSize: 10, fontWeight: "600", marginTop: 2 },
  banWarning: { color: "#8B3027", fontSize: 11, lineHeight: 16, marginTop: 10 },
  batchNote: { marginTop: 2 },
  scrollContent: { paddingBottom: 12 },
  sectionTitle: { color: palette.ink, fontSize: 16, fontWeight: "700", marginTop: 19, marginBottom: 8 },
  helper: { color: palette.muted, fontSize: 10, marginTop: 4, marginBottom: 8 },
  seasoningGroup: { marginTop: 13 },
  seasoningTitle: { color: palette.ink, fontSize: 16, fontWeight: "700", marginBottom: 8 },
  ingredient: { backgroundColor: palette.white, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 12, marginBottom: 8 },
  ingredientTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  ingredientName: { flex: 1, color: palette.ink, fontSize: 13, fontWeight: "600" },
  quantity: { color: palette.muted, fontSize: 11, fontWeight: "600", marginLeft: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  chip: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: "#F1EEE4" },
  chipProtein: { backgroundColor: palette.softGreen },
  chipCost: { backgroundColor: "#F6E9D8" },
  chipText: { color: palette.ink, fontSize: 10, fontWeight: "700" },
  chipTextProtein: { color: palette.green },
  chipTextCost: { color: "#8A5A1F" },
  totalCard: { marginTop: 5, backgroundColor: palette.softGreen, borderWidth: 1, borderColor: palette.green },
  priceReference: { color: palette.muted, fontSize: 9, lineHeight: 14, marginTop: 15 },
  disclaimer: { color: palette.muted, fontSize: 10, lineHeight: 15, marginTop: 16 }
});
