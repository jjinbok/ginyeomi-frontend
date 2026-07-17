import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { subscribeAppAlert, type AppAlertPayload } from '@/api/errors';
import { colors, fonts, layout } from '@/constants/theme';

/** Root에 한 번만 마운트 — showAppAlert / showApiErrorAlert 가 이 모달을 띄움 */
export function AppAlertHost() {
  const [alert, setAlert] = useState<AppAlertPayload | null>(null);

  useEffect(() => subscribeAppAlert(setAlert), []);

  const dismiss = () => setAlert(null);

  return (
    <Modal
      visible={alert != null}
      transparent
      animationType="fade"
      onRequestClose={dismiss}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} />
        <View style={styles.card}>
          <Text style={styles.eyebrow}>알려드려요</Text>
          <Text style={[styles.title, !alert?.message && styles.titleSolo]}>{alert?.title}</Text>
          {alert?.message ? <Text style={styles.message}>{alert.message}</Text> : null}
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={dismiss}
          >
            <Text style={styles.buttonText}>확인</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(44, 36, 22, 0.42)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.background,
    borderRadius: layout.cardRadius,
    paddingTop: 22,
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
  },
  eyebrow: {
    fontSize: 12,
    fontFamily: fonts.serif,
    color: colors.accent,
    textAlign: 'center',
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 10,
  },
  titleSolo: {
    marginBottom: 22,
  },
  message: {
    fontSize: 14,
    fontFamily: fonts.sans,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 22,
  },
  button: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonText: {
    fontSize: 15,
    fontFamily: fonts.sans,
    color: colors.surface,
    fontWeight: '500',
  },
});
