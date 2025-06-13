import { View } from 'react-native';
import { useAuthContext } from '@/components/AuthProvider';
import { UserProvider } from '@/components/UserContext';
import PaywallContent from '@/components/PaywallContent';
import AuthScreen from '@/components/AuthScreen';

export default function PaywallScreen() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: '#f8fafc' }} />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <UserProvider>
      <PaywallContent />
    </UserProvider>
  );
}