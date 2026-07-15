import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, layout } from '@/constants/theme';

interface FABProps {
  onPress: () => void;
}

export function FAB({ onPress }: FABProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Text style={styles.icon}>+</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: layout.fabSize,
    height: layout.fabSize,
    borderRadius: layout.fabSize / 2,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  icon: {
    color: colors.surface,
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2,
  },
});
