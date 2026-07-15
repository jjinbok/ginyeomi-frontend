import type { Parent } from '@/types';
import { PARENT_RELATIONS } from '@/constants/parents';

export function getDaysUntilBirthday(birthDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [, month, day] = birthDate.split('-').map(Number);
  let next = new Date(today.getFullYear(), month - 1, day);
  if (next < today) {
    next = new Date(today.getFullYear() + 1, month - 1, day);
  }
  return Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatBirthDate(birthDate: string, lunarBirth: boolean): string {
  const [, month, day] = birthDate.split('-').map(Number);
  const calendar = lunarBirth ? '음력' : '양력';
  return `${month}월 ${day}일 (${calendar})`;
}

export function getParentDisplayEmoji(parent: Parent): string {
  return PARENT_RELATIONS[parent.relation].emoji;
}

export function getParentRelationLabel(parent: Parent): string {
  return PARENT_RELATIONS[parent.relation].label;
}
