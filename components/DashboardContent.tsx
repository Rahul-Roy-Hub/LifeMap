import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Calendar, Target, Sparkles, ChartBar as BarChart3, Activity, Award, ArrowRight } from 'lucide-react-native';
import { useUser } from '@/components/UserContext';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';
import PieChart from 'react-native-pie-chart';

const { width } = Dimensions.get('window');

type Goal = {
  id: string;
  title: string;
  habit: string;
  target: number;
};

export default function DashboardContent() {
  const { entries, subscription, getWeeklySummary } = useUser();

  const thisWeekEntries = getThisWeekEntries(entries);
  const averageMood = thisWeekEntries.length > 0 
    ? thisWeekEntries.reduce((sum, entry) => sum + entry.mood, 0) / thisWeekEntries.length
    : 0;

  const habitStats = getHabitStats(thisWeekEntries);
  // Only show these habits in Habit Progress
  const allowedHabits = ['Exercise', 'Meditation', 'Reading', 'Healthy Eating', 'Early Sleep', 'Gratitude'];
  const filteredHabitStats = Object.fromEntries(
    Object.entries(habitStats).filter(([habit]) => allowedHabits.includes(habit))
  );
  const moodTrend = getMoodTrend(entries);
  const streakCount = getStreakCount(entries);

  // Pie chart data for habits
  const pieColors = ['#10b981', '#f59e42', '#6366f1', '#f43f5e', '#eab308', '#22c55e', '#8b5cf6'];
  const pieLabels = Object.keys(habitStats);
  const pieSeries = Object.values(habitStats).map((value, idx) => ({
    value,
    color: pieColors[idx % pieColors.length],
  }));

  // Goal Progress pie chart uses Habit Progress data
  const goalPieSeries = Object.entries(filteredHabitStats).map(([habit, count], idx) => ({
    value: Math.min(Math.round((count / 7) * 100), 100),
    color: pieColors[idx % pieColors.length],
    name: habit,
    id: habit,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Enhanced Header */}
        <Animated.View entering={FadeInUp} style={styles.headerContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>Dashboard</Text>
                <Text style={styles.headerSubtitle}>Your personal growth insights</Text>
              </View>
              <View style={styles.headerStats}>
                <Text style={styles.headerStatsNumber}>{entries.length}</Text>
                <Text style={styles.headerStatsLabel}>Total Entries</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Enhanced Subscription Status */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.subscriptionContainer}>
          <LinearGradient
            colors={subscription.plan === 'pro' ? ['#fef3c7', '#fde68a'] : ['#dbeafe', '#bfdbfe']}
            style={styles.subscriptionCard}
          >
            <View style={styles.subscriptionHeader}>
              <View style={styles.subscriptionTitleContainer}>
                {subscription.plan === 'pro' && <Sparkles size={20} color="#f59e0b" />}
                <Text style={styles.subscriptionTitle}>
                  {subscription.plan === 'pro' ? 'LifeMap Pro' : 'LifeMap Free'}
                </Text>
              </View>
              {subscription.plan === 'free' && (
                <TouchableOpacity 
                  style={styles.upgradeButton}
                  onPress={() => router.push('/paywall')}
                >
                  <Text style={styles.upgradeButtonText}>Upgrade</Text>
                  <ArrowRight size={14} color="#ffffff" />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.subscriptionText}>
              {subscription.plan === 'pro' 
                ? `${subscription.entriesThisMonth}/${subscription.maxEntriesPerMonth} entries this month • AI insights • Custom domains`
                : `${subscription.entriesThisMonth}/${subscription.maxEntriesPerMonth} entries this month • 1 daily entry (editable)`
              }
            </Text>
            <View style={styles.usageBar}>
              <View style={[
                styles.usageBarFill,
                { width: `${Math.min((subscription.entriesThisMonth / subscription.maxEntriesPerMonth) * 100, 100)}%` }
              ]} />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Key Metrics Grid */}
        <Animated.View entering={SlideInRight.delay(200)} style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <LinearGradient
              colors={['#fef2f2', '#fee2e2']}
              style={styles.metricGradient}
            >
              <View style={styles.metricIcon}>
                <Activity size={24} color="#ef4444" />
              </View>
              <Text style={styles.metricValue}>
                {averageMood > 0 ? averageMood.toFixed(1) : 'N/A'}
              </Text>
              <Text style={styles.metricLabel}>Avg Mood</Text>
              <Text style={styles.metricTrend}>{moodTrend}</Text>
            </LinearGradient>
          </View>

          <View style={styles.metricCard}>
            <LinearGradient
              colors={['#f0fdf4', '#dcfce7']}
              style={styles.metricGradient}
            >
              <View style={styles.metricIcon}>
                <Award size={24} color="#22c55e" />
              </View>
              <Text style={styles.metricValue}>{streakCount}</Text>
              <Text style={styles.metricLabel}>Day Streak</Text>
              <Text style={styles.metricTrend}>
                {streakCount >= 7 ? '🔥 On fire!' : streakCount >= 3 ? '📈 Building' : '🌱 Starting'}
              </Text>
            </LinearGradient>
          </View>

          <View style={styles.metricCard}>
            <LinearGradient
              colors={['#faf5ff', '#f3e8ff']}
              style={styles.metricGradient}
            >
              <View style={styles.metricIcon}>
                <Target size={24} color="#8b5cf6" />
              </View>
              <Text style={styles.metricValue}>{thisWeekEntries.length}</Text>
              <Text style={styles.metricLabel}>This Week</Text>
              <Text style={styles.metricTrend}>
                {thisWeekEntries.length >= 5 ? '🎯 Excellent' : thisWeekEntries.length >= 3 ? '👍 Good' : '💪 Keep going'}
              </Text>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Enhanced Mood Overview */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>Mood Analysis</Text>
          <View style={styles.moodCard}>
            <View style={styles.moodDisplay}>
              <Text style={styles.moodEmoji}>{getMoodEmoji(averageMood)}</Text>
              <View style={styles.moodInfo}>
                <Text style={styles.moodValue}>
                  {averageMood > 0 ? averageMood.toFixed(1) : 'N/A'}
                </Text>
                <Text style={styles.moodLabel}>Weekly Average</Text>
              </View>
            </View>
            
            <View style={styles.moodBreakdown}>
              {[5, 4, 3, 2, 1].map(mood => {
                const count = thisWeekEntries.filter(entry => entry.mood === mood).length;
                const percentage = thisWeekEntries.length > 0 ? (count / thisWeekEntries.length) * 100 : 0;
                return (
                  <View key={mood} style={styles.moodBreakdownItem}>
                    <Text style={styles.moodBreakdownEmoji}>{getMoodEmoji(mood)}</Text>
                    <View style={styles.moodBreakdownBar}>
                      <View style={[
                        styles.moodBreakdownFill,
                        { width: `${percentage}%`, backgroundColor: getMoodColor(mood) }
                      ]} />
                    </View>
                    <Text style={styles.moodBreakdownCount}>{count}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </Animated.View>

        {/* Enhanced Habit Tracking */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Habit Progress</Text>
            <Text style={styles.sectionSubtitle}>This week's consistency</Text>
          </View>
          <View style={styles.habitsList}>
            {Object.entries(filteredHabitStats).map(([habit, count], index) => (
              <Animated.View 
                key={habit} 
                entering={FadeInDown.delay(500 + index * 50)}
                style={styles.habitItem}
              >
                <View style={styles.habitInfo}>
                  <View style={styles.habitIconContainer}>
                    <Text style={styles.habitIcon}>{getHabitIcon(habit)}</Text>
                  </View>
                  <View style={styles.habitDetails}>
                    <Text style={styles.habitName}>{habit}</Text>
                    <Text style={styles.habitCount}>{count}/7 days</Text>
                  </View>
                </View>
                <View style={styles.habitProgressContainer}>
                  <View style={styles.habitProgress}>
                    <View style={[
                      styles.habitProgressBar,
                      { 
                        width: `${(count / 7) * 100}%`,
                        backgroundColor: getHabitColor(count)
                      }
                    ]} />
                  </View>
                  <Text style={styles.habitPercentage}>{Math.round((count / 7) * 100)}%</Text>
                </View>
              </Animated.View>
            ))}
            {Object.keys(filteredHabitStats).length === 0 && (
              <View style={styles.emptyHabits}>
                <BarChart3 size={48} color="#d1d5db" />
                <Text style={styles.emptyHabitsTitle}>No habit data yet</Text>
                <Text style={styles.emptyHabitsText}>Start logging entries to see your progress!</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* AI Summary (Pro Feature) */}
        {subscription.plan === 'pro' && (
          <Animated.View entering={FadeInDown.delay(500)} style={styles.section}>
            <Text style={styles.sectionTitle}>AI Weekly Summary</Text>
            <View style={styles.summaryCard}>
              <LinearGradient
                colors={['#f0f9ff', '#e0f2fe']}
                style={styles.summaryGradient}
              >
                <View style={styles.summaryHeader}>
                  <Sparkles size={20} color="#0ea5e9" />
                  <Text style={styles.summaryTitle}>Personalized Insights</Text>
                  <View style={styles.aiPoweredBadge}>
                    <Text style={styles.aiPoweredText}>AI</Text>
                  </View>
                </View>
                <Text style={styles.summaryText}>{getWeeklySummary()}</Text>
              </LinearGradient>
            </View>
          </Animated.View>
        )}

        {/* Pie Chart for Goal Progress */}
        {goalPieSeries.length > 0 && (
          <View style={{ alignItems: 'center', marginVertical: 24 }}>
            <Text style={{ fontSize: 26, fontWeight: 'bold', marginBottom: 12 }}>Goal Progress</Text>
            <PieChart
              widthAndHeight={160}
              series={goalPieSeries}
            />
            {/* Habit completion summary */}
            {Object.entries(filteredHabitStats).length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
                {Object.entries(filteredHabitStats).map(([habit, count], idx) => (
                  <View key={habit} style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 8, marginBottom: 4 }}>
                    <View style={{ width: 12, height: 12, backgroundColor: pieColors[idx % pieColors.length], borderRadius: 6, marginRight: 6 }} />
                    <Text style={{ fontWeight: 'bold', color: '#374151', marginRight: 4 }}>{habit}:</Text>
                    <Text
                      style={{
                        backgroundColor: '#6366f1',
                        color: '#fff',
                        borderRadius: 12,
                        paddingHorizontal: 10,
                        paddingVertical: 2,
                        fontWeight: 'bold',
                        fontSize: 14,
                        overflow: 'hidden',
                        marginLeft: 2,
                      }}
                    >
                      {count}x
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper functions
function getThisWeekEntries(entries: any[]) {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  startOfWeek.setHours(0, 0, 0, 0);
  
  return entries.filter(entry => 
    new Date(entry.created_at) >= startOfWeek
  );
}

function getHabitStats(entries: any[]) {
  const habitCounts: { [key: string]: number } = {};
  
  entries.forEach(entry => {
    Object.entries(entry.habits).forEach(([habit, completed]) => {
      if (completed) {
        habitCounts[habit] = (habitCounts[habit] || 0) + 1;
      }
    });
  });
  
  return habitCounts;
}

function getMoodTrend(entries: any[]): string {
  if (entries.length < 2) return 'Not enough data';
  
  const recent = entries.slice(0, 3);
  const older = entries.slice(3, 6);
  
  if (recent.length === 0 || older.length === 0) return 'Not enough data';
  
  const recentAvg = recent.reduce((sum, entry) => sum + entry.mood, 0) / recent.length;
  const olderAvg = older.reduce((sum, entry) => sum + entry.mood, 0) / older.length;
  
  if (recentAvg > olderAvg) return '📈 Improving';
  if (recentAvg < olderAvg) return '📉 Declining';
  return '➡️ Stable';
}

function getStreakCount(entries: any[]): number {
  if (entries.length === 0) return 0;
  
  let streak = 0;
  const today = new Date();
  // Helper to format date as YYYY-MM-DD
  const formatDateForDatabase = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const checkDateString = formatDateForDatabase(checkDate);
    const hasEntry = entries.some(entry => entry.date === checkDateString);
    if (hasEntry) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function getMoodEmoji(mood: number): string {
  if (mood >= 4.5) return '😄';
  if (mood >= 3.5) return '😊';
  if (mood >= 2.5) return '😐';
  if (mood >= 1.5) return '😔';
  return '😞';
}

function getMoodColor(mood: number): string {
  if (mood >= 4.5) return '#10b981';
  if (mood >= 3.5) return '#22c55e';
  if (mood >= 2.5) return '#eab308';
  if (mood >= 1.5) return '#f97316';
  return '#ef4444';
}

function getHabitIcon(habit: string): string {
  const icons: { [key: string]: string } = {
    'Exercise': '💪',
    'Meditation': '🧘',
    'Reading': '📚',
    'Healthy Eating': '🥗',
    'Early Sleep': '😴',
    'Gratitude': '🙏',
  };
  return icons[habit] || '✅';
}

function getHabitColor(count: number): string {
  if (count >= 6) return '#10b981';
  if (count >= 4) return '#22c55e';
  if (count >= 2) return '#eab308';
  return '#ef4444';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  headerContainer: {
    marginBottom: 24,
  },
  headerGradient: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#e2e8f0',
    marginTop: 4,
  },
  headerStats: {
    alignItems: 'center',
  },
  headerStatsNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  headerStatsLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#e2e8f0',
  },
  subscriptionContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  subscriptionCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  subscriptionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
  },
  upgradeButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  subscriptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    marginBottom: 12,
  },
  usageBar: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  usageBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  metricsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  metricGradient: {
    padding: 16,
    alignItems: 'center',
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#64748b',
    marginBottom: 4,
  },
  metricTrend: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#667eea',
  },
  moodCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  moodDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  moodEmoji: {
    fontSize: 48,
    marginRight: 20,
  },
  moodInfo: {
    flex: 1,
  },
  moodValue: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
  },
  moodLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  moodBreakdown: {
    gap: 8,
  },
  moodBreakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  moodBreakdownEmoji: {
    fontSize: 16,
    width: 20,
  },
  moodBreakdownBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  moodBreakdownFill: {
    height: '100%',
    borderRadius: 3,
  },
  moodBreakdownCount: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#64748b',
    width: 20,
    textAlign: 'center',
  },
  habitsList: {
    paddingHorizontal: 20,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  habitIcon: {
    fontSize: 18,
  },
  habitDetails: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  habitCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  habitProgressContainer: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  habitProgress: {
    width: 60,
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  habitProgressBar: {
    height: '100%',
    borderRadius: 3,
  },
  habitPercentage: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#64748b',
  },
  emptyHabits: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyHabitsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6b7280',
    marginTop: 16,
  },
  emptyHabitsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  summaryCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryGradient: {
    padding: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    marginLeft: 8,
    flex: 1,
  },
  aiPoweredBadge: {
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  aiPoweredText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  summaryText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 24,
  },
});