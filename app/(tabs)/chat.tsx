import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ChatInterface } from '../../components/ChatInterface';
import { useAuthContext } from '@/components/AuthProvider';
import AuthScreen from '@/components/AuthScreen';

export default function ChatScreen() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <View style={styles.container}>
      <ChatInterface />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); 