import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useFoodNames } from "../i18n";
import type { IngredientCategoryGroup, Meal, MealType } from "../models";
import { ingredientCatalog, ingredientCategoryOrder } from "../ingredientCatalog";
import { mealBadge, mealTypeIcon, palette } from "../theme";
import { MealCard } from "./MealCard";

const typeOrder: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

type HeadingProps = {
  icon: React.ReactNode;
  iconBackground: string;
  title: string;
  count: string | number;
  collapsed: boolean;
  onToggle: () => void;
  /** Extra button shown left of the chevron; the heading then splits into separate touch targets. */
  action?: React.ReactNode;
};

/** Collapsible group heading shared by the Menu and the ban lists. */
export function GroupHeading({ icon, iconBackground, title, count, collapsed, onToggle, action }: HeadingProps): React.JSX.Element {
  const body = <>
    <View style={[styles.typeIcon, { backgroundColor: iconBackground }]}>{icon}</View>
    <View style={styles.titleWrap}>
      <Text accessibilityRole="header" numberOfLines={1} style={styles.groupTitle}>{title}</Text>
      <View style={styles.countBadge}><Text style={styles.countText}>{count}</Text></View>
    </View>
  </>;
  const chevron = <View style={[styles.chevron, collapsed ? styles.chevronDown : styles.chevronUp]} />;
  if (!action) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: !collapsed }}
        onPress={onToggle}
        style={({ pressed }) => [styles.groupHeading, collapsed && styles.groupHeadingCollapsed, pressed && styles.headingPressed]}
      >
        {body}
        <View style={styles.chevronBox}>{chevron}</View>
      </Pressable>
    );
  }
  return (
    <View style={[styles.groupHeading, styles.splitHeading, collapsed && styles.groupHeadingCollapsed]}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: !collapsed }} onPress={onToggle} style={styles.headingMain}>{body}</Pressable>
      {action}
      <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ expanded: !collapsed }} hitSlop={4} onPress={onToggle} style={styles.chevronBox}>
        {chevron}
      </Pressable>
    </View>
  );
}

function MealTypeIcon({ type }: { type: MealType }): React.JSX.Element {
  return <Text>{mealTypeIcon[type]}</Text>;
}

type BannedMealsProps = {
  recipes: Meal[];
  bannedMeals: string[];
  mealSubstitutes: Record<string, string>;
  onUnban: (recipeKey: string) => void;
  onMealPress: (meal: Meal) => void;
};

export function BannedMealsSection({ recipes, bannedMeals, mealSubstitutes, onUnban, onMealPress }: BannedMealsProps): React.JSX.Element {
  const { t } = useTranslation();
  const { food } = useFoodNames();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const rows = bannedMeals.map((recipeKey) => {
    const recipe = recipes.find((item) => item.recipeKey === recipeKey);
    const substituteKey = mealSubstitutes[recipeKey];
    const substitute = substituteKey ? recipes.find((item) => item.recipeKey === substituteKey) : undefined;
    return { recipeKey, recipe, substitute };
  });
  const groups = typeOrder.map((type) => ({
    type,
    rows: rows.filter((row) => (row.recipe?.type ?? "Breakfast") === type)
  })).filter((group) => group.rows.length > 0);

  function renderUnbanButton(recipeKey: string): React.JSX.Element {
    return (
      <Pressable accessibilityRole="button" hitSlop={6} onPress={() => onUnban(recipeKey)} style={({ pressed }) => [styles.unbanButton, pressed && styles.pressed]}>
        <Text style={styles.unbanText}>{t("menu.unban")}</Text>
      </Pressable>
    );
  }

  if (groups.length === 0) {
    return <View style={styles.emptyCard}>
      <Text style={styles.emptyText}>{t("menu.noBanned")}</Text>
      <Text style={styles.emptyHint}>{t("menu.noBannedHint")}</Text>
    </View>;
  }
  return (
    <View>
      {groups.map((group) => (
        <View key={group.type} style={styles.group}>
          <GroupHeading
            icon={<MealTypeIcon type={group.type} />}
            iconBackground={mealBadge[group.type].background}
            title={t(`mealType.${group.type}`)}
            count={group.rows.length}
            collapsed={Boolean(collapsed[group.type])}
            onToggle={() => setCollapsed((current) => ({ ...current, [group.type]: !current[group.type] }))}
          />
          {!collapsed[group.type] && <View style={styles.cards}>
            {group.rows.map(({ recipeKey, recipe, substitute }) => recipe ? (
              <MealCard
                key={recipeKey}
                meal={recipe}
                onPress={onMealPress}
                corner={renderUnbanButton(recipeKey)}
                footer={substitute ? <Text style={styles.substitute}>{t("menu.substitute", { name: food(substitute.title) })}</Text> : undefined}
              />
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
  );
}

type BannedIngredientsProps = {
  bannedIngredients: string[];
  onToggleIngredientBan: (ingredientId: string) => void;
  onToggleIngredientCategory: (category: IngredientCategoryGroup) => void;
};

export function BannedIngredientsSection({ bannedIngredients, onToggleIngredientBan, onToggleIngredientCategory }: BannedIngredientsProps): React.JSX.Element {
  const { t } = useTranslation();
  const { food } = useFoodNames();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  function renderIngredientCategory(category: IngredientCategoryGroup): React.JSX.Element {
    const items = ingredientCatalog.filter((ingredient) => ingredient.category === category);
    const bannedCount = items.filter((ingredient) => bannedIngredients.includes(ingredient.id)).length;
    const allBanned = bannedCount === items.length;
    const isCollapsed = Boolean(collapsed[category]);
    const name = t("grocery.category." + category, { defaultValue: category });
    return (
      <View key={category} style={styles.group}>
        <GroupHeading
          icon={<Text style={styles.categoryIcon}>{category.slice(0, 1)}</Text>}
          iconBackground={mealBadge.Breakfast.background}
          title={name}
          count={`${bannedCount}/${items.length}`}
          collapsed={isCollapsed}
          onToggle={() => setCollapsed((current) => ({ ...current, [category]: !current[category] }))}
          action={<Pressable
            accessibilityRole="button"
            accessibilityLabel={t(allBanned ? "menu.unbanCategory" : "menu.banCategory", { name })}
            hitSlop={4}
            onPress={() => onToggleIngredientCategory(category)}
            style={({ pressed }) => [styles.categoryAction, allBanned ? styles.categoryActionUnban : styles.categoryActionBan, pressed && styles.pressed]}
          >
            {allBanned
              ? <Text style={styles.categoryUnbanIcon}>{String.fromCharCode(10003)}</Text>
              : <View style={styles.trashIcon}>
                <View style={styles.trashHandle} />
                <View style={styles.trashLid} />
                <View style={styles.trashBin}>
                  <View style={styles.trashLine} />
                  <View style={styles.trashLine} />
                </View>
              </View>}
          </Pressable>}
        />
        {!isCollapsed && <View style={styles.ingredientChoices}>
          {items.map((ingredient) => {
            const isBanned = bannedIngredients.includes(ingredient.id);
            return <Pressable key={ingredient.id} accessibilityRole="button" accessibilityLabel={t(isBanned ? "prefs.unban" : "prefs.ban", { name: food(ingredient.name) })} accessibilityState={{ selected: isBanned }} onPress={() => onToggleIngredientBan(ingredient.id)} style={[styles.ingredientChip, isBanned && styles.ingredientChipBanned]}>
              <Text style={[styles.ingredientChipText, isBanned && styles.ingredientChipTextBanned]}>{food(ingredient.name)}</Text>
            </Pressable>;
          })}
        </View>}
      </View>
    );
  }

  return <View>{ingredientCategoryOrder.map(renderIngredientCategory)}</View>;
}

const styles = StyleSheet.create({
  group: { marginBottom: 19 },
  groupHeading: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 9, paddingLeft: 10, paddingRight: 8, borderRadius: 16, borderWidth: 1, borderColor: "transparent" },
  groupHeadingCollapsed: { marginBottom: 0, paddingVertical: 10, borderColor: palette.line, backgroundColor: palette.white },
  splitHeading: { gap: 8 },
  headingMain: { flex: 1, flexDirection: "row", alignItems: "center", gap: 9 },
  headingPressed: { opacity: 0.6 },
  typeIcon: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  titleWrap: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  groupTitle: { flexShrink: 1, color: palette.ink, fontSize: 16, fontWeight: "800" },
  countBadge: { minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 7, alignItems: "center", justifyContent: "center", backgroundColor: palette.softGreen },
  countText: { color: palette.green, fontSize: 11, fontWeight: "800", includeFontPadding: false },
  chevronBox: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "#F1EEE4" },
  chevron: { width: 11, height: 11, borderRightWidth: 2.5, borderBottomWidth: 2.5, borderColor: palette.ink },
  chevronDown: { marginTop: -5, transform: [{ rotate: "45deg" }] },
  chevronUp: { marginTop: 5, transform: [{ rotate: "-135deg" }] },
  cards: { gap: 9 },
  pressed: { opacity: 0.75 },
  categoryIcon: { color: palette.green, fontSize: 12, fontWeight: "800" },
  categoryAction: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  categoryActionBan: { backgroundColor: "#F8E9E5", borderColor: "#E6C3BB" },
  categoryActionUnban: { backgroundColor: palette.softGreen, borderColor: "#BFD3BF" },
  trashIcon: { alignItems: "center" },
  trashHandle: { width: 6, height: 3, borderTopLeftRadius: 2, borderTopRightRadius: 2, borderWidth: 1.5, borderBottomWidth: 0, borderColor: "#C0392B" },
  trashLid: { width: 15, height: 2, borderRadius: 1, backgroundColor: "#C0392B", marginBottom: 1 },
  trashBin: { width: 11, height: 11, flexDirection: "row", justifyContent: "space-evenly", paddingTop: 2, borderWidth: 1.5, borderTopWidth: 0, borderColor: "#C0392B", borderBottomLeftRadius: 3, borderBottomRightRadius: 3 },
  trashLine: { width: 1.5, height: 6, borderRadius: 1, backgroundColor: "#C0392B" },
  categoryUnbanIcon: { color: palette.green, fontSize: 16, fontWeight: "900" },
  ingredientChoices: { flexDirection: "row", flexWrap: "wrap", gap: 7, paddingHorizontal: 4, paddingTop: 9 },
  ingredientChip: { borderRadius: 15, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line },
  ingredientChipBanned: { backgroundColor: "#F8E9E5", borderColor: "#E6C3BB" },
  ingredientChipText: { color: palette.ink, fontSize: 10, fontWeight: "600" },
  ingredientChipTextBanned: { color: "#A23A2B" },
  substitute: { color: palette.muted, fontSize: 10, marginTop: 6 },
  unknownBanned: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  unbanButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: palette.softGreen, borderWidth: 1, borderColor: "#BFD3BF" },
  unbanText: { color: palette.green, fontSize: 11, fontWeight: "800" },
  emptyCard: { backgroundColor: palette.white, borderRadius: 16, padding: 17, marginBottom: 8 },
  emptyText: { color: palette.muted, fontSize: 12 },
  emptyHint: { color: palette.muted, fontSize: 10, lineHeight: 14, marginTop: 5, opacity: 0.85 }
});
