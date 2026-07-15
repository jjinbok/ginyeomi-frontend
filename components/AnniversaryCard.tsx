import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, layout } from '@/constants/theme';
import type { Anniversary } from '@/types';

interface AnniversaryCardProps {
  anniversary: Anniversary;
  onPress: () => void;
}

function formatDate(month: number, day: number): string {
  return `${month}월 ${day}일`;
}

export function AnniversaryCard({ anniversary, onPress }: AnniversaryCardProps) {
  const isRecurring = anniversary.recurring;
  const isUpcoming = isRecurring && anniversary.daysUntilNext <= 30;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.emojiCircle}>
        <Text style={styles.emoji}>{anniversary.emoji}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{anniversary.name}</Text>
        <Text style={styles.date}>
          {formatDate(anniversary.month, anniversary.day)}
          {!isRecurring ? ' · 일회성' : ''}
        </Text>
      </View>
      <View style={[styles.badge, isUpcoming ? styles.badgeAccent : styles.badgeMuted]}>
        <Text style={[styles.badgeText, isUpcoming ? styles.badgeTextAccent : styles.badgeTextMuted]}>
          {isUpcoming
            ? `D-${anniversary.daysUntilNext}`
            : isRecurring
              ? `지난 기록 ${anniversary.memoryCount}개`
              : `일회성 · ${anniversary.memoryCount}개`}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.85,
  },
  emojiCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.tagBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  emoji: {
    fontSize: 22,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
    fontFamily: fonts.sans,
    marginBottom: 2,
  },
  date: {
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: fonts.sans,
  },
  badge: {
    borderRadius: layout.chipRadius,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeAccent: {
    backgroundColor: colors.accent,
  },
  badgeMuted: {
    backgroundColor: colors.tagBackground,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: fonts.sans,
    fontWeight: '500',
  },
  badgeTextAccent: {
    color: colors.surface,
  },
  badgeTextMuted: {
    color: colors.textMuted,
  },
});
