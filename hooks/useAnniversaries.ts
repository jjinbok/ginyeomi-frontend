import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAnniversary,
  deleteAnniversary,
  fetchAnniversaries,
  updateAnniversary,
} from '@/api/anniversaries';
import { fetchParents } from '@/api/parents';
import type { Anniversary, CreateAnniversaryPayload, UpdateAnniversaryPayload } from '@/types';
import {
  enrichAnniversariesWithParents,
  loadAnniversaryParentMap,
  removeAnniversaryParents,
  saveAnniversaryParents,
} from '@/utils/anniversaryParents';

const CACHE_KEY = '@ginyeomi/anniversaries/v2';

interface CachedQueryResult<T> {
  items: T;
  offline: boolean;
}

async function fetchWithCache(): Promise<CachedQueryResult<Anniversary[]>> {
  try {
    const [data, parents, parentMap] = await Promise.all([
      fetchAnniversaries(),
      fetchParents().catch(() => []),
      loadAnniversaryParentMap(),
    ]);
    const items = enrichAnniversariesWithParents(data, parents, parentMap);
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(items));
    return { items, offline: false };
  } catch (error) {
    if (__DEV__) {
      console.warn('[API] fetchAnniversaries failed, using cache:', error);
    }
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      return { items: JSON.parse(cached) as Anniversary[], offline: true };
    }
    throw error;
  }
}

export function useAnniversaries() {
  const query = useQuery({
    queryKey: ['anniversaries'],
    queryFn: fetchWithCache,
  });

  return {
    ...query,
    data: query.data?.items ?? [],
    isOffline: query.data?.offline ?? false,
  };
}

export function useCreateAnniversary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAnniversaryPayload) => createAnniversary(payload),
    onSuccess: async (created, payload) => {
      await saveAnniversaryParents(created.id, payload.parentIds);
      const enriched: Anniversary = { ...created, parentIds: payload.parentIds };
      const previous = queryClient.getQueryData<CachedQueryResult<Anniversary[]>>(['anniversaries']);
      const list = previous?.items ?? [];
      const nextItems = [enriched, ...list.filter((item) => item.id !== enriched.id)];
      queryClient.setQueryData(['anniversaries'], { items: nextItems, offline: false });
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(nextItems));
    },
  });
}

export function useUpdateAnniversary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateAnniversaryPayload }) =>
      updateAnniversary(id, payload),
    onSuccess: async (updated) => {
      const previous = queryClient.getQueryData<CachedQueryResult<Anniversary[]>>(['anniversaries']);
      const list = previous?.items ?? [];
      const nextItems = list.map((item) =>
        item.id === updated.id ? { ...item, ...updated } : item,
      );
      queryClient.setQueryData(['anniversaries'], { items: nextItems, offline: false });
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(nextItems));
    },
  });
}

export function useDeleteAnniversary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteAnniversary(id),
    onSuccess: async (_data, id) => {
      await removeAnniversaryParents(id);
      const previous = queryClient.getQueryData<CachedQueryResult<Anniversary[]>>(['anniversaries']);
      const list = previous?.items ?? [];
      const nextItems = list.filter((item) => item.id !== id);
      queryClient.setQueryData(['anniversaries'], { items: nextItems, offline: false });
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(nextItems));
      queryClient.removeQueries({ queryKey: ['memories', id] });
    },
  });
}
