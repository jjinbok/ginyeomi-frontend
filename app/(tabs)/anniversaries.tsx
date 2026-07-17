import { AnniversaryAddModal } from '@/components/AnniversaryAddModal';
import { AnniversaryCard } from '@/components/AnniversaryCard';
import { ErrorBanner } from '@/components/ErrorBanner';
import { FAB } from '@/components/FAB';
import { getScreenContentStyle } from '@/components/ScreenBody';
import { space, typeScale } from '@/constants/layout';
import { colors, fonts, layout, typography } from '@/constants/theme';
import { useFetchErrorAlert } from '@/hooks/useFetchErrorAlert';
import { useAnniversaries } from '@/hooks/useAnniversaries';
import type { Anniversary } from '@/types';
import { findNextAnniversary } from '@/utils/anniversary';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function UpcomingCard({
  anniversary,
  onPress,
}: {
  anniversary: Anniversary;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.upcomingCard, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Text style={styles.upcomingLabel}>곧 다가오는 날</Text>
      <Text style={styles.upcomingName} numberOfLines={2}>
        {anniversary.emoji} {anniversary.name}
      </Text>
      <Text style={styles.upcomingMeta}>
        {anniversary.month}월 {anniversary.day}일
      </Text>
      <View style={styles.upcomingBadge}>
        <Text style={styles.upcomingDday}>
          {anniversary.daysUntilNext === 0
            ? '오늘이에요'
            : `${anniversary.daysUntilNext}일 남았어요`}
        </Text>
      </View>
    </Pressable>
  );
}

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
        contentContainerStyle={getScreenContentStyle({ paddingBottom: 100 })}
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
              <Text style={styles.title}>기념일</Text>
              <Text style={styles.subtitle}>
                {Platform.OS === 'web'
                  ? '특별한 날을 챙기고, 그해의 기억을 차곡차곡 남겨요'
                  : '특별한 날을 챙기고\n그해의 기억을 차곡차곡 남겨요'}
              </Text>
            </View>

            {nextAnniversary ? (
              <UpcomingCard
                anniversary={nextAnniversary}
                onPress={() => handleCardPress(nextAnniversary)}
              />
            ) : null}

            {(isError || isOffline) && (
              <ErrorBanner
                message={
                  isError
                    ? '잠시 연결이 불안정해요. 네트워크를 확인해 주세요.'
                    : '연결이 불안정해 저장된 기념일을 보여드려요.'
                }
              />
            )}

            <View style={styles.sectionHeader}>
              <Text style={typography.sectionTitle}>모든 기념일</Text>
              <Text style={[typography.sectionSubcopy, styles.sectionSubcopy]}>
                {anniversaries.length > 0
                  ? `${anniversaries.length}개의 날을 기억하고 있어요`
                  : '아직 남겨둔 날이 없어요'}
              </Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <AnniversaryCard anniversary={item} onPress={() => handleCardPress(item)} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={styles.emptyTitle}>첫 기념일을 남겨보세요</Text>
            <Text style={styles.emptyBody}>
              오른쪽 아래 + 버튼으로{'\n'}생신이나 특별한 날을 추가할 수 있어요
            </Text>
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
  header: {
    marginBottom: space.headerBottom,
  },
  title: {
    fontSize: typeScale.pageTitle,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    lineHeight: typeScale.pageTitleLine,
    marginBottom: Platform.OS === 'web' ? 10 : 6,
  },
  subtitle: {
    fontSize: typeScale.pageSub,
    color: colors.textMuted,
    fontFamily: fonts.sans,
    lineHeight: typeScale.pageSubLine,
  },
  upcomingCard: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    padding: space.cardPad + 2,
    marginBottom: space.section - 8,
  },
  pressed: {
    opacity: 0.9,
  },
  upcomingLabel: {
    fontSize: 12,
    fontFamily: fonts.sans,
    color: colors.accent,
    fontWeight: '500',
    marginBottom: 8,
  },
  upcomingName: {
    fontSize: Platform.OS === 'web' ? 22 : 20,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    lineHeight: Platform.OS === 'web' ? 30 : 28,
    marginBottom: 4,
  },
  upcomingMeta: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.textMuted,
    marginBottom: 12,
  },
  upcomingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderRadius: layout.chipRadius,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  upcomingDday: {
    fontSize: 13,
    color: colors.surface,
    fontFamily: fonts.sans,
    fontWeight: '500',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionSubcopy: {
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    borderStyle: 'dashed',
    paddingVertical: 32,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 26,
    marginBottom: 10,
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
    lineHeight: 20,
    textAlign: 'center',
  },
});
