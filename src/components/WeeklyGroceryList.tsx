import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { formatMoney, getCountry, type CountryCode } from "../countryPricing";
import {
  buildShoppingEstimate,
  formatShoppingQuantity,
  isCalendarDateAvailable,
  getCalendarMonthNavigationAvailability,
  getShoppingCategory
} from "../groceryEstimate";
import { PLANNING_HORIZON_DAYS } from "../sampleData";
import type { MealPreferences } from "../models";
import { palette } from "../theme";
import { useTranslation } from "react-i18next";
import { useDateLocale, useFoodNames } from "../i18n";

type Props = {
  today: Date;
  preferences: MealPreferences;
  appliedGoals: Record<string, number>;
  countryCode: CountryCode;
};

type DateField = "start" | "end";

const DAY_MS = 86_400_000;
const MAX_RANGE_DAYS = 90;
const categoryOrder = [
  "Fruit",
  "Vegetables",
  "Meat & fish",
  "Dairy & eggs",
  "Grains & bakery",
  "Legumes",
  "Pantry & seasonings",
  "Other"
];

export function WeeklyGroceryList({
  today,
  preferences,
  appliedGoals,
  countryCode
}: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { food, unit } = useFoodNames();
  const country = getCountry(countryCode);
  const firstAvailableDate = startOfDay(today);
  const lastAvailableDate = addDays(firstAvailableDate, PLANNING_HORIZON_DAYS);
  const [startDate, setStartDate] = useState(() => startOfDay(today));
  const [endDate, setEndDate] = useState(() => addDays(startOfDay(today), 6));
  const [hasCustomRange, setHasCustomRange] = useState(false);
  const [activeDateField, setActiveDateField] = useState<DateField | null>(null);

  useEffect(() => {
    const newStartDate = startOfDay(today);
    const newLastDate = addDays(newStartDate, PLANNING_HORIZON_DAYS);
    if (!hasCustomRange) {
      const newEndDate = addDays(newStartDate, 6);
      if (!isSameDay(startDate, newStartDate)) setStartDate(newStartDate);
      if (!isSameDay(endDate, newEndDate)) setEndDate(newEndDate);
      return;
    }

    const start = startDate < newStartDate ? newStartDate : startDate > newLastDate ? newLastDate : startDate;
    const end = endDate < start ? start : endDate > newLastDate ? newLastDate : endDate;
    if (!isSameDay(start, startDate)) setStartDate(start);
    if (!isSameDay(end, endDate)) setEndDate(end);
  }, [hasCustomRange, today, startDate, endDate]);

  const estimate = useMemo(
    () => buildShoppingEstimate(startDate, endDate, preferences, appliedGoals, countryCode),
    [startDate, endDate, preferences, appliedGoals, countryCode]
  );
  const days = dayCount(startDate, endDate);
  const groups = categoryOrder.map((category) => ({
    category,
    items: estimate.items.filter((item) => getShoppingCategory(item.name) === category)
  })).filter((group) => group.items.length > 0);
  const [checkedKeys, setCheckedKeys] = useState<ReadonlySet<string>>(() => new Set());
  // Price-only changes keep the ticks; any change in dates, items or quantities resets them.
  const listSignature = [
    startDate.toDateString(),
    endDate.toDateString(),
    ...estimate.items.map((item) => `${item.key}:${item.quantity}:${item.unit}`)
  ].join("|");
  const checkedCount = estimate.items.filter((item) => checkedKeys.has(item.key)).length;

  useEffect(() => {
    setCheckedKeys(new Set());
  }, [listSignature]);

  function toggleItem(key: string): void {
    setCheckedKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function chooseDate(date: Date): void {
    setHasCustomRange(true);
    if (activeDateField === "start") {
      setStartDate(date);
      const selectedRangeDays = dayCount(date, endDate);
      if (selectedRangeDays < 1) {
        setEndDate(date);
      } else if (selectedRangeDays > MAX_RANGE_DAYS) {
        setEndDate(addDays(date, MAX_RANGE_DAYS - 1));
      }
    } else {
      setEndDate(date);
    }
    setActiveDateField(null);
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t("grocery.title")}</Text>
      <View style={styles.dateFields}>
        <DateFieldButton
          label={t("grocery.startDate")}
          date={startDate}
          onPress={() => setActiveDateField("start")}
        />
        <Text style={styles.dateSeparator}>—</Text>
        <DateFieldButton
          label={t("grocery.endDate")}
          date={endDate}
          onPress={() => setActiveDateField("end")}
        />
      </View>
      <Text style={styles.period}>{t("grocery.days", { count: days })} · {days === 7 ? t("grocery.weeklyList") : t("grocery.selectedRange")}</Text>
      <View style={styles.totalRow}>
        <View>
          <Text style={styles.totalLabel}>{t("grocery.estimatedTotal")}</Text>
          <Text style={styles.countryLabel}>{country.name} · {country.currencyCode}</Text>
        </View>
        <Text style={styles.totalValue}>{formatMoney(estimate.estimatedTotal, country.locale)}</Text>
      </View>
      {estimate.items.length === 0 ? (
        <Text style={styles.empty}>{t("grocery.empty")}</Text>
      ) : (
        <View style={styles.items}>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>{t("grocery.progress", { checked: checkedCount, total: estimate.items.length })}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("grocery.resetA11y")}
              accessibilityState={{ disabled: checkedCount === 0 }}
              disabled={checkedCount === 0}
              hitSlop={6}
              onPress={() => setCheckedKeys(new Set())}
              style={({ pressed }) => [styles.resetButton, checkedCount === 0 && styles.resetButtonDisabled, pressed && styles.pressed]}
            >
              <Text style={styles.resetText}>↺ {t("grocery.reset")}</Text>
            </Pressable>
          </View>
          {groups.map((group) => (
            <View key={group.category} style={styles.category}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>{t(`grocery.category.${group.category}`, { defaultValue: group.category }).toUpperCase()}</Text>
                <Text style={styles.categoryCount}>
                  {group.items.filter((item) => checkedKeys.has(item.key)).length}/{group.items.length}
                </Text>
              </View>
              <View style={styles.categoryItems}>
                {group.items.map((item) => {
                  const checked = checkedKeys.has(item.key);
                  const quantity = formatShoppingQuantity(item.quantity, unit(item.unit), country.locale);
                  return (
                    <Pressable
                      key={item.key}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked }}
                      accessibilityLabel={`${food(item.name)}, ${quantity}`}
                      onPress={() => toggleItem(item.key)}
                      style={({ pressed }) => [styles.itemRow, checked && styles.itemRowChecked, pressed && styles.pressed]}
                    >
                      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                        {checked && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <View style={styles.itemMain}>
                        <Text style={[styles.itemName, checked && styles.textChecked]}>{food(item.name)}</Text>
                        <Text style={[styles.quantity, checked && styles.textChecked]}>{quantity}</Text>
                      </View>
                      <Text style={[styles.itemCost, checked && styles.itemCostChecked]}>{formatMoney(item.estimatedCost, country.locale)}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      )}
      <DatePickerModal
        visible={activeDateField !== null}
        selectedDate={activeDateField === "end" ? endDate : startDate}
        preferences={preferences}
        minDate={activeDateField === "end" ? startDate : firstAvailableDate}
        maxDate={activeDateField === "end"
          ? earlierDate(lastAvailableDate, addDays(startDate, MAX_RANGE_DAYS - 1))
          : lastAvailableDate}
        onSelect={chooseDate}
        onClose={() => setActiveDateField(null)}
      />
    </View>
  );
}

function DateFieldButton({
  label,
  date,
  onPress
}: {
  label: string;
  date: Date;
  onPress: () => void;
}): React.JSX.Element {
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("grocery.dateA11y", { label, date: formatDate(date, dateLocale) })}
      onPress={onPress}
      style={({ pressed }) => [styles.dateField, pressed && styles.pressed]}
    >
      <Text style={styles.dateFieldLabel}>{label}</Text>
      <Text style={styles.dateFieldValue}>{formatDate(date, dateLocale)}</Text>
    </Pressable>
  );
}

function DatePickerModal({
  visible,
  selectedDate,
  preferences,
  minDate,
  maxDate,
  onSelect,
  onClose
}: {
  visible: boolean;
  selectedDate: Date;
  preferences: MealPreferences;
  minDate?: Date;
  maxDate?: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
}): React.JSX.Element {
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const [month, setMonth] = useState(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const weekdays = Array.from({ length: 7 }, (_, index) =>
    new Date(2024, 0, 1 + index).toLocaleDateString(dateLocale, { weekday: "short" })
  );

  useEffect(() => {
    if (visible) setMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  }, [selectedDate, visible]);

  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = new Date(first);
  gridStart.setDate(1 - ((first.getDay() + 6) % 7));
  const dates = Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
  const monthLabel = month.toLocaleDateString(dateLocale, { month: "long", year: "numeric" });
  const monthNavigation = minDate && maxDate
    ? getCalendarMonthNavigationAvailability(month, minDate, maxDate)
    : { previous: true, next: true };

  function changeMonth(amount: number): void {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  }

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.modalOverlay}>
        <View accessibilityViewIsModal style={styles.datePicker}>
          <View style={styles.pickerHeader}>
            <Pressable accessibilityRole="button" accessibilityLabel={t("grocery.previousMonth")} accessibilityState={{ disabled: !monthNavigation.previous }} disabled={!monthNavigation.previous} onPress={() => changeMonth(-1)} style={[styles.monthButton, !monthNavigation.previous && styles.monthButtonDisabled]}>
              <Text style={[styles.monthArrow, !monthNavigation.previous && styles.monthArrowDisabled]}>‹</Text>
            </Pressable>
            <Text accessibilityRole="header" style={styles.monthTitle}>{monthLabel}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={t("grocery.nextMonth")} accessibilityState={{ disabled: !monthNavigation.next }} disabled={!monthNavigation.next} onPress={() => changeMonth(1)} style={[styles.monthButton, !monthNavigation.next && styles.monthButtonDisabled]}>
              <Text style={[styles.monthArrow, !monthNavigation.next && styles.monthArrowDisabled]}>›</Text>
            </Pressable>
          </View>
          <View style={styles.calendarGrid}>
            {weekdays.map((day) => <Text key={day} style={styles.weekday}>{day}</Text>)}
            {dates.map((date) => {
              const inMonth = date.getMonth() === month.getMonth();
              const disabled = minDate !== undefined && maxDate !== undefined
                ? !isCalendarDateAvailable(date, minDate, maxDate, preferences)
                : (minDate !== undefined && date < startOfDay(minDate)) ||
                  (maxDate !== undefined && date > startOfDay(maxDate));
              const selected = isSameDay(date, selectedDate);
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={date.toLocaleDateString(dateLocale, {
                    weekday: "long", day: "numeric", month: "long", year: "numeric"
                  })}
                  accessibilityState={{ selected, disabled }}
                  disabled={disabled}
                  key={date.toISOString()}
                  onPress={() => onSelect(date)}
                  style={[styles.calendarDay, selected && styles.calendarDaySelected, !inMonth && styles.calendarDayOutside]}
                >
                  <Text style={[
                    styles.calendarDayText,
                    selected && styles.calendarDayTextSelected,
                    (!inMonth || disabled) && styles.calendarDayTextMuted
                  ]}>{date.getDate()}</Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>{t("common.cancel")}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function startOfDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function addDays(date: Date, count: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + count);
  return next;
}

function earlierDate(first: Date, second: Date): Date {
  return first <= second ? first : second;
}

function dayCount(startDate: Date, endDate: Date): number {
  return Math.round((startOfDay(endDate).getTime() - startOfDay(startDate).getTime()) / DAY_MS) + 1;
}

function isSameDay(first: Date, second: Date): boolean {
  return first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();
}

function formatDate(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}

const styles = StyleSheet.create({
  card: { marginTop: 24, backgroundColor: palette.white, borderRadius: 18, padding: 15, borderWidth: 1, borderColor: "#F0F0EA" },
  title: { color: palette.ink, fontSize: 18, fontWeight: "700" },
  dateFields: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 15 },
  dateField: { flex: 1, minHeight: 54, justifyContent: "center", paddingHorizontal: 10, borderRadius: 11, backgroundColor: "#F7F7F2" },
  dateFieldLabel: { color: palette.muted, fontSize: 9, fontWeight: "600" },
  dateFieldValue: { color: palette.ink, fontSize: 12, fontWeight: "700", marginTop: 4 },
  dateSeparator: { color: palette.muted, fontSize: 14 },
  period: { color: palette.green, fontSize: 10, fontWeight: "700", marginTop: 8 },
  totalRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: palette.line },
  totalLabel: { color: palette.ink, fontSize: 12, fontWeight: "700" },
  countryLabel: { color: palette.muted, fontSize: 9, marginTop: 3 },
  totalValue: { color: palette.green, fontSize: 17, fontWeight: "700" },
  items: { marginTop: 3 },
  progressRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 },
  progressText: { color: palette.muted, fontSize: 11, fontWeight: "700" },
  resetButton: { flexDirection: "row", alignItems: "center", paddingHorizontal: 11, paddingVertical: 6, borderRadius: 9, borderWidth: 1, borderColor: "#C9D9C9", backgroundColor: palette.softGreen },
  resetButtonDisabled: { opacity: 0.4 },
  resetText: { color: palette.green, fontSize: 11, fontWeight: "700" },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#B9C8B6", alignItems: "center", justifyContent: "center", marginRight: 11, backgroundColor: palette.white },
  checkboxChecked: { borderColor: palette.green, backgroundColor: palette.green },
  checkmark: { color: palette.white, fontSize: 13, lineHeight: 16, fontWeight: "900", includeFontPadding: false },
  itemRowChecked: { backgroundColor: "#F3F5F0" },
  textChecked: { color: "#A3A79E", textDecorationLine: "line-through" },
  itemCostChecked: { opacity: 0.45 },
  category: { marginTop: 15, borderWidth: 1, borderColor: "#C9D8C6", borderRadius: 13, overflow: "hidden", backgroundColor: "#FAFBF8" },
  categoryHeader: { minHeight: 46, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 13, backgroundColor: "#DCE9D9", borderBottomWidth: 2, borderBottomColor: "#C0D2BC" },
  categoryTitle: { color: "#244A31", fontSize: 13, fontWeight: "800", letterSpacing: 0.8 },
  categoryCount: { color: palette.green, fontSize: 10, fontWeight: "800", backgroundColor: palette.white, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, overflow: "hidden" },
  categoryItems: { paddingHorizontal: 10, paddingTop: 10, paddingBottom: 2 },
  itemRow: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, marginBottom: 8, borderRadius: 11, backgroundColor: palette.white, borderWidth: 1, borderColor: "#EDEFE8" },
  itemMain: { flex: 1, paddingVertical: 9 },
  itemName: { color: palette.ink, fontSize: 12, fontWeight: "600" },
  quantity: { color: palette.muted, fontSize: 11, fontWeight: "600", marginTop: 3 },
  itemCost: { color: "#8A5A1F", fontSize: 11, fontWeight: "700", marginLeft: 12, backgroundColor: "#F6E9D8", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, overflow: "hidden" },
  empty: { color: palette.muted, fontSize: 11, paddingVertical: 12 },
  modalOverlay: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "rgba(25, 32, 26, 0.42)" },
  datePicker: { borderRadius: 20, padding: 16, backgroundColor: palette.paper },
  pickerHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  monthButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: palette.white },
  monthButtonDisabled: { opacity: 0.35 },
  monthArrow: { color: palette.green, fontSize: 27, lineHeight: 30 },
  monthArrowDisabled: { color: palette.muted },
  monthTitle: { color: palette.ink, fontSize: 16, fontWeight: "700" },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap" },
  weekday: { width: "14.2857%", textAlign: "center", color: palette.muted, fontSize: 10, fontWeight: "600", paddingVertical: 8 },
  calendarDay: { width: "14.2857%", height: 42, alignItems: "center", justifyContent: "center", borderRadius: 12 },
  calendarDaySelected: { backgroundColor: palette.green },
  calendarDayOutside: { opacity: 0.45 },
  calendarDayText: { color: palette.ink, fontSize: 12, fontWeight: "600" },
  calendarDayTextSelected: { color: palette.white },
  calendarDayTextMuted: { color: palette.muted },
  cancelButton: { alignSelf: "flex-end", paddingHorizontal: 14, paddingVertical: 10, marginTop: 8 },
  cancelText: { color: palette.green, fontSize: 12, fontWeight: "700" },
  pressed: { opacity: 0.75 }
});
