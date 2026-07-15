import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createParent,
  deleteParent,
  fetchParent,
  fetchParents,
  updateParent,
} from '@/api/parents';
import { fetchPreferences } from '@/api/preferences';
import type {
  CreateParentPayload,
  Parent,
  ParentPreference,
  UpdateParentPayload,
} from '@/types';

const PARENTS_CACHE_KEY = '@ginyeomi/parents/v2';

interface CachedQueryResult<T> {
  items: T;
  offline: boolean;
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
    const cached = await AsyncStorage.getItem(PARENTS_CACHE_KEY);
    if (cached) {
      return { items: JSON.parse(cached) as Parent[], offline: true };
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
    const { items } = await fetchParentsWithCache();
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

export function useParent(parentId: number) {
  return useQuery({
    queryKey: ['parents', parentId],
    queryFn: () => fetchParentWithCache(parentId),
    enabled: parentId > 0,
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
      await AsyncStorage.setItem(PARENTS_CACHE_KEY, JSON.stringify(nextItems));
      queryClient.invalidateQueries({ queryKey: ['anniversaries'] });
    },
  });
}

export function usePreferences(parentId: number) {
  return useQuery({
    queryKey: ['preferences', parentId],
    queryFn: () => fetchPreferences(parentId),
    enabled: parentId > 0,
  });
}

export function groupPreferencesByCategory(
  preferences: ParentPreference[],
): Map<ParentPreference['category'], ParentPreference[]> {
  const grouped = new Map<ParentPreference['category'], ParentPreference[]>();
  for (const pref of preferences) {
    const list = grouped.get(pref.category) ?? [];
    list.push(pref);
    grouped.set(pref.category, list);
  }
  return grouped;
}
