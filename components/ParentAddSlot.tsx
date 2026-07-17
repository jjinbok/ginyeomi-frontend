import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PARENT_RELATIONS } from '@/constants/parents';
import { metrics, space } from '@/constants/layout';
import { colors, fonts, layout } from '@/constants/theme';
import type { ParentRelation } from '@/types';

interface ParentAddSlotProps {
  relation: ParentRelation;
  onPress: () => void;
}

export function ParentAddSlot({ relation, onPress }: ParentAddSlotProps) {
  const info = PARENT_RELATIONS[relation];
  const photo = metrics.parentPhoto;

  return (
    <Pressable
      style={({ pressed }) => [styles.slot, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View
        style={[
          styles.iconCircle,
          { width: photo, height: photo, borderRadius: photo / 2 },
        ]}
      >
        <Text style={styles.plus}>+</Text>
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {info.formalLabel} 모시기
      </Text>
      <Text style={styles.hint}>이름과 생신을{'\n'}남겨 주세요</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderDashed,
    paddingVertical: space.cardPad + 8,
    paddingHorizontal: space.cardPad - 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: metrics.parentPhoto + 120,
  },
  pressed: {
    opacity: 0.88,
  },
  iconCircle: {
    backgroundColor: colors.tagBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  plus: {
    fontSize: 26,
    color: colors.accent,
    lineHeight: 30,
  },
  label: {
    fontSize: 15,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    marginBottom: 6,
    maxWidth: '100%',
  },
  hint: {
    fontSize: 12,
    fontFamily: fonts.sans,
    color: colors.textHint,
    textAlign: 'center',
    lineHeight: 18,
  },
});
