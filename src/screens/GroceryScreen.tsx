import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { WeeklyGroceryList } from "../components/WeeklyGroceryList";
import type { CountryCode } from "../countryPricing";
import type { MealPreferences } from "../models";
import { palette } from "../theme";

type Props = {
  today: Date;
  preferences: MealPreferences;
  appliedGoals: Record<string, number>;
  countryCode: CountryCode;
  onBackToCalendar: () => void;
};

export function GroceryScreen({
  today,
  preferences,
  appliedGoals,
  countryCode,
  onBackToCalendar
}: Props): React.JSX.Element {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to meal calendar"
        onPress={onBackToCalendar}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Text style={styles.backArrow}>←</Text>
        <Text style={styles.backLabel}>Meal calendar</Text>
      </Pressable>
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>NOURISH · YOUR MEALS</Text>
        <Text style={styles.title}>Shopping list</Text>
        <Text style={styles.subtitle}>Choose dates for your list. It starts with a seven-day week.</Text>
      </View>
      <WeeklyGroceryList
        today={today}
        preferences={preferences}
        appliedGoals={appliedGoals}
        countryCode={countryCode}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 40 },
  backButton: { alignSelf: "flex-start", minHeight: 40, flexDirection: "row", alignItems: "center", paddingRight: 10 },
  backArrow: { color: palette.green, fontSize: 20, fontWeight: "600", marginRight: 7 },
  backLabel: { color: palette.green, fontSize: 13, fontWeight: "700" },
  heading: { marginTop: 13 },
  eyebrow: { color: palette.muted, fontSize: 9, fontWeight: "700", letterSpacing: 1 },
  title: { color: palette.ink, fontSize: 24, fontWeight: "700", letterSpacing: -0.5, marginTop: 7 },
  subtitle: { color: palette.muted, fontSize: 12, marginTop: 5 },
  pressed: { opacity: 0.75 }
});
