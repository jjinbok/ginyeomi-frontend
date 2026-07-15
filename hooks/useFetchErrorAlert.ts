import { useEffect, useRef } from 'react';
import { showApiErrorAlert } from '@/api/errors';

/** 조회 실패 시(캐시 없음) 한 번 알림 */
export function useFetchErrorAlert(isError: boolean, error: unknown) {
  const shown = useRef(false);

  useEffect(() => {
    if (!isError || !error || shown.current) return;
    shown.current = true;
    showApiErrorAlert('불러오기 실패', error, '데이터를 불러오지 못했습니다.');
  }, [isError, error]);
}
