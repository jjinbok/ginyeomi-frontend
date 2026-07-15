import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, layout } from '@/constants/theme';

interface TagChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
}

export function TagChip({ label, selected, onPress, onRemove }: TagChipProps) {
  const isInteractive = onPress !== undefined;
  const isRemovable = onRemove !== undefined;

  return (
    <Pressable
      style={[
        styles.chip,
        selected ? styles.chipSelected : styles.chipDefault,
        !isInteractive && !selected && styles.chipStatic,
        isRemovable && styles.chipRemovable,
      ]}
      onPress={onPress}
      disabled={!isInteractive}
    >
      <Text
        style={[
          styles.label,
          selected ? styles.labelSelected : styles.labelDefault,
          isRemovable && styles.labelRemovable,
        ]}
      >
        {label}
      </Text>
      {onRemove && (
        <Pressable onPress={onRemove} hitSlop={8} style={styles.removeBtn}>
          <Text style={styles.removeText}>✕</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: layout.chipRadius,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: layout.borderWidth,
  },
  chipDefault: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.tagBackground,
    borderColor: colors.textPrimary,
  },
  chipStatic: {
    backgroundColor: colors.tagBackground,
    borderColor: colors.tagBackground,
  },
  chipRemovable: {
    backgroundColor: colors.tagBackground,
    borderColor: colors.border,
  },
  label: {
    fontSize: 12,
    fontFamily: fonts.sans,
  },
  labelDefault: {
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  labelRemovable: {
    color: colors.textPrimary,
  },
  removeBtn: {
    marginLeft: 6,
  },
  removeText: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
