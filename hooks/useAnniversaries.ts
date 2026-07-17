import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAnniversary,
  deleteAnniversary,
  fetchAnniversaries,
  updateAnniversary,
} from '@/api/anniversaries';
import type { Anniversary, CreateAnniversaryPayload, Parent, UpdateAnniversaryPayload } from '@/types';
import {
  enrichAnniversariesWithParents,
  loadAnniversaryParentMap,
  removeAnniversaryParents,
  saveAnniversaryParents,
} from '@/utils/anniversaryParents';

const CACHE_KEY = '@ginyeomi/anniversaries/v2';
const PARENTS_CACHE_KEY = '@ginyeomi/parents/v2';

interface CachedQueryResult<T> {
  items: T;
  offline: boolean;
}

async function readParentsLocally(
  queryClient: ReturnType<typeof useQueryClient>,
): Promise<Parent[]> {
  const memory = queryClient.getQueryData<CachedQueryResult<Parent[]>>(['parents']);
  if (memory?.items?.length) return memory.items;

  const raw = await AsyncStorage.getItem(PARENTS_CACHE_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as Parent[];
}

export function useAnniversaries() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['anniversaries'],
    queryFn: async (): Promise<CachedQueryResult<Anniversary[]>> => {
      try {
        // parents는 enrich용 — 이미 있는 목록/스토리지만 쓰고 API는 치지 않음
        const [data, parents, parentMap] = await Promise.all([
          fetchAnniversaries(),
          readParentsLocally(queryClient),
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
    },
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
