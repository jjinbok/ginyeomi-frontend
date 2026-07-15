import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { showApiErrorAlert } from '@/api/errors';
import { PARENT_RELATIONS } from '@/constants/parents';
import { colors, fonts, layout } from '@/constants/theme';
import { useSubmitStoryAnswer } from '@/hooks/useStories';
import type { ParentRelation } from '@/types';

const ANSWER_MAX_LENGTH = 1000;

export default function StoryAnswerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    questionId: string;
    parentId: string;
    parentName: string;
    relation: ParentRelation;
    question: string;
  }>();

  const questionId = Number(params.questionId);
  const [answer, setAnswer] = useState('');
  const submitMutation = useSubmitStoryAnswer();

  const relationInfo = PARENT_RELATIONS[params.relation ?? 'FATHER'];

  const handleSave = async () => {
    const trimmed = answer.trim();
    if (!trimmed) {
      Alert.alert('답변 필요', '부모님의 답변을 입력해주세요.');
      return;
    }

    try {
      await submitMutation.mutateAsync({ questionId, answerText: trimmed });
      router.back();
    } catch (error) {
      showApiErrorAlert('저장 실패', error, '답변을 저장하지 못했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} disabled={submitMutation.isPending} hitSlop={8}>
          <Text style={styles.cancelText}>취소</Text>
        </Pressable>
        <Text style={styles.headerTitle}>답변 남기기</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.body}>
          <View style={styles.contextChip}>
            <Text style={styles.contextEmoji}>{relationInfo.emoji}</Text>
            <Text style={styles.contextText}>
              {relationInfo.label} · {params.parentName}
            </Text>
          </View>

          <Text style={styles.question}>{params.question}</Text>

          <View style={styles.answerContainer}>
            <TextInput
              style={styles.answerInput}
              value={answer}
              onChangeText={setAnswer}
              placeholder="부모님의 답변을 적어주세요..."
              placeholderTextColor={colors.textHint}
              multiline
              maxLength={ANSWER_MAX_LENGTH}
              textAlignVertical="top"
              autoFocus
            />
            <Text style={styles.charCount}>
              {answer.length}/{ANSWER_MAX_LENGTH}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable
            style={[styles.saveButton, submitMutation.isPending && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.saveButtonText}>답변 저장하기</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: layout.borderWidth,
    borderBottomColor: colors.border,
  },
  cancelText: {
    fontSize: 15,
    color: colors.textMuted,
    fontFamily: fonts.sans,
    minWidth: 40,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
  },
  headerSpacer: {
    minWidth: 40,
  },
  body: {
    flex: 1,
    padding: 20,
  },
  contextChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: colors.chipBackground,
    borderRadius: layout.chipRadius,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 20,
  },
  contextEmoji: {
    fontSize: 18,
  },
  contextText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: fonts.sans,
  },
  question: {
    fontSize: 18,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    lineHeight: 26,
    marginBottom: 20,
  },
  answerContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    minHeight: 200,
  },
  answerInput: {
    flex: 1,
    padding: 16,
    fontSize: 15,
    fontFamily: fonts.serif,
    color: colors.textSecondary,
    lineHeight: 24,
    minHeight: 180,
  },
  charCount: {
    fontSize: 11,
    color: colors.textHint,
    textAlign: 'right',
    paddingRight: 12,
    paddingBottom: 10,
    fontFamily: fonts.sans,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: layout.borderWidth,
    borderTopColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.textPrimary,
    borderRadius: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontFamily: fonts.sans,
    fontWeight: '500',
  },
});
