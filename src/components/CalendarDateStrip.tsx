import React, { useEffect, useMemo, useRef } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { ScrollViewInstance } from "react-native";
import { formatDateKey } from "../sampleData";
import { getBatchWindow } from "../batchCooking";
import { palette } from "../theme";
import { useTranslation } from "react-i18next";
import { useDateLocale } from "../i18n";

type Props = {
  dates: Date[];
  selectedDate: Date;
  today: Date;
  batchCooking?: boolean;
  onSelectDate: (date: Date) => void;
  onTouchChange: (touching: boolean) => void;
};

export function CalendarDateStrip({ dates, selectedDate, today, batchCooking = false, onSelectDate, onTouchChange }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const scrollViewRef = useRef<ScrollViewInstance | null>(null);
  const selectedKey = formatDateKey(selectedDate);
  const todayKey = formatDateKey(today);
  const formatters = useMemo(() => ({
    label: new Intl.DateTimeFormat(dateLocale, { weekday: "long", month: "long", day: "numeric" }),
    weekday: new Intl.DateTimeFormat(dateLocale, { weekday: "short" })
  }), [dateLocale]);

  useEffect(() => {
    const selectedIndex = dates.findIndex((date) => formatDateKey(date) === selectedKey);
    if (selectedIndex >= 0) {
      scrollViewRef.current?.scrollTo({ x: Math.max(0, selectedIndex * 59), animated: true });
    }
  }, [dates, selectedKey]);

  return (
    <ScrollView
      ref={scrollViewRef}
      accessibilityLabel={t("calendar.planningDates")}
      contentContainerStyle={styles.content}
      horizontal
      nestedScrollEnabled
      directionalLockEnabled
      onTouchStart={() => onTouchChange(true)}
      onTouchEnd={() => onTouchChange(false)}
      onTouchCancel={() => onTouchChange(false)}
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
    >
      {dates.map((date) => {
        const dateKey = formatDateKey(date);
        const active = dateKey === selectedKey;
        const isToday = dateKey === todayKey;
        // Batch starts (Mon/Fri), plus today when it falls inside a running batch.
        const isCookDay = batchCooking && (getBatchWindow(date).dayIndex === 0 || isToday);
        const label = formatters.label.format(date);
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityHint={t("calendar.dateHint")}
            accessibilityState={{ selected: active }}
            key={dateKey}
            onPress={() => onSelectDate(date)}
            style={[styles.dayButton, isCookDay && !active && styles.dayButtonCook, active && styles.dayButtonActive]}
          >
            <Text style={[styles.dayName, active && styles.dayNameActive]}>
              {formatters.weekday.format(date)}
            </Text>
            <Text style={[styles.dayNumber, active && styles.dayNumberActive]}>{date.getDate()}</Text>
            {isCookDay ? <Text style={styles.cookIcon}>🍲</Text> : <View style={[styles.dayDot, (isToday || active) && styles.dayDotVisible]} />}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginHorizontal: -22, marginBottom: 21 },
  content: { paddingHorizontal: 22, gap: 7 },
  dayButton: {
    width: 52,
    height: 73,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: "#F0F0EA"
  },
  dayButtonActive: { backgroundColor: palette.green, borderColor: palette.green },
  dayButtonCook: { backgroundColor: "#F6E9D8", borderColor: "#E3C79F" },
  cookIcon: { fontSize: 12, lineHeight: 15, marginTop: 1, height: 15 },
  dayName: { color: palette.muted, fontSize: 10, fontWeight: "600" },
  dayNameActive: { color: "#DCE7DB" },
  dayNumber: { color: palette.ink, fontSize: 17, fontWeight: "700", marginTop: 5 },
  dayNumberActive: { color: palette.white },
  dayDot: { height: 4, width: 4, borderRadius: 2, marginTop: 4 },
  dayDotVisible: { backgroundColor: "#9EBD9D" }
});
