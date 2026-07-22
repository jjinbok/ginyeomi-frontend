import { ErrorBanner } from '@/components/ErrorBanner';
import { ParentAddModal } from '@/components/ParentAddModal';
import { ParentAddSlot } from '@/components/ParentAddSlot';
import { ParentCard } from '@/components/ParentCard';
import { colors, fonts, layout } from '@/constants/theme';
import { space, typeScale, webContentFrame } from '@/constants/layout';
import { useFetchErrorAlert } from '@/hooks/useFetchErrorAlert';
import { useParents } from '@/hooks/useParents';
import type { ParentRelation } from '@/types';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
      <View style={[styles.content, webContentFrame]}>
        <View style={styles.hero}>
          <Text style={styles.brand}>기녀미</Text>
          <Text style={styles.headline}>함께한 날들,{'\n'}책 한 권으로</Text>
          <Text style={styles.subcopy}>
            기념일과 이야기를 남기면{'\n'}
            기녀미가 책으로 엮어 드려요.
          </Text>
        </View>

        <View style={styles.cardRow}>
          {father ? (
            <ParentCard parent={father} onPress={() => openAddModal('FATHER')} enterIndex={0} />
          ) : (
            <ParentAddSlot relation="FATHER" onPress={() => openAddModal('FATHER')} />
          )}
          {mother ? (
            <ParentCard parent={mother} onPress={() => openAddModal('MOTHER')} enterIndex={1} />
          ) : (
            <ParentAddSlot relation="MOTHER" onPress={() => openAddModal('MOTHER')} />
          )}
        </View>

        <Text style={styles.hint}>
          {canStart
            ? '둘 다 등록하면 더 풍성한 책이 될 수 있어요'
            : '먼저 부모님 정보를 등록해 주세요'}
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

      <View style={[styles.footer, webContentFrame]}>
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
    width: '100%',
    paddingHorizontal: space.screenX,
    paddingTop: space.screenTop + 12,
  },
  hero: {
    marginBottom: space.headerBottom,
  },
  brand: {
    fontSize: 14,
    fontFamily: fonts.serif,
    color: colors.accent,
    marginBottom: 10,
  },
  headline: {
    fontSize: typeScale.pageTitle,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    marginBottom: 10,
    lineHeight: typeScale.pageTitleLine,
  },
  subcopy: {
    fontSize: typeScale.pageSub,
    fontFamily: fonts.sans,
    color: colors.textMuted,
    lineHeight: typeScale.pageSubLine,
  },
  cardRow: {
    flexDirection: 'row',
    gap: space.cardGap,
  },
  hint: {
    marginTop: 14,
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.textHint,
    textAlign: 'center',
  },
  footer: {
    width: '100%',
    paddingHorizontal: space.screenX,
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
