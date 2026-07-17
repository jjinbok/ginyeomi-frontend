import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getScreenContentStyle } from '@/components/ScreenBody';
import { ParentAddModal } from '@/components/ParentAddModal';
import { ParentAddSlot } from '@/components/ParentAddSlot';
import { ParentCard } from '@/components/ParentCard';
import { ErrorBanner } from '@/components/ErrorBanner';
import { space, typeScale } from '@/constants/layout';
import { colors, fonts, typography } from '@/constants/theme';
import { useFetchErrorAlert } from '@/hooks/useFetchErrorAlert';
import { useParents } from '@/hooks/useParents';
import type { Parent, ParentRelation } from '@/types';

export default function ParentsTabScreen() {
  const router = useRouter();
  const { data: parents = [], isLoading, isError, isOffline, error, refetch } = useParents();

  useFetchErrorAlert(isError, error);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalRelation, setModalRelation] = useState<ParentRelation>('FATHER');

  const handleCardPress = useCallback(
    (parent: Parent) => {
      router.push({
        pathname: '/parent/[id]',
        params: { id: String(parent.id) },
      });
    },
    [router],
  );

  const openAddModal = useCallback((relation: ParentRelation) => {
    setModalRelation(relation);
    setModalVisible(true);
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

  const father = parents.find((p) => p.relation === 'FATHER');
  const mother = parents.find((p) => p.relation === 'MOTHER');
  const filledCount = parents.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={getScreenContentStyle()}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>부모님</Text>
          <Text style={styles.subtitle}>
            {Platform.OS === 'web'
              ? '두 분의 하루를 기억하고, 작은 이야기들을 모아 두어요'
              : '두 분의 하루를 기억하고\n작은 이야기들을 모아 두어요'}
          </Text>
        </View>

        {(isError || isOffline) && (
          <ErrorBanner
            message={
              isError
                ? '잠시 연결이 불안정해요. 네트워크를 확인해 주세요.'
                : '연결이 불안정해 저장된 정보를 보여드려요.'
            }
          />
        )}

        <View style={styles.sectionHeader}>
          <Text style={typography.sectionTitle}>우리 가족</Text>
          <Text style={[typography.sectionSubcopy, styles.sectionSubcopy]}>
            {filledCount === 0
              ? '아직 모신 분이 없어요'
              : filledCount === 1
                ? '한 분을 모시고 있어요'
                : '두 분을 모두 모시고 있어요'}
          </Text>
        </View>

        <View style={styles.cardRow}>
          {father ? (
            <ParentCard parent={father} onPress={() => handleCardPress(father)} />
          ) : (
            <ParentAddSlot relation="FATHER" onPress={() => openAddModal('FATHER')} />
          )}
          {mother ? (
            <ParentCard parent={mother} onPress={() => handleCardPress(mother)} />
          ) : (
            <ParentAddSlot relation="MOTHER" onPress={() => openAddModal('MOTHER')} />
          )}
        </View>
      </ScrollView>

      <ParentAddModal
        visible={modalVisible}
        relation={modalRelation}
        onClose={() => setModalVisible(false)}
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
  sectionHeader: {
    marginBottom: 12,
  },
  sectionSubcopy: {
    marginTop: 4,
  },
  cardRow: {
    flexDirection: 'row',
    gap: space.cardGap,
    alignItems: 'stretch',
  },
});
