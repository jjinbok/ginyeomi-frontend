import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { showApiErrorAlert } from '@/api/errors';
import { AnniversaryAddModal } from '@/components/AnniversaryAddModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ErrorBanner } from '@/components/ErrorBanner';
import { FAB } from '@/components/FAB';
import { MemoryCard } from '@/components/MemoryCard';
import { getScreenContentStyle } from '@/components/ScreenBody';
import { softFade, softRiseStagger } from '@/constants/motion';
import { metrics, space, typeScale, webContentFrame } from '@/constants/layout';
import { colors, fonts, layout, typography } from '@/constants/theme';
import { useFetchErrorAlert } from '@/hooks/useFetchErrorAlert';
import { useAnniversaries, useDeleteAnniversary } from '@/hooks/useAnniversaries';
import { useMemories } from '@/hooks/useMemories';
import { formatAnniversaryDate } from '@/utils/anniversary';
import type { Anniversary } from '@/types';

function SectionHeader({ title, subcopy }: { title: string; subcopy?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={typography.sectionTitle}>{title}</Text>
      {subcopy ? <Text style={[typography.sectionSubcopy, styles.sectionSubcopy]}>{subcopy}</Text> : null}
    </View>
  );
}

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

  const sortedMemories = useMemo(
    () => [...memories].sort((a, b) => b.year - a.year),
    [memories],
  );

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

  const emojiSize = metrics.anniversaryEmoji;
  const memoryCountLabel =
    sortedMemories.length > 0 ? `해마다 남긴 하루 · ${sortedMemories.length}` : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.navHeader, webContentFrame]}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.navSide}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.navTitle}>기념일</Text>
        <View style={[styles.navSide, styles.headerActions]}>
          <Pressable onPress={() => setSheetVisible(true)} hitSlop={8}>
            <Text style={styles.actionText}>수정</Text>
          </Pressable>
          <Pressable
            onPress={() => setDeleteVisible(true)}
            hitSlop={8}
            disabled={deleteMutation.isPending}
          >
            <Text style={styles.deleteText}>삭제</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={getScreenContentStyle({ paddingTop: 4, paddingBottom: 120 })}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={softFade(40)} style={styles.hero}>
          <View style={[styles.emojiCircle, { width: emojiSize + 28, height: emojiSize + 28 }]}>
            <Text style={[styles.emoji, { fontSize: emojiSize }]}>{displayEmoji}</Text>
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.dateSubtitle}>
            {formatAnniversaryDate(
              displayMonth,
              displayDay,
              anniversary?.recurring ?? editingAnniversary?.recurring,
            )}
          </Text>
          {memoryCountLabel ? (
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>{memoryCountLabel}</Text>
            </View>
          ) : null}
        </Animated.View>

        {isError ? (
          <ErrorBanner message="추억을 불러오지 못했어요. 네트워크와 서버 상태를 확인해주세요." />
        ) : null}
        {isOffline && !isError ? (
          <ErrorBanner message="서버 연결에 실패했어요. 저장된 추억 데이터를 표시합니다." />
        ) : null}

        <View style={styles.section}>
          <SectionHeader title="해마다의 기억" subcopy="년도 순서대로 이어져 있어요" />

          {sortedMemories.length === 0 ? (
            <Pressable
              style={({ pressed }) => [styles.emptyCard, pressed && styles.pressed]}
              onPress={navigateToCreate}
            >
              <Text style={styles.emptyTitle}>첫 추억을 남겨 보세요</Text>
              <Text style={styles.emptyBody}>그날의 사진과 짧은 메모만 있어도 충분해요</Text>
              <Text style={styles.emptyAction}>+ 추억 남기기</Text>
            </Pressable>
          ) : (
            sortedMemories.map((memory, index) => {
              const isLast = index === sortedMemories.length - 1;
              return (
                <Animated.View
                  key={memory.id}
                  entering={softRiseStagger(index, 110)}
                  style={styles.timelineRow}
                >
                  <View style={styles.timelineRail}>
                    <Text style={styles.timelineYear}>{memory.year}</Text>
                    <View style={styles.timelineDot} />
                    {!isLast ? <View style={styles.timelineLine} /> : null}
                  </View>
                  <View style={styles.timelineContent}>
                    <MemoryCard
                      memory={memory}
                      showYear={false}
                      enterIndex={false}
                      onPress={() => navigateToMemory(memory.id)}
                    />
                  </View>
                </Animated.View>
              );
            })
          )}
        </View>
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
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: space.screenX,
    paddingVertical: 8,
  },
  navSide: {
    minWidth: 72,
  },
  navTitle: {
    fontSize: 15,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
  },
  backText: {
    fontSize: 22,
    color: colors.textPrimary,
    lineHeight: 28,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionText: {
    fontSize: 14,
    color: colors.accent,
    fontFamily: fonts.sans,
    fontWeight: '500',
  },
  deleteText: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: fonts.sans,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: space.section - 8,
    marginBottom: 4,
  },
  emojiCircle: {
    borderRadius: 999,
    backgroundColor: colors.tagBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emoji: {
    textAlign: 'center',
  },
  name: {
    fontSize: typeScale.heroName,
    lineHeight: typeScale.heroNameLine,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  dateSubtitle: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 12,
  },
  metaBadge: {
    backgroundColor: colors.tagBackground,
    borderRadius: layout.chipRadius,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  metaBadgeText: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.accent,
    fontWeight: '500',
  },
  section: {
    marginBottom: space.section,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionSubcopy: {
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    paddingVertical: 28,
    paddingHorizontal: 18,
  },
  pressed: {
    opacity: 0.88,
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.textHint,
    lineHeight: 19,
    marginBottom: 12,
  },
  emptyAction: {
    fontSize: 14,
    color: colors.accent,
    fontFamily: fonts.sans,
    fontWeight: '500',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  timelineRail: {
    width: 52,
    alignItems: 'center',
    paddingTop: 4,
  },
  timelineYear: {
    fontSize: 12,
    fontFamily: fonts.sans,
    color: colors.accent,
    fontWeight: '500',
    marginBottom: 6,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
  timelineLine: {
    flex: 1,
    width: 1.5,
    backgroundColor: colors.border,
    marginTop: 6,
    marginBottom: 2,
    minHeight: 24,
  },
  timelineContent: {
    flex: 1,
    minWidth: 0,
    paddingLeft: 10,
  },
});
