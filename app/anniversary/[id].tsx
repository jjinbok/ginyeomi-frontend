import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { showApiErrorAlert } from '@/api/errors';
import { AnniversaryAddModal } from '@/components/AnniversaryAddModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyYearCard } from '@/components/EmptyYearCard';
import { ErrorBanner } from '@/components/ErrorBanner';
import { FAB } from '@/components/FAB';
import { MemoryCard } from '@/components/MemoryCard';
import { colors, fonts, layout } from '@/constants/theme';
import { useFetchErrorAlert } from '@/hooks/useFetchErrorAlert';
import { useAnniversaries, useDeleteAnniversary } from '@/hooks/useAnniversaries';
import { useMemories } from '@/hooks/useMemories';
import { buildYearTabs, formatAnniversaryDate } from '@/utils/anniversary';
import type { Anniversary } from '@/types';

export default function DetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    emoji: string;
    month: string;
    day: string;
  }>();

  const anniversaryId = Number(params.id);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const { data: anniversaries = [] } = useAnniversaries();
  const { data: memories = [], isLoading, isError, isOffline, error } = useMemories(anniversaryId);
  const deleteMutation = useDeleteAnniversary();

  useFetchErrorAlert(isError, error);

  const anniversary = anniversaries.find((a) => a.id === anniversaryId);

  const displayName = anniversary?.name ?? params.name ?? '';
  const displayEmoji = anniversary?.emoji ?? params.emoji ?? '';
  const displayMonth = anniversary?.month ?? Number(params.month);
  const displayDay = anniversary?.day ?? Number(params.day);

  const yearTabs = useMemo(() => buildYearTabs(memories), [memories]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  useEffect(() => {
    if (yearTabs.length === 0) {
      setSelectedYear(null);
      return;
    }
    setSelectedYear((prev) => (prev != null && yearTabs.includes(prev) ? prev : yearTabs[0]));
  }, [yearTabs]);

  const selectedMemory =
    selectedYear != null ? memories.find((m) => m.year === selectedYear) : undefined;

  const editingAnniversary = useMemo<Anniversary | null>(() => {
    if (anniversary) return anniversary;
    if (!anniversaryId) return null;
    return {
      id: anniversaryId,
      name: displayName,
      emoji: displayEmoji,
      month: displayMonth,
      day: displayDay,
      recurring: true,
      memoryCount: memories.length,
      daysUntilNext: 0,
    };
  }, [
    anniversary,
    anniversaryId,
    displayName,
    displayEmoji,
    displayMonth,
    displayDay,
    memories.length,
  ]);

  const navigateToCreate = useCallback(() => {
    router.push({
      pathname: '/memory/edit',
      params: {
        anniversaryId: String(anniversaryId),
        anniversaryName: displayName,
        emoji: displayEmoji,
      },
    });
  }, [router, anniversaryId, displayName, displayEmoji]);

  const navigateToMemory = useCallback(
    (memoryId: number) => {
      router.push({
        pathname: '/memory/[id]',
        params: {
          id: String(memoryId),
          anniversaryId: String(anniversaryId),
          anniversaryName: displayName,
          emoji: displayEmoji,
        },
      });
    },
    [router, anniversaryId, displayName, displayEmoji],
  );

  const handleEditSuccess = useCallback(
    (updated?: Anniversary) => {
      if (!updated) return;
      router.setParams({
        name: updated.name,
        emoji: updated.emoji,
        month: String(updated.month),
        day: String(updated.day),
      });
    },
    [router],
  );

  const handleDeleteConfirm = useCallback(async () => {
    try {
      await deleteMutation.mutateAsync(anniversaryId);
      setDeleteVisible(false);
      router.replace('/');
    } catch (error) {
      setDeleteVisible(false);
      showApiErrorAlert('삭제 실패', error, '기념일을 삭제하지 못했습니다. 다시 시도해주세요.');
    }
  }, [deleteMutation, anniversaryId, router]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable onPress={() => setSheetVisible(true)} hitSlop={8}>
              <Text style={styles.actionText}>수정</Text>
            </Pressable>
            <Pressable onPress={() => setDeleteVisible(true)} hitSlop={8} disabled={deleteMutation.isPending}>
              <Text style={styles.deleteText}>삭제</Text>
            </Pressable>
          </View>
        </View>
        <Text style={styles.emoji}>{displayEmoji}</Text>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.dateSubtitle}>
          {formatAnniversaryDate(
            displayMonth,
            displayDay,
            anniversary?.recurring ?? editingAnniversary?.recurring,
          )}
        </Text>
      </View>

      {isError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>
            추억을 불러오지 못했어요. 네트워크와 서버 상태를 확인해주세요.
          </Text>
        </View>
      )}
      {isOffline && !isError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>서버 연결에 실패했어요. 저장된 추억 데이터를 표시합니다.</Text>
        </View>
      )}

      {yearTabs.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.yearTabs}
          style={styles.yearTabsContainer}
        >
          {yearTabs.map((year) => {
            const isSelected = year === selectedYear;
            return (
              <Pressable
                key={year}
                style={[styles.yearTab, isSelected ? styles.yearTabSelected : styles.yearTabDefault]}
                onPress={() => setSelectedYear(year)}
              >
                <Text style={[styles.yearTabText, isSelected && styles.yearTabTextSelected]}>
                  {year}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        {selectedMemory ? (
          <Pressable onPress={() => navigateToMemory(selectedMemory.id)}>
            <MemoryCard memory={selectedMemory} />
          </Pressable>
        ) : (
          <EmptyYearCard onPress={navigateToCreate} />
        )}
      </ScrollView>

      <FAB onPress={navigateToCreate} />
      <AnniversaryAddModal
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        editingAnniversary={editingAnniversary}
        onSuccess={handleEditSuccess}
      />
      <ConfirmDialog
        visible={deleteVisible}
        title="기념일 삭제"
        message={`'${displayName}' 기념일과 연결된 모든 추억이 삭제됩니다.`}
        confirmLabel="삭제"
        destructive
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteVisible(false)}
        onConfirm={handleDeleteConfirm}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionText: {
    fontSize: 14,
    color: colors.accent,
    fontFamily: fonts.sans,
    fontWeight: '500',
  },
  deleteText: {
    fontSize: 14,
    color: colors.accent,
    fontFamily: fonts.sans,
    fontWeight: '500',
  },
  emoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  dateSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: fonts.sans,
  },
  errorBanner: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: fonts.sans,
  },
  yearTabsContainer: {
    maxHeight: 52,
    marginBottom: 8,
  },
  yearTabs: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  yearTab: {
    minWidth: 72,
    minHeight: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: layout.borderWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearTabSelected: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  yearTabDefault: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  yearTabText: {
    fontSize: 14,
    fontFamily: fonts.sans,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  yearTabTextSelected: {
    color: colors.surface,
    fontWeight: '500',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
});
