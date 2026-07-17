import type {
  Anniversary,
  Memory,
  MemoryWithAnniversary,
  Parent,
  ParentPreference,
  StoryAnswer,
  StoryQuestion,
} from '@/types';

const currentYear = new Date().getFullYear();

export const MOCK_PARENTS: Parent[] = [
  {
    id: 1,
    name: '김영수',
    relation: 'FATHER',
    birthDate: '1955-03-15',
    lunarBirth: false,
    profileImageUrl: null,
  },
  {
    id: 2,
    name: '박순자',
    relation: 'MOTHER',
    birthDate: '1960-11-03',
    lunarBirth: true,
    profileImageUrl: null,
  },
];

export const MOCK_ANNIVERSARIES: Anniversary[] = [
  {
    id: 1,
    name: '아버지 생신',
    emoji: '🎂',
    month: 3,
    day: 15,
    recurring: true,
    memoryCount: 4,
    daysUntilNext: 12,
    parentId: 1,
  },
  {
    id: 2,
    name: '결혼기념일',
    emoji: '💍',
    month: 5,
    day: 20,
    recurring: true,
    memoryCount: 6,
    daysUntilNext: 78,
    parentId: null,
  },
  {
    id: 3,
    name: '어머니 생신',
    emoji: '🌸',
    month: 11,
    day: 3,
    recurring: true,
    memoryCount: 3,
    daysUntilNext: 245,
    parentId: 2,
  },
  {
    id: 4,
    name: '첫 만남 기념일',
    emoji: '❤️',
    month: 9,
    day: 1,
    recurring: false,
    memoryCount: 2,
    daysUntilNext: 182,
    parentId: null,
  },
];

export const MOCK_MEMORIES: Memory[] = [
  {
    id: 101,
    anniversaryId: 1,
    year: currentYear,
    memo: '온 가족이 모여 아버지가 좋아하시는 한정식을 먹었어요. 케이크에 "사랑해요 아빠"라고 썼더니 눈시울이 붉어지셨어요.',
    tags: ['DINING_OUT', 'GIFT'],
    gift: '남성용 향수',
    photoUrls: [],
    createdAt: `${currentYear}-03-15T12:00:00Z`,
  },
  {
    id: 102,
    anniversaryId: 1,
    year: currentYear - 1,
    memo: '근처 호텔 뷔페에서 브런치를 즐겼어요. 아이들이 직접 만든 카드도 전달했답니다.',
    tags: ['DINING_OUT'],
    gift: '손목시계',
    photoUrls: [],
    createdAt: `${currentYear - 1}-03-15T12:00:00Z`,
  },
  {
    id: 103,
    anniversaryId: 1,
    year: currentYear - 2,
    memo: '코로나 이후 오랜만에 온 가족 외식. 아버지가 가장 좋아하시는 갈비집에 갔어요.',
    tags: ['DINING_OUT', 'HOME'],
    gift: '',
    photoUrls: [],
    createdAt: `${currentYear - 2}-03-15T12:00:00Z`,
  },
  {
    id: 201,
    anniversaryId: 2,
    year: currentYear - 1,
    memo: '제주도로 2박 3일 여행을 다녀왔어요. 바다를 보며 함께한 시간이 소중했습니다.',
    tags: ['TRAVEL'],
    gift: '커플 반지',
    photoUrls: [],
    createdAt: `${currentYear - 1}-05-20T12:00:00Z`,
  },
  {
    id: 301,
    anniversaryId: 3,
    year: currentYear - 1,
    memo: '어머니가 좋아하시는 카페에서 케이크와 꽃다발을 준비했어요.',
    tags: ['DINING_OUT', 'GIFT'],
    gift: '스카프',
    photoUrls: [],
    createdAt: `${currentYear - 1}-11-03T12:00:00Z`,
  },
];

export const MOCK_PREFERENCES: ParentPreference[] = [
  { id: 1, parentId: 1, category: 'FOOD', content: '갈비, 한정식' },
  { id: 2, parentId: 1, category: 'HOBBY', content: '등산, 바둑' },
  { id: 3, parentId: 1, category: 'DISLIKE', content: '너무 짠 음식' },
  { id: 4, parentId: 2, category: 'FOOD', content: '떡국, 전통차' },
  { id: 5, parentId: 2, category: 'HOBBY', content: '독서, 요리' },
  { id: 6, parentId: 2, category: 'LIKE', content: '편한 운동화' },
  { id: 7, parentId: 1, category: 'CARE', content: '주말 산책 함께하기' },
];

const weekStart = '2026-03-09';

export const MOCK_WEEKLY_QUESTIONS: StoryQuestion[] = [
  {
    id: 1,
    parentId: 1,
    question: '어릴 때 가장 기억에 남는 순간은 무엇인가요?',
    weekStart,
    answerText: null,
    answeredAt: null,
  },
  {
    id: 2,
    parentId: 2,
    question: '요즘 가장 행복하다고 느끼는 순간은 언제인가요?',
    weekStart,
    answerText: '손주가 안아줄 때가 가장 행복해요.',
    answeredAt: '2026-03-11T10:00:00Z',
  },
];

export const MOCK_STORY_ANSWERS: StoryAnswer[] = [
  {
    id: 101,
    parentId: 1,
    questionId: 10,
    question: '인생에서 가장 후회하지 않는 선택은 무엇인가요?',
    answerText: '가족과 함께한 시간을 우선순위에 두기로 한 것이에요.',
    answeredAt: '2026-03-02T09:00:00Z',
  },
  {
    id: 102,
    parentId: 2,
    questionId: 11,
    question: '어린 시절 꿈은 무엇이었나요?',
    answerText: '선생님이 되고 싶었어요. 아이들 가르치는 걸 좋아했거든요.',
    answeredAt: '2026-02-24T14:30:00Z',
  },
  {
    id: 103,
    parentId: 1,
    questionId: 12,
    question: '우리 가족에게 해주고 싶은 말이 있다면?',
    answerText: '늘 고맙다. 건강하게 지내길 바란다.',
    answeredAt: '2026-02-17T11:00:00Z',
  },
  {
    id: 104,
    parentId: 2,
    questionId: 13,
    question: '가장 좋아하는 계절과 그 이유는?',
    answerText: '가을이요. 단풍이 예쁘고 날씨도 선선해서 산책하기 좋아요.',
    answeredAt: '2026-02-10T16:00:00Z',
  },
];

export function getMockMemoriesForAnniversary(anniversaryId: number): Memory[] {
  return MOCK_MEMORIES.filter((m) => m.anniversaryId === anniversaryId);
}

export function getMockAnniversariesForParent(parentId: number): Anniversary[] {
  return MOCK_ANNIVERSARIES.filter((a) => a.parentId === parentId);
}

export function getMockMemoriesForParent(parentId: number): MemoryWithAnniversary[] {
  const anniversaries = getMockAnniversariesForParent(parentId);
  const anniversaryMap = new Map(anniversaries.map((a) => [a.id, a]));

  return MOCK_MEMORIES.filter((m) => m.anniversaryId && anniversaryMap.has(m.anniversaryId))
    .map((m) => {
      const anniversary = anniversaryMap.get(m.anniversaryId!)!;
      return {
        ...m,
        anniversaryName: anniversary.name,
        anniversaryEmoji: anniversary.emoji,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getMockStoryAnswersForParent(parentId: number): StoryAnswer[] {
  return MOCK_STORY_ANSWERS.filter((a) => a.parentId === parentId).sort(
    (a, b) => new Date(b.answeredAt).getTime() - new Date(a.answeredAt).getTime(),
  );
}

export function getMockPreferencesForParent(parentId: number): ParentPreference[] {
  return MOCK_PREFERENCES.filter((p) => p.parentId === parentId);
}
