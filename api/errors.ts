import { Alert, Platform } from 'react-native';
import axios from 'axios';
import type { ApiResponse } from '@/types';

const ERROR_MESSAGES: Record<string, string> = {
  C001: '입력값을 다시 확인해주세요.',
  C002: '요청한 정보를 찾을 수 없어요.',
  C005: '같은 부모님이 중복 선택됐어요.',
  C006: '유효하지 않은 날짜예요.',
  P001: '부모님 정보를 찾을 수 없어요.',
  P002: '부모님은 최대 2명까지 등록할 수 있어요.',
  P003: '연결된 기념일이 있어 삭제할 수 없어요.',
  AN001: '기념일을 찾을 수 없어요.',
  ME001: '추억을 찾을 수 없어요.',
  ME002: '해당 연도의 추억이 이미 있어요.',
  PR001: '선호도 정보를 찾을 수 없어요.',
};

export function getApiErrorCode(error: unknown): string | null {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiResponse<unknown> | undefined;
    return body?.errorCode ?? null;
  }
  return null;
}

export function getApiErrorMessage(error: unknown, fallback = '요청에 실패했습니다.'): string {
  const code = getApiErrorCode(error);
  if (code && ERROR_MESSAGES[code]) {
    return ERROR_MESSAGES[code];
  }

  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiResponse<unknown> | undefined;
    if (body?.message) return body.message;

    if (!error.response) {
      return '서버에 연결할 수 없어요. 네트워크와 서버 상태를 확인해주세요.';
    }
    if (error.message) return error.message;
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

/** RN Alert — web에서는 window.alert 폴백 */
export function showApiErrorAlert(
  title: string,
  error: unknown,
  fallback?: string,
): void {
  const message = getApiErrorMessage(error, fallback);
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
    return;
  }
  Alert.alert(title, message);
}
