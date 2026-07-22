import { showApiErrorAlert } from '@/api/errors';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnniversaryCard } from '@/components/AnniversaryCard';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ParentAddModal } from '@/components/ParentAddModal';
import { PreferenceAddModal } from '@/components/PreferenceAddModal';
import { PreferenceSection } from '@/components/PreferenceSection';
import { StoryAnswerCard } from '@/components/StoryAnswerCard';
import { TimelineMemoryCard } from '@/components/TimelineMemoryCard';
import { colors, fonts, layout, typography } from '@/constants/theme';
import { getScreenContentStyle } from '@/components/ScreenBody';
import { metrics, space, typeScale, webContentFrame } from '@/constants/layout';
import { useFetchErrorAlert } from '@/hooks/useFetchErrorAlert';
import { useParentTimeline } from '@/hooks/useParentTimeline';
import { useDeleteParent, useParent } from '@/hooks/useParents';
import { usePreferences } from '@/hooks/usePreferences';
import { useParentStoryAnswers } from '@/hooks/useStories';
import type { Anniversary, Parent, ParentPreference, StoryAnswer } from '@/types';
import {
  formatBirthDate,
  getDaysUntilBirthday,
  getParentDisplayEmoji,
  getParentRelationLabel,
} from '@/utils/parent';

function SectionHeader({
  title,
  subcopy,
}: {
  title: string;
  subcopy?: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={typography.sectionTitle}>{title}</Text>
      {subcopy ? <Text style={[typography.sectionSubcopy, styles.sectionSubcopy]}>{subcopy}</Text> : null}
    </View>
  );
}

function EmptyBlock({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

export default function ParentDetailScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ id: string }>();
  const parentId = Number(params.id);

  const { data: parent, isLoading: parentLoading, isError: parentError, error: parentFetchError } = useParent(parentId);
  const { data: preferences = [], isError: preferencesError, error: preferencesFetchError } =
    usePreferences(parentId);
  const {
    data: storyAnswers = [],
    isLoading: storiesLoading,
    isError: storiesError,
    error: storiesFetchError,
  } = useParentStoryAnswers(parentId);
  const {
    anniversaries,
    memories,
    isLoading: timelineLoading,
    isError: timelineError,
    error: timelineFetchError,
  } = useParentTimeline(parentId);
  const deleteMutation = useDeleteParent();

  useFetchErrorAlert(parentError, parentFetchError);
  useFetchErrorAlert(preferencesError, preferencesFetchError);
  useFetchErrorAlert(timelineError, timelineFetchError);
  useFetchErrorAlert(storiesError, storiesFetchError);

  const [editVisible, setEditVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [preferenceModalVisible, setPreferenceModalVisible] = useState(false);
  const [editingPreference, setEditingPreference] = useState<ParentPreference | null>(null);

  const handleAnniversaryPress = useCallback(
    (anniversary: Anniversary) => {
      router.push({
        pathname: '/anniversary/[id]',
        params: {
          id: String(anniversary.id),
          name: anniversary.name,
          emoji: anniversary.emoji,
          month: String(anniversary.month),
          day: String(anniversary.day),
        },
      });
    },
    [router],
  );

  const handleMemoryPress = useCallback(
    (memoryId: number, anniversaryId: number) => {
      if (!anniversaryId) return;
      const anniversary = anniversaries.find((a) => a.id === anniversaryId);
      if (!anniversary) return;
      router.push({
        pathname: '/memory/[id]',
        params: {
          id: String(memoryId),
          anniversaryId: String(anniversaryId),
          anniversaryName: anniversary.name,
          emoji: anniversary.emoji,
        },
      });
    },
    [router, anniversaries],
  );

  const handleAddPreference = useCallback(() => {
    setEditingPreference(null);
    setPreferenceModalVisible(true);
  }, []);

  const handleEditPreference = useCallback((preference: ParentPreference) => {
    setEditingPreference(preference);
    setPreferenceModalVisible(true);
  }, []);

  const handleClosePreferenceModal = useCallback(() => {
    setPreferenceModalVisible(false);
    setEditingPreference(null);
  }, []);

  const handleStoryPress = useCallback(
    (answer: StoryAnswer) => {
      if (!parent) return;
      router.push({
        pathname: '/story/answer',
        params: {
          questionId: String(answer.questionId),
          parentId: String(parent.id),
          parentName: parent.name,
          relation: parent.relation,
          question: answer.questionContent,
          answerId: String(answer.id),
          answerText: answer.answerText,
        },
      });
    },
    [parent, router],
  );

  const handleDeleteConfirm = useCallback(async () => {
    try {
      await deleteMutation.mutateAsync(parentId);
      setDeleteVisible(false);
      const remaining = queryClient.getQueryData<Parent[]>(['parents']) ?? [];
      if (remaining.length === 0) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)/parents');
      }
    } catch (error) {
      setDeleteVisible(false);
      showApiErrorAlert('삭제 실패', error, '부모님 정보를 삭제하지 못했습니다. 다시 시도해주세요.');
    }
  }, [deleteMutation, parentId, queryClient, router]);

  if (parentLoading || !parent) {
    return (
      <SafeAreaView style={styles.centered}>
        {parentLoading ? (
          <ActivityIndicator size="large" color={colors.accent} />
        ) : (
          <Text style={styles.loadError}>부모님 정보를 불러오지 못했어요</Text>
        )}
      </SafeAreaView>
    );
  }

  const relationLabel = getParentRelationLabel(parent);
  const emoji = getParentDisplayEmoji(parent);
  const daysUntilBirthday = getDaysUntilBirthday(parent.birthDate);
  const isBirthdaySoon = daysUntilBirthday <= 30;
  const photo = metrics.parentDetailPhoto;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={[styles.navHeader, webContentFrame]}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.navSide}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.navTitle}>{relationLabel}</Text>
        <View style={[styles.navSide, styles.headerActions]}>
          <Pressable onPress={() => setEditVisible(true)} hitSlop={8}>
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
        contentContainerStyle={getScreenContentStyle({ paddingTop: 4 })}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          {parent.profileImageUrl ? (
            <Image
              source={{ uri: parent.profileImageUrl }}
              style={{
                width: photo,
                height: photo,
                borderRadius: photo / 2,
                marginBottom: 16,
              }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.profilePlaceholder,
                {
                  width: photo,
                  height: photo,
                  borderRadius: photo / 2,
                },
              ]}
            >
              <Text style={styles.profileEmoji}>{emoji}</Text>
            </View>
          )}

          <Text style={styles.relationChip}>{relationLabel}</Text>
          <Text style={styles.profileName}>{parent.name}</Text>
          <Text style={styles.profileMeta}>
            {formatBirthDate(parent.birthDate, parent.lunarBirth)}
          </Text>

          <View style={styles.birthdayBlock}>
            {daysUntilBirthday === 0 ? (
              <Text style={styles.birthdayToday}>오늘 생신이에요</Text>
            ) : (
              <>
                <Text style={[styles.birthdayDays, isBirthdaySoon && styles.birthdayDaysSoon]}>
                  {daysUntilBirthday}
                </Text>
                <Text style={styles.birthdayHint}>
                  {isBirthdaySoon ? '일 뒤면 생신이에요' : '일 뒤 생신'}
                </Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <PreferenceSection
            preferences={preferences}
            onAddPress={handleAddPreference}
            onItemPress={handleEditPreference}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="함께한 날들" subcopy="이분과 연결된 기념일이에요" />
          {anniversaries.length === 0 ? (
            <EmptyBlock title="연결된 기념일이 없어요" body="생신이나 특별한 날을 추가해 보세요" />
          ) : (
            anniversaries.map((anniversary, index) => (
              <AnniversaryCard
                key={anniversary.id}
                anniversary={anniversary}
                enterIndex={index}
                onPress={() => handleAnniversaryPress(anniversary)}
              />
            ))
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader title="기억의 결" subcopy="해마다 남긴 추억들이 이어져요" />
          {timelineLoading ? (
            <ActivityIndicator color={colors.accent} style={styles.inlineLoader} />
          ) : memories.length === 0 ? (
            <EmptyBlock title="아직 기록이 없어요" body="기념일에서 그해의 추억을 남겨 보세요" />
          ) : (
            memories.map((memory, index) => (
              <TimelineMemoryCard
                key={memory.id}
                memory={memory}
                enterIndex={index}
                onPress={() => handleMemoryPress(memory.id, memory.anniversaryId ?? 0)}
              />
            ))
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader title="나눈 이야기" subcopy="질문에 남긴 부모님의 말씀이에요" />
          {storiesLoading ? (
            <ActivityIndicator color={colors.accent} style={styles.inlineLoader} />
          ) : storyAnswers.length === 0 ? (
            <EmptyBlock title="아직 답변이 없어요" body="이야기 탭에서 이번 주 질문을 남겨 보세요" />
          ) : (
            storyAnswers.map((answer) => (
              <StoryAnswerCard
                key={answer.id}
                answer={answer}
                relation={parent.relation}
                onPress={() => handleStoryPress(answer)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <ParentAddModal
        visible={editVisible}
        relation={parent.relation}
        editingParent={parent}
        onClose={() => setEditVisible(false)}
      />
      <PreferenceAddModal
        visible={preferenceModalVisible}
        parentId={parentId}
        editingPreference={editingPreference}
        onClose={handleClosePreferenceModal}
      />
      <ConfirmDialog
        visible={deleteVisible}
        title="부모님 정보 삭제"
        message={`'${parent.name}' 님의 기록을 삭제할까요?`}
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
    paddingHorizontal: 24,
  },
  loadError: {
    fontSize: 15,
    fontFamily: fonts.sans,
    color: colors.textMuted,
    textAlign: 'center',
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
  backText: {
    fontSize: 22,
    color: colors.textPrimary,
    lineHeight: 28,
  },
  navTitle: {
    fontSize: 15,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
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
  profilePlaceholder: {
    backgroundColor: colors.tagBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  profileEmoji: {
    fontSize: metrics.parentDetailPhoto * 0.42,
  },
  relationChip: {
    fontSize: 12,
    fontFamily: fonts.sans,
    color: colors.accent,
    fontWeight: '500',
    marginBottom: 6,
  },
  profileName: {
    fontSize: typeScale.heroName,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    lineHeight: typeScale.heroNameLine,
    marginBottom: 6,
  },
  profileMeta: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.textMuted,
    marginBottom: 12,
  },
  birthdayBlock: {
    alignItems: 'center',
    marginTop: 4,
  },
  birthdayDays: {
    fontSize: 28,
    fontFamily: fonts.serif,
    color: colors.textSecondary,
    lineHeight: 34,
  },
  birthdayDaysSoon: {
    color: colors.accent,
  },
  birthdayHint: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.textMuted,
    marginTop: 4,
  },
  birthdayToday: {
    fontSize: 16,
    fontFamily: fonts.serif,
    color: colors.accent,
  },
  section: {
    marginBottom: space.section,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionSubcopy: {
    marginTop: 4,
  },
  inlineLoader: {
    marginTop: 12,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    paddingVertical: 20,
    paddingHorizontal: 16,
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
  },
});
