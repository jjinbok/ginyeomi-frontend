import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PREFERENCE_CATEGORIES } from '@/constants/preferences';
import { space } from '@/constants/layout';
import { colors, fonts, layout, typography } from '@/constants/theme';
import type { ParentPreference } from '@/types';

interface PreferenceSectionProps {
  preferences: ParentPreference[];
  onAddPress?: () => void;
  onItemPress?: (preference: ParentPreference) => void;
}

export function PreferenceSection({
  preferences,
  onAddPress,
  onItemPress,
}: PreferenceSectionProps) {
  const grouped = PREFERENCE_CATEGORIES.map((category) => ({
    ...category,
    items: preferences.filter((p) => p.category === category.id),
  })).filter((group) => group.items.length > 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={typography.sectionTitle}>알아둔 것들</Text>
          <Text style={[typography.sectionSubcopy, styles.subcopy]}>
            작지만 소중한 것들을 기억해 두어요
          </Text>
        </View>
        {onAddPress ? (
          <Pressable onPress={onAddPress} hitSlop={8} style={styles.addButton}>
            <Text style={styles.addText}>+ 남기기</Text>
          </Pressable>
        ) : null}
      </View>

      {grouped.length === 0 ? (
        <Pressable
          style={({ pressed }) => [styles.emptyCard, pressed && onAddPress && styles.pressed]}
          onPress={onAddPress}
          disabled={!onAddPress}
        >
          <Text style={styles.emptyMark}>✦</Text>
          <Text style={styles.emptyTitle}>아직 남겨둔 기록이 없어요</Text>
          <Text style={styles.emptyBody}>
            좋아하시는 음식, 해드리고 싶은 일부터{'\n'}천천히 적어 보세요
          </Text>
        </Pressable>
      ) : (
        <View style={styles.list}>
          {grouped.map((group) => (
            <View key={group.id} style={styles.group}>
              <View style={styles.groupHeader}>
                <View style={styles.emojiBadge}>
                  <Text style={styles.emoji}>{group.emoji}</Text>
                </View>
                <Text style={styles.groupLabel}>{group.label}</Text>
              </View>

              <View style={styles.items}>
                {group.items.map((item) => (
                  <Pressable
                    key={item.id}
                    style={({ pressed }) => [
                      styles.itemRow,
                      pressed && onItemPress && styles.pressed,
                    ]}
                    onPress={onItemPress ? () => onItemPress(item) : undefined}
                    disabled={!onItemPress}
                  >
                    <Text style={styles.itemQuote}>“</Text>
                    <Text style={styles.itemText}>{item.content}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  headerText: {
    flex: 1,
    paddingRight: 12,
  },
  subcopy: {
    marginTop: 6,
  },
  addButton: {
    marginTop: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: layout.chipRadius,
    backgroundColor: colors.tagBackground,
  },
  addText: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.accent,
    fontWeight: '500',
  },
  list: {
    gap: 22,
  },
  group: {
    gap: 10,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emojiBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.tagBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 15,
  },
  groupLabel: {
    fontSize: 14,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
  },
  items: {
    gap: 8,
    paddingLeft: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 6,
  },
  itemQuote: {
    fontSize: 18,
    fontFamily: fonts.serif,
    color: colors.accent,
    lineHeight: 22,
    marginTop: -2,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.serif,
    fontWeight: '300',
    color: colors.textSecondary,
    lineHeight: 22,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    paddingVertical: 28,
    paddingHorizontal: space.cardPad,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.88,
  },
  emptyMark: {
    fontSize: 16,
    color: colors.textHint,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.textHint,
    lineHeight: 20,
    textAlign: 'center',
  },
});
