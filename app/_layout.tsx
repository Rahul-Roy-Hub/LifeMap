import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/components/AuthProvider';
import { useAuthContext } from '@/components/AuthProvider';
import AuthScreen from '@/components/AuthScreen';
import { revenueCatService } from '../lib/revenuecat';
import Toast from 'react-native-toast-message';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Light': Inter_300Light,
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    // Initialize RevenueCat
    revenueCatService.initialize();
  }, []);

  // Hide splash screen once fonts are loaded
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Return null to keep splash screen visible while fonts load
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <AuthGate />
      <StatusBar style="auto" />
      <Toast />
    </AuthProvider>
  );
}

function AuthGate() {
  const { user, loading } = useAuthContext();

  if (loading) return null;

  if (!user) {
    // Show only login screen, no tab bar
    return <AuthScreen />;
  }

  // Show the main app with tabs
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="entry" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="paywall" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="profile-edit" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="+not-found" options={{ headerShown: false }} />
    </Stack>
  );
}