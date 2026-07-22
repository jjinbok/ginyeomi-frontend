import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AnimatedModal } from '@/components/AnimatedModal';
import { colors, fonts, layout } from '@/constants/theme';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatedModal
      visible={visible}
      onRequestClose={loading ? () => undefined : onCancel}
      variant="dialog"
      dismissOnBackdrop={!loading}
    >
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.actions}>
          <Pressable
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.cancelText}>{cancelLabel}</Text>
          </Pressable>
          <Pressable
            style={[
              styles.button,
              destructive ? styles.destructiveButton : styles.confirmButton,
              loading && styles.disabled,
            ]}
            onPress={onConfirm}
            disabled={loading}
          >
            <Text style={destructive ? styles.destructiveText : styles.confirmText}>
              {loading ? '처리 중…' : confirmLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </AnimatedModal>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: layout.cardRadius,
    padding: 24,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    fontFamily: fonts.sans,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
  },
  confirmButton: {
    backgroundColor: colors.textPrimary,
  },
  destructiveButton: {
    backgroundColor: colors.accent,
  },
  disabled: {
    opacity: 0.6,
  },
  cancelText: {
    fontSize: 15,
    fontFamily: fonts.sans,
    color: colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  confirmText: {
    fontSize: 15,
    fontFamily: fonts.sans,
    color: colors.surface,
    fontWeight: '500',
    textAlign: 'center',
  },
  destructiveText: {
    fontSize: 15,
    fontFamily: fonts.sans,
    color: colors.surface,
    fontWeight: '500',
    textAlign: 'center',
  },
});
