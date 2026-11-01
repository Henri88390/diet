import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useFoodNames } from "../i18n";
import { ingredientCatalog } from "../ingredientCatalog";
import { palette } from "../theme";
import { BottomSheet } from "./BottomSheet";

type Props = {
  ingredientId: string | null;
  onCancel: () => void;
  onConfirm: (ingredientId: string) => void;
};

/** Bottom-sheet confirmation for unbanning an ingredient, styled like the meal unban confirmation. */
export function IngredientUnbanConfirmSheet({ ingredientId, onCancel, onConfirm }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { food } = useFoodNames();
  const ingredient = ingredientCatalog.find((option) => option.id === ingredientId);
  const name = ingredient ? food(ingredient.name) : "";
  return (
    <BottomSheet visible={ingredientId !== null} onClose={onCancel} closeLabel={t("details.close")} sheetStyle={styles.sheet}>
      {ingredientId && (
        <>
          <Text accessibilityRole="header" style={styles.title}>{t("details.unbanIngredientConfirmTitle")}</Text>
          <Text style={styles.subtitle}>{name}</Text>
          <View style={styles.confirm}>
            <Text style={styles.confirmText}>{t("details.unbanIngredientConfirmMessage", { name })}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => onConfirm(ingredientId)}
              style={({ pressed }) => [styles.confirmButton, pressed && styles.pressed]}
            >
              <Text style={styles.confirmButtonText}>{t("prefs.unban", { name })}</Text>
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
