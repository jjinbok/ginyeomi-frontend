import {
  MOCK_PREFERENCES,
  getMockPreferencesForParent,
} from '@/api/mock';
import type { ParentPreference } from '@/types';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

/** Preference 엔드포인트 연결 전 목업 */
export async function fetchPreferences(parentId: number): Promise<ParentPreference[]> {
  await delay();
  return getMockPreferencesForParent(parentId);
}

export async function createPreference(
  parentId: number,
  category: ParentPreference['category'],
  content: string,
): Promise<ParentPreference> {
  await delay();
  const created: ParentPreference = {
    id: Date.now(),
    parentId,
    category,
    content,
  };
  MOCK_PREFERENCES.push(created);
  return created;
}
