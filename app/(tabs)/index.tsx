import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthContext } from '@/components/AuthProvider';
import { UserProvider } from '@/components/UserContext';
import HomeContent from '@/components/HomeContent';
import AuthScreen from '@/components/AuthScreen';

export default function HomePage() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: '#f8fafc' }} />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <UserProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }} edges={['left', 'right', 'top']}>
        <HomeContent />
      </SafeAreaView>
    </UserProvider>
  );
}