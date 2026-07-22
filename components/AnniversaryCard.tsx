import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { softRiseStagger } from '@/constants/motion';
import { metrics, space } from '@/constants/layout';
import { colors, fonts, layout } from '@/constants/theme';
import type { Anniversary } from '@/types';

interface AnniversaryCardProps {
  anniversary: Anniversary;
  onPress: () => void;
  enterIndex?: number;
}

function formatDate(month: number, day: number): string {
  return `${month}월 ${day}일`;
}

export function AnniversaryCard({
  anniversary,
  onPress,
  enterIndex = 0,
}: AnniversaryCardProps) {
  const isRecurring = anniversary.recurring;
  const isUpcoming = isRecurring && anniversary.daysUntilNext <= 30;
  const emojiSize = metrics.anniversaryEmoji;

  let asideLabel: string;
  let asideHint: string | null = null;
  if (isUpcoming) {
    if (anniversary.daysUntilNext === 0) {
      asideLabel = '오늘';
      asideHint = null;
    } else {
      asideLabel = String(anniversary.daysUntilNext);
      asideHint = '일 전';
    }
  } else if (anniversary.memoryCount > 0) {
    asideLabel = String(anniversary.memoryCount);
    asideHint = '기록';
  } else {
    asideLabel = '·';
    asideHint = '기록 없음';
  }

  return (
    <Animated.View entering={softRiseStagger(enterIndex, 80)}>
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
        <View style={styles.aside}>
          <Text style={[styles.asideValue, isUpcoming && styles.asideValueAccent]}>
            {asideLabel}
          </Text>
          {asideHint ? (
            <Text style={[styles.asideHint, isUpcoming && styles.asideHintAccent]}>
              {asideHint}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
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
  aside: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 44,
    flexShrink: 0,
  },
  asideValue: {
    fontSize: 16,
    fontFamily: fonts.serif,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  asideValueAccent: {
    color: colors.accent,
    fontSize: 18,
    lineHeight: 24,
  },
  asideHint: {
    fontSize: 11,
    fontFamily: fonts.sans,
    color: colors.textHint,
    marginTop: 1,
  },
  asideHintAccent: {
    color: colors.textMuted,
  },
});
