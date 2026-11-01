import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Meal, RemovedBannedIngredient } from "../models";
import { getIngredientCatalogId } from "../ingredientCatalog";
import { getIngredientCategory } from "../ingredientEstimates";
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
  onBanIngredient?: (meal: Meal, ingredientId: string) => void;
  canRevert?: boolean;
  /** Number of planned occurrences "All occurrences" would revert; 0 hides the choice. */
  revertAllCount?: number;
  onRevert?: (meal: Meal, scope: "meal" | "all") => void;
  restrictionReason?: string | null;
  /** When set, the meal is banned and only an Unban action is offered. */
  onUnban?: (meal: Meal) => void;
  /** Starts the confirmation for unbanning an ingredient this meal originally used. */
  onUnbanIngredient?: (meal: Meal, ingredientId: string) => void;
};

type IngredientListRow =
  | { kind: "active"; name: string; seasoning: boolean; ingredient: Meal["ingredients"][number] }
  | { kind: "banned"; name: string; seasoning: boolean; item: RemovedBannedIngredient };

export function MealDetailsModal({ meal, onClose, onReplace, onBan, onBanIngredient, canRevert = false, revertAllCount = 0, onRevert, restrictionReason, onUnban, onUnbanIngredient }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { food } = useFoodNames();
  const [revertChoiceOpen, setRevertChoiceOpen] = React.useState(false);
  React.useEffect(() => setRevertChoiceOpen(false), [meal]);
  const currencyCode = meal?.currencyCode ?? "EUR";
  const currencyLocale = meal?.currencyLocale;
  const formatCost = (minorUnits: number): string =>
    formatMoney({ amountMinorUnits: minorUnits, currencyCode }, currencyLocale);
  const byCategory = <Row extends { name: string }>(items: Row[]): Row[] =>
    items
      .map((item, index) => ({ item, index, rank: categoryOrder.indexOf(getShoppingCategory(item.name)) }))
      .sort((a, b) => a.rank - b.rank || a.index - b.index)
      .map(({ item }) => item);
  const renderIngredients = (items: IngredientListRow[], showCategories = true): React.JSX.Element[] =>
    items.map((row, index) => (
      <React.Fragment key={`${row.kind}-${row.name}-${index}`}>
        {showCategories && (index === 0 || getShoppingCategory(items[index - 1].name) !== getShoppingCategory(row.name)) && (
          <View style={[styles.categoryDivider, index === 0 && styles.categoryDividerFirst]}>
            <View style={styles.categoryDividerLine} />
            <Text style={styles.categoryDividerLabel}>
              {t(`grocery.category.${getShoppingCategory(row.name)}`, { defaultValue: getShoppingCategory(row.name) })}
            </Text>
            <View style={styles.categoryDividerLine} />
          </View>
        )}
        {row.kind === "active" ? (
          <IngredientRow
            ingredient={row.ingredient}
            meal={meal!}
            formatCost={formatCost}
            onBanIngredient={onBanIngredient}
          />
        ) : (
          <BannedIngredientRow item={row.item} meal={meal!} onUnbanIngredient={onUnbanIngredient} />
        )}
      </React.Fragment>
    ));
  const rows: IngredientListRow[] = [
    ...(meal?.ingredients ?? []).map((ingredient): IngredientListRow => ({
      kind: "active", name: ingredient.name, seasoning: ingredient.category === "seasoning", ingredient
    })),
    ...(meal?.removedBannedIngredients ?? []).map((item): IngredientListRow => ({
      kind: "banned", name: item.name, seasoning: getIngredientCategory(item.name) === "seasoning", item
    }))
  ];
  const mainIngredients = byCategory(rows.filter((row) => !row.seasoning));
  const seasonings = byCategory(rows.filter((row) => row.seasoning));
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
                    {canRevert && <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ expanded: revertAllCount > 0 ? revertChoiceOpen : undefined }}
                      onPress={() => revertAllCount > 0 ? setRevertChoiceOpen((open) => !open) : onRevert?.(meal, "meal")}
                      style={({ pressed }) => [styles.actionButton, styles.revertButton, pressed && styles.actionPressed]}
                    >
                      <Text style={styles.revertText}>{t("mealActions.revert")}</Text>
                    </Pressable>}
                    {canRevert && revertAllCount > 0 && revertChoiceOpen && (
                      <View style={styles.revertChoices}>
                        <Pressable accessibilityRole="button" onPress={() => onRevert?.(meal, "meal")} style={({ pressed }) => [styles.revertChoice, pressed && styles.actionPressed]}>
                          <Text style={styles.revertText}>{t("mealActions.thisDay")}</Text>
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`${t("mealActions.allOccurrences")}, ${t("menu.occurrences", { count: revertAllCount })}`}
                          onPress={() => onRevert?.(meal, "all")}
                          style={({ pressed }) => [styles.revertChoice, pressed && styles.actionPressed]}
                        >
                          <Text style={styles.revertText}>{t("mealActions.allOccurrences")}</Text>
                          <View style={styles.revertCount}>
                            <Text style={styles.revertCountText}>{t("menu.occurrences", { count: revertAllCount })}</Text>
                          </View>
                        </Pressable>
                      </View>
                    )}
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
            </SheetScrollView>
          </>
        )}
    </BottomSheet>
  );
}

function IngredientRow({
  ingredient,
  meal,
  formatCost,
  onBanIngredient
}: {
  ingredient: Meal["ingredients"][number];
  meal: Meal;
  formatCost: (value: number) => string;
  onBanIngredient?: (meal: Meal, ingredientId: string) => void;
}): React.JSX.Element {
  const { t } = useTranslation();
  const { food, unit } = useFoodNames();
  const catalogId = getIngredientCatalogId(ingredient.name);
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
        {catalogId && onBanIngredient && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${t("ingredientBan.banAction")}: ${food(ingredient.name)}`}
            hitSlop={6}
            onPress={() => onBanIngredient(meal, catalogId)}
            style={({ pressed }) => [styles.banIngredientButton, pressed && styles.actionPressed]}
          >
            <Text style={styles.banIngredientText}>{t("ingredientBan.banAction")}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function BannedIngredientRow({
  item,
  meal,
  onUnbanIngredient
}: {
  item: RemovedBannedIngredient;
  meal: Meal;
  onUnbanIngredient?: (meal: Meal, ingredientId: string) => void;
}): React.JSX.Element {
  const { t } = useTranslation();
  const { food } = useFoodNames();
  return (
    <View style={[styles.ingredient, styles.bannedIngredient]}>
      <View style={styles.ingredientTop}>
        <Text style={[styles.ingredientName, styles.bannedName]}>{food(item.name)}</Text>
        <View style={styles.bannedTag}><Text style={styles.bannedTagText}>{t("details.bannedTag")}</Text></View>
      </View>
      <View style={styles.chips}>
        <Text style={styles.bannedNote}>
          {item.replacement
            ? t("details.bannedReplaced", { name: food(item.replacement) })
            : t("details.bannedLeftOut")}
        </Text>
        {onUnbanIngredient && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${t("details.unbanIngredient")}: ${food(item.name)}`}
            hitSlop={6}
            onPress={() => onUnbanIngredient(meal, item.ingredientId)}
            style={({ pressed }) => [styles.unbanIngredientButton, pressed && styles.actionPressed]}
          >
            <Text style={styles.unbanIngredientText}>{t("details.unbanIngredient")}</Text>
          </Pressable>
        )}
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
  revertButton: { backgroundColor: "#F1EEE4", borderColor: "#DDD7C8" },
  revertText: { color: palette.ink, fontSize: 13, fontWeight: "800" },
  revertChoices: { flexBasis: "100%", flexDirection: "row", gap: 8 },
  revertChoice: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: "#DDD7C8",
    borderRadius: 11,
    paddingHorizontal: 10,
    paddingVertical: 10
  },
  revertCount: { borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2, backgroundColor: "#F1EEE4" },
  revertCountText: { color: palette.ink, fontSize: 11, fontWeight: "800" },
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
  banIngredientButton: { marginLeft: "auto", borderRadius: 8, borderWidth: 1, borderColor: "#E6C3BB", backgroundColor: "#F8E9E5", paddingHorizontal: 10, paddingVertical: 3 },
  banIngredientText: { color: "#A23A2B", fontSize: 10, fontWeight: "800" },
  bannedIngredient: { backgroundColor: "#FBF3F1", borderWidth: 1, borderStyle: "dashed", borderColor: "#E6C3BB" },
  bannedName: { color: palette.muted, textDecorationLine: "line-through" },
  bannedTag: { marginLeft: 12, borderRadius: 7, paddingHorizontal: 7, paddingVertical: 2, backgroundColor: "#F8E9E5" },
  bannedTagText: { color: "#A23A2B", fontSize: 9, fontWeight: "800" },
  bannedNote: { flexShrink: 1, color: palette.muted, fontSize: 10, fontWeight: "600" },
  unbanIngredientButton: { marginLeft: "auto", borderRadius: 8, borderWidth: 1, borderColor: "#BFD3BF", backgroundColor: palette.softGreen, paddingHorizontal: 10, paddingVertical: 3 },
  unbanIngredientText: { color: palette.green, fontSize: 10, fontWeight: "800" },
  chips: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6, marginTop: 8 },
  chip: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: "#F1EEE4" },
  chipProtein: { backgroundColor: palette.softGreen },
  chipCost: { backgroundColor: "#F6E9D8" },
  chipText: { color: palette.ink, fontSize: 10, fontWeight: "700" },
  chipTextProtein: { color: palette.green },
  chipTextCost: { color: "#8A5A1F" },
  priceReference: { color: palette.muted, fontSize: 9, lineHeight: 14, marginTop: 15 },
  disclaimer: { color: palette.muted, fontSize: 10, lineHeight: 15, marginTop: 16 }
});
