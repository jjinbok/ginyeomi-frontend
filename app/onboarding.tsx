import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
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
import { colors, fonts, layout } from '@/constants/theme';
import { useFetchErrorAlert } from '@/hooks/useFetchErrorAlert';
import { useParents } from '@/hooks/useParents';
import type { ParentRelation } from '@/types';

export default function OnboardingScreen() {
  const router = useRouter();
  const { data: parents = [], isLoading, isFetched, isError, isOffline, error } = useParents();

  useFetchErrorAlert(isError, error);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalRelation, setModalRelation] = useState<ParentRelation>('FATHER');

  const father = parents.find((p) => p.relation === 'FATHER');
  const mother = parents.find((p) => p.relation === 'MOTHER');
  const canStart = parents.length > 0;

  const openAddModal = useCallback((relation: ParentRelation) => {
    setModalRelation(relation);
    setModalVisible(true);
  }, []);

  const handleStart = useCallback(() => {
    router.replace('/(tabs)/parents');
  }, [router]);

  if (isLoading || !isFetched) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.brand}>기녀미</Text>
          <Text style={styles.headline}>부모님을 먼저 알려주세요</Text>
          <Text style={styles.subcopy}>
            기녀미는 부모님의 생신과 기념일을 챙기는 공간이에요.{'\n'}
            아버지·어머니 정보를 등록하면 시작할 수 있어요.
          </Text>
        </View>

        <View style={styles.cardRow}>
          {father ? (
            <ParentCard parent={father} onPress={() => openAddModal('FATHER')} />
          ) : (
            <ParentAddSlot relation="FATHER" onPress={() => openAddModal('FATHER')} />
          )}
          {mother ? (
            <ParentCard parent={mother} onPress={() => openAddModal('MOTHER')} />
          ) : (
            <ParentAddSlot relation="MOTHER" onPress={() => openAddModal('MOTHER')} />
          )}
        </View>

        <Text style={styles.hint}>
          {canStart
            ? '둘 다 등록하면 더 알차게 쓸 수 있어요'
            : '적어도 한 분을 등록해주세요'}
        </Text>

        {(isError || isOffline) && (
          <ErrorBanner
            message={
              isError
                ? '서버에 연결하지 못했어요. 부모님 등록 전에 서버를 확인해주세요.'
                : '서버 연결에 실패했어요. 저장된 데이터를 표시합니다.'
            }
          />
        )}
      </View>

      <View style={styles.footer}>
        <Pressable
          style={[styles.startButton, !canStart && styles.startDisabled]}
          onPress={handleStart}
          disabled={!canStart}
        >
          <Text style={styles.startText}>기녀미 시작하기</Text>
        </Pressable>
      </View>

      <ParentAddModal
        visible={modalVisible}
        relation={modalRelation}
        editingParent={
          modalRelation === 'FATHER' ? father ?? null : mother ?? null
        }
        onClose={() => setModalVisible(false)}
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
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  hero: {
    marginBottom: 28,
  },
  brand: {
    fontSize: 15,
    fontFamily: fonts.serif,
    color: colors.accent,
    marginBottom: 12,
  },
  headline: {
    fontSize: 26,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    marginBottom: 12,
    lineHeight: 36,
  },
  subcopy: {
    fontSize: 14,
    fontFamily: fonts.sans,
    color: colors.textMuted,
    lineHeight: 22,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  hint: {
    marginTop: 16,
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.textHint,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 8,
    borderTopWidth: layout.borderWidth,
    borderTopColor: colors.border,
  },
  startButton: {
    backgroundColor: colors.textPrimary,
    borderRadius: 12,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startDisabled: {
    opacity: 0.4,
  },
  startText: {
    color: colors.surface,
    fontSize: 16,
    fontFamily: fonts.sans,
    fontWeight: '500',
  },
});
