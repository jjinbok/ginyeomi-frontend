import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PARENT_RELATIONS } from '@/constants/parents';
import { colors, fonts, layout } from '@/constants/theme';
import type { ParentRelation, StoryAnswer } from '@/types';

interface StoryAnswerCardProps {
  answer: StoryAnswer;
  relation: ParentRelation;
  onPress?: () => void;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

export function StoryAnswerCard({ answer, relation, onPress }: StoryAnswerCardProps) {
  const parentInfo = PARENT_RELATIONS[relation];

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && onPress && styles.pressed]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={styles.parentLabel}>
          <Text style={styles.parentEmoji}>{parentInfo.emoji}</Text>
          <Text style={styles.parentName}>{parentInfo.label}</Text>
        </View>
        <Text style={styles.date}>{formatDate(answer.answeredAt)}</Text>
      </View>
      <Text style={styles.question}>{answer.questionContent}</Text>
      <Text style={styles.answer} numberOfLines={4}>
        {answer.answerText}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 8,
  },
  pressed: {
    opacity: 0.88,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  parentLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  parentEmoji: {
    fontSize: 15,
  },
  parentName: {
    fontSize: 12,
    fontFamily: fonts.sans,
    color: colors.textMuted,
    fontWeight: '500',
  },
  date: {
    fontSize: 11,
    fontFamily: fonts.sans,
    color: colors.textHint,
  },
  question: {
    fontSize: 13,
    fontFamily: fonts.serif,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  answer: {
    fontSize: 14,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    lineHeight: 22,
  },
});
