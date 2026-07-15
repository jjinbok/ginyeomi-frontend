import { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MemoryPhotos } from '@/components/MemoryPhotos';
import { TagChip } from '@/components/TagChip';
import { ACTIVITY_TAGS } from '@/constants/tags';
import { colors, fonts, layout, typography } from '@/constants/theme';
import { useMemories } from '@/hooks/useMemories';
import type { MemoryTag } from '@/types';

function getTagLabel(tagId: MemoryTag | string): string {
  const tag = ACTIVITY_TAGS.find((t) => t.id === tagId);
  return tag ? `${tag.emoji} ${tag.label}` : tagId;
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
  const { data: memories = [], isLoading } = useMemories(anniversaryId);
  const memory = memories.find((m) => m.id === memoryId);

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
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>기억</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>기억을 찾을 수 없어요.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const gifts = memory.gift
    ? memory.gift.split(',').map((g) => g.trim()).filter(Boolean)
    : [];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{memory.year}년 기억</Text>
        <Pressable onPress={navigateToEdit} hitSlop={8}>
          <Text style={styles.editText}>수정</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contextChip}>
          <Text style={styles.contextText}>
            {params.emoji} {params.anniversaryName}
          </Text>
        </View>

        <MemoryPhotos photoUrls={memory.photoUrls} />

        {memory.memo ? (
          <>
            <Text style={[typography.sectionLabel, styles.sectionLabel]}>메모</Text>
            <View style={styles.memoCard}>
              <Text style={styles.memoText}>{memory.memo}</Text>
            </View>
          </>
        ) : null}

        {memory.tags.length > 0 && (
          <>
            <Text style={[typography.sectionLabel, styles.sectionLabel]}>어떤 날이었나요</Text>
            <View style={styles.tagRow}>
              {memory.tags.map((tag) => (
                <TagChip key={tag} label={getTagLabel(tag)} />
              ))}
            </View>
          </>
        )}

        {gifts.length > 0 && (
          <>
            <Text style={[typography.sectionLabel, styles.sectionLabel]}>선물</Text>
            <View style={styles.giftRow}>
              {gifts.map((gift) => (
                <TagChip key={gift} label={`🎁 ${gift}`} />
              ))}
            </View>
          </>
        )}
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
  },
  header: {
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
  headerTitle: {
    fontSize: 16,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
  },
  editText: {
    fontSize: 15,
    color: colors.accent,
    fontFamily: fonts.sans,
    fontWeight: '500',
    minWidth: 40,
    textAlign: 'right',
  },
  headerSpacer: {
    minWidth: 40,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 0,
  },
  contextChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.chipBackground,
    borderRadius: layout.chipRadius,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 20,
  },
  contextText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: fonts.sans,
  },
  sectionLabel: {
    marginTop: 20,
    marginBottom: 10,
  },
  memoCard: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    padding: 16,
  },
  memoText: {
    ...typography.memo,
    lineHeight: 24,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  giftRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: fonts.sans,
    color: colors.textMuted,
  },
});
