import { View } from 'react-native';
import { useAuthContext } from '@/components/AuthProvider';
import { UserProvider } from '@/components/UserContext';
import SettingsContent from '@/components/SettingsContent';
import AuthScreen from '@/components/AuthScreen';

export default function SettingsScreen() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: '#f8fafc' }} />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <UserProvider>
      <SettingsContent />
    </UserProvider>
  );
}