import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createStoryAnswer,
  deleteStoryAnswer,
  fetchCurrentStoryQuestion,
  fetchStoryAnswers,
  updateStoryAnswer,
} from '@/api/stories';
import type { StoryAnswer, StoryQuestion } from '@/types';

const CURRENT_CACHE_KEY = '@ginyeomi/stories/current/v2';

function answersCacheKey(parentId: number) {
  return `@ginyeomi/stories/answers/${parentId}/v2`;
}

async function fetchCurrentWithCache(): Promise<StoryQuestion> {
  try {
    const data = await fetchCurrentStoryQuestion();
    await AsyncStorage.setItem(CURRENT_CACHE_KEY, JSON.stringify(data));
    return data;
  } catch (error) {
    if (__DEV__) {
      console.warn('[API] fetchCurrentStoryQuestion failed, using cache:', error);
    }
    const cached = await AsyncStorage.getItem(CURRENT_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached) as StoryQuestion;
    }
    throw error;
  }
}

async function fetchAnswersWithCache(parentId: number): Promise<StoryAnswer[]> {
  try {
    const data = await fetchStoryAnswers(parentId);
    await AsyncStorage.setItem(answersCacheKey(parentId), JSON.stringify(data));
    return data;
  } catch (error) {
    if (__DEV__) {
      console.warn(`[API] fetchStoryAnswers(${parentId}) failed, using cache:`, error);
    }
    const cached = await AsyncStorage.getItem(answersCacheKey(parentId));
    if (cached) {
      return JSON.parse(cached) as StoryAnswer[];
    }
    throw error;
  }
}

export function useCurrentStoryQuestion() {
  return useQuery({
    queryKey: ['stories', 'current'],
    queryFn: fetchCurrentWithCache,
  });
}

export function useParentStoryAnswers(parentId: number) {
  return useQuery({
    queryKey: ['stories', 'parent', parentId],
    queryFn: () => fetchAnswersWithCache(parentId),
    enabled: parentId > 0,
  });
}

export function useStoryAnswersForParents(parentIds: number[]) {
  const queries = useQueries({
    queries: parentIds.map((parentId) => ({
      queryKey: ['stories', 'parent', parentId] as const,
      queryFn: () => fetchAnswersWithCache(parentId),
      enabled: parentId > 0,
    })),
  });

  const answers = queries
    .flatMap((query) => query.data ?? [])
    .sort(
      (a, b) =>
        (Date.parse(b.answeredAt) || 0) - (Date.parse(a.answeredAt) || 0),
    );

  return {
    answers,
    isLoading: queries.some((query) => query.isLoading),
    isError: queries.some((query) => query.isError),
    error: queries.find((query) => query.isError)?.error ?? null,
  };
}

async function persistAnswers(parentId: number, answers: StoryAnswer[]) {
  await AsyncStorage.setItem(answersCacheKey(parentId), JSON.stringify(answers));
}

export function useCreateStoryAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      parentId,
      questionId,
      answerText,
    }: {
      parentId: number;
      questionId: number;
      answerText: string;
    }) => createStoryAnswer(parentId, { questionId, answerText }),
    onSuccess: async (created) => {
      const key = ['stories', 'parent', created.parentId] as const;
      const previous = queryClient.getQueryData<StoryAnswer[]>(key) ?? [];
      const next = [...previous.filter((item) => item.id !== created.id), created];
      queryClient.setQueryData(key, next);
      await persistAnswers(created.parentId, next);
    },
  });
}

export function useUpdateStoryAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      parentId,
      answerId,
      answerText,
    }: {
      parentId: number;
      answerId: number;
      answerText: string;
    }) => updateStoryAnswer(parentId, answerId, { answerText }),
    onSuccess: async (updated) => {
      const key = ['stories', 'parent', updated.parentId] as const;
      const previous = queryClient.getQueryData<StoryAnswer[]>(key) ?? [];
      const next = previous.map((item) =>
        item.id === updated.id ? updated : item,
      );
      queryClient.setQueryData(key, next);
      await persistAnswers(updated.parentId, next);
    },
  });
}

export function useDeleteStoryAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      parentId,
      answerId,
    }: {
      parentId: number;
      answerId: number;
    }) => deleteStoryAnswer(parentId, answerId),
    onSuccess: async (_data, { parentId, answerId }) => {
      const key = ['stories', 'parent', parentId] as const;
      const previous = queryClient.getQueryData<StoryAnswer[]>(key) ?? [];
      const next = previous.filter((item) => item.id !== answerId);
      queryClient.setQueryData(key, next);
      await persistAnswers(parentId, next);
    },
  });
}
