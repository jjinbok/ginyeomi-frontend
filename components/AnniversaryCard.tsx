import { Pressable, StyleSheet, Text, View } from 'react-native';
import { metrics, space } from '@/constants/layout';
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
  const emojiSize = metrics.anniversaryEmoji;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View
        style={[
          styles.emojiCircle,
          {
            width: emojiSize,
            height: emojiSize,
            borderRadius: emojiSize / 2,
          },
        ]}
      >
        <Text style={styles.emoji}>{anniversary.emoji}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {anniversary.name}
        </Text>
        <Text style={styles.date} numberOfLines={1}>
          {formatDate(anniversary.month, anniversary.day)}
          {!isRecurring ? ' · 올해만' : ' · 매년'}
        </Text>
      </View>
      <View style={[styles.badge, isUpcoming ? styles.badgeAccent : styles.badgeMuted]}>
        <Text
          style={[styles.badgeText, isUpcoming ? styles.badgeTextAccent : styles.badgeTextMuted]}
          numberOfLines={1}
        >
          {isUpcoming
            ? `${anniversary.daysUntilNext}일 전`
            : anniversary.memoryCount > 0
              ? `기록 ${anniversary.memoryCount}`
              : '기록 없음'}
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
    paddingVertical: 14,
    paddingHorizontal: space.cardPad - 2,
    marginBottom: 8,
  },
  pressed: {
    opacity: 0.88,
  },
  emojiCircle: {
    backgroundColor: colors.tagBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 22,
  },
  content: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  name: {
    fontSize: 15,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    marginBottom: 3,
    lineHeight: 21,
  },
  date: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: fonts.sans,
  },
  badge: {
    borderRadius: layout.chipRadius,
    paddingHorizontal: 9,
    paddingVertical: 5,
    flexShrink: 0,
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
