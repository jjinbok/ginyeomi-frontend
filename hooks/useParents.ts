import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createParent,
  deleteParent,
  fetchParent,
  fetchParents,
  updateParent,
} from '@/api/parents';
import type {
  CreateParentPayload,
  Parent,
  UpdateParentPayload,
} from '@/types';

const PARENTS_CACHE_KEY = '@ginyeomi/parents/v2';

interface CachedQueryResult<T> {
  items: T;
  offline: boolean;
}

async function readParentsFromStorage(): Promise<Parent[]> {
  const cached = await AsyncStorage.getItem(PARENTS_CACHE_KEY);
  if (!cached) return [];
  return JSON.parse(cached) as Parent[];
}

function getParentsFromListCache(
  queryClient: ReturnType<typeof useQueryClient>,
): Parent[] {
  const cached = queryClient.getQueryData<CachedQueryResult<Parent[]>>(['parents']);
  return cached?.items ?? [];
}

async function fetchParentsWithCache(): Promise<CachedQueryResult<Parent[]>> {
  try {
    const items = await fetchParents();
    await AsyncStorage.setItem(PARENTS_CACHE_KEY, JSON.stringify(items));
    return { items, offline: false };
  } catch (error) {
    if (__DEV__) {
      console.warn('[API] fetchParents failed, using cache/empty:', error);
    }
    const items = await readParentsFromStorage();
    if (items.length > 0) {
      return { items, offline: true };
    }
    throw error;
  }
}

async function fetchParentWithCache(parentId: number): Promise<Parent | null> {
  try {
    return await fetchParent(parentId);
  } catch (error) {
    if (__DEV__) {
      console.warn(`[API] fetchParent(${parentId}) failed, using list cache:`, error);
    }
    const items = await readParentsFromStorage();
    return items.find((p) => p.id === parentId) ?? null;
  }
}

export function useParents() {
  const query = useQuery({
    queryKey: ['parents'],
    queryFn: fetchParentsWithCache,
  });

  return {
    ...query,
    data: query.data?.items ?? [],
    isOffline: query.data?.offline ?? false,
  };
}

/** 목록 캐시에 있으면 단건 API를 치지 않음 */
export function useParent(parentId: number) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['parents', parentId],
    queryFn: async () => {
      const fromList = getParentsFromListCache(queryClient).find((p) => p.id === parentId);
      if (fromList) return fromList;
      return fetchParentWithCache(parentId);
    },
    enabled: parentId > 0,
    initialData: () =>
      getParentsFromListCache(queryClient).find((p) => p.id === parentId),
    initialDataUpdatedAt: () => queryClient.getQueryState(['parents'])?.dataUpdatedAt,
  });
}

export function useCreateParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateParentPayload) => createParent(payload),
    onSuccess: async (created) => {
      const previous = queryClient.getQueryData<CachedQueryResult<Parent[]>>(['parents']);
      const list = previous?.items ?? [];
      const nextItems = [created, ...list.filter((item) => item.id !== created.id)];
      queryClient.setQueryData(['parents'], { items: nextItems, offline: false });
      queryClient.setQueryData(['parents', created.id], created);
      await AsyncStorage.setItem(PARENTS_CACHE_KEY, JSON.stringify(nextItems));
      queryClient.invalidateQueries({ queryKey: ['anniversaries'] });
    },
  });
}

export function useUpdateParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      parentId,
      payload,
    }: {
      parentId: number;
      payload: UpdateParentPayload;
    }) => updateParent(parentId, payload),
    onSuccess: async (updated) => {
      const previous = queryClient.getQueryData<CachedQueryResult<Parent[]>>(['parents']);
      const list = previous?.items ?? [];
      const nextItems = list.map((item) =>
        item.id === updated.id ? { ...item, ...updated } : item,
      );
      queryClient.setQueryData(['parents'], { items: nextItems, offline: false });
      queryClient.setQueryData(['parents', updated.id], updated);
      await AsyncStorage.setItem(PARENTS_CACHE_KEY, JSON.stringify(nextItems));
    },
  });
}

export function useDeleteParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (parentId: number) => deleteParent(parentId),
    onSuccess: async (_data, parentId) => {
      const previous = queryClient.getQueryData<CachedQueryResult<Parent[]>>(['parents']);
      const list = previous?.items ?? [];
      const nextItems = list.filter((item) => item.id !== parentId);
      queryClient.setQueryData(['parents'], { items: nextItems, offline: false });
      queryClient.removeQueries({ queryKey: ['parents', parentId] });
      queryClient.removeQueries({ queryKey: ['preferences', parentId] });
      await AsyncStorage.setItem(PARENTS_CACHE_KEY, JSON.stringify(nextItems));
      queryClient.invalidateQueries({ queryKey: ['anniversaries'] });
    },
  });
}
