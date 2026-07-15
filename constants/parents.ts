import type { ParentRelation } from '@/types';

export const PARENT_RELATIONS: Record<
  ParentRelation,
  { label: string; formalLabel: string; emoji: string; addLabel: string }
> = {
  FATHER: { label: '아빠', formalLabel: '아버지', emoji: '👨', addLabel: '아버지 추가하기' },
  MOTHER: { label: '엄마', formalLabel: '어머니', emoji: '👩', addLabel: '어머니 추가하기' },
};
