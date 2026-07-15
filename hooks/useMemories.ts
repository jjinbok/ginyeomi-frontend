import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createMemory, deleteMemory, fetchMemories, updateMemory } from '@/api/memories';
import type { CreateMemoryPayload, Memory, UpdateMemoryPayload } from '@/types';

function cacheKey(anniversaryId: number) {
  return `@ginyeomi/memories/${anniversaryId}`;
}

interface CachedQueryResult<T> {
  items: T;
  offline: boolean;
}

async function fetchMemoriesWithCache(anniversaryId: number): Promise<CachedQueryResult<Memory[]>> {
  try {
    const items = await fetchMemories(anniversaryId);
    await AsyncStorage.setItem(cacheKey(anniversaryId), JSON.stringify(items));
    return { items, offline: false };
  } catch (error) {
    if (__DEV__) {
      console.warn(`[API] fetchMemories(${anniversaryId}) failed, using cache:`, error);
    }
    const cached = await AsyncStorage.getItem(cacheKey(anniversaryId));
    if (cached) {
      return { items: JSON.parse(cached) as Memory[], offline: true };
    }
    throw error;
  }
}

export function useMemories(anniversaryId: number) {
  const query = useQuery({
    queryKey: ['memories', anniversaryId],
    queryFn: () => fetchMemoriesWithCache(anniversaryId),
    enabled: anniversaryId > 0,
  });

  return {
    ...query,
    data: query.data?.items ?? [],
    isOffline: query.data?.offline ?? false,
  };
}

export function useCreateMemory(anniversaryId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMemoryPayload) => createMemory(anniversaryId, payload),
    onSuccess: async (created) => {
      const previous = queryClient.getQueryData<CachedQueryResult<Memory[]>>(['memories', anniversaryId]);
      const list = previous?.items ?? [];
      const nextItems = [created, ...list.filter((item) => item.id !== created.id)];
      queryClient.setQueryData(['memories', anniversaryId], { items: nextItems, offline: false });
      await AsyncStorage.setItem(cacheKey(anniversaryId), JSON.stringify(nextItems));
      queryClient.invalidateQueries({ queryKey: ['anniversaries'] });
    },
  });
}

export function useUpdateMemory(anniversaryId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memoryId, payload }: { memoryId: number; payload: UpdateMemoryPayload }) =>
      updateMemory(anniversaryId, memoryId, payload),
    onSuccess: async (updated) => {
      const previous = queryClient.getQueryData<CachedQueryResult<Memory[]>>(['memories', anniversaryId]);
      const list = previous?.items ?? [];
      const nextItems = list.map((item) =>
        item.id === updated.id ? { ...item, ...updated } : item,
      );
      queryClient.setQueryData(['memories', anniversaryId], { items: nextItems, offline: false });
      await AsyncStorage.setItem(cacheKey(anniversaryId), JSON.stringify(nextItems));
    },
  });
}

export function useDeleteMemory(anniversaryId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memoryId: number) => deleteMemory(anniversaryId, memoryId),
    onSuccess: async (_data, memoryId) => {
      const previous = queryClient.getQueryData<CachedQueryResult<Memory[]>>(['memories', anniversaryId]);
      const list = previous?.items ?? [];
      const nextItems = list.filter((item) => item.id !== memoryId);
      queryClient.setQueryData(['memories', anniversaryId], { items: nextItems, offline: false });
      await AsyncStorage.setItem(cacheKey(anniversaryId), JSON.stringify(nextItems));
      queryClient.invalidateQueries({ queryKey: ['anniversaries'] });
    },
  });
}
