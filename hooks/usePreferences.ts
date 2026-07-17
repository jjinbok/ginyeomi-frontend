import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPreference,
  deletePreference,
  fetchPreferences,
  updatePreference,
} from '@/api/preferences';
import type {
  CreatePreferencePayload,
  ParentPreference,
  UpdatePreferencePayload,
} from '@/types';

export function usePreferences(parentId: number) {
  return useQuery({
    queryKey: ['preferences', parentId],
    queryFn: () => fetchPreferences(parentId),
    enabled: parentId > 0,
  });
}

export function useCreatePreference(parentId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePreferencePayload) => createPreference(parentId, payload),
    onSuccess: (created) => {
      const previous = queryClient.getQueryData<ParentPreference[]>(['preferences', parentId]) ?? [];
      const next = [created, ...previous.filter((item) => item.id !== created.id)];
      queryClient.setQueryData(['preferences', parentId], next);
    },
  });
}

export function useUpdatePreference(parentId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      preferenceId,
      payload,
    }: {
      preferenceId: number;
      payload: UpdatePreferencePayload;
    }) => updatePreference(parentId, preferenceId, payload),
    onSuccess: (updated) => {
      const previous = queryClient.getQueryData<ParentPreference[]>(['preferences', parentId]) ?? [];
      const next = previous.map((item) =>
        item.id === updated.id ? { ...item, ...updated } : item,
      );
      queryClient.setQueryData(['preferences', parentId], next);
    },
  });
}

export function useDeletePreference(parentId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferenceId: number) => deletePreference(parentId, preferenceId),
    onSuccess: (_data, preferenceId) => {
      const previous = queryClient.getQueryData<ParentPreference[]>(['preferences', parentId]) ?? [];
      queryClient.setQueryData(
        ['preferences', parentId],
        previous.filter((item) => item.id !== preferenceId),
      );
    },
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
