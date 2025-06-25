import React from 'react';
import { View, StyleSheet, Text, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChatInterface } from '../../components/ChatInterface';
import { useAuthContext } from '@/components/AuthProvider';
import AuthScreen from '@/components/AuthScreen';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserProvider, useUser } from '@/components/UserContext';
import { useRouter } from 'expo-router';

export default function ChatScreen() {
  const { user, loading } = useAuthContext();
  const { subscription } = useUser();
  const router = useRouter();

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (!loading && subscription.plan !== 'pro') {
    router.replace('/paywall');
    return null;
  }

  return (
    <UserProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <Animated.View entering={FadeInUp} style={styles.headerContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.header}>
              <TouchableOpacity
                style={{ position: 'absolute', top: 10, right: 20, zIndex: 10 }}
                onPress={() => Linking.openURL('https://bolt.new/')}
                activeOpacity={0.7}
              >
                <Image
                  source={require('../../assets/images/black_circle_360x360.png')}
                  style={{ width: 56, height: 56 }}
                />
              </TouchableOpacity>
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
      </SafeAreaView>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
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