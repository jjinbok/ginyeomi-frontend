import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { softRiseStagger } from '@/constants/motion';
import { colors, fonts, layout, typography } from '@/constants/theme';
import type { MemoryWithAnniversary } from '@/types';

interface TimelineMemoryCardProps {
  memory: MemoryWithAnniversary;
  onPress?: () => void;
  enterIndex?: number;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function TimelineMemoryCard({
  memory,
  onPress,
  enterIndex = 0,
}: TimelineMemoryCardProps) {
  return (
    <Animated.View entering={softRiseStagger(enterIndex, 100)}>
      <Pressable
        style={({ pressed }) => [styles.card, pressed && onPress && styles.pressed]}
        onPress={onPress}
        disabled={!onPress}
      >
        <View style={styles.header}>
          <Text style={styles.anniversary}>
            {memory.anniversaryEmoji} {memory.anniversaryName}
          </Text>
          <Text style={styles.year}>{memory.year}년</Text>
        </View>
        <Text style={styles.memo} numberOfLines={3}>
          {memory.memo}
        </Text>
        <Text style={styles.date}>{formatDate(memory.createdAt)}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  pressed: {
    opacity: 0.85,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  anniversary: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  year: {
    fontSize: 12,
    fontFamily: fonts.sans,
    color: colors.textHint,
  },
  memo: {
    ...typography.memo,
    lineHeight: 20,
    marginBottom: 6,
  },
  date: {
    fontSize: 11,
    fontFamily: fonts.sans,
    color: colors.textHint,
  },
});
