import axios from 'axios';
import { ApiError, getApiErrorCode, getApiErrorMessage } from '@/api/errors';
import type { ApiResponse } from '@/types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** HTTP 에러를 ApiError로 통일 — errorCode 기반 안내 문구 유지 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const code = getApiErrorCode(error);
    const status = error.response?.status ?? null;
    const message = getApiErrorMessage(error);
    return Promise.reject(new ApiError(message, code, status));
  },
);

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
    throw new ApiError(
      body.message || 'API 요청에 실패했어요.',
      body.errorCode ?? null,
      null,
    );
  }
  if (body.data === undefined || body.data === null) {
    throw new ApiError(
      body.message || 'API 응답 데이터가 없어요.',
      body.errorCode ?? null,
      null,
    );
  }
  return body.data;
}

/** DELETE 등 data가 null인 성공 응답 */
export function unwrapVoidResponse(response: { data: ApiResponse<null | void> }): void {
  const body = response.data;
  if (!body.success) {
    throw new ApiError(
      body.message || 'API 요청에 실패했어요.',
      body.errorCode ?? null,
      null,
    );
  }
}
