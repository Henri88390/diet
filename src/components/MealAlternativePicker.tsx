import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useFoodNames } from "../i18n";
import type { Meal } from "../models";
import { formatMoney } from "../countryPricing";
import { palette } from "../theme";
import { BottomSheet, SheetScrollView } from "./BottomSheet";

type Mode = "scope" | "replace" | "ban";
type Props = {
  visible: boolean;
  mode: Mode;
  scope: "day" | "all";
  meal: Meal | null;
  options: Meal[];
  onClose: () => void;
  onScope: (scope: "day" | "all") => void;
  onSelect: (recipeKey: string | null) => void;
};

export function MealAlternativePicker({ visible, mode, scope, meal, options, onClose, onScope, onSelect }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { food } = useFoodNames();
  const [pending, setPending] = useState<{ recipeKey: string | null; meal: Meal | null } | null>(null);
  useEffect(() => { setPending(null); }, [visible, mode, meal]);
  const title = pending
    ? t(mode === "ban" ? "picker.confirmBanTitle" : "picker.confirmTitle")
    : mode === "scope" ? t("picker.scopeTitle") : mode === "ban" ? t("picker.banTitle") : t("picker.replaceTitle");
  const current = meal ? food(meal.title) : "";
  const substitute = pending?.meal ? food(pending.meal.title) : t("picker.automatic");
  const confirmMessage = mode === "ban"
    ? t(pending?.meal ? "picker.confirmBan" : "picker.confirmBanAuto", { current, substitute })
    : t(scope === "day" ? "picker.confirmDay" : "picker.confirmAll", { current, substitute });
  return (
    <BottomSheet visible={visible} onClose={onClose} closeLabel={t("details.close")} sheetStyle={styles.sheet}>
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
          {meal && <Text style={styles.subtitle}>{food(meal.title)}</Text>}
          {pending ? (
            <View style={styles.confirm}>
              <Text style={styles.confirmText}>{confirmMessage}</Text>
              <Pressable accessibilityRole="button" onPress={() => onSelect(pending.recipeKey)} style={styles.confirmButton}>
                <Text style={styles.confirmButtonText}>{t(mode === "ban" ? "picker.confirmBanAction" : "picker.confirmAction")}</Text>
              </Pressable>
            </View>
          ) : mode === "scope" ? (
            <View style={styles.scopeOptions}>
              <Pressable accessibilityRole="button" onPress={() => onScope("day")} style={styles.scopeButton}>
                <Text style={styles.optionTitle}>{t("picker.thisDay")}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => onScope("all")} style={styles.scopeButton}>
                <Text style={styles.optionTitle}>{t("picker.allOccurrences")}</Text>
              </Pressable>
            </View>
          ) : (
            <SheetScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
              {mode === "ban" && (
                <Pressable accessibilityRole="button" onPress={() => setPending({ recipeKey: null, meal: null })} style={styles.automatic}>
                  <View style={styles.optionCopy}>
                    <Text style={styles.optionTitle}>{t("picker.automatic")}</Text>
                    <Text style={styles.optionHint}>{t("picker.automaticHint")}</Text>
                  </View>
                  <Text style={styles.arrow}>›</Text>
                </Pressable>
              )}
              {options.map((option) => (
                <Pressable key={option.recipeKey} accessibilityRole="button" onPress={() => setPending({ recipeKey: option.recipeKey, meal: option })} style={styles.option}>
                  <Text style={styles.emoji}>{option.emoji}</Text>
                  <View style={styles.optionCopy}>
                    <Text style={styles.optionTitle}>{food(option.title)}</Text>
                    <Text style={styles.meta}>{t("meal.kcalChip", { value: option.calories })} · {t("meal.proteinChip", { value: option.proteinGrams })} · ~{formatMoney(option.estimatedCost ?? { amountMinorUnits: option.estimatedCostCents, currencyCode: option.currencyCode ?? "EUR" }, option.currencyLocale)}</Text>
                  </View>
                  <Text style={styles.arrow}>›</Text>
                </Pressable>
              ))}
              {options.length === 0 && <Text style={styles.empty}>{t("picker.noAlternatives")}</Text>}
            </SheetScrollView>
          )}
          <Pressable accessibilityRole="button" onPress={pending ? () => setPending(null) : onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>{pending ? t("picker.back") : t("common.cancel")}</Text>
          </Pressable>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: { maxHeight: "82%", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 22 },
  title: { color: palette.ink, fontSize: 20, fontWeight: "800" },
  subtitle: { color: palette.muted, fontSize: 12, marginTop: 4, marginBottom: 12 },
  scopeOptions: { gap: 9, marginTop: 17 },
  scopeButton: { backgroundColor: palette.white, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: palette.line },
  list: { gap: 8, paddingTop: 4, paddingBottom: 8 },
  automatic: { flexDirection: "row", alignItems: "center", backgroundColor: palette.softGreen, borderRadius: 14, padding: 13, borderWidth: 1, borderColor: "#C9D9C9" },
  option: { flexDirection: "row", alignItems: "center", backgroundColor: palette.white, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: palette.line },
  emoji: { fontSize: 23, marginRight: 11 },
  optionCopy: { flex: 1 },
  optionTitle: { color: palette.ink, fontSize: 13, fontWeight: "700" },
  optionHint: { color: palette.muted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  meta: { color: palette.muted, fontSize: 10, marginTop: 4 },
  arrow: { color: palette.green, fontSize: 20, fontWeight: "700", marginLeft: 8 },
  confirm: { gap: 16, paddingTop: 6 },
  confirmText: { color: palette.ink, fontSize: 14, lineHeight: 21 },
  confirmButton: { backgroundColor: palette.green, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  confirmButtonText: { color: palette.white, fontSize: 14, fontWeight: "800" },
  empty: { color: palette.muted, fontSize: 12, paddingVertical: 20, textAlign: "center" },
  cancel: { alignSelf: "center", paddingHorizontal: 18, paddingVertical: 11, marginTop: 8 },
  cancelText: { color: palette.muted, fontWeight: "700", fontSize: 12 }
});
