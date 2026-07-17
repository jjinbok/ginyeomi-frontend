import { Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { PhotoSlot } from '@/components/PhotoSlot';
import { colors, fonts } from '@/constants/theme';

const EDIT_MAIN = 140;
const EDIT_SUB_W = 82;
const EDIT_SUB_H = 65;

interface MemoryPhotosProps {
  photoUrls?: string[];
  editable?: boolean;
  /** detail: 읽기용 큰 레이아웃 / edit: 기존 슬롯 */
  variant?: 'edit' | 'detail';
  onPickPhoto?: (index: number) => void;
}

export function MemoryPhotos({
  photoUrls = [],
  editable = false,
  variant = 'edit',
  onPickPhoto,
}: MemoryPhotosProps) {
  const { width } = useWindowDimensions();
  const photos = Array.from({ length: 3 }, (_, i) => photoUrls[i]);
  const filled = photos.filter(Boolean) as string[];
  const filledCount = filled.length;

  if (editable && onPickPhoto) {
    return (
      <View style={styles.editRow}>
        <PhotoSlot
          width={EDIT_MAIN}
          height={EDIT_MAIN}
          uri={photos[0]}
          badge={filledCount}
          onPress={() => onPickPhoto(0)}
        />
        <View style={styles.editSubs}>
          <PhotoSlot
            width={EDIT_SUB_W}
            height={EDIT_SUB_H}
            uri={photos[1]}
            onPress={() => onPickPhoto(1)}
          />
          <PhotoSlot
            width={EDIT_SUB_W}
            height={EDIT_SUB_H}
            uri={photos[2]}
            onPress={() => onPickPhoto(2)}
          />
        </View>
      </View>
    );
  }

  if (variant === 'detail') {
    if (filledCount === 0) {
      return (
        <View style={styles.detailEmpty}>
          <Text style={styles.detailEmptyMark}>✦</Text>
          <Text style={styles.detailEmptyText}>사진은 아직 없어요</Text>
        </View>
      );
    }

    const heroHeight = Math.min(280, Math.round(width * 0.55));

    return (
      <View style={styles.detailBlock}>
        <Image
          source={{ uri: filled[0] }}
          style={[styles.detailHero, { height: heroHeight }]}
          resizeMode="cover"
        />
        {filledCount > 1 ? (
          <View style={styles.detailStrip}>
            {filled.slice(1).map((uri) => (
              <Image key={uri} source={{ uri }} style={styles.detailThumb} resizeMode="cover" />
            ))}
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.editRow}>
      {photos[0] ? (
        <Image source={{ uri: photos[0] }} style={styles.mainPhoto} resizeMode="cover" />
      ) : (
        <View style={[styles.mainPhoto, styles.placeholder]} />
      )}
      <View style={styles.editSubs}>
        {photos[1] ? (
          <Image source={{ uri: photos[1] }} style={styles.subPhoto} resizeMode="cover" />
        ) : (
          <View style={[styles.subPhoto, styles.placeholder]} />
        )}
        {photos[2] ? (
          <Image source={{ uri: photos[2] }} style={styles.subPhoto} resizeMode="cover" />
        ) : (
          <View style={[styles.subPhoto, styles.placeholder]} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  editRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  editSubs: {
    gap: 10,
    justifyContent: 'space-between',
  },
  mainPhoto: {
    width: EDIT_MAIN,
    height: EDIT_MAIN,
    borderRadius: 12,
    backgroundColor: colors.photoPlaceholder,
  },
  subPhoto: {
    width: EDIT_SUB_W,
    height: EDIT_SUB_H,
    borderRadius: 12,
    backgroundColor: colors.photoPlaceholder,
  },
  placeholder: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailBlock: {
    marginBottom: 8,
    gap: 10,
  },
  detailHero: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: colors.photoPlaceholder,
  },
  detailStrip: {
    flexDirection: 'row',
    gap: 10,
  },
  detailThumb: {
    flex: 1,
    height: 88,
    borderRadius: 12,
    backgroundColor: colors.photoPlaceholder,
  },
  detailEmpty: {
    height: 140,
    borderRadius: 16,
    backgroundColor: colors.photoPlaceholder,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  detailEmptyMark: {
    fontSize: 16,
    color: colors.textHint,
  },
  detailEmptyText: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.textHint,
  },
});
