import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { colors } from '@/constants/theme';
import { useParents } from '@/hooks/useParents';

/** 앱 진입점: 부모님 미등록이면 온보딩, 있으면 메인 */
export default function IndexGate() {
  const { data: parents = [], isLoading, isFetched } = useParents();

  if (isLoading || !isFetched) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (parents.length === 0) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)/parents" />;
}
