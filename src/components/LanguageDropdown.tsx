import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { languages } from "../i18n";
import { palette } from "../theme";

export function LanguageDropdown(): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = languages.find((language) => language.code === i18n.language) ?? languages[0];

  return (
    <View style={styles.wrapper}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("common.languageA11y", { language: current.name })}
        accessibilityState={{ expanded: open }}
        hitSlop={6}
        onPress={() => setOpen((value) => !value)}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.flag}>{current.flag}</Text>
        <Text style={styles.caret}>{open ? "▴" : "▾"}</Text>
      </Pressable>
      {open && (
        <View style={styles.menu}>
          {languages.map((language) => {
            const selected = language.code === current.code;
            return (
              <Pressable
                key={language.code}
                accessibilityRole="button"
                accessibilityLabel={t("common.languageOption", { language: language.name })}
                accessibilityState={{ selected }}
                onPress={() => {
                  setOpen(false);
                  if (!selected) void i18n.changeLanguage(language.code);
                }}
                style={[styles.item, selected && styles.itemSelected]}
              >
                <Text style={styles.flag}>{language.flag}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginLeft: 10, zIndex: 20 },
  button: { flexDirection: "row", alignItems: "center", gap: 5, height: 36, paddingHorizontal: 10, borderRadius: 11, borderWidth: 1, borderColor: "#C9D9C9", backgroundColor: palette.softGreen },
  pressed: { opacity: 0.75 },
  flag: { fontSize: 20, lineHeight: 26, includeFontPadding: false },
  caret: { color: palette.green, fontSize: 11 },
  menu: { position: "absolute", top: 42, right: 0, zIndex: 30, elevation: 8, borderRadius: 12, backgroundColor: palette.white, padding: 4, borderWidth: 1, borderColor: "#E3E7DE", shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  item: { minHeight: 44, minWidth: 56, alignItems: "center", justifyContent: "center", paddingHorizontal: 12, borderRadius: 9 },
  itemSelected: { backgroundColor: palette.softGreen }
});