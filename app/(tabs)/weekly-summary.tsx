import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WeeklySummary } from '../../components/WeeklySummary';
import { useAuthContext } from '@/components/AuthProvider';
import AuthScreen from '@/components/AuthScreen';

export default function WeeklySummaryScreen() {
  const { user, loading } = useAuthContext();
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

  return (
    <View style={styles.container}>
      <WeeklySummary startDate={startDate} endDate={endDate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); 