import type { PreferenceCategory } from '@/types';

export const PREFERENCE_CATEGORIES: {
  id: PreferenceCategory;
  emoji: string;
  label: string;
  hint: string;
}[] = [
  { id: 'FOOD', emoji: '🍽️', label: '맛있게 드시는 것', hint: '예: 따뜻한 갈비탕' },
  { id: 'HOBBY', emoji: '🎨', label: '즐기시는 일', hint: '예: 산책, 바둑' },
  { id: 'LIKE', emoji: '💛', label: '좋아하시는 것', hint: '예: 손주 사진' },
  { id: 'DISLIKE', emoji: '🙅', label: '불편해하시는 것', hint: '예: 너무 짠 음식' },
  { id: 'CARE', emoji: '🤲', label: '해드리고 싶은 일', hint: '예: 주말마다 전화 드리기' },
];

export function getPreferenceCategoryMeta(category: PreferenceCategory) {
  return (
    PREFERENCE_CATEGORIES.find((c) => c.id === category) ?? {
      id: category,
      emoji: '✦',
      label: category,
      hint: '',
    }
  );
}

export function getPreferenceCategoryLabel(category: PreferenceCategory): string {
  const meta = getPreferenceCategoryMeta(category);
  return `${meta.emoji} ${meta.label}`;
}

export function getPreferenceCategoryHint(category: PreferenceCategory): string {
  return PREFERENCE_CATEGORIES.find((c) => c.id === category)?.hint ?? '';
}
