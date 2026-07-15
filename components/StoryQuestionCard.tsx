import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PARENT_RELATIONS } from '@/constants/parents';
import { colors, fonts, layout } from '@/constants/theme';
import type { StoryQuestion } from '@/types';
import type { ParentRelation } from '@/types';

interface StoryQuestionCardProps {
  question: StoryQuestion;
  relation: ParentRelation;
  onPress: () => void;
}

export function StoryQuestionCard({ question, relation, onPress }: StoryQuestionCardProps) {
  const answered = !!question.answerText;
  const parentInfo = PARENT_RELATIONS[relation];

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
      disabled={answered}
    >
      <View style={styles.header}>
        <View style={styles.parentLabel}>
          <Text style={styles.parentEmoji}>{parentInfo.emoji}</Text>
          <Text style={styles.parentName}>{parentInfo.label}</Text>
        </View>
        {answered ? (
          <View style={styles.answeredBadge}>
            <Text style={styles.answeredText}>✓ 답변 완료</Text>
          </View>
        ) : (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>답변하기</Text>
          </View>
        )}
      </View>
      <Text style={styles.question}>{question.question}</Text>
      {answered && question.answerText ? (
        <Text style={styles.answerPreview} numberOfLines={2}>
          {question.answerText}
        </Text>
      ) : null}
    </Pressable>
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
  pressed: {
    opacity: 0.85,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  parentLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  parentEmoji: {
    fontSize: 18,
  },
  parentName: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  answeredBadge: {
    backgroundColor: colors.tagBackground,
    borderRadius: layout.chipRadius,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  answeredText: {
    fontSize: 11,
    fontFamily: fonts.sans,
    color: colors.textMuted,
    fontWeight: '500',
  },
  pendingBadge: {
    backgroundColor: colors.accent,
    borderRadius: layout.chipRadius,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pendingText: {
    fontSize: 11,
    fontFamily: fonts.sans,
    color: colors.surface,
    fontWeight: '500',
  },
  question: {
    fontSize: 15,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  answerPreview: {
    marginTop: 10,
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.textMuted,
    lineHeight: 20,
  },
});
