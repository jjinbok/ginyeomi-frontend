import { Image, StyleSheet, Text, View } from 'react-native';
import { ACTIVITY_TAGS } from '@/constants/tags';
import { colors, fonts, layout, typography } from '@/constants/theme';
import { TagChip } from '@/components/TagChip';
import type { Memory, MemoryTag } from '@/types';

interface MemoryCardProps {
  memory: Memory;
}

function getTagLabel(tagId: MemoryTag | string): string {
  const tag = ACTIVITY_TAGS.find((t) => t.id === tagId);
  return tag ? `${tag.emoji} ${tag.label}` : tagId;
}

export function MemoryCard({ memory }: MemoryCardProps) {
  const mainPhoto = memory.photoUrls?.[0];

  return (
    <View style={styles.card}>
      {mainPhoto ? (
        <Image source={{ uri: mainPhoto }} style={styles.photo} resizeMode="cover" />
      ) : (
        <View style={styles.photoPlaceholder} />
      )}
      {memory.memo ? (
        <Text style={styles.memo}>{memory.memo}</Text>
      ) : null}
      {memory.tags.length > 0 && (
        <View style={styles.tags}>
          {memory.tags.map((tag) => (
            <TagChip key={tag} label={getTagLabel(tag)} />
          ))}
        </View>
      )}
      {memory.gift ? (
        <Text style={styles.gift}>🎁 {memory.gift}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  photo: {
    width: '100%',
    height: 160,
  },
  photoPlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: colors.photoPlaceholder,
  },
  memo: {
    ...typography.memo,
    padding: 16,
    paddingBottom: 8,
    lineHeight: 22,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  gift: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: fonts.sans,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
