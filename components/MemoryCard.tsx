import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { ACTIVITY_TAGS } from '@/constants/tags';
import { colors, fonts, layout, typography } from '@/constants/theme';
import type { Memory, MemoryTag } from '@/types';

interface MemoryCardProps {
  memory: Memory;
  onPress?: () => void;
  /** 타임라인 연도가 이미 보이는 경우 숨김 */
  showYear?: boolean;
}

function getTagLabel(tagId: MemoryTag | string): string {
  const tag = ACTIVITY_TAGS.find((t) => t.id === tagId);
  return tag ? tag.label : tagId;
}

export function MemoryCard({ memory, onPress, showYear = true }: MemoryCardProps) {
  const mainPhoto = memory.photoUrls?.[0];
  const photoCount = memory.photoUrls?.length ?? 0;
  const hasMemo = Boolean(memory.memo?.trim());
  const gifts = memory.gift
    ? memory.gift
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean)
    : [];
  const tagLabels = memory.tags.map(getTagLabel);
  const metaParts = [
    ...tagLabels,
    gifts.length > 0 ? `선물 ${gifts.length}` : null,
    photoCount > 1 ? `사진 ${photoCount}` : null,
  ].filter(Boolean);

  const body = (
    <>
      {mainPhoto ? (
        <View style={styles.photoWrap}>
          <Image source={{ uri: mainPhoto }} style={styles.photo} resizeMode="cover" />
          <View style={styles.photoShade} />
          {showYear ? (
            <Text style={styles.photoYear}>{memory.year}년</Text>
          ) : null}
        </View>
      ) : (
        <View style={styles.noPhotoHero}>
          {showYear ? <Text style={styles.year}>{memory.year}년</Text> : null}
          <Text style={styles.quoteMark}>“</Text>
        </View>
      )}

      <View style={styles.body}>
        {hasMemo ? (
          <Text style={styles.memo} numberOfLines={onPress ? 3 : undefined}>
            {memory.memo}
          </Text>
        ) : (
          <Text style={styles.memoEmpty}>메모 없이 남겨둔 날이에요</Text>
        )}

        {metaParts.length > 0 ? (
          <Text style={styles.meta}>{metaParts.join(' · ')}</Text>
        ) : null}

        {onPress ? <Text style={styles.cue}>하루 다시 보기</Text> : null}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        onPress={onPress}
      >
        {body}
      </Pressable>
    );
  }

  return <View style={styles.card}>{body}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.92,
  },
  photoWrap: {
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: 176,
  },
  photoShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(44, 36, 22, 0.18)',
  },
  photoYear: {
    position: 'absolute',
    left: 14,
    bottom: 12,
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.surface,
    fontWeight: '500',
  },
  noPhotoHero: {
    backgroundColor: colors.tagBackground,
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 4,
    minHeight: 72,
  },
  year: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.accent,
    fontWeight: '500',
    marginBottom: 2,
  },
  quoteMark: {
    fontSize: 32,
    fontFamily: fonts.serif,
    color: colors.accent,
    opacity: 0.55,
    lineHeight: 36,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },
  memo: {
    ...typography.memo,
    lineHeight: 22,
  },
  memoEmpty: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.textHint,
    lineHeight: 20,
  },
  meta: {
    marginTop: 10,
    fontSize: 12,
    fontFamily: fonts.sans,
    color: colors.textMuted,
    lineHeight: 18,
  },
  cue: {
    marginTop: 12,
    fontSize: 12,
    fontFamily: fonts.sans,
    color: colors.accent,
    fontWeight: '500',
  },
});
