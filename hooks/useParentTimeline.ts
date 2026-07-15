import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { fetchMemories } from '@/api/memories';
import { useAnniversaries } from '@/hooks/useAnniversaries';
import type { MemoryWithAnniversary } from '@/types';
import { filterAnniversariesForParent } from '@/utils/anniversaryParents';

export function useParentTimeline(parentId: number) {
  const { data: anniversaries = [], isLoading: anniversariesLoading } = useAnniversaries();

  const parentAnniversaries = useMemo(
    () => filterAnniversariesForParent(anniversaries, parentId),
    [anniversaries, parentId],
  );

  const memoryQueries = useQueries({
    queries: parentAnniversaries.map((anniversary) => ({
      queryKey: ['memories', anniversary.id],
      queryFn: () => fetchMemories(anniversary.id),
      enabled: parentId > 0 && anniversary.id > 0,
    })),
  });

  const memories = useMemo(() => {
    const items: MemoryWithAnniversary[] = [];

    parentAnniversaries.forEach((anniversary, index) => {
      const query = memoryQueries[index];
      const list = query?.data ?? [];
      for (const memory of list) {
        items.push({
          ...memory,
          anniversaryName: anniversary.name,
          anniversaryEmoji: anniversary.emoji,
        });
      }
    });

    return items.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [parentAnniversaries, memoryQueries]);

  const isLoading =
    anniversariesLoading || memoryQueries.some((query) => query.isLoading);

  return {
    anniversaries: parentAnniversaries,
    memories,
    isLoading,
  };
}
