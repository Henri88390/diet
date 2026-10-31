import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { ArrowButton } from "../components/ArrowButton";
import { WeeklyGroceryList } from "../components/WeeklyGroceryList";
import type { CountryCode } from "../countryPricing";
import type { MealPreferences } from "../models";

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
      <ArrowButton
        variant="compact"
        direction="left"
        label="Meal calendar"
        accessibilityLabel="Back to meal calendar"
        onPress={onBackToCalendar}
        style={{ alignSelf: "flex-start" }}
      />
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
  content: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 40 }
});
