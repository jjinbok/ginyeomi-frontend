import { apiClient, unwrapResponse, unwrapVoidResponse } from '@/api/client';
import type {
  ApiResponse,
  CreateStoryAnswerPayload,
  StoryAnswer,
  StoryQuestion,
  UpdateStoryAnswerPayload,
} from '@/types';

export async function fetchCurrentStoryQuestion(): Promise<StoryQuestion> {
  const response = await apiClient.get<ApiResponse<StoryQuestion>>(
    '/story-questions/current',
  );
  return unwrapResponse(response);
}

export async function fetchStoryAnswers(parentId: number): Promise<StoryAnswer[]> {
  const response = await apiClient.get<ApiResponse<StoryAnswer[]>>(
    `/parents/${parentId}/story-answers`,
  );
  return unwrapResponse(response);
}

export async function createStoryAnswer(
  parentId: number,
  payload: CreateStoryAnswerPayload,
): Promise<StoryAnswer> {
  const response = await apiClient.post<ApiResponse<StoryAnswer>>(
    `/parents/${parentId}/story-answers`,
    payload,
  );
  return unwrapResponse(response);
}

export async function updateStoryAnswer(
  parentId: number,
  answerId: number,
  payload: UpdateStoryAnswerPayload,
): Promise<StoryAnswer> {
  const response = await apiClient.patch<ApiResponse<StoryAnswer>>(
    `/parents/${parentId}/story-answers/${answerId}`,
    payload,
  );
  return unwrapResponse(response);
}

export async function deleteStoryAnswer(
  parentId: number,
  answerId: number,
): Promise<void> {
  const response = await apiClient.delete<ApiResponse<null>>(
    `/parents/${parentId}/story-answers/${answerId}`,
  );
  unwrapVoidResponse(response);
}
