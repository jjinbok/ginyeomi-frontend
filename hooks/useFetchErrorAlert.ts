import { useEffect, useRef } from 'react';
import { getApiErrorCode, showApiErrorAlert } from '@/api/errors';

/** 조회 실패 시 코드별 안내를 한 번만 알림 */
export function useFetchErrorAlert(isError: boolean, error: unknown) {
  const shownKey = useRef<string | null>(null);

  useEffect(() => {
    if (!isError || !error) {
      shownKey.current = null;
      return;
    }

    const key = getApiErrorCode(error) ?? String(error);
    if (shownKey.current === key) return;
    shownKey.current = key;

    showApiErrorAlert('불러오기 실패', error, '데이터를 불러오지 못했어요.');
  }, [isError, error]);
}
