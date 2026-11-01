import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useFoodNames } from "../i18n";
import type { Meal } from "../models";
import { palette } from "../theme";
import { BottomSheet } from "./BottomSheet";

type Props = {
  meal: Meal | null;
  onCancel: () => void;
  onConfirm: (meal: Meal) => void;
};

/** Bottom-sheet confirmation for unbanning a meal, styled like the ban confirmation. */
export function UnbanConfirmSheet({ meal, onCancel, onConfirm }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { food } = useFoodNames();
  return (
    <BottomSheet visible={meal !== null} onClose={onCancel} closeLabel={t("details.close")} sheetStyle={styles.sheet}>
      {meal && (
        <>
          <Text accessibilityRole="header" style={styles.title}>{t("menu.unbanConfirmTitle")}</Text>
          <Text style={styles.subtitle}>{meal.emoji} {food(meal.title)}</Text>
          <View style={styles.confirm}>
            <Text style={styles.confirmText}>{t("menu.unbanConfirmMessage", { name: food(meal.title) })}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => onConfirm(meal)}
              style={({ pressed }) => [styles.confirmButton, pressed && styles.pressed]}
            >
              <Text style={styles.confirmButtonText}>{t("menu.unban")}</Text>
            </Pressable>
          </View>
        </>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 22 },
  title: { color: palette.ink, fontSize: 20, fontWeight: "800" },
  subtitle: { color: palette.muted, fontSize: 12, marginTop: 4, marginBottom: 12 },
  confirm: { gap: 16, paddingTop: 6 },
  confirmText: { color: palette.ink, fontSize: 14, lineHeight: 21 },
  confirmButton: { backgroundColor: palette.green, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  confirmButtonText: { color: palette.white, fontSize: 14, fontWeight: "800" },
  pressed: { opacity: 0.85 }
});
