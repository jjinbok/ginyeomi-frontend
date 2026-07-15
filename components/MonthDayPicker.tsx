import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, fonts, layout } from '@/constants/theme';

interface MonthDayPickerProps {
  month: number;
  day: number;
  onChange: (month: number, day: number) => void;
  style?: StyleProp<ViewStyle>;
}

const ITEM_HEIGHT = 32;
const VISIBLE_ROWS = 3;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ROWS;
const PAD_ROWS = 1;

const MONTH_LABELS = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
];

function daysInMonth(month: number) {
  return new Date(2001, month, 0).getDate();
}

function WheelColumn({
  items,
  selectedIndex,
  onSelect,
}: {
  items: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const isScrolling = useRef(false);

  useEffect(() => {
    if (isScrolling.current) return;
    scrollRef.current?.scrollTo({
      y: selectedIndex * ITEM_HEIGHT,
      animated: true,
    });
  }, [selectedIndex]);

  const handleMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(items.length - 1, index));
      isScrolling.current = false;
      onSelect(clamped);
    },
    [items.length, onSelect],
  );

  return (
    <View style={styles.wheel}>
      <View pointerEvents="none" style={styles.selectionBand} />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScrollBeginDrag={() => {
          isScrolling.current = true;
        }}
        onMomentumScrollEnd={handleMomentumEnd}
        onScrollEndDrag={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
          const clamped = Math.max(0, Math.min(items.length - 1, index));
          isScrolling.current = false;
          onSelect(clamped);
        }}
        contentContainerStyle={styles.wheelContent}
      >
        {Array.from({ length: PAD_ROWS }).map((_, i) => (
          <View key={`pad-top-${i}`} style={styles.item} />
        ))}
        {items.map((label, index) => {
          const selected = index === selectedIndex;
          return (
            <Pressable
              key={label}
              style={styles.item}
              onPress={() => {
                onSelect(index);
                scrollRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: true });
              }}
            >
              <Text style={[styles.itemText, selected && styles.itemTextSelected]}>{label}</Text>
            </Pressable>
          );
        })}
        {Array.from({ length: PAD_ROWS }).map((_, i) => (
          <View key={`pad-bottom-${i}`} style={styles.item} />
        ))}
      </ScrollView>
    </View>
  );
}

export function MonthDayPicker({ month, day, onChange, style }: MonthDayPickerProps) {
  const maxDay = daysInMonth(month);
  const safeDay = Math.min(day, maxDay);

  const dayLabels = useMemo(
    () => Array.from({ length: maxDay }, (_, i) => `${i + 1}일`),
    [maxDay],
  );

  useEffect(() => {
    if (day > maxDay) {
      onChange(month, maxDay);
    }
  }, [day, maxDay, month, onChange]);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.summary}>
        {month}월 {safeDay}일
      </Text>
      <View style={styles.wheels}>
        <WheelColumn
          items={MONTH_LABELS}
          selectedIndex={month - 1}
          onSelect={(index) => {
            const nextMonth = index + 1;
            onChange(nextMonth, Math.min(safeDay, daysInMonth(nextMonth)));
          }}
        />
        <View style={styles.divider} />
        <WheelColumn
          items={dayLabels}
          selectedIndex={safeDay - 1}
          onSelect={(index) => onChange(month, index + 1)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  summary: {
    fontSize: 14,
    fontFamily: fonts.sans,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },
  wheels: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    overflow: 'hidden',
    height: PICKER_HEIGHT,
  },
  wheel: {
    flex: 1,
    position: 'relative',
  },
  selectionBand: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: ITEM_HEIGHT * PAD_ROWS,
    height: ITEM_HEIGHT,
    borderRadius: 8,
    backgroundColor: colors.tagBackground,
    zIndex: 0,
  },
  wheelContent: {
    paddingVertical: 0,
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  itemText: {
    fontSize: 14,
    fontFamily: fonts.sans,
    color: colors.textHint,
  },
  itemTextSelected: {
    fontSize: 15,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
});
