import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { palette } from "../theme";

type Props = {
  label: string;
  onPress: () => void;
  direction?: "left" | "right";
  variant?: "primary" | "compact" | "light";
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: object;
};

const variants = {
  primary: { minHeight: 55, radius: 15, fontSize: 15, bg: palette.green, fg: palette.white },
  compact: { minHeight: 42, radius: 15, fontSize: 14, bg: palette.green, fg: palette.white },
  light: { minHeight: 42, radius: 11, fontSize: 12, bg: palette.white, fg: palette.green }
} as const;

// The chevron is drawn with borders because font arrow glyphs sit below the text's vertical center.
export function ArrowButton({
  label,
  onPress,
  direction = "right",
  variant = "primary",
  disabled = false,
  accessibilityLabel,
  style
}: Props): React.JSX.Element {
  const v = variants[variant];
  const size = variant === "primary" ? 10 : 8;
  const chevron = (
    <View
      style={[
        { width: size, height: size, borderColor: v.fg, transform: [{ rotate: "45deg" }] },
        direction === "left"
          ? { borderLeftWidth: 2, borderBottomWidth: 2, marginRight: 9, marginLeft: 2 }
          : { borderRightWidth: 2, borderTopWidth: 2, marginLeft: 9, marginRight: 2 }
      ]}
    />
  );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { minHeight: v.minHeight, borderRadius: v.radius, backgroundColor: v.bg },
        disabled && styles.disabled,
        pressed && styles.pressed,
        style
      ]}
    >
      {direction === "left" && chevron}
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={[styles.text, { color: v.fg, fontSize: v.fontSize }, style && { flexShrink: 1 }]}>{label}</Text>
      {direction === "right" && chevron}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  text: { fontWeight: "700", lineHeight: 18, includeFontPadding: false, textAlignVertical: "center" },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.84 }
});
