import { Image, StyleSheet, View } from 'react-native';
import { PhotoSlot } from '@/components/PhotoSlot';
import { colors } from '@/constants/theme';

const MAIN_SIZE = 140;
const SUB_WIDTH = 82;
const SUB_HEIGHT = 65;

interface MemoryPhotosProps {
  photoUrls?: string[];
  editable?: boolean;
  onPickPhoto?: (index: number) => void;
}

export function MemoryPhotos({ photoUrls = [], editable = false, onPickPhoto }: MemoryPhotosProps) {
  const photos = Array.from({ length: 3 }, (_, i) => photoUrls[i]);
  const filledCount = photos.filter(Boolean).length;

  return (
    <View style={styles.section}>
      {editable && onPickPhoto ? (
        <>
          <PhotoSlot
            width={MAIN_SIZE}
            height={MAIN_SIZE}
            uri={photos[0]}
            badge={filledCount}
            onPress={() => onPickPhoto(0)}
          />
          <View style={styles.subPhotos}>
            <PhotoSlot
              width={SUB_WIDTH}
              height={SUB_HEIGHT}
              uri={photos[1]}
              onPress={() => onPickPhoto(1)}
            />
            <PhotoSlot
              width={SUB_WIDTH}
              height={SUB_HEIGHT}
              uri={photos[2]}
              onPress={() => onPickPhoto(2)}
            />
          </View>
        </>
      ) : (
        <>
          {photos[0] ? (
            <Image source={{ uri: photos[0] }} style={styles.mainPhoto} resizeMode="cover" />
          ) : (
            <View style={[styles.mainPhoto, styles.placeholder]} />
          )}
          <View style={styles.subPhotos}>
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
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  subPhotos: {
    gap: 10,
    justifyContent: 'space-between',
  },
  mainPhoto: {
    width: MAIN_SIZE,
    height: MAIN_SIZE,
    borderRadius: 12,
    backgroundColor: colors.photoPlaceholder,
  },
  subPhoto: {
    width: SUB_WIDTH,
    height: SUB_HEIGHT,
    borderRadius: 12,
    backgroundColor: colors.photoPlaceholder,
  },
  placeholder: {
    borderWidth: 1,
    borderColor: colors.border,
  },
});
