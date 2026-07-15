import { apiClient, unwrapResponse, unwrapVoidResponse } from '@/api/client';
import type {
  ApiResponse,
  CreateParentPayload,
  Parent,
  UpdateParentPayload,
} from '@/types';

export async function fetchParents(): Promise<Parent[]> {
  const response = await apiClient.get<ApiResponse<Parent[]>>('/parents');
  return unwrapResponse(response);
}

export async function fetchParent(parentId: number): Promise<Parent> {
  const response = await apiClient.get<ApiResponse<Parent>>(`/parents/${parentId}`);
  return unwrapResponse(response);
}

export async function createParent(payload: CreateParentPayload): Promise<Parent> {
  const response = await apiClient.post<ApiResponse<Parent>>('/parents', payload);
  return unwrapResponse(response);
}

export async function updateParent(
  parentId: number,
  payload: UpdateParentPayload,
): Promise<Parent> {
  const response = await apiClient.patch<ApiResponse<Parent>>(
    `/parents/${parentId}`,
    payload,
  );
  return unwrapResponse(response);
}

export async function deleteParent(parentId: number): Promise<void> {
  const response = await apiClient.delete<ApiResponse<null>>(`/parents/${parentId}`);
  unwrapVoidResponse(response);
}
