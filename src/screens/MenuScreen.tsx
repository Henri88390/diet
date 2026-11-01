import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useDateLocale, useFoodNames } from "../i18n";
import type { Meal, MealType, PlanStyle } from "../models";
import { mealAccent, mealBadge, mealTypeIcon, palette } from "../theme";
import { getMenuMealGroupKey } from "../menuGrouping";
import { MealCard } from "../components/MealCard";

type MenuDay = { dateKey: string; meals: Meal[] };
type Props = {
  days: MenuDay[];
  recipes: Meal[];
  bannedMeals: string[];
  mealSubstitutes: Record<string, string>;
  planStyle: PlanStyle;
  onBan: (meal: Meal) => void;
  onReplaceAll: (meal: Meal, sourceRecipeKeys: string[]) => void;
  onUnban: (recipeKey: string) => void;
  onMealPress: (meal: Meal) => void;
};
const typeOrder: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

export function MenuScreen(props: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { food } = useFoodNames();
  const locale = useDateLocale();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  function renderHeading(sectionKey: string, type: MealType, count: number): React.JSX.Element {
    const isCollapsed = Boolean(collapsed[sectionKey]);
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: !isCollapsed }}
        onPress={() => setCollapsed((current) => ({ ...current, [sectionKey]: !current[sectionKey] }))}
        style={({ pressed }) => [styles.groupHeading, isCollapsed && styles.groupHeadingCollapsed, pressed && styles.headingPressed]}
      >
        <View style={[styles.typeIcon, { backgroundColor: mealBadge[type].background }]}><Text>{mealTypeIcon[type]}</Text></View>
        <View style={styles.titleWrap}>
          <Text accessibilityRole="header" numberOfLines={1} style={styles.groupTitle}>{t(`mealType.${type}`)}</Text>
          <View style={styles.countBadge}><Text style={styles.countText}>{count}</Text></View>
        </View>
        <View style={styles.chevronBox}>
          <View style={[styles.chevron, isCollapsed ? styles.chevronDown : styles.chevronUp]} />
        </View>
      </Pressable>
    );
  }
  const groups = useMemo(() => {
    const grouped = new Map<string, { key: string; recipe: Meal; dates: string[]; occurrences: number; batch: boolean; typical: boolean; sourceRecipeKeys: Set<string> }>();
    props.days.forEach(({ dateKey, meals }) => meals.forEach((meal) => {
      const key = getMenuMealGroupKey(meal);
      const current = grouped.get(key) ?? { key, recipe: meal, dates: [], occurrences: 0, batch: false, typical: false, sourceRecipeKeys: new Set<string>() };
      current.occurrences += 1;
      current.dates.push(dateKey);
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
        {renderHeading(`menu-${group.type}`, group.type, group.meals.length)}
        {!collapsed[`menu-${group.type}`] && <View style={styles.cards}>
          {group.meals.map((entry) => {
            const meal = entry.recipe;
            const dates = expanded[entry.key] ? entry.dates : entry.dates.slice(0, 3);
            const restricted = entry.typical || meal.type === "Snack" || (props.planStyle === "batchCooking" && entry.batch);
            return (
              <Pressable
                key={entry.key}
                accessibilityRole="button"
                accessibilityHint={t("meal.hint")}
                onPress={() => props.onMealPress({ ...meal, occurrenceKey: undefined })}
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              >
                <View style={[styles.emojiBox, { backgroundColor: mealAccent[meal.type] }]}><Text style={styles.emoji}>{meal.emoji}</Text></View>
                <View style={styles.main}>
                  <View style={styles.titleRow}>
                    <Text style={styles.mealTitle}>{food(meal.title)}</Text>
                    <Text style={styles.count}>{t("menu.occurrences", { count: entry.occurrences })}</Text>
                  </View>
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
                    <Pressable accessibilityRole="button" onPress={() => props.onBan(meal)} style={styles.banButton}><Text style={styles.banText}>{t("menu.ban")}</Text></Pressable>
                    <Pressable accessibilityRole="button" onPress={() => props.onReplaceAll(meal, [...entry.sourceRecipeKeys])} style={styles.replaceButton}><Text style={styles.replaceText}>{t("menu.replaceAll")}</Text></Pressable>
                  </View>}
                </View>
              </Pressable>
            );
          })}
        </View>}
      </View>
    );
  }

  function renderUnbanButton(recipeKey: string): React.JSX.Element {
    return (
      <Pressable accessibilityRole="button" hitSlop={6} onPress={() => props.onUnban(recipeKey)} style={styles.unbanButton}>
        <Text style={styles.unbanText}>{t("menu.unban")}</Text>
      </Pressable>
    );
  }

  function renderSubstitute(substitute: Meal | undefined): React.JSX.Element | undefined {
    return substitute ? <Text style={styles.substitute}>{t("menu.substitute", { name: food(substitute.title) })}</Text> : undefined;
  }

  const bannedRows = props.bannedMeals.map((recipeKey) => {
    const recipe = props.recipes.find((item) => item.recipeKey === recipeKey);
    const substituteKey = props.mealSubstitutes[recipeKey];
    const substitute = substituteKey ? props.recipes.find((item) => item.recipeKey === substituteKey) : undefined;
    return { recipeKey, recipe, substitute };
  });
  const bannedGroups = typeOrder.map((type) => ({
    type,
    rows: bannedRows.filter((row) => (row.recipe?.type ?? "Breakfast") === type)
  })).filter((group) => group.rows.length > 0);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text accessibilityRole="header" style={styles.title}>{t("menu.title")}</Text>
      {groups.length > 0 ? groups.map(renderGroup) : <View style={styles.emptyCard}><Text style={styles.emptyText}>{t("menu.empty")}</Text></View>}
      <View style={styles.bannedSection}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>{t("menu.bannedTitle")}</Text>
        {bannedGroups.length === 0 ? <View style={styles.emptyCard}><Text style={styles.emptyText}>{t("menu.noBanned")}</Text></View> : bannedGroups.map((group) => (
          <View key={group.type} style={styles.group}>
            {renderHeading(`banned-${group.type}`, group.type, group.rows.length)}
            {!collapsed[`banned-${group.type}`] && <View style={styles.cards}>
              {group.rows.map(({ recipeKey, recipe, substitute }) => recipe ? (
                <MealCard key={recipeKey} meal={recipe} onPress={props.onMealPress} corner={renderUnbanButton(recipeKey)} footer={renderSubstitute(substitute)} />
              ) : (
                <View key={recipeKey} style={[styles.emptyCard, styles.unknownBanned]}>
                  <Text style={styles.emptyText}>{recipeKey}</Text>
                  {renderUnbanButton(recipeKey)}
                </View>
              ))}
            </View>}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 22, paddingTop: 22, paddingBottom: 42 },
  title: { color: palette.ink, fontSize: 25, fontWeight: "800", marginBottom: 17 },
  group: { marginBottom: 19 },
  groupHeading: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 9, paddingLeft: 10, paddingRight: 8, borderRadius: 16, borderWidth: 1, borderColor: "transparent" },
  groupHeadingCollapsed: { marginBottom: 0, paddingVertical: 10, borderColor: palette.line, backgroundColor: palette.white },
  typeIcon: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  titleWrap: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  groupTitle: { flexShrink: 1, color: palette.ink, fontSize: 16, fontWeight: "800" },
  countBadge: { minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 7, alignItems: "center", justifyContent: "center", backgroundColor: palette.softGreen },
  countText: { color: palette.green, fontSize: 11, fontWeight: "800", includeFontPadding: false },
  chevronBox: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "#F1EEE4" },
  chevron: { width: 11, height: 11, borderRightWidth: 2.5, borderBottomWidth: 2.5, borderColor: palette.ink },
  chevronDown: { marginTop: -5, transform: [{ rotate: "45deg" }] },
  chevronUp: { marginTop: 5, transform: [{ rotate: "-135deg" }] },
  headingPressed: { opacity: 0.6 },
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
  actions: { flexDirection: "row", gap: 8, marginTop: 9 },
  banButton: { backgroundColor: "#F5E7E2", paddingHorizontal: 11, paddingVertical: 6, borderRadius: 8 },
  banText: { color: "#8B3027", fontSize: 10, fontWeight: "700" },
  replaceButton: { backgroundColor: palette.softGreen, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 8 },
  replaceText: { color: palette.green, fontSize: 10, fontWeight: "700" },
  restriction: { color: palette.muted, fontSize: 10, lineHeight: 14, marginTop: 7 },
  bannedSection: { marginTop: 12 },
  sectionTitle: { color: palette.ink, fontSize: 18, fontWeight: "800", marginBottom: 9 },
  substitute: { color: palette.muted, fontSize: 10, marginTop: 6 },
  unknownBanned: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  unbanButton: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, backgroundColor: palette.softGreen },
  unbanText: { color: palette.green, fontSize: 10, fontWeight: "700" },
  emptyCard: { backgroundColor: palette.white, borderRadius: 16, padding: 17, marginBottom: 8 },
  emptyText: { color: palette.muted, fontSize: 12 }
});
