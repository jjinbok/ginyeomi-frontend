import { useCallback, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MemoryPhotos } from '@/components/MemoryPhotos';
import { getScreenContentStyle } from '@/components/ScreenBody';
import { ACTIVITY_TAGS } from '@/constants/tags';
import { space, typeScale, webContentFrame } from '@/constants/layout';
import { colors, fonts, layout, typography } from '@/constants/theme';
import { useFetchErrorAlert } from '@/hooks/useFetchErrorAlert';
import { useMemories } from '@/hooks/useMemories';
import type { MemoryTag } from '@/types';

function getTagMeta(tagId: MemoryTag | string) {
  const tag = ACTIVITY_TAGS.find((t) => t.id === tagId);
  return tag ?? { id: tagId, label: tagId, emoji: '✦' };
}

function DetailBlock({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.block}>
      <View style={styles.blockHeader}>
        <View style={styles.blockRule} />
        <Text style={styles.blockEyebrow}>{eyebrow}</Text>
        <View style={styles.blockRule} />
      </View>
      {children}
    </View>
  );
}

export default function MemoryDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    anniversaryId: string;
    anniversaryName: string;
    emoji: string;
  }>();

  const memoryId = Number(params.id);
  const anniversaryId = Number(params.anniversaryId);
  const { data: memories = [], isLoading, isError, error } = useMemories(anniversaryId);
  const memory = memories.find((m) => m.id === memoryId);

  useFetchErrorAlert(isError, error);

  const navigateToEdit = useCallback(() => {
    router.push({
      pathname: '/memory/edit',
      params: {
        anniversaryId: params.anniversaryId,
        anniversaryName: params.anniversaryName,
        emoji: params.emoji,
        recordId: String(memoryId),
      },
    });
  }, [router, params.anniversaryId, params.anniversaryName, params.emoji, memoryId]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

  if (!memory) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={[styles.navHeader, webContentFrame]}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.navSide}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <Text style={styles.navTitle}>기억</Text>
          <View style={styles.navSide} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>기억을 찾을 수 없어요</Text>
        </View>
      </SafeAreaView>
    );
  }

  const gifts = memory.gift
    ? memory.gift
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean)
    : [];
  const hasMemo = Boolean(memory.memo?.trim());
  const anniversaryLabel = [params.emoji, params.anniversaryName].filter(Boolean).join(' ');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={[styles.navHeader, webContentFrame]}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.navSide}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.navTitle}>기억</Text>
        <View style={[styles.navSide, styles.navRight]}>
          <Pressable onPress={navigateToEdit} hitSlop={8}>
            <Text style={styles.editText}>수정</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={getScreenContentStyle({ paddingTop: 4, paddingBottom: 48 })}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          {anniversaryLabel ? (
            <View style={styles.contextPill}>
              <Text style={styles.context}>{anniversaryLabel}</Text>
            </View>
          ) : null}
          <Text style={styles.year}>{memory.year}년</Text>
          <Text style={styles.heroSub}>그날의 하루를 다시 펼쳐 봤어요</Text>
        </View>

        <MemoryPhotos photoUrls={memory.imageUrls} variant="detail" />

        <DetailBlock eyebrow="그날의 기록">
          {hasMemo ? (
            <View style={styles.memoPanel}>
              <Text style={styles.memoMark} accessible={false}>
                “
              </Text>
              <Text style={styles.memo}>{memory.memo}</Text>
            </View>
          ) : (
            <View style={styles.emptyNote}>
              <Text style={styles.emptyMark}>✦</Text>
              <Text style={styles.emptyNoteText}>짧은 한 줄만 적어도 충분해요</Text>
            </View>
          )}
        </DetailBlock>

        {memory.tags.length > 0 ? (
          <DetailBlock eyebrow="어떤 날이었나요">
            <View style={styles.moodRow}>
              {memory.tags.map((tag) => {
                const meta = getTagMeta(tag);
                return (
                  <View key={tag} style={styles.moodCard}>
                    <Text style={styles.moodEmoji}>{meta.emoji}</Text>
                    <Text style={styles.moodLabel}>{meta.label}</Text>
                  </View>
                );
              })}
            </View>
          </DetailBlock>
        ) : null}

        {gifts.length > 0 ? (
          <DetailBlock eyebrow="건넨 마음">
            <View style={styles.giftList}>
              {gifts.map((gift) => (
                <View key={gift} style={styles.giftRow}>
                  <View style={styles.giftIcon}>
                    <Text style={styles.giftIconText}>🎁</Text>
                  </View>
                  <Text style={styles.giftText}>{gift}</Text>
                </View>
              ))}
            </View>
          </DetailBlock>
        ) : null}
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
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
  navRight: {
    alignItems: 'flex-end',
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
  editText: {
    fontSize: 14,
    color: colors.accent,
    fontFamily: fonts.sans,
    fontWeight: '500',
  },
  hero: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: space.headerBottom,
  },
  contextPill: {
    backgroundColor: colors.tagBackground,
    borderRadius: layout.chipRadius,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 12,
  },
  context: {
    fontSize: 12,
    fontFamily: fonts.sans,
    color: colors.accent,
    fontWeight: '500',
  },
  year: {
    fontSize: typeScale.heroName,
    lineHeight: typeScale.heroNameLine,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.textMuted,
  },
  block: {
    marginTop: space.section - 4,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  blockRule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderDashed,
  },
  blockEyebrow: {
    fontSize: 12,
    fontFamily: fonts.serif,
    color: colors.accent,
    letterSpacing: 0.6,
  },
  memoPanel: {
    backgroundColor: colors.tagBackground,
    borderRadius: layout.cardRadius,
    paddingHorizontal: layout.memoPad,
    paddingTop: 28,
    paddingBottom: 22,
    overflow: 'hidden',
  },
  memoMark: {
    position: 'absolute',
    top: 6,
    left: layout.memoPad,
    fontSize: 36,
    fontFamily: fonts.serif,
    color: colors.accent,
    opacity: 0.28,
    lineHeight: 40,
  },
  memo: {
    ...typography.memo,
    ...(Platform.OS === 'web' ? ({ whiteSpace: 'pre-wrap' } as object) : null),
  },
  emptyNote: {
    backgroundColor: colors.tagBackground,
    borderRadius: layout.cardRadius,
    paddingVertical: 28,
    paddingHorizontal: layout.memoPad,
    alignItems: 'center',
    gap: 8,
  },
  emptyMark: {
    fontSize: 14,
    color: colors.textHint,
  },
  emptyNoteText: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.textHint,
    lineHeight: 19,
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moodCard: {
    minWidth: 88,
    flexGrow: 1,
    flexBasis: '28%',
    backgroundColor: colors.tagBackground,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 8,
  },
  moodEmoji: {
    fontSize: 22,
  },
  moodLabel: {
    fontSize: 13,
    fontFamily: fonts.serif,
    color: colors.textSecondary,
  },
  giftList: {
    gap: 10,
  },
  giftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.tagBackground,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  giftIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftIconText: {
    fontSize: 16,
  },
  giftText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.serif,
    fontWeight: '300',
    color: colors.textPrimary,
    lineHeight: 22,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: fonts.sans,
    color: colors.textMuted,
  },
});
