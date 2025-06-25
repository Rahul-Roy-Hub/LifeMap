import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import Colors from '../../constants/Colors';
import { FontAwesome } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser, UserProvider } from '@/components/UserContext';
import { ColorSchemeName } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme() as 'light' | 'dark' | null;
  const insets = useSafeAreaInsets();

  return (
    <UserProvider>
      <TabLayoutInner colorScheme={colorScheme} insets={insets} />
    </UserProvider>
  );
}

function TabLayoutInner({ colorScheme, insets }: { colorScheme: 'light' | 'dark' | null; insets: { bottom: number } }) {
  const { subscription, loading } = useUser();
  if (loading) return null;
  const isPro = subscription.plan === 'pro';
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors[(colorScheme ?? 'light') as 'light' | 'dark'].tint,
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: 12,
        },
        tabBarStyle: {
          backgroundColor: Colors[(colorScheme ?? 'light') as 'light' | 'dark'].background,
          borderTopColor: Colors[(colorScheme ?? 'light') as 'light' | 'dark'].tabIconDefault,
          paddingBottom: insets.bottom + 0,
          paddingTop: 8,
          height: 80 + insets.bottom,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color }) => <FontAwesome name="book" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <FontAwesome name="dashboard" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="weekly-summary"
        options={{
          title: 'Weekly',
          tabBarIcon: ({ color }) => isPro ? <FontAwesome name="bar-chart" size={24} color={color} /> : <FontAwesome name="lock" size={24} color={color} />,
        }}
        listeners={!isPro ? {
          tabPress: (e) => {
            e.preventDefault();
            // @ts-ignore
            import('expo-router').then(({ router }) => router.push('/paywall'));
          }
        } : undefined}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => isPro ? <FontAwesome name="comments" size={24} color={color} /> : <FontAwesome name="lock" size={24} color={color} />,
        }}
        listeners={!isPro ? {
          tabPress: (e) => {
            e.preventDefault();
            // @ts-ignore
            import('expo-router').then(({ router }) => router.push('/paywall'));
          }
        } : undefined}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <FontAwesome name="cog" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
