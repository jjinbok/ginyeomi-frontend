import { apiClient, unwrapResponse, unwrapVoidResponse } from '@/api/client';
import type {
  ApiResponse,
  CreatePreferencePayload,
  ParentPreference,
  UpdatePreferencePayload,
} from '@/types';

export async function fetchPreferences(parentId: number): Promise<ParentPreference[]> {
  const response = await apiClient.get<ApiResponse<ParentPreference[]>>(
    `/parents/${parentId}/preferences`,
  );
  return unwrapResponse(response);
}

export async function createPreference(
  parentId: number,
  payload: CreatePreferencePayload,
): Promise<ParentPreference> {
  const response = await apiClient.post<ApiResponse<ParentPreference>>(
    `/parents/${parentId}/preferences`,
    payload,
  );
  return unwrapResponse(response);
}

export async function updatePreference(
  parentId: number,
  preferenceId: number,
  payload: UpdatePreferencePayload,
): Promise<ParentPreference> {
  const response = await apiClient.patch<ApiResponse<ParentPreference>>(
    `/parents/${parentId}/preferences/${preferenceId}`,
    payload,
  );
  return unwrapResponse(response);
}

export async function deletePreference(
  parentId: number,
  preferenceId: number,
): Promise<void> {
  const response = await apiClient.delete<ApiResponse<null>>(
    `/parents/${parentId}/preferences/${preferenceId}`,
  );
  unwrapVoidResponse(response);
}
