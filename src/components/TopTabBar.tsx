import React, { useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { palette } from "../theme";

type Props = {
  labels: string[];
  activeIndex: number;
  // Pager offset in pages (0 … labels.length - 1), driven by the pager scroll.
  position: Animated.AnimatedInterpolation<number> | Animated.Value;
  onTabPress: (index: number) => void;
};

export function TopTabBar({ labels, activeIndex, position, onTabPress }: Props): React.JSX.Element {
  const [width, setWidth] = useState(0);
  const tabWidth = labels.length > 0 ? width / labels.length : 0;
  const indicatorInset = 18;

  return (
    <View
      accessibilityRole="tablist"
      style={styles.bar}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      {labels.map((label, index) => {
        const selected = index === activeIndex;
        return (
          <Pressable
            key={label}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onTabPress(index)}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
          >
            <Text numberOfLines={1} style={[styles.label, selected && styles.labelSelected]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
      {tabWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            {
              left: indicatorInset,
              width: tabWidth - indicatorInset * 2,
              transform: [{ translateX: Animated.multiply(position, tabWidth) }]
            }
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    marginHorizontal: 22,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.line
  },
  tab: { flex: 1, alignItems: "center", paddingTop: 10, paddingBottom: 12 },
  pressed: { opacity: 0.6 },
  label: { fontSize: 15, fontWeight: "600", color: palette.muted },
  labelSelected: { color: palette.ink, fontWeight: "800" },
  indicator: {
    position: "absolute",
    bottom: -1,
    height: 3,
    borderRadius: 2,
    backgroundColor: palette.green
  }
});
