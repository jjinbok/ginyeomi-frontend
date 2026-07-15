import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/theme';

interface PhotoSlotProps {
  uri?: string;
  width: number;
  height: number;
  badge?: number;
  onPress: () => void;
}

export function PhotoSlot({ uri, width, height, badge, onPress }: PhotoSlotProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.slot,
        { width, height },
        uri ? styles.filled : styles.empty,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      {uri ? (
        <>
          <Image source={{ uri }} style={{ width, height }} resizeMode="cover" />
          {badge !== undefined && badge > 1 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>+{badge - 1}</Text>
            </View>
          )}
        </>
      ) : (
        <Text style={styles.plus}>+</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderDashed,
    backgroundColor: colors.photoPlaceholder,
  },
  filled: {
    backgroundColor: colors.photoPlaceholder,
  },
  pressed: {
    opacity: 0.85,
  },
  plus: {
    fontSize: 24,
    color: colors.textHint,
  },
  badge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(44, 36, 22, 0.7)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: '600',
  },
});
