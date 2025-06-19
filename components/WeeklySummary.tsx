import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Platform } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Target, Activity, Award, ArrowRight, Sparkles, RefreshCw } from 'lucide-react-native';
import { AIService } from '../lib/ai-service';

interface WeeklySummaryProps {
  startDate: Date;
  endDate: Date;
}

// Default values for summary sections
const defaultSummary = {
  summary: 'No summary available',
  insights: [] as string[],
  moodAnalysis: {
    averageMood: 0,
    moodTrend: 'neutral',
    suggestions: [] as string[],
    moodDistribution: {} as Record<string, number>
  },
  habitAnalysis: {
    topHabits: [] as string[],
    habitSuggestions: [] as string[]
  },
  goalsProgress: {
    completed: 0,
    inProgress: 0,
    suggestions: [] as string[]
  },
  nextWeekRecommendations: {
    focusAreas: [] as string[],
    actionItems: [] as string[],
    habitGoals: [] as string[]
  }
};

// Helper function to ensure an array exists
const ensureArray = <T,>(arr: T[] | undefined | null): T[] => {
  return Array.isArray(arr) ? arr : [];
};

export const WeeklySummary: React.FC<WeeklySummaryProps> = ({ startDate, endDate }) => {
  const [summary, setSummary] = useState<typeof defaultSummary>(defaultSummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const aiService = AIService.getInstance();

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (authLoading) {
        return; // Wait for auth to complete
      }

      if (!user?.id) {
        throw new Error('Please sign in to view your weekly summary');
      }

      // Calculate the date range for the current week
      const now = new Date();
      const currentWeekStart = new Date(now);
      currentWeekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      currentWeekStart.setHours(0, 0, 0, 0);

      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setDate(currentWeekStart.getDate() + 6); // End of week (Saturday)
      currentWeekEnd.setHours(23, 59, 59, 999);

      console.log('Fetching summary for date range:', {
        start: currentWeekStart.toISOString(),
        end: currentWeekEnd.toISOString()
      });

      const result = await aiService.generateWeeklySummary(
        user.id,
        currentWeekStart,
        currentWeekEnd
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate weekly summary');
      }

      // Ensure all required properties exist and are of the correct type
      const safeResult = {
        summary: String(result.result?.summary || defaultSummary.summary),
        insights: ensureArray(result.result?.insights).map(String),
        moodAnalysis: {
          averageMood: Number(result.result?.moodAnalysis?.averageMood ?? defaultSummary.moodAnalysis.averageMood),
          moodTrend: String(result.result?.moodAnalysis?.moodTrend || defaultSummary.moodAnalysis.moodTrend),
          suggestions: ensureArray(result.result?.moodAnalysis?.suggestions).map(String),
          moodDistribution: result.result?.moodAnalysis?.moodDistribution || defaultSummary.moodAnalysis.moodDistribution
        },
        habitAnalysis: {
          topHabits: ensureArray(result.result?.habitAnalysis?.topHabits).map(String),
          habitSuggestions: ensureArray(result.result?.habitAnalysis?.habitSuggestions).map(String)
        },
        goalsProgress: {
          completed: Number(result.result?.goalsProgress?.completed ?? defaultSummary.goalsProgress.completed),
          inProgress: Number(result.result?.goalsProgress?.inProgress ?? defaultSummary.goalsProgress.inProgress),
          suggestions: ensureArray(result.result?.goalsProgress?.suggestions).map(String)
        },
        nextWeekRecommendations: {
          focusAreas: ensureArray(result.result?.nextWeekRecommendations?.focusAreas).map(String),
          actionItems: ensureArray(result.result?.nextWeekRecommendations?.actionItems).map(String),
          habitGoals: ensureArray(result.result?.nextWeekRecommendations?.habitGoals).map(String)
        }
      };

      setSummary(safeResult);
    } catch (err) {
      console.error('Error fetching summary:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate weekly summary';
      setError(errorMessage);
      Alert.alert(
        'Error',
        errorMessage,
        [
          {
            text: 'Retry',
            onPress: fetchSummary
          },
          {
            text: 'OK',
            style: 'cancel'
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, user?.id, authLoading]);

  useEffect(() => {
    if (!authLoading) {
      fetchSummary();
    }
  }, [fetchSummary, authLoading]);

  if (authLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading authentication...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Generating your weekly summary...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchSummary}>
          <RefreshCw size={20} color="#fff" />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Overall Summary Section */}
      <View style={styles.section}>
        <View style={[styles.gradientCard, { backgroundColor: '#f0f9ff' }]}>
          <View style={styles.sectionHeader}>
            <Sparkles size={20} color="#0ea5e9" />
            <Text style={styles.title}>Weekly Summary</Text>
          </View>
          <Text style={styles.content}>{summary.summary}</Text>
        </View>
      </View>

      {/* Key Insights Section */}
      <View style={styles.section}>
        <View style={[styles.gradientCard, { backgroundColor: '#faf5ff' }]}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color="#8b5cf6" />
            <Text style={styles.title}>Key Insights</Text>
          </View>
          {summary.insights.map((insight: string, index: number) => (
            <Text key={index} style={styles.insight}>
              • {insight}
            </Text>
          ))}
        </View>
      </View>

      {/* Mood Analysis Section */}
      <View style={styles.section}>
        <View style={[styles.gradientCard, { backgroundColor: '#f0fdf4' }]}>
          <View style={styles.sectionHeader}>
            <Activity size={20} color="#22c55e" />
            <Text style={styles.title}>Mood Analysis</Text>
          </View>
          <Text style={styles.subtitle}>Average Mood: {summary.moodAnalysis.averageMood}/10</Text>
          <Text style={styles.subtitle}>Trend: {summary.moodAnalysis.moodTrend}</Text>
          
          <View style={styles.moodDistribution}>
            {Object.entries(summary.moodAnalysis.moodDistribution).map(([mood, count]) => (
              <View key={mood} style={styles.moodBar}>
                <Text style={styles.moodLabel}>Mood {mood}</Text>
                <View style={styles.moodBarContainer}>
                  <View 
                    style={[
                      styles.moodBarFill,
                      { width: `${(Number(count) / Math.max(Object.keys(summary.moodAnalysis.moodDistribution).length, 1)) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.moodCount}>{String(count)}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.subtitle}>Suggestions:</Text>
          {summary.moodAnalysis.suggestions.map((suggestion: string, index: number) => (
            <Text key={index} style={styles.suggestion}>
              • {suggestion}
            </Text>
          ))}
        </View>
      </View>

      {/* Habit Analysis Section */}
      <View style={styles.section}>
        <View style={[styles.gradientCard, { backgroundColor: '#fff7ed' }]}>
          <View style={styles.sectionHeader}>
            <Target size={20} color="#f97316" />
            <Text style={styles.title}>Habit Analysis</Text>
          </View>
          
          <Text style={styles.subtitle}>Top Habits:</Text>
          {summary.habitAnalysis.topHabits.map((habit: string, index: number) => (
            <Text key={index} style={styles.habit}>
              • {habit}
            </Text>
          ))}

          <Text style={styles.subtitle}>Suggestions:</Text>
          {summary.habitAnalysis.habitSuggestions.map((suggestion: string, index: number) => (
            <Text key={index} style={styles.suggestion}>
              • {suggestion}
            </Text>
          ))}
        </View>
      </View>

      {/* Goals Progress Section */}
      <View style={styles.section}>
        <View style={[styles.gradientCard, { backgroundColor: '#fef2f2' }]}>
          <View style={styles.sectionHeader}>
            <Award size={20} color="#ef4444" />
            <Text style={styles.title}>Goals Progress</Text>
          </View>
          
          <Text style={styles.subtitle}>Completed: {summary.goalsProgress.completed}</Text>
          <Text style={styles.subtitle}>In Progress: {summary.goalsProgress.inProgress}</Text>

          <Text style={styles.subtitle}>Suggestions:</Text>
          {summary.goalsProgress.suggestions.map((suggestion: string, index: number) => (
            <Text key={index} style={styles.suggestion}>
              • {suggestion}
            </Text>
          ))}
        </View>
      </View>

      {/* Next Week Recommendations Section */}
      <View style={styles.section}>
        <View style={[styles.gradientCard, { backgroundColor: '#f8fafc' }]}>
          <View style={styles.sectionHeader}>
            <ArrowRight size={20} color="#64748b" />
            <Text style={styles.title}>Next Week's Focus</Text>
          </View>
          
          <Text style={styles.subtitle}>Focus Areas:</Text>
          {summary.nextWeekRecommendations.focusAreas.map((area: string, index: number) => (
            <Text key={index} style={styles.focusArea}>
              • {area}
            </Text>
          ))}

          <Text style={styles.subtitle}>Action Items:</Text>
          {summary.nextWeekRecommendations.actionItems.map((item: string, index: number) => (
            <Text key={index} style={styles.actionItem}>
              • {item}
            </Text>
          ))}

          <Text style={styles.subtitle}>Habit Goals:</Text>
          {summary.nextWeekRecommendations.habitGoals.map((goal: string, index: number) => (
            <Text key={index} style={styles.habitGoal}>
              • {goal}
            </Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 16,
  },
  gradientCard: {
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#475569',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginTop: 12,
    marginBottom: 8,
  },
  insight: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
    marginBottom: 8,
    marginLeft: 8,
  },
  moodDistribution: {
    marginTop: 12,
  },
  moodBar: {
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  moodBarContainer: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  moodBarFill: {
    height: '100%',
    backgroundColor: '#0ea5e9',
    borderRadius: 4,
  },
  moodCount: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  suggestion: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
    marginBottom: 8,
    marginLeft: 8,
  },
  habit: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
    marginBottom: 8,
    marginLeft: 8,
  },
  focusArea: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
    marginBottom: 8,
    marginLeft: 8,
  },
  actionItem: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
    marginBottom: 8,
    marginLeft: 8,
  },
  habitGoal: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
    marginBottom: 8,
    marginLeft: 8,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 