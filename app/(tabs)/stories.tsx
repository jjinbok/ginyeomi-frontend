import { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getScreenContentStyle } from '@/components/ScreenBody';
import { StoryAnswerCard } from '@/components/StoryAnswerCard';
import { StoryQuestionCard } from '@/components/StoryQuestionCard';
import { space, typeScale } from '@/constants/layout';
import { colors, fonts, layout, typography } from '@/constants/theme';
import { useFetchErrorAlert } from '@/hooks/useFetchErrorAlert';
import { useParents } from '@/hooks/useParents';
import {
  useCurrentStoryQuestion,
  useStoryAnswersForParents,
} from '@/hooks/useStories';
import type { Parent, StoryAnswer } from '@/types';

export default function StoriesTabScreen() {
  const router = useRouter();
  const { data: parents = [], isLoading: parentsLoading } = useParents();
  const {
    data: currentQuestion,
    isLoading: questionLoading,
    isError: questionError,
    error: questionFetchError,
  } = useCurrentStoryQuestion();
  const parentIds = useMemo(() => parents.map((parent) => parent.id), [parents]);
  const {
    answers,
    isLoading: answersLoading,
    isError: answersError,
    error: answersFetchError,
  } = useStoryAnswersForParents(parentIds);

  useFetchErrorAlert(questionError, questionFetchError);
  useFetchErrorAlert(answersError, answersFetchError);

  const parentRelationMap = useMemo(() => {
    return new Map(parents.map((p) => [p.id, p.relation]));
  }, [parents]);

  const pastAnswers = useMemo(
    () => answers.filter((answer) => answer.questionId !== currentQuestion?.id),
    [answers, currentQuestion?.id],
  );

  const answeredCount = useMemo(() => {
    if (!currentQuestion) return 0;
    return parents.filter((parent) =>
      answers.some(
        (item) => item.parentId === parent.id && item.questionId === currentQuestion.id,
      ),
    ).length;
  }, [answers, currentQuestion, parents]);

  const openAnswer = useCallback(
    (parent: Parent, answer?: StoryAnswer) => {
      const questionId = answer?.questionId ?? currentQuestion?.id;
      const question = answer?.questionContent ?? currentQuestion?.content;
      if (!questionId || !question) return;
      router.push({
        pathname: '/story/answer',
        params: {
          questionId: String(questionId),
          parentId: String(parent.id),
          parentName: parent.name,
          relation: parent.relation,
          question,
          ...(answer
            ? {
                answerId: String(answer.id),
                answerText: answer.answerText,
              }
            : {}),
        },
      });
    },
    [router, currentQuestion],
  );

  if (parentsLoading || questionLoading || answersLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={getScreenContentStyle()}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>이야기</Text>
          <Text style={styles.subtitle}>
            {Platform.OS === 'web'
              ? '한 주마다 질문을 건네고, 부모님의 말씀을 책장처럼 남겨요'
              : '한 주마다 질문을 건네고\n부모님의 말씀을 책장처럼 남겨요'}
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={typography.sectionTitle}>이번 주 질문</Text>
          <Text style={[typography.sectionSubcopy, styles.sectionSubcopy]}>
            {currentQuestion
              ? parents.length > 0
                ? `${answeredCount}/${parents.length}분의 이야기를 들었어요`
                : '부모님을 먼저 등록해 주세요'
              : '아직 준비된 질문이 없어요'}
          </Text>
        </View>

        {currentQuestion ? (
          <View style={styles.questionHero}>
            <Text style={styles.weekLabel}>{currentQuestion.weekOrder}주차</Text>
            <Text style={styles.questionText}>{currentQuestion.content}</Text>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>이번 주 질문이 아직 없어요</Text>
            <Text style={styles.emptyBody}>곧 새로운 질문이 도착할 거예요</Text>
          </View>
        )}

        {currentQuestion && parents.length > 0 ? (
          <View style={styles.parentCards}>
            {parents.map((parent) => {
              const answer = answers.find(
                (item) =>
                  item.parentId === parent.id &&
                  item.questionId === currentQuestion.id,
              );
              return (
                <StoryQuestionCard
                  key={parent.id}
                  relation={parent.relation}
                  parentName={parent.name}
                  answer={answer}
                  onPress={() => openAnswer(parent, answer)}
                />
              );
            })}
          </View>
        ) : null}

        <View style={[styles.sectionHeader, styles.pastHeader]}>
          <Text style={typography.sectionTitle}>지난 이야기</Text>
          <Text style={[typography.sectionSubcopy, styles.sectionSubcopy]}>
            예전에 남긴 말씀들이 여기 있어요
          </Text>
        </View>

        {pastAnswers.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>아직 지난 이야기가 없어요</Text>
            <Text style={styles.emptyBody}>이번 주 질문부터 천천히 남겨 보세요</Text>
          </View>
        ) : (
          pastAnswers.map((answer) => {
            const relation = parentRelationMap.get(answer.parentId);
            const parent = parents.find((item) => item.id === answer.parentId);
            if (!relation || !parent) return null;
            return (
              <StoryAnswerCard
                key={answer.id}
                answer={answer}
                relation={relation}
                onPress={() => openAnswer(parent, answer)}
              />
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginBottom: space.headerBottom,
  },
  title: {
    fontSize: typeScale.pageTitle,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    lineHeight: typeScale.pageTitleLine,
    marginBottom: Platform.OS === 'web' ? 10 : 6,
  },
  subtitle: {
    fontSize: typeScale.pageSub,
    color: colors.textMuted,
    fontFamily: fonts.sans,
    lineHeight: typeScale.pageSubLine,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  pastHeader: {
    marginTop: space.section - 8,
  },
  sectionSubcopy: {
    marginTop: 4,
  },
  questionHero: {
    backgroundColor: colors.tagBackground,
    borderRadius: layout.cardRadius,
    padding: space.cardPad + 2,
    marginBottom: 12,
  },
  weekLabel: {
    fontSize: 12,
    fontFamily: fonts.sans,
    color: colors.accent,
    fontWeight: '500',
    marginBottom: 8,
  },
  questionText: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    lineHeight: Platform.OS === 'web' ? 28 : 24,
  },
  parentCards: {
    marginBottom: 4,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.textHint,
    lineHeight: 19,
  },
});
