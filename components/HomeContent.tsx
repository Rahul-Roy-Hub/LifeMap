import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Platform, ColorValue } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Heart, Target, TrendingUp, Calendar, Sparkles, ArrowRight, Zap, Award, Activity, User, CreditCard as Edit } from 'lucide-react-native';
import { router, useRouter } from 'expo-router';
import { useUser } from '@/components/UserContext';
import { useAuthContext } from '@/components/AuthProvider';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, SlideInRight, useSharedValue, useAnimatedStyle, withSpring, withRepeat, withTiming } from 'react-native-reanimated';
import { useEffect, useState, useCallback } from 'react';
import { Database } from '@/types/database';
import * as Location from 'expo-location';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');

type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];
type Json = Database['public']['Tables']['journal_entries']['Row']['habits'];

// Helper function to format date consistently
const formatDateForDatabase = (date: Date): string => {
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
};

// Helper function to safely parse habits
function isPlainObject(obj: unknown): obj is { [key: string]: boolean } {
  return !!obj && typeof obj === 'object' && !Array.isArray(obj);
}

const parseHabits = (habits: Json): Record<string, boolean> => {
  if (!isPlainObject(habits)) return {};
  return Object.fromEntries(
    Object.entries(habits).map(([key, value]) => [key, Boolean(value)])
  );
};

// Define gradient colors as readonly tuples
const gradientColors = {
  red: ['#fef2f2', '#fee2e2'] as const,
  green: ['#f0fdf4', '#dcfce7'] as const,
  purple: ['#faf5ff', '#f3e8ff'] as const,
  blue: ['#f0f9ff', '#e0f2fe'] as const,
  premium: ['#667eea', '#764ba2'] as const,
  disabled: ['#9ca3af', '#6b7280'] as const
};

// Helper function to convert to IST (UTC+5:30) without using toLocaleString timeZone
const convertToIST = (date: Date): Date => {
  const IST_OFFSET = 330; // in minutes
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  return new Date(utc + (IST_OFFSET * 60000));
};

export default function HomeContent() {
  const { subscription, entries, getWeeklySummary, getTodaysEntry } = useUser();
  const { profile } = useAuthContext();
  const router = useRouter();
  
  // Get today's entry
  const todaysEntry = getTodaysEntry();
  const hasEntryToday = !!todaysEntry;

  // Animated values for micro-interactions
  const pulseValue = useSharedValue(1);
  const sparkleRotation = useSharedValue(0);

  // Weather state
  const [weather, setWeather] = useState<null | {
    temp: number;
    description: string;
    icon: string;
    city: string;
  }>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  useEffect(() => {
    // Pulse animation for the add entry button
    pulseValue.value = withRepeat(
      withTiming(1.05, { duration: 2000 }),
      -1,
      true
    );

    // Sparkle rotation animation
    sparkleRotation.value = withRepeat(
      withTiming(360, { duration: 3000 }),
      -1,
      false
    );

    // Fetch weather on mount
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setWeatherError('Permission to access location was denied');
          return;
        }
        let location = await Location.getCurrentPositionAsync({});
        const lat = location.coords.latitude;
        const lon = location.coords.longitude;
        // Call your backend proxy instead of OpenWeatherMap directly
        const url = `http://192.168.0.115:5000/api/weather?lat=${lat}&lon=${lon}`;
        const response = await fetch(url);
        const data = await response.json();
        console.log('Weather API response:', data);
        if (data && data.weather && data.weather.length > 0) {
          setWeather({
            temp: data.main.temp,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            city: data.name,
          });
        } else {
          setWeatherError('Unable to fetch weather');
        }
      } catch (e) {
        setWeatherError('Unable to fetch weather');
      }
    })();
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sparkleRotation.value}deg` }],
  }));

  const handleEntryAction = () => {
    router.push('/entry');
  };

  const getAverageMood = (): number => {
    if (entries.length === 0) return 0;
    const totalMood = entries.reduce((sum, entry) => sum + entry.mood, 0);
    return totalMood / entries.length;
  };

  const getStreakCount = (): number => {
    if (entries.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    
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
  };

  const getMotivationalMessage = (): string => {
    const streak = getStreakCount();
    const avgMood = getAverageMood();
    
    if (hasEntryToday) {
      return "Great job on today's reflection! You can edit it anytime. ✨";
    }
    if (streak >= 7) return "Amazing streak! Time for today's reflection 🔥";
    if (streak >= 3) return "Great momentum! Don't break the streak ⭐";
    if (avgMood >= 4) return "Your positive energy is inspiring! ✨";
    if (entries.length === 0) return "Welcome to your growth journey! 🌱";
    return "Every entry is a step forward. You've got this! 💪";
  };

  const getInsightCard = () => {
    const streak = getStreakCount();
    const avgMood = getAverageMood();
    const thisWeekEntries = entries.filter(entry => {
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      startOfWeek.setHours(0, 0, 0, 0);
      const startOfWeekString = formatDateForDatabase(startOfWeek);
      return entry.date >= startOfWeekString;
    });

    if (streak >= 7) {
      return {
        icon: <Award size={24} color="#f59e0b" />,
        title: "Streak Master!",
        description: `${streak} days of consistent journaling`,
        color: ['#fef3c7', '#fde68a'],
        textColor: '#92400e'
      };
    }

    if (avgMood >= 4) {
      return {
        icon: <Activity size={24} color="#10b981" />,
        title: "Positive Vibes",
        description: `Your average mood is ${avgMood.toFixed(1)}/5`,
        color: ['#d1fae5', '#a7f3d0'],
        textColor: '#065f46'
      };
    }

    if (thisWeekEntries.length >= 5) {
      return {
        icon: <Zap size={24} color="#8b5cf6" />,
        title: "Weekly Champion",
        description: `${thisWeekEntries.length} entries this week`,
        color: ['#ede9fe', '#ddd6fe'],
        textColor: '#5b21b6'
      };
    }

    return {
      icon: <Target size={24} color="#3b82f6" />,
      title: "Keep Growing",
      description: "Your journey is just beginning",
      color: ['#dbeafe', '#bfdbfe'],
      textColor: '#1e40af'
    };
  };

  const insightCard = getInsightCard();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Enhanced Header with Gradient and Profile */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.headerContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={styles.greeting}>Good {getTimeOfDay()}</Text>
                <Text style={styles.welcomeText}>{getMotivationalMessage()}</Text>
                
                {/* Weather-like mood indicator */}
                <View style={styles.moodWeather}>
                  {/* Real-time weather display */}
                  {weather ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                      <Image
                        source={{ uri: `https://openweathermap.org/img/wn/${weather.icon}@2x.png` }}
                        style={{ width: 32, height: 32, marginRight: 4 }}
                      />
                      <Text style={{ color: '#fff', fontFamily: 'Inter-Medium', fontSize: 14, marginRight: 4 }}>
                        {Math.round(weather.temp)}°C
                      </Text>
                      <Text style={{ color: '#fff', fontFamily: 'Inter-Regular', fontSize: 13, textTransform: 'capitalize' }}>
                        {weather.description}
                      </Text>
                    </View>
                  ) : weatherError ? (
                    <Text style={{ color: '#fff', fontSize: 12, marginRight: 8 }}>{weatherError}</Text>
                  ) : null}
                  {/* Mood-based indicator (keep as well) */}
                  <Text style={styles.moodWeatherEmoji}>
                    {getAverageMood() >= 4 ? '☀️' : getAverageMood() >= 3 ? '⛅' : '🌧️'}
                  </Text>
                  <Text style={styles.moodWeatherText}>
                    {getAverageMood() >= 4 ? 'Sunny mood' : getAverageMood() >= 3 ? 'Partly cloudy' : 'Stormy weather'}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.profileContainer}
                onPress={() => router.push('/profile-edit')}
              >
                {profile?.avatar_url ? (
                  <Image 
                    source={{ uri: profile.avatar_url }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <User size={24} color="#ffffff" />
                  </View>
                )}
                {subscription.plan === 'pro' && (
                  <Animated.View style={[styles.proBadge, sparkleStyle]}>
                    <Sparkles size={12} color="#fbbf24" />
                  </Animated.View>
                )}
                <View style={styles.streakBadge}>
                  <Text style={styles.streakBadgeText}>{getStreakCount()}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Today's Entry Card with Enhanced Design */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.entryCardContainer}>
          {hasEntryToday ? (
            <View style={styles.entryCard}>
              <LinearGradient
                colors={['#ffffff', '#f8fafc']}
                style={styles.entryCardGradient}
              >
                <View style={styles.entryCardHeader}>
                  <View style={styles.entryCardTitleContainer}>
                    <Calendar size={20} color="#667eea" />
                    <Text style={styles.cardTitle}>Today's Reflection</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={handleEntryAction}
                  >
                    <Edit size={16} color="#667eea" />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.entryPreview}>
                  <View style={styles.moodDisplayContainer}>
                    <Text style={styles.moodDisplay}>{todaysEntry.mood_emoji}</Text>
                    <View style={styles.moodRating}>
                      {[...Array(5)].map((_, i) => (
                        <View
                          key={i}
                          style={[
                            styles.moodStar,
                            i < todaysEntry.mood && styles.moodStarFilled
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                  
                  <View style={styles.entryDetails}>
                    <Text style={styles.entryDecision} numberOfLines={2}>
                      {todaysEntry.decision}
                    </Text>
                    <View style={styles.entryMeta}>
                      <Text style={styles.entryTime}>
                        {(() => {
                          const istDate = convertToIST(new Date(todaysEntry.created_at));
                          return istDate.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          });
                        })()}
                      </Text>
                      <View style={styles.habitSummary}>
                        <Text style={styles.habitSummaryText}>
                          {Object.values(parseHabits(todaysEntry.habits)).filter(Boolean).length} habits completed
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>
          ) : (
            <Animated.View style={pulseStyle}>
              <TouchableOpacity style={styles.addEntryCard} onPress={handleEntryAction}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.addEntryGradient}
                >
                  <View style={styles.addEntryIcon}>
                    <Plus size={32} color="#ffffff" />
                  </View>
                  <Text style={styles.addEntryText}>Start Today's Entry</Text>
                  <Text style={styles.addEntrySubtext}>
                    Create your daily reflection and track your growth
                  </Text>
                  <ArrowRight size={20} color="#ffffff" style={styles.addEntryArrow} />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>

        {/* Enhanced Stats Grid with Better Visual Hierarchy */}
        <Animated.View entering={SlideInRight.delay(300)} style={styles.statsContainer}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={gradientColors.red}
              style={styles.statGradient}
            >
              <View style={styles.statIconContainer}>
                <Heart size={24} color="#ef4444" />
              </View>
              <Text style={styles.statNumber}>{entries.length}</Text>
              <Text style={styles.statLabel}>Total Entries</Text>
              <View style={styles.statProgress}>
                <View style={[styles.statProgressBar, { width: `${Math.min((entries.length / 50) * 100, 100)}%`, backgroundColor: '#ef4444' }]} />
              </View>
              <Text style={styles.statSubtext}>
                {entries.length >= 50 ? 'Master level!' : `${50 - entries.length} to master`}
              </Text>
            </LinearGradient>
          </View>
          
          <View style={styles.statCard}>
            <LinearGradient
              colors={gradientColors.green}
              style={styles.statGradient}
            >
              <View style={styles.statIconContainer}>
                <Target size={24} color="#10b981" />
              </View>
              <Text style={styles.statNumber}>{getStreakCount()}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
              <View style={styles.statProgress}>
                <View style={[styles.statProgressBar, { width: `${Math.min((getStreakCount() / 30) * 100, 100)}%`, backgroundColor: '#10b981' }]} />
              </View>
              <Text style={styles.statSubtext}>
                {getStreakCount() >= 30 ? 'Legendary!' : `${30 - getStreakCount()} to legend`}
              </Text>
            </LinearGradient>
          </View>
          
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#faf5ff', '#f3e8ff']}
              style={styles.statGradient}
            >
              <View style={styles.statIconContainer}>
                <TrendingUp size={24} color="#8b5cf6" />
              </View>
              <Text style={styles.statNumber}>
                {getAverageMood().toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>Avg Mood</Text>
              <View style={styles.statProgress}>
                <View style={[styles.statProgressBar, { width: `${(getAverageMood() / 5) * 100}%`, backgroundColor: '#8b5cf6' }]} />
              </View>
              <Text style={styles.statSubtext}>
                {getAverageMood() >= 4 ? 'Excellent!' : getAverageMood() >= 3 ? 'Good' : 'Improving'}
              </Text>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Dynamic Insight Card */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.insightCardContainer}>
          <LinearGradient
            colors={insightCard.color as [ColorValue, ColorValue]}
            style={styles.insightCard}
          >
            <View style={styles.insightHeader}>
              {insightCard.icon}
              <Text style={[styles.insightTitle, { color: insightCard.textColor }]}>
                {insightCard.title}
              </Text>
            </View>
            <Text style={[styles.insightDescription, { color: insightCard.textColor }]}>
              {insightCard.description}
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Weekly Summary (Pro Feature) with Enhanced Design */}
        {subscription.plan === 'pro' && (
          <Animated.View entering={FadeInDown.delay(500)} style={styles.summaryCard}>
            <LinearGradient
              colors={['#f0f9ff', '#e0f2fe']}
              style={styles.summaryGradient}
            >
              <View style={styles.summaryHeader}>
                <Animated.View style={sparkleStyle}>
                  <Sparkles size={20} color="#0ea5e9" />
                </Animated.View>
                <Text style={styles.cardTitle}>AI Weekly Summary</Text>
                <View style={styles.aiPoweredBadge}>
                  <Text style={styles.aiPoweredText}>AI Powered</Text>
                </View>
              </View>
              <Text style={styles.summaryText}>{getWeeklySummary()}</Text>
              <TouchableOpacity style={styles.summaryAction}>
                <Text style={styles.summaryActionText}>View Full Analysis</Text>
                <ArrowRight size={16} color="#0ea5e9" />
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Recent Entries with Enhanced Design */}
        <Animated.View entering={FadeInDown.delay(600)} style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Reflections</Text>
            <TouchableOpacity style={styles.viewAllButton} onPress={() => router.push('/all-entries')}>
              <Text style={styles.viewAllText}>View All</Text>
              <ArrowRight size={16} color="#667eea" />
            </TouchableOpacity>
          </View>
          
          {entries.slice(0, 3).map((entry, index) => {
            const habits = parseHabits(entry.habits);
            return (
              <Animated.View 
                key={entry.id} 
                entering={FadeInDown.delay(700 + index * 100)}
                style={styles.recentEntry}
              >
                <View style={styles.recentEntryDate}>
                  <Text style={styles.recentEntryDay}>
                    {new Date(entry.created_at).getDate()}
                  </Text>
                  <Text style={styles.recentEntryMonth}>
                    {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short' })}
                  </Text>
                </View>
                
                <View style={styles.recentEntryMoodContainer}>
                  <Text style={styles.recentEntryMood}>{entry.mood_emoji}</Text>
                  <View style={styles.moodIndicator}>
                    <View style={[
                      styles.moodIndicatorBar,
                      { width: `${(entry.mood / 5) * 100}%` }
                    ]} />
                  </View>
                </View>
                
                <View style={styles.recentEntryContent}>
                  <Text style={styles.recentEntryText} numberOfLines={2}>
                    {entry.decision}
                  </Text>
                  <View style={styles.recentEntryMeta}>
                    <Text style={styles.recentEntryTime}>
                      {(() => {
                        const istDate = convertToIST(new Date(entry.created_at));
                        return istDate.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                      })()}
                    </Text>
                    <View style={styles.habitIndicators}>
                      {Object.entries(habits).slice(0, 3).map(([habit, completed], i) => (
                        <View
                          key={habit}
                          style={[
                            styles.habitDot,
                            completed && styles.habitDotCompleted
                          ]}
                        />
                      ))}
                      {Object.values(habits).filter(Boolean).length > 3 && (
                        <Text style={styles.habitMore}>
                          +{Object.values(habits).filter(Boolean).length - 3}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
                
                <TouchableOpacity style={styles.recentEntryAction}>
                  <ArrowRight size={16} color="#9ca3af" />
                </TouchableOpacity>
              </Animated.View>
            );
          })}
          
          {entries.length === 0 && (
            <Animated.View entering={FadeInDown.delay(700)} style={styles.emptyStateContainer}>
              <View style={styles.emptyStateIcon}>
                <Calendar size={48} color="#d1d5db" />
              </View>
              <Text style={styles.emptyStateTitle}>Start Your Journey</Text>
              <Text style={styles.emptyStateText}>
                Begin documenting your thoughts, decisions, and growth. Every entry is a step toward better self-awareness.
              </Text>
              <TouchableOpacity style={styles.emptyStateButton} onPress={handleEntryAction}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.emptyStateButtonGradient}
                >
                  <Text style={styles.emptyStateButtonText}>Create First Entry</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 32 : 48,
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
  headerContent: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#e2e8f0',
    lineHeight: 24,
    marginBottom: 12,
  },
  moodWeather: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  moodWeatherEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  moodWeatherText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
  },
  profileContainer: {
    position: 'absolute',
    top: 20,
    right: 24,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  profileImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  proBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#fbbf24',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  streakBadge: {
    position: 'absolute',
    bottom: -4,
    left: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  streakBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  entryCardContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  entryCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  entryCardGradient: {
    padding: 24,
  },
  entryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  entryCardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#667eea',
  },
  entryPreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  moodDisplayContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  moodDisplay: {
    fontSize: 40,
    marginBottom: 8,
  },
  moodRating: {
    flexDirection: 'row',
    gap: 2,
  },
  moodStar: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e5e7eb',
  },
  moodStarFilled: {
    backgroundColor: '#fbbf24',
  },
  entryDetails: {
    flex: 1,
  },
  entryDecision: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 12,
    lineHeight: 24,
  },
  entryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  entryTime: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  habitSummary: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  habitSummaryText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#475569',
  },
  addEntryCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  addEntryGradient: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  addEntryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  addEntryText: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  addEntrySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#e2e8f0',
    textAlign: 'center',
    marginBottom: 16,
  },
  addEntryArrow: {
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statGradient: {
    padding: 16,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
  },
  statProgress: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  statProgressBar: {
    height: '100%',
    borderRadius: 2,
  },
  statSubtext: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    textAlign: 'center',
  },
  insightCardContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  insightCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  insightTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  insightDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 24,
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
  aiPoweredBadge: {
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginLeft: 'auto',
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
    marginBottom: 16,
  },
  summaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryActionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#0ea5e9',
  },
  recentSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
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
  recentEntry: {
    flexDirection: 'row',
    alignItems: 'center',
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
  recentEntryDate: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 40,
  },
  recentEntryDay: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
  },
  recentEntryMonth: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
  },
  recentEntryMoodContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  recentEntryMood: {
    fontSize: 28,
    marginBottom: 4,
  },
  moodIndicator: {
    width: 24,
    height: 3,
    backgroundColor: '#f1f5f9',
    borderRadius: 2,
    overflow: 'hidden',
  },
  moodIndicatorBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  recentEntryContent: {
    flex: 1,
  },
  recentEntryText: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
    lineHeight: 22,
  },
  recentEntryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentEntryTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  habitIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  habitDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e5e7eb',
  },
  habitDotCompleted: {
    backgroundColor: '#10b981',
  },
  habitMore: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#64748b',
  },
  recentEntryAction: {
    padding: 8,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyStateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyStateButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});