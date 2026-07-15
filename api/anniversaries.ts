import { apiClient, unwrapResponse, unwrapVoidResponse } from '@/api/client';
import type {
  Anniversary,
  ApiResponse,
  CreateAnniversaryPayload,
  UpdateAnniversaryPayload,
} from '@/types';

export async function fetchAnniversaries(): Promise<Anniversary[]> {
  const response = await apiClient.get<ApiResponse<Anniversary[]>>('/anniversaries');
  return unwrapResponse(response);
}

export async function fetchAnniversary(anniversaryId: number): Promise<Anniversary> {
  const response = await apiClient.get<ApiResponse<Anniversary>>(
    `/anniversaries/${anniversaryId}`,
  );
  return unwrapResponse(response);
}

export async function createAnniversary(payload: CreateAnniversaryPayload): Promise<Anniversary> {
  const response = await apiClient.post<ApiResponse<Anniversary>>('/anniversaries', payload);
  return unwrapResponse(response);
}

export async function updateAnniversary(
  id: number,
  payload: UpdateAnniversaryPayload,
): Promise<Anniversary> {
  const response = await apiClient.patch<ApiResponse<Anniversary>>(
    `/anniversaries/${id}`,
    payload,
  );
  return unwrapResponse(response);
}

export async function deleteAnniversary(id: number): Promise<void> {
  const response = await apiClient.delete<ApiResponse<null>>(`/anniversaries/${id}`);
  unwrapVoidResponse(response);
}
