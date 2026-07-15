import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PARENT_RELATIONS } from '@/constants/parents';
import { colors, fonts, layout } from '@/constants/theme';
import type { ParentRelation } from '@/types';

interface ParentAddSlotProps {
  relation: ParentRelation;
  onPress: () => void;
}

export function ParentAddSlot({ relation, onPress }: ParentAddSlotProps) {
  const info = PARENT_RELATIONS[relation];

  return (
    <Pressable
      style={({ pressed }) => [styles.slot, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.iconCircle}>
        <Text style={styles.emoji}>{info.emoji}</Text>
      </View>
      <Text style={styles.label}>{info.addLabel}</Text>
      <Text style={styles.hint}>성함과 생일을 남겨보세요</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderDashed,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  pressed: {
    opacity: 0.85,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.tagBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emoji: {
    fontSize: 34,
  },
  label: {
    fontSize: 15,
    fontFamily: fonts.sans,
    fontWeight: '500',
    color: colors.accent,
    marginBottom: 6,
  },
  hint: {
    fontSize: 12,
    fontFamily: fonts.sans,
    color: colors.textHint,
    textAlign: 'center',
  },
});
