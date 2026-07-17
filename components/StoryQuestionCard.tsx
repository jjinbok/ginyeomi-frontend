import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PARENT_RELATIONS } from '@/constants/parents';
import { colors, fonts, layout } from '@/constants/theme';
import type { ParentRelation, StoryAnswer } from '@/types';

interface StoryQuestionCardProps {
  relation: ParentRelation;
  parentName?: string;
  answer?: StoryAnswer;
  onPress: () => void;
}

export function StoryQuestionCard({
  relation,
  parentName,
  answer,
  onPress,
}: StoryQuestionCardProps) {
  const answered = !!answer;
  const parentInfo = PARENT_RELATIONS[relation];

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.parentLabel}>
          <Text style={styles.parentEmoji}>{parentInfo.emoji}</Text>
          <Text style={styles.parentName}>
            {parentName ? `${parentInfo.label} · ${parentName}` : parentInfo.label}
          </Text>
        </View>
        <View style={answered ? styles.answeredBadge : styles.pendingBadge}>
          <Text style={answered ? styles.answeredText : styles.pendingText}>
            {answered ? '남긴 말' : '들어보기'}
          </Text>
        </View>
      </View>

      {answer ? (
        <Text style={styles.answerPreview} numberOfLines={3}>
          {answer.answerText}
        </Text>
      ) : (
        <Text style={styles.prompt}>이번 주 이야기를 들려주세요</Text>
      )}
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
    gap: 8,
  },
  parentLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  parentEmoji: {
    fontSize: 16,
  },
  parentName: {
    fontSize: 12,
    fontFamily: fonts.sans,
    color: colors.textSecondary,
    fontWeight: '500',
    flexShrink: 1,
  },
  answeredBadge: {
    backgroundColor: colors.tagBackground,
    borderRadius: layout.chipRadius,
    paddingHorizontal: 9,
    paddingVertical: 4,
    flexShrink: 0,
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
    paddingHorizontal: 9,
    paddingVertical: 4,
    flexShrink: 0,
  },
  pendingText: {
    fontSize: 11,
    fontFamily: fonts.sans,
    color: colors.surface,
    fontWeight: '500',
  },
  answerPreview: {
    fontSize: 14,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  prompt: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.textHint,
    lineHeight: 20,
  },
});
