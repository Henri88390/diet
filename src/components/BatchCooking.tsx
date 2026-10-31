import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { BatchPrep } from "../groceryEstimate";
import { formatShoppingQuantity } from "../groceryEstimate";
import { useDateLocale, useFoodNames } from "../i18n";
import { palette } from "../theme";

function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function useWeekday(startDate: string): string {
  const locale = useDateLocale();
  return parseDateKey(startDate).toLocaleDateString(locale, { weekday: "long" });
}

/** Small note for a meal assembled from the batch-cooked base. */
export function BatchNote(): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <View style={styles.note}>
      <Text style={styles.noteText}>🍱 {t("batch.note")}</Text>
    </View>
  );
}

/** Drained canned legumes are already cooked; everything else in the prep list is weighed raw/dry. */
function isPreCooked(name: string): boolean {
  return /drained/i.test(name);
}

/** Calendar card listing what to cook in bulk for the selected day's batch. */
export function BatchPrepCard({
  prep,
  selectedDateKey,
  todayKey
}: {
  prep: BatchPrep;
  selectedDateKey: string;
  todayKey: string;
}): React.JSX.Element {
  const { t } = useTranslation();
  const { food, unit } = useFoodNames();
  const locale = useDateLocale();
  const day = useWeekday(prep.startDate);
  const isPrepToday = prep.startDate === todayKey && selectedDateKey === todayKey;
  // Open by default on the cook day itself; other days of the batch start collapsed.
  const isCookDay = selectedDateKey === prep.startDate;
  const [expanded, setExpanded] = useState(isCookDay);
  const showItems = expanded;
  useEffect(() => {
    setExpanded(isCookDay);
  }, [selectedDateKey, isCookDay]);
  const subtitle = isPrepToday
    ? t("batch.prepToday", { count: prep.days })
    : t("batch.prepSubtitle", { day, count: prep.days });
  return (
    <View style={styles.card} accessibilityRole="summary">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${t("batch.prepTitle")}, ${subtitle}`}
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((open) => !open)}
        style={styles.titleRow}
      >
        <View style={styles.titleGroup}>
          <Text style={styles.title}>{t("batch.prepTitle")}</Text>
          <Text numberOfLines={1} style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={[styles.chevron, expanded && styles.chevronOpen]} />
      </Pressable>
      {showItems && <View style={styles.itemsGap} />}
      {showItems && prep.items.map((item) => {
        const preCooked = isPreCooked(item.name);
        return (
        <View key={`${item.name}-${item.unit}`} style={styles.row}>
          <Text style={styles.name}>{food(item.name)}</Text>
          <View style={[styles.stateBadge, preCooked ? styles.stateCooked : styles.stateRaw]}>
            <Text style={[styles.stateText, preCooked ? styles.stateTextCooked : styles.stateTextRaw]}>
              {t(preCooked ? "batch.cooked" : "batch.raw")}
            </Text>
          </View>
          <Text style={styles.quantity}>{formatShoppingQuantity(item.quantity, unit(item.unit), locale)}</Text>
        </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  note: { alignSelf: "flex-start", marginTop: 8, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: palette.softGreen },
  noteText: { color: palette.green, fontSize: 10, fontWeight: "700" },
  card: { backgroundColor: palette.white, borderRadius: 16, padding: 14, marginTop: 20, borderWidth: 1, borderColor: "#C9D9C9" },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { color: palette.green, fontSize: 14, fontWeight: "800" },
  stateBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 },
  stateRaw: { backgroundColor: "#F6E9D8" },
  stateCooked: { backgroundColor: palette.softGreen },
  stateText: { fontSize: 10, fontWeight: "700" },
  stateTextRaw: { color: "#8A5A1F" },
  stateTextCooked: { color: palette.green },
  itemsGap: { height: 6 },
  chevron: { width: 8, height: 8, marginLeft: 12, marginRight: 2, marginBottom: 3, borderRightWidth: 2, borderBottomWidth: 2, borderColor: palette.green, transform: [{ rotate: "45deg" }] },
  chevronOpen: { marginBottom: 0, marginTop: 3, transform: [{ rotate: "225deg" }] },
  titleGroup: { flex: 1, flexDirection: "row", alignItems: "baseline", flexWrap: "nowrap", gap: 8, marginRight: 8 },
  subtitle: { flexShrink: 1, color: palette.ink, fontSize: 12, fontWeight: "600" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6, borderTopWidth: 1, borderTopColor: palette.line },
  name: { flex: 1, color: palette.ink, fontSize: 12, fontWeight: "500" },
  quantity: { color: palette.ink, fontSize: 12, fontWeight: "700", marginLeft: 10 }
});
