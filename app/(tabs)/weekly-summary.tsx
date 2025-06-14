import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { WeeklySummary } from '../../components/WeeklySummary';

export default function WeeklySummaryScreen() {
  const [startDate, setStartDate] = useState<Date>(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    return start;
  });

  const [endDate, setEndDate] = useState<Date>(() => {
    return new Date();
  });

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