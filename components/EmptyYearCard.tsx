import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, layout } from '@/constants/theme';

interface EmptyYearCardProps {
  onPress: () => void;
}

export function EmptyYearCard({ onPress }: EmptyYearCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Text style={styles.icon}>✦</Text>
      <Text style={styles.message}>아직 남겨둔 추억이 없어요</Text>
      <Text style={styles.action}>+ 추억 남기기</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderDashed,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  pressed: {
    opacity: 0.85,
  },
  icon: {
    fontSize: 20,
    color: colors.textHint,
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: fonts.sans,
    marginBottom: 8,
  },
  action: {
    fontSize: 14,
    color: colors.accent,
    fontFamily: fonts.sans,
    fontWeight: '500',
  },
});
