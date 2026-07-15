import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fonts, layout } from '@/constants/theme';

interface YearPickerProps {
  value: number;
  onChange: (year: number) => void;
  minYear?: number;
  maxYear?: number;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

const YEARS_PER_PAGE = 12;

export function YearPicker({
  value,
  onChange,
  minYear = 1900,
  maxYear = new Date().getFullYear() + 1,
  compact = false,
  style,
}: YearPickerProps) {
  const [open, setOpen] = useState(false);
  const [pageStart, setPageStart] = useState(
    Math.floor(value / YEARS_PER_PAGE) * YEARS_PER_PAGE,
  );

  const years = useMemo(() => {
    return Array.from({ length: YEARS_PER_PAGE }, (_, i) => pageStart + i).filter(
      (year) => year >= minYear && year <= maxYear,
    );
  }, [pageStart, minYear, maxYear]);

  const canGoPrev = pageStart > minYear;
  const canGoNext = pageStart + YEARS_PER_PAGE <= maxYear;

  const openPicker = () => {
    setPageStart(Math.floor(value / YEARS_PER_PAGE) * YEARS_PER_PAGE);
    setOpen(true);
  };

  return (
    <View style={style}>
      <Pressable
        style={[styles.trigger, compact && styles.triggerCompact]}
        onPress={openPicker}
      >
        <Text style={[styles.triggerText, compact && styles.triggerTextCompact]}>
          {value}년
        </Text>
        <Text style={[styles.triggerHint, compact && styles.triggerHintCompact]}>
          {compact ? '›' : '눌러서 선택'}
        </Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
          <View style={styles.card}>
            <View style={styles.header}>
              <Pressable
                disabled={!canGoPrev}
                onPress={() => setPageStart((s) => s - YEARS_PER_PAGE)}
                style={[styles.navButton, !canGoPrev && styles.navDisabled]}
              >
                <Text style={styles.navText}>‹</Text>
              </Pressable>
              <Text style={styles.headerTitle}>
                {pageStart}–{Math.min(pageStart + YEARS_PER_PAGE - 1, maxYear)}
              </Text>
              <Pressable
                disabled={!canGoNext}
                onPress={() => setPageStart((s) => s + YEARS_PER_PAGE)}
                style={[styles.navButton, !canGoNext && styles.navDisabled]}
              >
                <Text style={styles.navText}>›</Text>
              </Pressable>
            </View>

            <View style={styles.grid}>
              {years.map((year) => {
                const selected = year === value;
                return (
                  <Pressable
                    key={year}
                    style={[styles.yearCell, selected && styles.yearSelected]}
                    onPress={() => {
                      onChange(year);
                      setOpen(false);
                    }}
                  >
                    <Text style={[styles.yearText, selected && styles.yearTextSelected]}>
                      {year}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable style={styles.closeButton} onPress={() => setOpen(false)}>
              <Text style={styles.closeText}>닫기</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerCompact: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 0,
    borderRadius: 10,
    gap: 6,
  },
  triggerText: {
    fontSize: 16,
    fontFamily: fonts.sans,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  triggerTextCompact: {
    fontSize: 14,
  },
  triggerHint: {
    fontSize: 12,
    fontFamily: fonts.sans,
    color: colors.accent,
  },
  triggerHintCompact: {
    fontSize: 16,
    color: colors.textMuted,
    lineHeight: 18,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(44, 36, 22, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: colors.background,
    borderRadius: layout.cardRadius,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 15,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tagBackground,
  },
  navDisabled: {
    opacity: 0.35,
  },
  navText: {
    fontSize: 22,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    minHeight: 152,
  },
  yearCell: {
    width: '33.3333%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  yearSelected: {
    backgroundColor: colors.textPrimary,
  },
  yearText: {
    fontSize: 14,
    fontFamily: fonts.sans,
    color: colors.textPrimary,
  },
  yearTextSelected: {
    color: colors.surface,
    fontWeight: '500',
  },
  closeButton: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 10,
  },
  closeText: {
    fontSize: 14,
    fontFamily: fonts.sans,
    color: colors.textMuted,
  },
});
