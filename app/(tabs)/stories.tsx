import { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StoryAnswerCard } from '@/components/StoryAnswerCard';
import { StoryQuestionCard } from '@/components/StoryQuestionCard';
import { colors, fonts, typography } from '@/constants/theme';
import { useParents } from '@/hooks/useParents';
import { usePastAnswers, useWeeklyQuestions } from '@/hooks/useStories';
import type { ParentRelation } from '@/types';

export default function StoriesTabScreen() {
  const router = useRouter();
  const { data: parents = [] } = useParents();
  const { data: weeklyQuestions = [], isLoading: weeklyLoading } = useWeeklyQuestions();
  const { data: pastAnswers = [], isLoading: pastLoading } = usePastAnswers();

  const parentRelationMap = useMemo(() => {
    return new Map(parents.map((p) => [p.id, p.relation]));
  }, [parents]);

  const handleAnswerPress = useCallback(
    (questionId: number, parentId: number) => {
      const parent = parents.find((p) => p.id === parentId);
      const question = weeklyQuestions.find((q) => q.id === questionId);
      if (!question || !parent) return;

      router.push({
        pathname: '/story/answer',
        params: {
          questionId: String(questionId),
          parentId: String(parentId),
          parentName: parent.name,
          relation: parent.relation,
          question: question.question,
        },
      });
    },
    [router, parents, weeklyQuestions],
  );

  if (weeklyLoading || pastLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>이야기</Text>
          <Text style={styles.subtitle}>부모님의 이야기를 들어보세요</Text>
        </View>

        <Text style={[typography.sectionLabel, styles.sectionLabel]}>이번 주 질문</Text>
        {weeklyQuestions.map((question) => {
          const relation = parentRelationMap.get(question.parentId);
          if (!relation) return null;

          const answered = !!question.answerText;
          return (
            <StoryQuestionCard
              key={question.id}
              question={question}
              relation={relation}
              onPress={() => {
                if (!answered) {
                  handleAnswerPress(question.id, question.parentId);
                }
              }}
            />
          );
        })}

        <Text style={[typography.sectionLabel, styles.sectionLabel, styles.pastLabel]}>
          지난 이야기
        </Text>
        {pastAnswers.length === 0 ? (
          <Text style={styles.empty}>아직 답변이 없어요</Text>
        ) : (
          pastAnswers.map((answer) => {
            const relation = parentRelationMap.get(answer.parentId);
            if (!relation) return null;
            return (
              <StoryAnswerCard key={answer.id} answer={answer} relation={relation} />
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: fonts.sans,
  },
  sectionLabel: {
    marginBottom: 12,
  },
  pastLabel: {
    marginTop: 12,
  },
  empty: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.textHint,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
