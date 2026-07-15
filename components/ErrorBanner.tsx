import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/constants/theme';

interface ErrorBannerProps {
  message?: string;
}

export function ErrorBanner({
  message = '서버 연결에 실패했어요. 저장된 데이터를 표시합니다.',
}: ErrorBannerProps) {
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  text: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: fonts.sans,
    lineHeight: 18,
  },
});
