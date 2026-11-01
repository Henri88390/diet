import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useFoodNames } from "../i18n";
import type { IngredientBanChoice, IngredientOption, Meal } from "../models";
import { formatMoney } from "../countryPricing";
import { palette } from "../theme";
import { BottomSheet, SheetScrollView } from "./BottomSheet";
import { MealStatChips } from "./MealStatChips";

type AffectedMeal = { meal: Meal; count: number; restricted: boolean; options: Meal[]; replacementIngredientIds: string[] };
type Props = {
  visible: boolean;
  meal: Meal | null;
  ingredient: IngredientOption | null;
  affectedMeals: AffectedMeal[];
  mainOptions: Meal[];
  replacementIngredients: IngredientOption[];
  onClose: () => void;
  onConfirm: (choices: IngredientBanChoice[]) => void;
};
type Stage = "choose" | "review";
type MainAction = "skip" | "replaceMeal";
/** "ingredient" swaps the banned ingredient for the replacement chosen for the main meal. */
type OtherSelection = { kind: "automatic" } | { kind: "ingredient" } | { kind: "omit" } | { kind: "meal"; recipeKey: string };

export function IngredientBanFlowSheet({
  visible, meal, ingredient, affectedMeals, mainOptions, replacementIngredients, onClose, onConfirm
}: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { food } = useFoodNames();
  const [stage, setStage] = useState<Stage>("choose");
  const [mainAction, setMainAction] = useState<MainAction>("skip");
  const [replacementIngredient, setReplacementIngredient] = useState<string | null>(null);
  const [mainReplacement, setMainReplacement] = useState<string | null>(null);
  const [applyEverywhere, setApplyEverywhere] = useState(false);
  const [otherSelections, setOtherSelections] = useState<Record<string, OtherSelection>>({});
  // Replacement meals picked per affected recipe stay listed after switching to another option.
  const [pickedMeals, setPickedMeals] = useState<Record<string, string>>({});
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

  useEffect(() => {
    setStage("choose");
    setMainAction("skip");
    setReplacementIngredient(null);
    setMainReplacement(null);
    setApplyEverywhere(false);
    setOtherSelections({});
    setPickedMeals({});
    setExpandedRecipe(null);
  }, [visible, ingredient?.id, meal?.recipeKey]);

  const title = stage === "choose" ? t("ingredientBan.chooseTitle") : t("ingredientBan.reviewTitle");
  const restricted = Boolean(meal?.isTypicalBreakfast || meal?.batch || meal?.type === "Snack");
  const sharedReplacement = mainAction === "skip" && replacementIngredient && !meal?.batch
    ? replacementIngredients.find((option) => option.id === replacementIngredient) ?? null
    : null;
  const everywhere = Boolean(sharedReplacement && applyEverywhere);

  function canUseShared(affected: AffectedMeal): boolean {
    return Boolean(sharedReplacement && !affected.meal.batch && affected.replacementIngredientIds.includes(sharedReplacement.id));
  }

  // Batch components ignore skips, so leaving the ingredient out is not offered there.
  function canOmit(affected: AffectedMeal): boolean {
    return mainAction === "skip" && !meal?.batch && !affected.meal.batch;
  }

  function selectionFor(affected: AffectedMeal): OtherSelection {
    const explicit = otherSelections[affected.meal.recipeKey];
    if (explicit && (explicit.kind === "ingredient" ? canUseShared(affected)
      : explicit.kind === "omit" ? canOmit(affected) : true)) return explicit;
    return everywhere && canUseShared(affected) ? { kind: "ingredient" } : { kind: "automatic" };
  }

  function confirmChoices(): void {
    if (!meal || !ingredient) return;
    // Batch components are assembled with automatic bans before this flow.
    // Do not offer or store an ingredient action that assembly would ignore.
    const scopedOccurrences = meal.occurrenceKeys?.length
      ? meal.occurrenceKeys
      : [meal.occurrenceKey];
    const choices: IngredientBanChoice[] = meal.batch ? [] : scopedOccurrences.map((occurrenceKey) => ({
      ingredientId: ingredient.id,
      recipeKey: meal.recipeKey,
      occurrenceKey,
      action: mainAction,
      ...(mainAction === "skip"
        ? { replacementIngredient }
        : { replacementMealKey: mainReplacement })
    }));
    if (meal.occurrenceKey || meal.occurrenceKeys?.length) {
      // The choice covers the whole recipe, so its other servings are not reviewed again.
      choices.push(mainAction === "skip"
        ? {
          ingredientId: ingredient.id, recipeKey: meal.recipeKey, action: "skip",
          replacementIngredient, ...(replacementIngredient ? { fallbackToAutomatic: true } : {})
        }
        : { ingredientId: ingredient.id, recipeKey: meal.recipeKey, action: "replaceMeal", replacementMealKey: mainReplacement });
    }
    affectedMeals.forEach((affected) => {
      const selection = selectionFor(affected);
      if (selection.kind === "ingredient" && sharedReplacement) {
        choices.push({
          ingredientId: ingredient.id, recipeKey: affected.meal.recipeKey, action: "skip",
          replacementIngredient: sharedReplacement.id, fallbackToAutomatic: true
        });
        return;
      }
      if (selection.kind === "omit") {
        choices.push({
          ingredientId: ingredient.id, recipeKey: affected.meal.recipeKey, action: "skip",
          replacementIngredient: null
        });
        return;
      }
      if (affected.restricted) return;
      choices.push({
        ingredientId: ingredient.id,
        recipeKey: affected.meal.recipeKey,
        action: "replaceMeal",
        replacementMealKey: selection.kind === "meal" ? selection.recipeKey : null
      });
    });
    onConfirm(choices);
  }

  function renderMealOption(option: Meal, onSelect: () => void, selected = false): React.JSX.Element {
    return (
      <Pressable
        key={option.recipeKey}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={onSelect}
        style={({ pressed }) => [styles.option, selected && styles.choiceSelected, pressed && styles.optionPressed]}
      >
        <Text style={styles.optionEmoji}>{option.emoji}</Text>
        <View style={styles.optionCopy}>
          <Text style={styles.optionTitle}>{food(option.title)}</Text>
          <MealStatChips
            style={styles.optionStats}
            calories={option.calories}
            proteinGrams={option.proteinGrams}
            cost={formatMoney(option.estimatedCost ?? { amountMinorUnits: option.estimatedCostCents, currencyCode: option.currencyCode ?? "EUR" }, option.currencyLocale)}
          />
        </View>
        <Text style={styles.arrow}>{String.fromCharCode(selected ? 10003 : 8250)}</Text>
      </Pressable>
    );
  }

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      onBack={stage === "review" ? () => setStage("choose") : undefined}
      closeLabel={t("details.close")}
      sheetStyle={styles.sheet}
      swipeToClose={stage === "review" ? "firm" : "normal"}
    >
      {meal && ingredient && <>
        <Text accessibilityRole="header" style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{meal.emoji} {food(meal.title)} {String.fromCharCode(183)} {food(ingredient.name)}</Text>
        {stage === "choose" ? (
          <SheetScrollView key="choose" contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>{t("ingredientBan.mealChoice", { name: food(meal.title) })}</Text>
            {!meal.batch && <>
              <Pressable accessibilityRole="button" accessibilityState={{ selected: mainAction === "skip" }} onPress={() => setMainAction("skip")} style={[styles.choice, mainAction === "skip" && styles.choiceSelected]}>
                <Text style={styles.choiceTitle}>{t("ingredientBan.skipAction")}</Text>
              </Pressable>
              {mainAction === "skip" && <View style={styles.ingredientChoices}>
                <Text style={styles.subheading}>{t("ingredientBan.optionalReplacement")}</Text>
                <Pressable accessibilityRole="button" accessibilityState={{ selected: replacementIngredient === null }} onPress={() => setReplacementIngredient(null)} style={[styles.ingredientChip, replacementIngredient === null && styles.ingredientChipSelected]}>
                  <Text style={styles.chipText}>{t("ingredientBan.noReplacement")}</Text>
                </Pressable>
                {replacementIngredients.map((option) => <Pressable key={option.id} accessibilityRole="button" accessibilityState={{ selected: replacementIngredient === option.id }} onPress={() => setReplacementIngredient(option.id)} style={[styles.ingredientChip, replacementIngredient === option.id && styles.ingredientChipSelected]}>
                  <Text style={styles.chipText}>{food(option.name)}</Text>
                </Pressable>)}
                {sharedReplacement && <Pressable
                  accessibilityRole="switch"
                  accessibilityState={{ checked: applyEverywhere }}
                  onPress={() => setApplyEverywhere((current) => !current)}
                  style={[styles.everywhere, applyEverywhere && styles.choiceSelected]}
                >
                  <View style={[styles.checkbox, applyEverywhere && styles.checkboxChecked]}>
                    {applyEverywhere && <Text style={styles.checkmark}>{String.fromCharCode(10003)}</Text>}
                  </View>
                  <View style={styles.optionCopy}>
                    <Text style={styles.choiceTitle}>{t("ingredientBan.applyEverywhere", { replacement: food(sharedReplacement.name) })}</Text>
                    <Text style={styles.choiceHint}>{t("ingredientBan.applyEverywhereHint", { ingredient: food(ingredient.name), replacement: food(sharedReplacement.name) })}</Text>
                  </View>
                </Pressable>}
              </View>}
            </>}
            {!restricted && <>
              <Pressable accessibilityRole="button" accessibilityState={{ selected: mainAction === "replaceMeal" }} onPress={() => setMainAction("replaceMeal")} style={[styles.choice, mainAction === "replaceMeal" && styles.choiceSelected]}>
                <Text style={styles.choiceTitle}>{t("ingredientBan.replaceMealAction")}</Text>
                <Text style={styles.choiceHint}>{t("ingredientBan.automaticHint")}</Text>
              </Pressable>
              {mainAction === "replaceMeal" && <>
                <Pressable accessibilityRole="button" accessibilityState={{ selected: mainReplacement === null }} onPress={() => setMainReplacement(null)} style={[styles.automatic, mainReplacement === null && styles.choiceSelected]}>
                  <View style={styles.optionCopy}><Text style={styles.choiceTitle}>{t("picker.automatic")}</Text><Text style={styles.choiceHint}>{t("ingredientBan.automaticHint")}</Text></View>
                  <Text style={styles.arrow}>{String.fromCharCode(10003)}</Text>
                </Pressable>
                {mainOptions.map((option) => renderMealOption(option, () => setMainReplacement(option.recipeKey), mainReplacement === option.recipeKey))}
                {mainOptions.length === 0 && <Text style={styles.empty}>{t("picker.noAlternatives")}</Text>}
              </>}
            </>}
            {meal.batch && <Text style={styles.restriction}>{t("ingredientBan.restricted")}</Text>}
            <Pressable accessibilityRole="button" onPress={everywhere ? confirmChoices : () => setStage("review")} style={styles.primaryButton}>
              <Text style={styles.primaryText}>{t(everywhere ? "ingredientBan.applyAction" : "ingredientBan.reviewContinue")}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.backButton}><Text style={styles.backText}>{t("common.cancel")}</Text></Pressable>
          </SheetScrollView>
        ) : (
          <SheetScrollView key="review" contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            <Text style={styles.bodyText}>{everywhere && sharedReplacement
              ? t("ingredientBan.reviewHintEverywhere", { ingredient: food(ingredient.name), replacement: food(sharedReplacement.name) })
              : t("ingredientBan.reviewHint", { ingredient: food(ingredient.name) })}</Text>
            {affectedMeals.length === 0 && <Text style={styles.empty}>{t("ingredientBan.noAffected")}</Text>}
            {affectedMeals.map((affectedEntry) => {
              const { meal: affected, count, restricted: isRestricted, options } = affectedEntry;
              const selection = selectionFor(affectedEntry);
              const sharedAvailable = canUseShared(affectedEntry);
              const expanded = expandedRecipe === affected.recipeKey;
              const select = (next: OtherSelection): void => {
                setOtherSelections((current) => ({ ...current, [affected.recipeKey]: next }));
                if (next.kind === "meal") setPickedMeals((current) => ({ ...current, [affected.recipeKey]: next.recipeKey }));
                setExpandedRecipe(null);
              };
              return <View key={affected.recipeKey} style={styles.affectedCard}>
                <View style={styles.affectedHeader}>
                  <Text style={styles.optionEmoji}>{affected.emoji}</Text>
                  <View style={styles.optionCopy}>
                    <Text style={styles.choiceTitle}>{food(affected.title)}</Text>
                    <Text style={styles.choiceHint}>{t("ingredientBan.affectedCount", { count })}</Text>
                  </View>
                </View>
                {sharedAvailable && sharedReplacement && <Pressable accessibilityRole="button" accessibilityState={{ selected: selection.kind === "ingredient" }} onPress={() => select({ kind: "ingredient" })} style={[styles.automatic, styles.unselected, selection.kind === "ingredient" && styles.choiceSelected]}>
                  <View style={styles.optionCopy}>
                    <Text style={styles.choiceTitle}>{t("ingredientBan.useReplacement", { replacement: food(sharedReplacement.name) })}</Text>
                    <Text style={styles.choiceHint}>{t("ingredientBan.useReplacementHint", { ingredient: food(ingredient.name), replacement: food(sharedReplacement.name) })}</Text>
                  </View>
                  {selection.kind === "ingredient" && <Text style={styles.arrow}>{String.fromCharCode(10003)}</Text>}
                </Pressable>}
                {canOmit(affectedEntry) && <Pressable accessibilityRole="button" accessibilityState={{ selected: selection.kind === "omit" }} onPress={() => select({ kind: "omit" })} style={[styles.automatic, styles.unselected, selection.kind === "omit" && styles.choiceSelected]}>
                  <View style={styles.optionCopy}>
                    <Text style={styles.choiceTitle}>{t("ingredientBan.omitIngredient", { ingredient: food(ingredient.name) })}</Text>
                    <Text style={styles.choiceHint}>{t("ingredientBan.omitIngredientHint", { ingredient: food(ingredient.name) })}</Text>
                  </View>
                  {selection.kind === "omit" && <Text style={styles.arrow}>{String.fromCharCode(10003)}</Text>}
                </Pressable>}
                {isRestricted ? (sharedAvailable || canOmit(affectedEntry)
                  ? <Pressable accessibilityRole="button" accessibilityState={{ selected: selection.kind === "automatic" }} onPress={() => select({ kind: "automatic" })} style={[styles.automatic, styles.unselected, selection.kind === "automatic" && styles.choiceSelected]}>
                    <View style={styles.optionCopy}><Text style={styles.choiceTitle}>{t("picker.automatic")}</Text><Text style={styles.choiceHint}>{t("ingredientBan.restricted")}</Text></View>
                    {selection.kind === "automatic" && <Text style={styles.arrow}>{String.fromCharCode(10003)}</Text>}
                  </Pressable>
                  : <Text style={styles.restriction}>{t("ingredientBan.restricted")}</Text>) : <>
                  <Pressable accessibilityRole="button" accessibilityState={{ selected: selection.kind === "automatic" }} onPress={() => select({ kind: "automatic" })} style={[styles.automatic, styles.unselected, selection.kind === "automatic" && styles.choiceSelected]}>
                    <View style={styles.optionCopy}><Text style={styles.choiceTitle}>{t("picker.automatic")}</Text><Text style={styles.choiceHint}>{t("ingredientBan.automaticHint")}</Text></View>
                    {selection.kind === "automatic" && <Text style={styles.arrow}>{String.fromCharCode(10003)}</Text>}
                  </Pressable>
                  {(() => {
                    const picked = options.find((option) => option.recipeKey === pickedMeals[affected.recipeKey]);
                    return picked ? renderMealOption(picked, () => select({ kind: "meal", recipeKey: picked.recipeKey }), selection.kind === "meal" && selection.recipeKey === picked.recipeKey) : null;
                  })()}
                  <Pressable accessibilityRole="button" onPress={() => setExpandedRecipe(expanded ? null : affected.recipeKey)} style={styles.chooseButton}>
                    <Text style={styles.chooseText}>{t("ingredientBan.chooseMeal")}</Text>
                  </Pressable>
                  {expanded && options.filter((option) => option.recipeKey !== pickedMeals[affected.recipeKey]).map((option) => renderMealOption(option, () => select({ kind: "meal", recipeKey: option.recipeKey }), false))}
                </>}
              </View>;
            })}
            <Pressable accessibilityRole="button" onPress={confirmChoices} style={styles.primaryButton}>
              <Text style={styles.primaryText}>{t("ingredientBan.applyAction")}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => setStage("choose")} style={styles.backButton}><Text style={styles.backText}>{t("picker.back")}</Text></Pressable>
          </SheetScrollView>
        )}
      </>}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: { maxHeight: "88%", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 22 },
  title: { color: palette.ink, fontSize: 20, fontWeight: "800" },
  subtitle: { color: palette.muted, fontSize: 12, marginTop: 4, marginBottom: 12 },
  bodyText: { color: palette.ink, fontSize: 13, lineHeight: 20 },
  list: { gap: 8, paddingTop: 5, paddingBottom: 8 },
  sectionTitle: { color: palette.ink, fontSize: 15, fontWeight: "800", marginBottom: 3 },
  choice: { backgroundColor: palette.white, borderRadius: 13, padding: 12, borderWidth: 1, borderColor: palette.line },
  choiceSelected: { borderColor: palette.green, backgroundColor: palette.softGreen },
  choiceTitle: { color: palette.ink, fontSize: 13, fontWeight: "700" },
  choiceHint: { color: palette.muted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  ingredientChoices: { flexDirection: "row", flexWrap: "wrap", gap: 7, padding: 3 },
  subheading: { width: "100%", color: palette.muted, fontSize: 11, fontWeight: "700" },
  ingredientChip: { borderRadius: 16, paddingHorizontal: 11, paddingVertical: 7, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line },
  ingredientChipSelected: { backgroundColor: palette.softGreen, borderColor: palette.green },
  chipText: { color: palette.ink, fontSize: 10, fontWeight: "700" },
  automatic: { flexDirection: "row", alignItems: "center", backgroundColor: palette.softGreen, borderRadius: 13, padding: 12, borderWidth: 1, borderColor: "#C9D9C9" },
  unselected: { backgroundColor: palette.white, borderColor: palette.line },
  everywhere: { width: "100%", flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4, backgroundColor: palette.white, borderRadius: 13, padding: 11, borderWidth: 1, borderColor: palette.line },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: palette.muted, alignItems: "center", justifyContent: "center" },
  checkboxChecked: { backgroundColor: palette.green, borderColor: palette.green },
  checkmark: { color: palette.white, fontSize: 12, fontWeight: "800" },
  option: { flexDirection: "row", alignItems: "center", backgroundColor: palette.white, borderRadius: 13, padding: 11, borderWidth: 1, borderColor: palette.line },
  optionPressed: { opacity: 0.7 },
  optionEmoji: { fontSize: 21, marginRight: 9 },
  optionCopy: { flex: 1 },
  optionTitle: { color: palette.ink, fontSize: 12, fontWeight: "700" },
  optionStats: { marginTop: 5 },
  arrow: { color: palette.green, fontSize: 19, fontWeight: "800", marginLeft: 8 },
  affectedCard: { gap: 7, padding: 10, borderRadius: 14, backgroundColor: "#F8F7F1", borderWidth: 1, borderColor: palette.line },
  affectedHeader: { flexDirection: "row", alignItems: "center" },
  chooseButton: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9, backgroundColor: palette.white },
  chooseText: { color: palette.green, fontSize: 11, fontWeight: "700" },
  primaryButton: { backgroundColor: palette.green, borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 7 },
  primaryText: { color: palette.white, fontSize: 13, fontWeight: "800" },
  backButton: { alignSelf: "center", paddingHorizontal: 18, paddingVertical: 10 },
  backText: { color: palette.muted, fontWeight: "700", fontSize: 12 },
  empty: { color: palette.muted, fontSize: 12, paddingVertical: 12, textAlign: "center" },
  restriction: { color: palette.muted, fontSize: 10, lineHeight: 15, paddingVertical: 3 }
});
