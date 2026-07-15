import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '페이지 없음' }} />
      <View style={styles.container}>
        <Text style={styles.title}>페이지를 찾을 수 없어요</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>홈으로 돌아가기</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
  },
  link: {
    marginTop: 16,
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 14,
    fontFamily: fonts.sans,
    color: colors.accent,
  },
});
