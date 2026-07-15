import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getPreferenceCategoryLabel, PREFERENCE_CATEGORIES } from '@/constants/preferences';
import { colors, fonts, layout, typography } from '@/constants/theme';
import { TagChip } from '@/components/TagChip';
import type { ParentPreference, PreferenceCategory } from '@/types';

interface PreferenceSectionProps {
  preferences: ParentPreference[];
  onAddPress?: () => void;
}

export function PreferenceSection({ preferences, onAddPress }: PreferenceSectionProps) {
  const grouped = PREFERENCE_CATEGORIES.map((category) => ({
    category: category.id,
    label: category.label,
    items: preferences.filter((p) => p.category === category.id),
  })).filter((group) => group.items.length > 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={typography.sectionLabel}>선호도</Text>
        {onAddPress && (
          <Pressable onPress={onAddPress} hitSlop={8} style={styles.addButton}>
            <Text style={styles.addText}>+ 추가</Text>
          </Pressable>
        )}
      </View>

      {grouped.length === 0 ? (
        <Text style={styles.empty}>아직 등록된 선호도가 없어요</Text>
      ) : (
        grouped.map((group) => (
          <View key={group.category} style={styles.group}>
            <Text style={styles.groupLabel}>
              {getPreferenceCategoryLabel(group.category as PreferenceCategory)}
            </Text>
            <View style={styles.chips}>
              {group.items.map((item) => (
                <TagChip key={item.id} label={item.content} />
              ))}
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  addText: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.accent,
    fontWeight: '500',
  },
  empty: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.textHint,
    paddingVertical: 8,
  },
  group: {
    marginBottom: 14,
  },
  groupLabel: {
    fontSize: 12,
    fontFamily: fonts.sans,
    color: colors.textMuted,
    marginBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
