import type { PreferenceCategory } from '@/types';

export const PREFERENCE_CATEGORIES: {
  id: PreferenceCategory;
  label: string;
}[] = [
  { id: 'FOOD', label: '음식' },
  { id: 'CLOTHING_SIZE', label: '옷 사이즈' },
  { id: 'HOBBY', label: '취미' },
  { id: 'DISLIKE', label: '싫어하는 것' },
  { id: 'WISHLIST', label: '갖고 싶은 것' },
];

export function getPreferenceCategoryLabel(category: PreferenceCategory): string {
  return PREFERENCE_CATEGORIES.find((c) => c.id === category)?.label ?? category;
}
