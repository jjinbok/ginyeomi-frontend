import { StyleSheet, Text, View } from 'react-native';
import { PARENT_RELATIONS } from '@/constants/parents';
import { colors, fonts, layout } from '@/constants/theme';
import type { StoryAnswer } from '@/types';
import type { ParentRelation } from '@/types';

interface StoryAnswerCardProps {
  answer: StoryAnswer;
  relation: ParentRelation;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

export function StoryAnswerCard({ answer, relation }: StoryAnswerCardProps) {
  const parentInfo = PARENT_RELATIONS[relation];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.parentLabel}>
          <Text style={styles.parentEmoji}>{parentInfo.emoji}</Text>
          <Text style={styles.parentName}>{parentInfo.label}</Text>
        </View>
        <Text style={styles.date}>{formatDate(answer.answeredAt)}</Text>
      </View>
      <Text style={styles.question}>{answer.question}</Text>
      <Text style={styles.answer}>{answer.answerText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
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
    fontSize: 16,
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
    fontSize: 14,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    marginBottom: 8,
    lineHeight: 20,
  },
  answer: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
