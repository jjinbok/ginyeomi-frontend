export interface ApiResponse<T> {
  success: boolean;
  data?: T | null;
  message?: string | null;
  errorCode?: string | null;
}

export type MemoryTag = 'DINING_OUT' | 'GIFT' | 'TRAVEL' | 'HOME';

export type ParentRelation = 'FATHER' | 'MOTHER';

export type PreferenceCategory = 'FOOD' | 'HOBBY' | 'LIKE' | 'DISLIKE' | 'CARE';

export interface CreatePreferencePayload {
  category: PreferenceCategory;
  content: string;
}

export interface UpdatePreferencePayload {
  category: PreferenceCategory;
  content: string;
}

/** 서버 ParentResponse — birthDate는 ISO date (yyyy-MM-dd) */
export interface Parent {
  id: number;
  name: string;
  relation: ParentRelation;
  birthDate: string;
  lunarBirth: boolean;
  profileImageUrl?: string | null;
}

export interface CreateParentPayload {
  name: string;
  relation: ParentRelation;
  birthDate: string;
  lunarBirth: boolean;
  profileImageUrl?: string | null;
}

export interface UpdateParentPayload {
  profileImageUrl?: string | null;
}

export interface ParentPreference {
  id: number;
  parentId: number;
  category: PreferenceCategory;
  content: string;
}

export interface StoryQuestion {
  id: number;
  parentId: number;
  question: string;
  weekStart: string;
  answerText?: string | null;
  answeredAt?: string | null;
}

export interface StoryAnswer {
  id: number;
  parentId: number;
  questionId: number;
  question: string;
  answerText: string;
  answeredAt: string;
}

export interface Anniversary {
  id: number;
  name: string;
  emoji: string;
  month: number;
  day: number;
  recurring: boolean;
  memoryCount: number;
  daysUntilNext: number;
  /** 서버 생일 기념일 직접 연결 — API 미제공 시 클라이언트 추론 */
  parentId?: number | null;
  /** 커스텀 기념일 연결 부모 — 생성 시 클라이언트 저장 */
  parentIds?: number[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Memory {
  id: number;
  anniversaryId?: number;
  year: number;
  memo: string;
  gift: string | null;
  tags: MemoryTag[];
  createdAt: string;
  updatedAt?: string;
  /** 클라이언트 전용 — 사진 API 연동 전 UI용 */
  photoUrls?: string[];
}

export interface MemoryWithAnniversary extends Memory {
  anniversaryName: string;
  anniversaryEmoji: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  objectName: string;
}

export interface PhotoConfirmResponse {
  photoId: number;
  url: string;
}

export interface CreateAnniversaryPayload {
  parentIds: number[];
  name: string;
  emoji: string;
  month: number;
  day: number;
  recurring: boolean;
}

export interface UpdateAnniversaryPayload {
  name: string;
  emoji: string;
  month: number;
  day: number;
  recurring: boolean;
}

export interface CreateMemoryPayload {
  year: number;
  memo: string;
  gift?: string;
  tags: MemoryTag[];
}

export interface UpdateMemoryPayload {
  memo: string;
  gift?: string;
  tags: MemoryTag[];
}
