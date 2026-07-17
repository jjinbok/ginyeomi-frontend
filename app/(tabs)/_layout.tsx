import { ActivityIndicator, Platform, Text, View } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { metrics } from '@/constants/layout';
import { colors, fonts } from '@/constants/theme';
import { useParents } from '@/hooks/useParents';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: Platform.OS === 'web' ? 18 : 16, opacity: focused ? 1 : 0.45 }}>
      {label}
    </Text>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { data: parents = [], isLoading, isFetched } = useParents();
  const tabBarHeight =
    metrics.tabBarBaseHeight + (Platform.OS === 'web' ? 0 : Math.max(insets.bottom, 0));

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

  return (
    <Tabs
      initialRouteName="parents"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: fonts.sans,
          fontSize: Platform.OS === 'web' ? 11 : 10,
          fontWeight: '500',
          marginBottom: Platform.OS === 'ios' ? 0 : 2,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          height: tabBarHeight,
          paddingBottom: Platform.OS === 'web' ? 8 : Math.max(insets.bottom, 4),
          paddingTop: 6,
        },
        tabBarItemStyle: {
          paddingTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="parents"
        options={{
          title: '부모님',
          tabBarIcon: ({ focused }) => <TabIcon label="👨‍👩‍👧" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="anniversaries"
        options={{
          title: '기념일',
          tabBarIcon: ({ focused }) => <TabIcon label="📅" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="stories"
        options={{
          title: '이야기',
          tabBarIcon: ({ focused }) => <TabIcon label="💬" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
