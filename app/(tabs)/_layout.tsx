import { ActivityIndicator, Text, View } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { colors, fonts } from '@/constants/theme';
import { useParents } from '@/hooks/useParents';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.5 }}>{label}</Text>
  );
}

export default function TabLayout() {
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

  return (
    <Tabs
      initialRouteName="parents"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: fonts.sans,
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          height: 56,
          paddingBottom: 6,
          paddingTop: 6,
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
