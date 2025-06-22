import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChatInterface } from '../../components/ChatInterface';
import { useAuthContext } from '@/components/AuthProvider';
import AuthScreen from '@/components/AuthScreen';
import Animated, { FadeInUp } from 'react-native-reanimated';

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
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <Animated.View entering={FadeInUp} style={styles.headerContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>AI Chat</Text>
                <Text style={styles.headerSubtitle}>Your personal growth companion</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Content */}
        <View style={styles.content}>
          <ChatInterface />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerContainer: {
    marginBottom: 24,
  },
  headerGradient: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#e2e8f0',
    lineHeight: 24,
  },
  content: {
    flex: 1,
  },
}); 