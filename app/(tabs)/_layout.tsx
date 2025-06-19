import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import Colors from '../../constants/Colors';
import { FontAwesome } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets(); // Get safe area padding

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: 12,
        },
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff',
          // borderTopWidth: 1,
          borderTopColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb',
          paddingBottom: insets.bottom + 0, // Dynamic based on device
          paddingTop: 8,
          height: 80 + insets.bottom, // Allow space for bottom nav bar
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
          tabBarIcon: ({ color }) => <FontAwesome name="bar-chart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <FontAwesome name="comments" size={24} color={color} />,
        }}
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
