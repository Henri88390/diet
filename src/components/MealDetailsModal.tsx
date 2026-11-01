import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Meal } from "../models";
import { mealBadge, mealTypeIcon, palette } from "../theme";
import { formatMoney } from "../countryPricing";
import { useTranslation } from "react-i18next";
import { useFoodNames } from "../i18n";
import { BatchNote } from "./BatchCooking";
import { BottomSheet, SheetScrollView } from "./BottomSheet";
import { getShoppingCategory, type ShoppingCategory } from "../groceryEstimate";

const categoryOrder: ShoppingCategory[] = [
  "Grains & bakery",
  "Meat & fish",
  "Legumes",
  "Dairy & eggs",
  "Vegetables",
  "Fruit",
  "Pantry & seasonings",
  "Other"
];

type Props = {
  meal: Meal | null;
  onClose: () => void;
  onReplace?: (meal: Meal) => void;
  onBan?: (meal: Meal) => void;
  canRevert?: boolean;
  onRevert?: (meal: Meal) => void;
  restrictionReason?: string | null;
  /** When set, the meal is banned and only an Unban action is offered. */
  onUnban?: (meal: Meal) => void;
};

export function MealDetailsModal({ meal, onClose, onReplace, onBan, canRevert = false, onRevert, restrictionReason, onUnban }: Props): React.JSX.Element {
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
  const byCategory = (items: Meal["ingredients"]): Meal["ingredients"] =>
    items
      .map((item, index) => ({ item, index, rank: categoryOrder.indexOf(getShoppingCategory(item.name)) }))
      .sort((a, b) => a.rank - b.rank || a.index - b.index)
      .map(({ item }) => item);
  const renderIngredients = (items: Meal["ingredients"], showCategories = true): React.JSX.Element[] =>
    items.map((ingredient, index) => (
      <React.Fragment key={`${ingredient.name}-${index}`}>
        {showCategories && (index === 0 || getShoppingCategory(items[index - 1].name) !== getShoppingCategory(ingredient.name)) && (
          <View style={[styles.categoryDivider, index === 0 && styles.categoryDividerFirst]}>
            <View style={styles.categoryDividerLine} />
            <Text style={styles.categoryDividerLabel}>
              {t(`grocery.category.${getShoppingCategory(ingredient.name)}`, { defaultValue: getShoppingCategory(ingredient.name) })}
            </Text>
            <View style={styles.categoryDividerLine} />
          </View>
        )}
        <IngredientRow ingredient={ingredient} formatCost={formatCost} />
      </React.Fragment>
    ));
  const mainIngredients = byCategory(meal?.ingredients.filter((item) => item.category === "main") ?? []);
  const seasonings = byCategory(meal?.ingredients.filter((item) => item.category === "seasoning") ?? []);
  return (
    <BottomSheet visible={meal !== null} onClose={onClose} closeLabel={t("details.close")} sheetStyle={styles.sheet}>
        {meal && (
          <>
            <View accessible={false} style={[styles.typeIcon, { backgroundColor: mealBadge[meal.type].background }]}>
              <Text style={styles.typeIconText}>{mealTypeIcon[meal.type]}</Text>
            </View>
            <View style={styles.header}>
              <Text accessible={false} style={styles.mealEmoji}>{meal.emoji}</Text>
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
            {meal.type !== "Snack" && !meal.isTypicalBreakfast && (
              <View style={styles.actions}>
                {onUnban ? (
                  <Pressable accessibilityRole="button" onPress={() => onUnban(meal)} style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}>
                    <Text style={styles.actionText}>{t("menu.unban")}</Text>
                  </Pressable>
                ) : restrictionReason ? <Text style={styles.restriction}>{restrictionReason}</Text> : (
                  <>
                    <Pressable accessibilityRole="button" onPress={() => onReplace?.(meal)} style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}>
                      <Text style={styles.actionText}>{t("mealActions.replace")}</Text>
                    </Pressable>
                    <Pressable accessibilityRole="button" onPress={() => onBan?.(meal)} style={({ pressed }) => [styles.actionButton, styles.banButton, pressed && styles.actionPressed]}>
                      <Text style={styles.banActionText}>{t("mealActions.ban")}</Text>
                    </Pressable>
                    {canRevert && <Pressable accessibilityRole="button" onPress={() => onRevert?.(meal)} style={styles.revertButton}>
                      <Text style={styles.revertText}>{t("mealActions.revert")}</Text>
                    </Pressable>}
                  </>
                )}
              </View>
            )}
            <SheetScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionTitle}>{t("details.mainIngredients")}</Text>
              {renderIngredients(mainIngredients)}
              {seasonings.length > 0 && (
                <View style={styles.seasoningGroup}>
                  <Text style={styles.seasoningTitle}>{t("details.seasonings")}</Text>
                  {renderIngredients(seasonings, false)}
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
            </SheetScrollView>
          </>
        )}
    </BottomSheet>
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
  sheet: { maxHeight: "88%", paddingHorizontal: 21, paddingTop: 10, paddingBottom: 24 },
  header: { flexDirection: "row", alignItems: "center" },
  mealEmoji: { fontSize: 26, marginRight: 10 },
  heading: { flex: 1, paddingRight: 40 },
  typeIcon: { position: "absolute", top: 14, right: 16, width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", zIndex: 1 },
  typeIconText: { fontSize: 17 },
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
  actions: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10, marginTop: 16 },
  actionButton: {
    flexGrow: 1,
    flexBasis: 120,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.softGreen,
    borderWidth: 1,
    borderColor: "#BFD3BF",
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 11
  },
  actionPressed: { opacity: 0.75 },
  actionText: { color: palette.green, fontSize: 13, fontWeight: "800" },
  banButton: { backgroundColor: "#F8E9E5", borderColor: "#E6C3BB" },
  banActionText: { color: "#A23A2B", fontSize: 13, fontWeight: "800" },
  revertButton: { justifyContent: "center", paddingHorizontal: 8 },
  revertText: { color: palette.muted, fontSize: 11, fontWeight: "600" },
  restriction: { color: palette.muted, fontSize: 11, lineHeight: 16 },
  scrollContent: { paddingBottom: 12 },
  sectionTitle: { color: palette.ink, fontSize: 16, fontWeight: "700", marginTop: 19, marginBottom: 8 },
  helper: { color: palette.muted, fontSize: 10, marginTop: 4, marginBottom: 8 },
  seasoningGroup: { marginTop: 13 },
  seasoningTitle: { color: palette.ink, fontSize: 16, fontWeight: "700", marginBottom: 8 },
  ingredient: { backgroundColor: palette.white, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 12, marginBottom: 8 },
  ingredientTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  ingredientName: { flex: 1, color: palette.ink, fontSize: 13, fontWeight: "600" },
  categoryDivider: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6, marginBottom: 8 },
  categoryDividerFirst: { marginTop: 0 },
  categoryDividerLabel: { color: palette.muted, fontSize: 11, fontWeight: "600" },
  categoryDividerLine: { flex: 1, height: 1, backgroundColor: "#D6D9D0" },
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
