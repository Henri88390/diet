import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { IngredientCategoryGroup } from "../models";
import { palette } from "../theme";
import { BottomSheet } from "./BottomSheet";

type Props = {
  category: IngredientCategoryGroup | null;
  onCancel: () => void;
  onConfirm: (category: IngredientCategoryGroup) => void;
};

/** Bottom-sheet confirmation before banning every ingredient in a category. */
export function CategoryBanConfirmSheet({ category, onCancel, onConfirm }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const name = category ? t("grocery.category." + category, { defaultValue: category }) : "";
  return (
    <BottomSheet visible={category !== null} onClose={onCancel} closeLabel={t("details.close")} sheetStyle={styles.sheet}>
      {category && (
        <>
          <Text accessibilityRole="header" style={styles.title}>{t("menu.banCategoryConfirmTitle")}</Text>
          <Text style={styles.subtitle}>{name}</Text>
          <View style={styles.confirm}>
            <Text style={styles.confirmText}>{t("menu.banCategoryConfirmMessage", { name })}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => onConfirm(category)}
              style={({ pressed }) => [styles.confirmButton, pressed && styles.pressed]}
            >
              <Text style={styles.confirmButtonText}>{t("menu.banCategory", { name })}</Text>
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
  confirmButton: { backgroundColor: "#B23A2C", borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  confirmButtonText: { color: palette.white, fontSize: 14, fontWeight: "800" },
  pressed: { opacity: 0.85 }
});
