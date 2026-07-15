import axios from 'axios';
import type { ApiResponse } from '@/types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function withMockFallback<T>(
  apiCall: () => Promise<T>,
  mockData: T,
  label?: string,
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    if (__DEV__ && label) {
      console.warn(`[API] ${label} failed, using mock data:`, error);
    }
    return mockData;
  }
}

export function unwrapResponse<T>(response: { data: ApiResponse<T> }): T {
  const body = response.data;
  if (!body.success) {
    throw new Error(body.message || 'API 요청에 실패했습니다.');
  }
  if (body.data === undefined || body.data === null) {
    throw new Error(body.message || 'API 응답 데이터가 없습니다.');
  }
  return body.data;
}

/** DELETE 등 data가 null인 성공 응답 */
export function unwrapVoidResponse(response: { data: ApiResponse<null> }): void {
  const body = response.data;
  if (!body.success) {
    throw new Error(body.message || 'API 요청에 실패했습니다.');
  }
}
