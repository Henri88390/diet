import React, { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View, type KeyboardTypeOptions } from "react-native";
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
  placeholder?: string;
  invalid?: boolean;
  warning?: boolean;
};

/** − [ value unit ] + control; tapping anywhere in the field focuses the input with the cursor after the last digit. */
export function AmountStepper(props: Props): React.JSX.Element {
  const inputRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const [selection, setSelection] = useState<{ start: number; end: number } | undefined>();

  function focusInput(): void {
    const end = props.value.length;
    setSelection({ start: end, end });
    inputRef.current?.focus();
  }

  return (
    <>
      <Pressable accessibilityRole="button" accessibilityLabel={props.decreaseLabel} onPress={() => props.onStep(-1)} style={styles.button}>
        <Text style={styles.buttonText}>−</Text>
      </Pressable>
      <Pressable onPress={focusInput} style={[styles.container, props.invalid && styles.invalid, props.warning && styles.warning]}>
        <TextInput
          ref={inputRef}
          selection={selection}
          onSelectionChange={() => setSelection(undefined)}
          accessibilityLabel={props.inputLabel}
          accessibilityHint={props.inputHint}
          keyboardType={props.keyboardType}
          onChangeText={props.onChangeText}
          placeholder={props.placeholder}
          placeholderTextColor={palette.muted}
          style={styles.input}
          value={props.value}
        />
        <Text style={styles.unit}>{props.unit}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={props.increaseLabel} onPress={() => props.onStep(1)} style={styles.button}>
        <Text style={styles.buttonText}>+</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  button: { width: 40, borderRadius: 10, backgroundColor: "#E5EEE5", borderWidth: 1, borderColor: "#FFFFFF", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 3, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  buttonText: { color: palette.green, fontSize: 22, lineHeight: 26, fontWeight: "800", includeFontPadding: false },
  container: { width: 92, flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: palette.white, paddingHorizontal: 6 },
  invalid: { borderWidth: 1, borderColor: "#F0A899" },
  warning: { borderWidth: 1, borderColor: "#E08A1E", backgroundColor: "#FFF4E3" },
  input: { flex: 1, minWidth: 48, paddingVertical: 7, color: palette.ink, fontSize: 14, fontWeight: "700", textAlign: "right" },
  unit: { color: palette.muted, fontSize: 10, marginLeft: 5 }
});
