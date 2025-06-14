import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { BotpressService } from '../lib/botpress';
import { useAuth } from '../hooks/useAuth';

interface WeeklySummaryProps {
  startDate: Date;
  endDate: Date;
}

export const WeeklySummary: React.FC<WeeklySummaryProps> = ({ startDate, endDate }) => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchSummary = async () => {
      // Wait for auth to complete and ensure user exists with valid ID
      if (authLoading || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const botpressService = BotpressService.getInstance();
        const result = await botpressService.generateWeeklySummary(
          user.id,
          startDate,
          endDate
        );
        setSummary(result);
      } catch (err) {
        setError('Failed to generate weekly summary');
        console.error('Error generating weekly summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [startDate, endDate, user?.id, authLoading]);

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show message if no user is authenticated
  if (!user?.id) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Please log in to view your weekly summary</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Generating weekly summary...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Weekly Summary</Text>
        <Text style={styles.content}>{summary?.summary}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Key Insights</Text>
        {summary?.insights?.map((insight: string, index: number) => (
          <Text key={index} style={styles.insight}>
            • {insight}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Mood Analysis</Text>
        <Text style={styles.subtitle}>Average Mood: {summary?.moodAnalysis?.averageMood}/10</Text>
        <Text style={styles.subtitle}>Trend: {summary?.moodAnalysis?.moodTrend}</Text>
        
        <Text style={styles.subtitle}>Suggestions:</Text>
        {summary?.moodAnalysis?.suggestions?.map((suggestion: string, index: number) => (
          <Text key={index} style={styles.suggestion}>
            • {suggestion}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#444',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  insight: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginBottom: 8,
  },
  suggestion: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginBottom: 8,
    marginLeft: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    color: '#666',
  },
});