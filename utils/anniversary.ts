import type { Anniversary, Memory } from '@/types';

/** 추억이 있는 연도만 탭으로 노출 (최신순) */
export function buildYearTabs(memories: Memory[]): number[] {
  const years = new Set(memories.map((m) => m.year));
  return Array.from(years).sort((a, b) => b - a);
}

export function formatAnniversaryDate(month: number, day: number, recurring?: boolean): string {
  if (recurring === false) {
    return `${month}월 ${day}일 · 일회성`;
  }
  return `매년 ${month}월 ${day}일`;
}

/** 매년 반복 기념일만 대상으로, 가장 가까운 다가오는 기념일을 고름 */
export function findNextAnniversary(
  anniversaries: Pick<Anniversary, 'daysUntilNext' | 'name' | 'emoji' | 'recurring'>[],
) {
  const recurringOnly = anniversaries.filter((item) => item.recurring);
  if (recurringOnly.length === 0) return null;
  return recurringOnly.reduce((closest, item) =>
    item.daysUntilNext < closest.daysUntilNext ? item : closest,
  );
}
