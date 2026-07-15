import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ParentAddModal } from '@/components/ParentAddModal';
import { ParentAddSlot } from '@/components/ParentAddSlot';
import { ParentCard } from '@/components/ParentCard';
import { ErrorBanner } from '@/components/ErrorBanner';
import { colors, fonts } from '@/constants/theme';
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>부모님</Text>
          <Text style={styles.subtitle}>오늘의 이야기, 내일의 생신을 함께 기억해요</Text>
        </View>

        {(isError || isOffline) && (
          <ErrorBanner
            message={
              isError
                ? '서버에 연결하지 못했어요. 네트워크와 서버 상태를 확인해주세요.'
                : '서버 연결에 실패했어요. 저장된 부모님 데이터를 표시합니다.'
            }
          />
        )}

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
  content: {
    padding: 20,
    paddingBottom: 40,
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
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
