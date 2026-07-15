import {
  MOCK_STORY_ANSWERS,
  MOCK_WEEKLY_QUESTIONS,
} from '@/api/mock';
import type { StoryAnswer, StoryQuestion } from '@/types';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchWeeklyQuestions(): Promise<StoryQuestion[]> {
  await delay();
  return MOCK_WEEKLY_QUESTIONS;
}

export async function fetchPastAnswers(): Promise<StoryAnswer[]> {
  await delay();
  return [...MOCK_STORY_ANSWERS].sort(
    (a, b) => new Date(b.answeredAt).getTime() - new Date(a.answeredAt).getTime(),
  );
}

export async function submitStoryAnswer(
  questionId: number,
  answerText: string,
): Promise<StoryQuestion> {
  await delay();
  const question = MOCK_WEEKLY_QUESTIONS.find((q) => q.id === questionId);
  if (!question) {
    throw new Error('Question not found');
  }

  const answeredAt = new Date().toISOString();
  question.answerText = answerText.trim();
  question.answeredAt = answeredAt;

  MOCK_STORY_ANSWERS.unshift({
    id: Date.now(),
    parentId: question.parentId,
    questionId: question.id,
    question: question.question,
    answerText: question.answerText,
    answeredAt,
  });

  return { ...question };
}

export async function fetchPastAnswersForParent(parentId: number): Promise<StoryAnswer[]> {
  await delay();
  return MOCK_STORY_ANSWERS.filter((a) => a.parentId === parentId).sort(
    (a, b) => new Date(b.answeredAt).getTime() - new Date(a.answeredAt).getTime(),
  );
}
