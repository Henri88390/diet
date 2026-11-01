import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useDateLocale, useFoodNames } from "../i18n";
import type { Meal, MealType, PlanStyle } from "../models";
import { mealAccent, mealBadge, mealTypeIcon, palette } from "../theme";
import { getMenuMealGroupKey } from "../menuGrouping";
import { GroupHeading } from "../components/BanSections";
import { BannedIngredientsChip } from "../components/BannedIngredientsChip";

type MenuDay = { dateKey: string; meals: Meal[] };
type Props = {
  days: MenuDay[];
  planStyle: PlanStyle;
  onBan: (meal: Meal) => void;
  onReplaceAll: (meal: Meal, sourceRecipeKeys: string[]) => void;
  onMealPress: (meal: Meal) => void;
};
const typeOrder: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

export function MenuScreen(props: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { food } = useFoodNames();
  const locale = useDateLocale();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const groups = useMemo(() => {
    const grouped = new Map<string, { key: string; recipe: Meal; dates: string[]; occurrenceKeys: Set<string>; occurrenceSpecific: boolean; occurrences: number; batch: boolean; typical: boolean; sourceRecipeKeys: Set<string> }>();
    props.days.forEach(({ dateKey, meals }) => meals.forEach((meal) => {
      const key = getMenuMealGroupKey(meal);
      const current = grouped.get(key) ?? { key, recipe: meal, dates: [], occurrenceKeys: new Set<string>(), occurrenceSpecific: false, occurrences: 0, batch: false, typical: false, sourceRecipeKeys: new Set<string>() };
      current.occurrences += 1;
      current.dates.push(dateKey);
      if (meal.occurrenceKey) current.occurrenceKeys.add(meal.occurrenceKey);
      current.occurrenceSpecific ||= Boolean(meal.ingredientBanOccurrenceScoped);
      if (meal.sourceRecipeKey) current.sourceRecipeKeys.add(meal.sourceRecipeKey);
      current.batch ||= Boolean(meal.batch);
      current.typical ||= Boolean(meal.isTypicalBreakfast);
      grouped.set(key, current);
    }));
    return typeOrder.map((type) => ({
      type,
      meals: [...grouped.values()].filter((group) => group.recipe.type === type)
        .sort((a, b) => b.occurrences - a.occurrences || a.recipe.title.localeCompare(b.recipe.title))
    })).filter((group) => group.meals.length > 0);
  }, [props.days]);

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short" }),
    [locale]
  );

  function formatDate(key: string): string {
    const [year, month, day] = key.split("-").map(Number);
    return dateFormatter.format(new Date(year, month - 1, day));
  }

  function renderGroup(group: (typeof groups)[number]): React.JSX.Element {
    return (
      <View key={group.type} style={styles.group}>
        <GroupHeading
          icon={<Text>{mealTypeIcon[group.type]}</Text>}
          iconBackground={mealBadge[group.type].background}
          title={t(`mealType.${group.type}`)}
          count={group.meals.length}
          collapsed={Boolean(collapsed[group.type])}
          onToggle={() => setCollapsed((current) => ({ ...current, [group.type]: !current[group.type] }))}
        />
        {!collapsed[group.type] && <View style={styles.cards}>
          {group.meals.map((entry) => {
            const meal = entry.recipe;
            const dates = expanded[entry.key] ? entry.dates : entry.dates.slice(0, 3);
            const restricted = entry.typical || meal.type === "Snack" || (props.planStyle === "batchCooking" && entry.batch);
            return (
              <Pressable
                key={entry.key}
                accessibilityRole="button"
                accessibilityHint={t("meal.hint")}
                onPress={() => props.onMealPress({
                  ...meal,
                  occurrenceKey: entry.occurrenceSpecific ? [...entry.occurrenceKeys][0] : undefined,
                  occurrenceKeys: entry.occurrenceSpecific ? [...entry.occurrenceKeys] : undefined
                })}
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              >
                <View style={[styles.emojiBox, { backgroundColor: mealAccent[meal.type] }]}><Text style={styles.emoji}>{meal.emoji}</Text></View>
                <View style={styles.main}>
                  <View style={styles.titleRow}>
                    <Text style={styles.mealTitle}>{food(meal.title)}</Text>
                    <Text style={styles.count}>{t("menu.occurrences", { count: entry.occurrences })}</Text>
                  </View>
                  <BannedIngredientsChip meal={meal} />
                  <View style={styles.datesRow}>
                    {dates.map((dateKey) => (
                      <View key={dateKey} style={styles.dateChip}>
                        <Text style={styles.dateText}>{formatDate(dateKey)}</Text>
                      </View>
                    ))}
                    {entry.dates.length > 3 && <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={expanded[entry.key] ? t("menu.showLess") : t("menu.showAll")}
                      hitSlop={6}
                      onPress={() => setExpanded((current) => ({ ...current, [entry.key]: !current[entry.key] }))}
                      style={styles.moreChip}
                    >
                      <Text style={styles.more}>{expanded[entry.key] ? t("menu.showLess") : `+${entry.dates.length - 3}`}</Text>
                    </Pressable>}
                  </View>
                  {entry.batch && <Text style={styles.restriction}>{t("menu.batchUnavailable")}</Text>}
                  {entry.typical && <Text style={styles.restriction}>{t("menu.typicalUnavailable")}</Text>}
                  {!restricted && <View style={styles.actions}>
                    <Pressable accessibilityRole="button" onPress={() => props.onReplaceAll(meal, [...entry.sourceRecipeKeys])} style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}><Text style={styles.actionText}>{t("menu.replaceAll")}</Text></Pressable>
                    <Pressable accessibilityRole="button" onPress={() => props.onBan(meal)} style={({ pressed }) => [styles.actionButton, styles.banButton, pressed && styles.actionPressed]}><Text style={[styles.actionText, styles.banText]}>{t("menu.ban")}</Text></Pressable>
                  </View>}
                </View>
              </Pressable>
            );
          })}
        </View>}
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {groups.length > 0 ? groups.map(renderGroup) : <View style={styles.emptyCard}><Text style={styles.emptyText}>{t("menu.empty")}</Text></View>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 22, paddingTop: 22, paddingBottom: 42 },
  group: { marginBottom: 19 },
  cards: { gap: 9 },
  card: { flexDirection: "row", gap: 11, padding: 12, borderRadius: 16, backgroundColor: palette.white, borderWidth: 1, borderColor: "#F0F0EA" },
  cardPressed: { opacity: 0.78 },
  emojiBox: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 22 },
  main: { flex: 1 },
  titleRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  mealTitle: { flex: 1, color: palette.ink, fontSize: 13, fontWeight: "700" },
  count: { color: palette.green, fontSize: 11, fontWeight: "800" },
  datesRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6, marginTop: 8 },
  dateChip: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: "#F1EEE4" },
  dateText: { color: palette.ink, fontSize: 11, fontWeight: "600" },
  moreChip: { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4, backgroundColor: palette.softGreen },
  more: { color: palette.green, fontSize: 11, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 8, marginTop: 10 },
  actionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.softGreen,
    borderWidth: 1,
    borderColor: "#BFD3BF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10
  },
  actionPressed: { opacity: 0.75 },
  actionText: { color: palette.green, fontSize: 11, fontWeight: "800" },
  banButton: { backgroundColor: "#F8E9E5", borderColor: "#E6C3BB" },
  banText: { color: "#A23A2B" },
  restriction: { color: palette.muted, fontSize: 10, lineHeight: 14, marginTop: 7 },
  emptyCard: { backgroundColor: palette.white, borderRadius: 16, padding: 17, marginBottom: 8 },
  emptyText: { color: palette.muted, fontSize: 12 }
});
