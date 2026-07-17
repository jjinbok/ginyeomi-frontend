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
import { useFetchErrorAlert } from '@/hooks/useFetchErrorAlert';
import { useParentTimeline } from '@/hooks/useParentTimeline';
import { useDeleteParent, useParent } from '@/hooks/useParents';
import { usePreferences } from '@/hooks/usePreferences';
import { useParentStoryAnswers } from '@/hooks/useStories';
import type { Anniversary, Parent, ParentPreference } from '@/types';
import {
  formatBirthDate,
  getDaysUntilBirthday,
  getParentDisplayEmoji,
  getParentRelationLabel,
} from '@/utils/parent';

export default function ParentDetailScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ id: string }>();
  const parentId = Number(params.id);

  const { data: parent, isLoading: parentLoading, isError: parentError, error: parentFetchError } = useParent(parentId);
  const { data: preferences = [], isError: preferencesError, error: preferencesFetchError } =
    usePreferences(parentId);
  const { data: storyAnswers = [] } = useParentStoryAnswers(parentId);
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
          <Text style={styles.empty}>부모님 정보를 불러오지 못했어요</Text>
        )}
      </SafeAreaView>
    );
  }

  const relationLabel = getParentRelationLabel(parent);
  const emoji = getParentDisplayEmoji(parent);
  const daysUntilBirthday = getDaysUntilBirthday(parent.birthDate);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.navHeader}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.navTitle}>{relationLabel}</Text>
        <View style={styles.headerActions}>
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

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          {parent.profileImageUrl ? (
            <Image
              source={{ uri: parent.profileImageUrl }}
              style={styles.profilePhoto}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Text style={styles.profileEmoji}>{emoji}</Text>
            </View>
          )}
          <Text style={styles.profileName}>{parent.name}</Text>
          <Text style={styles.profileBirth}>
            {formatBirthDate(parent.birthDate, parent.lunarBirth)}
          </Text>
          <View style={styles.birthdayBadge}>
            <Text style={styles.birthdayText}>
              생신까지 D-{daysUntilBirthday}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={typography.sectionLabel}>기본 정보</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>생일</Text>
              <Text style={styles.infoValue}>
                {formatBirthDate(parent.birthDate, parent.lunarBirth)}
              </Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>음력 여부</Text>
              <Text style={styles.infoValue}>{parent.lunarBirth ? '음력' : '양력'}</Text>
            </View>
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
          <Text style={[typography.sectionLabel, styles.sectionTitle]}>관련 기념일</Text>
          {anniversaries.length === 0 ? (
            <Text style={styles.empty}>연결된 기념일이 없어요</Text>
          ) : (
            anniversaries.map((anniversary) => (
              <AnniversaryCard
                key={anniversary.id}
                anniversary={anniversary}
                onPress={() => handleAnniversaryPress(anniversary)}
              />
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={[typography.sectionLabel, styles.sectionTitle]}>기억 타임라인</Text>
          {timelineLoading ? (
            <ActivityIndicator color={colors.accent} style={{ marginTop: 8 }} />
          ) : memories.length === 0 ? (
            <Text style={styles.empty}>아직 기록이 없어요</Text>
          ) : (
            memories.map((memory) => (
              <TimelineMemoryCard
                key={memory.id}
                memory={memory}
                onPress={() =>
                  handleMemoryPress(memory.id, memory.anniversaryId ?? 0)
                }
              />
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={[typography.sectionLabel, styles.sectionTitle]}>이야기</Text>
          {storyAnswers.length === 0 ? (
            <Text style={styles.empty}>아직 답변이 없어요</Text>
          ) : (
            storyAnswers.map((answer) => (
              <StoryAnswerCard
                key={answer.id}
                answer={answer}
                relation={parent.relation}
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
        message={`'${parent.name}' 정보를 삭제할까요?`}
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: layout.borderWidth,
    borderBottomColor: colors.border,
  },
  backText: {
    fontSize: 24,
    color: colors.textPrimary,
    minWidth: 40,
  },
  navTitle: {
    fontSize: 16,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    minWidth: 80,
    justifyContent: 'flex-end',
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 8,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  profilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.tagBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  profileEmoji: {
    fontSize: 52,
  },
  profileName: {
    fontSize: 24,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  profileBirth: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.textMuted,
    marginBottom: 12,
  },
  birthdayBadge: {
    backgroundColor: colors.tagBackground,
    borderRadius: layout.chipRadius,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  birthdayText: {
    fontSize: 12,
    fontFamily: fonts.sans,
    color: colors.accent,
    fontWeight: '500',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    padding: 16,
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: fonts.sans,
    color: colors.textPrimary,
  },
  infoDivider: {
    height: layout.borderWidth,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  empty: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.textHint,
    marginTop: 8,
  },
});
