export const ACTIVITY_TAGS = [
  { id: 'DINING_OUT', label: '외식', emoji: '🍽' },
  { id: 'GIFT', label: '선물', emoji: '🎁' },
  { id: 'TRAVEL', label: '여행', emoji: '✈️' },
  { id: 'HOME', label: '집에서', emoji: '🏠' },
] as const;

export type ActivityTagId = (typeof ACTIVITY_TAGS)[number]['id'];

export const EMOJI_OPTIONS = ['🎂', '💍', '👨‍👩‍👧', '🎉', '❤️', '🌸', '🎁', '✨', '🏠', '🍰'];
