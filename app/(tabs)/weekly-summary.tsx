import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { WeeklySummary } from '../../components/WeeklySummary';
import { useAuthContext } from '@/components/AuthProvider';
import AuthScreen from '@/components/AuthScreen';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { UserProvider, useUser } from '@/components/UserContext';
import { useRouter } from 'expo-router';

export default function WeeklySummaryScreen() {
  const { user, loading } = useAuthContext();
  const { subscription } = useUser();
  const router = useRouter();
  const [startDate] = useState<Date>(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    return start;
  });

  const [endDate] = useState<Date>(() => {
    return new Date();
  });

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
                <TouchableOpacity
                  style={{ position: 'absolute', top: 8, right: 6, zIndex: 10 }}
                  onPress={() => Linking.openURL('https://bolt.new/')}
                  activeOpacity={0.7}
                >
                  <Image
                    source={require('../../assets/images/black_circle_360x360.png')}
                    style={{ width: 56, height: 56 }}
                  />
                </TouchableOpacity>
                <View>
                  <Text style={styles.headerTitle}>Weekly Summary</Text>
                  <Text style={styles.headerSubtitle}>AI-powered insights from your journal</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Content */}
          <View style={styles.content}>
            <WeeklySummary startDate={startDate} endDate={endDate} />
          </View>
        </ScrollView>
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