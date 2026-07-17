import axios from 'axios';
import type { ApiResponse } from '@/types';

export interface AppAlertPayload {
  id: number;
  title: string;
  message: string;
}

type AppAlertListener = (payload: AppAlertPayload | null) => void;

let alertSeq = 0;
const alertListeners = new Set<AppAlertListener>();

/** AppAlertHost가 구독 — 네이티브/웹 공통 커스텀 모달 */
export function subscribeAppAlert(listener: AppAlertListener): () => void {
  alertListeners.add(listener);
  return () => {
    alertListeners.delete(listener);
  };
}

function emitAppAlert(payload: AppAlertPayload | null): void {
  alertListeners.forEach((listener) => listener(payload));
}

/** 서버 ErrorCode.java 와 1:1 매핑 — 사용자용 짧은 안내 */
const ERROR_MESSAGES: Record<string, string> = {
  // Common
  C001: '입력값을 다시 확인해주세요.',
  C002: '요청한 정보를 찾을 수 없어요.',
  C003: '서버에 문제가 생겼어요. 잠시 후 다시 시도해주세요.',
  C004: '허용되지 않은 요청이에요.',
  C005: '같은 부모님이 중복 선택됐어요.',
  C006: '유효하지 않은 날짜예요.',

  // Auth (향후 연동)
  A001: '로그인이 필요해요.',
  A002: '로그인 정보가 만료됐어요. 다시 로그인해주세요.',
  A003: '이 기능에 접근할 권한이 없어요.',

  // Parent
  P001: '부모님 정보를 찾을 수 없어요.',
  P002: '부모님은 1~2명만 선택할 수 있어요.',
  P003: '연결된 기념일이 있어 삭제할 수 없어요.',

  // Anniversary
  AN001: '기념일을 찾을 수 없어요.',

  // Memory
  ME001: '추억을 찾을 수 없어요.',
  ME002: '이미 그해의 추억이 있어요. 목록에서 해당 해를 열어 수정해 주세요.',

  // Preference
  PR001: '남겨둔 기록을 찾을 수 없어요.',

  // Story
  S001: '이번 주 질문을 찾을 수 없어요.',
  S002: '답변을 찾을 수 없어요.',
  S003: '이미 답변한 질문이에요.',
};

const STATUS_FALLBACK: Record<number, string> = {
  400: ERROR_MESSAGES.C001,
  401: ERROR_MESSAGES.A001,
  403: ERROR_MESSAGES.A003,
  404: ERROR_MESSAGES.C002,
  405: ERROR_MESSAGES.C004,
  409: '이미 같은 내용이 있어서 추가할 수 없어요.',
  500: ERROR_MESSAGES.C003,
  502: ERROR_MESSAGES.C003,
  503: ERROR_MESSAGES.C003,
};

export class ApiError extends Error {
  readonly code: string | null;
  readonly status: number | null;

  constructor(message: string, code: string | null = null, status: number | null = null) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export function getApiErrorCode(error: unknown): string | null {
  if (error instanceof ApiError) {
    return error.code;
  }
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiResponse<unknown> | undefined;
    return body?.errorCode ?? null;
  }
  return null;
}

export function getApiErrorStatus(error: unknown): number | null {
  if (error instanceof ApiError) {
    return error.status;
  }
  if (axios.isAxiosError(error)) {
    return error.response?.status ?? null;
  }
  return null;
}

export function getApiErrorMessage(error: unknown, fallback = '요청에 실패했어요.'): string {
  const code = getApiErrorCode(error);
  if (code && ERROR_MESSAGES[code]) {
    return ERROR_MESSAGES[code];
  }

  if (error instanceof ApiError && error.message) {
    return error.message;
  }

  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiResponse<unknown> | undefined;
    if (body?.message) return body.message;

    const status = error.response?.status;
    if (status && STATUS_FALLBACK[status]) {
      return STATUS_FALLBACK[status];
    }

    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return '응답이 너무 늦어요. 잠시 후 다시 시도해주세요.';
      }
      return '서버에 연결할 수 없어요. 네트워크와 서버 상태를 확인해주세요.';
    }
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

/** 서버 fail 응답 / HTTP 에러를 ApiError로 통일 */
export function toApiError(error: unknown, fallback = '요청에 실패했어요.'): ApiError {
  if (error instanceof ApiError) return error;

  const code = getApiErrorCode(error);
  const status = getApiErrorStatus(error);
  const message = getApiErrorMessage(error, fallback);
  return new ApiError(message, code, status);
}

/** 앱/웹 공통 — ConfirmDialog와 같은 톤의 커스텀 모달 */
export function showAppAlert(title: string, message: string): void {
  alertSeq += 1;
  emitAppAlert({ id: alertSeq, title, message });
}

export function showApiErrorAlert(
  title: string,
  error: unknown,
  fallback?: string,
): void {
  showAppAlert(title, getApiErrorMessage(error, fallback));
}

export function showApiSuccessAlert(title: string, message: string): void {
  showAppAlert(title, message);
}
