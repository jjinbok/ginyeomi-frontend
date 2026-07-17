import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useAnniversaries } from '@/hooks/useAnniversaries';
import { fetchMemoriesWithCache, type MemoriesQueryResult } from '@/hooks/useMemories';
import type { Memory, MemoryWithAnniversary } from '@/types';
import { filterAnniversariesForParent } from '@/utils/anniversaryParents';

/** useMemories 캐시({ items })와 예전 배열 캐시 모두 허용 */
function getMemoryItems(data: unknown): Memory[] {
  if (Array.isArray(data)) return data as Memory[];
  if (
    data &&
    typeof data === 'object' &&
    Array.isArray((data as MemoriesQueryResult).items)
  ) {
    return (data as MemoriesQueryResult).items;
  }
  return [];
}

export function useParentTimeline(parentId: number) {
  const {
    data: anniversaries = [],
    isLoading: anniversariesLoading,
    isError: anniversariesError,
    error: anniversariesFetchError,
  } = useAnniversaries();

  const parentAnniversaries = useMemo(
    () => filterAnniversariesForParent(anniversaries, parentId),
    [anniversaries, parentId],
  );

  const memoryQueries = useQueries({
    queries: parentAnniversaries.map((anniversary) => ({
      queryKey: ['memories', anniversary.id] as const,
      queryFn: () => fetchMemoriesWithCache(anniversary.id),
      enabled: parentId > 0 && anniversary.id > 0,
    })),
  });

  const memories = useMemo(() => {
    const items: MemoryWithAnniversary[] = [];

    parentAnniversaries.forEach((anniversary, index) => {
      const query = memoryQueries[index];
      const list = getMemoryItems(query?.data);
      for (const memory of list) {
        items.push({
          ...memory,
          anniversaryId: memory.anniversaryId ?? anniversary.id,
          anniversaryName: anniversary.name,
          anniversaryEmoji: anniversary.emoji,
        });
      }
    });

    return items.sort((a, b) => {
      const aTime = Date.parse(String(a.createdAt ?? '')) || 0;
      const bTime = Date.parse(String(b.createdAt ?? '')) || 0;
      return bTime - aTime;
    });
  }, [parentAnniversaries, memoryQueries]);

  const isLoading =
    anniversariesLoading ||
    (parentAnniversaries.length > 0 && memoryQueries.some((query) => query.isLoading));

  const failedQuery = memoryQueries.find((query) => query.isError);
  const isError = anniversariesError || !!failedQuery;
  const error = anniversariesFetchError ?? failedQuery?.error ?? null;

  return {
    anniversaries: parentAnniversaries,
    memories,
    isLoading,
    isError,
    error,
  };
}
