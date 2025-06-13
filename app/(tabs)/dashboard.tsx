import { View } from 'react-native';
import { useAuthContext } from '@/components/AuthProvider';
import { UserProvider } from '@/components/UserContext';
import DashboardContent from '@/components/DashboardContent';
import AuthScreen from '@/components/AuthScreen';

export default function DashboardScreen() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: '#f8fafc' }} />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <UserProvider>
      <DashboardContent />
    </UserProvider>
  );
}