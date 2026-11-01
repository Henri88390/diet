import React, { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, type KeyboardTypeOptions } from "react-native";
import { palette } from "../theme";

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  onStep: (direction: 1 | -1) => void;
  unit: string;
  keyboardType: KeyboardTypeOptions;
  inputLabel: string;
  inputHint?: string;
  decreaseLabel: string;
  increaseLabel: string;
  maxLength?: number;
  invalid?: boolean;
  warning?: boolean;
};

/** [− value unit +] control; tapping anywhere in the field focuses the input with the cursor after the last digit. */
export function AmountStepper(props: Props): React.JSX.Element {
  const inputRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const [selection, setSelection] = useState<{ start: number; end: number } | undefined>();

  function focusInput(): void {
    const end = props.value.length;
    setSelection({ start: end, end });
    inputRef.current?.focus();
  }

  return (
    <Pressable onPress={focusInput} style={[styles.row, props.invalid && styles.invalid, props.warning && styles.warning]}>
      <Pressable accessibilityRole="button" accessibilityLabel={props.decreaseLabel} hitSlop={6} onPress={() => props.onStep(-1)} style={styles.button}>
        <Text style={styles.buttonText}>−</Text>
      </Pressable>
      <TextInput
        ref={inputRef}
        selection={selection}
        onSelectionChange={() => setSelection(undefined)}
        accessibilityLabel={props.inputLabel}
        accessibilityHint={props.inputHint}
        keyboardType={props.keyboardType}
        maxLength={props.maxLength}
        onChangeText={props.onChangeText}
        style={styles.input}
        value={props.value}
      />
      <Text style={styles.unit}>{props.unit}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={props.increaseLabel} hitSlop={6} onPress={() => props.onStep(1)} style={styles.button}>
        <Text style={styles.buttonText}>+</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", backgroundColor: "#F7F7F3", borderRadius: 10, paddingHorizontal: 6, minHeight: 36 },
  invalid: { borderWidth: 1, borderColor: "#C0392B", backgroundColor: "#FBEDEB" },
  warning: { borderWidth: 1, borderColor: "#E08A1E", backgroundColor: "#FFF4E3" },
  button: { width: 28, height: 28, borderRadius: 8, backgroundColor: "#E5EEE5", alignItems: "center", justifyContent: "center" },
  buttonText: { color: palette.green, fontSize: 18, lineHeight: 22, fontWeight: "800", includeFontPadding: false },
  input: { minWidth: 44, marginLeft: 5, color: palette.ink, fontSize: 15, fontWeight: "700", paddingVertical: 4, textAlign: "right" },
  unit: { color: palette.muted, fontSize: 11, marginLeft: 8, marginRight: 8 }
});