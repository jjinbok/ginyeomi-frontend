import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchPastAnswers,
  fetchPastAnswersForParent,
  fetchWeeklyQuestions,
  submitStoryAnswer,
} from '@/api/stories';
import { MOCK_STORY_ANSWERS, MOCK_WEEKLY_QUESTIONS } from '@/api/mock';
import type { StoryAnswer, StoryQuestion } from '@/types';

const WEEKLY_CACHE_KEY = '@ginyeomi/stories/weekly';
const PAST_CACHE_KEY = '@ginyeomi/stories/past';

async function fetchWeeklyWithCache(): Promise<StoryQuestion[]> {
  try {
    const data = await fetchWeeklyQuestions();
    await AsyncStorage.setItem(WEEKLY_CACHE_KEY, JSON.stringify(data));
    return data;
  } catch (error) {
    if (__DEV__) {
      console.warn('[API] fetchWeeklyQuestions failed, using cache/mock:', error);
    }
    const cached = await AsyncStorage.getItem(WEEKLY_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached) as StoryQuestion[];
    }
    await AsyncStorage.setItem(WEEKLY_CACHE_KEY, JSON.stringify(MOCK_WEEKLY_QUESTIONS));
    return MOCK_WEEKLY_QUESTIONS;
  }
}

async function fetchPastWithCache(): Promise<StoryAnswer[]> {
  try {
    const data = await fetchPastAnswers();
    await AsyncStorage.setItem(PAST_CACHE_KEY, JSON.stringify(data));
    return data;
  } catch (error) {
    if (__DEV__) {
      console.warn('[API] fetchPastAnswers failed, using cache/mock:', error);
    }
    const cached = await AsyncStorage.getItem(PAST_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached) as StoryAnswer[];
    }
    await AsyncStorage.setItem(PAST_CACHE_KEY, JSON.stringify(MOCK_STORY_ANSWERS));
    return MOCK_STORY_ANSWERS;
  }
}

export function useWeeklyQuestions() {
  return useQuery({
    queryKey: ['stories', 'weekly'],
    queryFn: fetchWeeklyWithCache,
  });
}

export function usePastAnswers() {
  return useQuery({
    queryKey: ['stories', 'past'],
    queryFn: fetchPastWithCache,
  });
}

export function useParentStoryAnswers(parentId: number) {
  return useQuery({
    queryKey: ['stories', 'parent', parentId],
    queryFn: () => fetchPastAnswersForParent(parentId),
    enabled: parentId > 0,
  });
}

export function useSubmitStoryAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questionId, answerText }: { questionId: number; answerText: string }) =>
      submitStoryAnswer(questionId, answerText),
    onSuccess: async (updated) => {
      const weekly = queryClient.getQueryData<StoryQuestion[]>(['stories', 'weekly']) ?? [];
      const nextWeekly = weekly.map((q) => (q.id === updated.id ? updated : q));
      queryClient.setQueryData(['stories', 'weekly'], nextWeekly);
      await AsyncStorage.setItem(WEEKLY_CACHE_KEY, JSON.stringify(nextWeekly));
      queryClient.invalidateQueries({ queryKey: ['stories', 'past'] });
      queryClient.invalidateQueries({ queryKey: ['stories', 'parent', updated.parentId] });
    },
  });
}
