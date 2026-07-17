import type { PreferenceCategory } from '@/types';

export const PREFERENCE_CATEGORIES: {
  id: PreferenceCategory;
  label: string;
}[] = [
  { id: 'FOOD', label: '🍽️ 음식' },
  { id: 'HOBBY', label: '🎨 취미' },
  { id: 'LIKE', label: '💛 좋아하는 것' },
  { id: 'DISLIKE', label: '🙅 싫어하는 것' },
  { id: 'CARE', label: '🤲 해드리고 싶은 것' },
];

export function getPreferenceCategoryLabel(category: PreferenceCategory): string {
  return PREFERENCE_CATEGORIES.find((c) => c.id === category)?.label ?? category;
}
