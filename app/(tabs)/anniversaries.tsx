import { AnniversaryAddModal } from '@/components/AnniversaryAddModal';
import { AnniversaryCard } from '@/components/AnniversaryCard';
import { ErrorBanner } from '@/components/ErrorBanner';
import { FAB } from '@/components/FAB';
import { colors, fonts, typography } from '@/constants/theme';
import { useFetchErrorAlert } from '@/hooks/useFetchErrorAlert';
import { useAnniversaries } from '@/hooks/useAnniversaries';
import type { Anniversary } from '@/types';
import { findNextAnniversary } from '@/utils/anniversary';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const [sheetVisible, setSheetVisible] = useState(false);
  const { data: anniversaries = [], isLoading, isError, isOffline, error, refetch, isRefetching } =
    useAnniversaries();

  useFetchErrorAlert(isError, error);

  const nextAnniversary = findNextAnniversary(anniversaries);

  const handleCardPress = useCallback(
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={anniversaries}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.accent}
          />
        }
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>기녀미</Text>
              <Text style={styles.subtitle}>부모님의 기념일을 챙기며 기억을 남기세요</Text>
            </View>

            {nextAnniversary && (
              <View style={styles.upcomingCard}>
                <Text style={typography.sectionLabel}>다가오는 기념일</Text>
                <Text style={styles.upcomingName}>
                  {nextAnniversary.emoji} {nextAnniversary.name}
                </Text>
                <Text style={styles.upcomingDday}>D-{nextAnniversary.daysUntilNext}</Text>
              </View>
            )}

            {(isError || isOffline) && (
              <ErrorBanner
                message={
                  isError
                    ? '서버에 연결하지 못했어요. 네트워크와 서버 상태를 확인해주세요.'
                    : '서버 연결에 실패했어요. 저장된 기념일 데이터를 표시합니다.'
                }
              />
            )}

            <Text style={[typography.sectionLabel, styles.listLabel]}>기념일 목록</Text>
          </>
        }
        renderItem={({ item }) => (
          <AnniversaryCard anniversary={item} onPress={() => handleCardPress(item)} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>아직 등록된 기념일이 없어요</Text>
            <Text style={styles.emptyHint}>+ 버튼을 눌러 첫 기념일을 추가해보세요</Text>
          </View>
        }
      />

      <FAB onPress={() => setSheetVisible(true)} />
      <AnniversaryAddModal
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onSuccess={() => {
          refetch();
        }}
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
  list: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: fonts.sans,
  },
  upcomingCard: {
    backgroundColor: colors.tagBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  upcomingName: {
    fontSize: 18,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  upcomingDday: {
    fontSize: 12,
    color: colors.accent,
    fontFamily: fonts.sans,
    fontWeight: '500',
  },
  listLabel: {
    marginBottom: 12,
  },
  errorBanner: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: fonts.sans,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textMuted,
    fontFamily: fonts.sans,
    marginBottom: 4,
  },
  emptyHint: {
    fontSize: 13,
    color: colors.textHint,
    fontFamily: fonts.sans,
  },
});
