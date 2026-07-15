import { apiClient, unwrapResponse, unwrapVoidResponse } from '@/api/client';
import type { ApiResponse, CreateMemoryPayload, Memory, UpdateMemoryPayload } from '@/types';

export async function fetchMemories(anniversaryId: number): Promise<Memory[]> {
  const response = await apiClient.get<ApiResponse<Memory[]>>(
    `/anniversaries/${anniversaryId}/memories`,
  );
  return unwrapResponse(response);
}

export async function fetchMemory(anniversaryId: number, memoryId: number): Promise<Memory> {
  const response = await apiClient.get<ApiResponse<Memory>>(
    `/anniversaries/${anniversaryId}/memories/${memoryId}`,
  );
  return unwrapResponse(response);
}

export async function createMemory(
  anniversaryId: number,
  payload: CreateMemoryPayload,
): Promise<Memory> {
  const response = await apiClient.post<ApiResponse<Memory>>(
    `/anniversaries/${anniversaryId}/memories`,
    payload,
  );
  return unwrapResponse(response);
}

export async function updateMemory(
  anniversaryId: number,
  memoryId: number,
  payload: UpdateMemoryPayload,
): Promise<Memory> {
  const response = await apiClient.patch<ApiResponse<Memory>>(
    `/anniversaries/${anniversaryId}/memories/${memoryId}`,
    payload,
  );
  return unwrapResponse(response);
}

export async function deleteMemory(anniversaryId: number, memoryId: number): Promise<void> {
  const response = await apiClient.delete<ApiResponse<null>>(
    `/anniversaries/${anniversaryId}/memories/${memoryId}`,
  );
  unwrapVoidResponse(response);
}
