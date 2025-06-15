import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { X, Save, Calendar, Heart, Target, CheckCircle, Circle } from 'lucide-react-native';
import { router } from 'expo-router';
import { useUser } from '@/components/UserContext';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';
import { getCurrentLocalDate } from '@/lib/dateUtils';

const { width } = Dimensions.get('window');

const moodOptions = [
  { value: 1, emoji: '😞', label: 'Terrible', color: '#ef4444' },
  { value: 2, emoji: '😔', label: 'Bad', color: '#f97316' },
  { value: 3, emoji: '😐', label: 'Okay', color: '#eab308' },
  { value: 4, emoji: '😊', label: 'Good', color: '#22c55e' },
  { value: 5, emoji: '😄', label: 'Amazing', color: '#10b981' },
];

const defaultHabits = [
  'Exercise',
  'Meditation',
  'Reading',
  'Healthy Eating',
  'Early Sleep',
  'Gratitude Practice',
  'Learning',
  'Social Connection',
];

export default function EntryContent() {
  const { addEntry, updateEntry, getTodaysEntry, subscription } = useUser();
  const [loading, setLoading] = useState(false);
  
  // Get today's entry using timezone-aware function
  const todaysEntry = getTodaysEntry();
  const isEditing = !!todaysEntry;
  
  // Form state
  const [mood, setMood] = useState(todaysEntry?.mood || 3);
  const [decision, setDecision] = useState(todaysEntry?.decision || '');
  const [habits, setHabits] = useState<{ [key: string]: boolean }>(() => {
    if (todaysEntry?.habits && typeof todaysEntry.habits === 'object') {
      return todaysEntry.habits as { [key: string]: boolean };
    }
    return defaultHabits.reduce((acc, habit) => ({ ...acc, [habit]: false }), {});
  });

  const selectedMood = moodOptions.find(option => option.value === mood) || moodOptions[2];

  const handleSave = async () => {
    if (!decision.trim()) {
      Alert.alert('Missing Information', 'Please write about your day before saving.');
      return;
    }

    // Check subscription limits for new entries
    if (!isEditing && subscription.plan === 'free' && subscription.entriesThisMonth >= subscription.maxEntriesPerMonth) {
      Alert.alert(
        'Entry Limit Reached',
        `You've reached your monthly limit of ${subscription.maxEntriesPerMonth} entries. Upgrade to Pro for unlimited entries and AI insights.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/paywall') }
        ]
      );
      return;
    }

    setLoading(true);

    try {
      const entryData = {
        mood,
        moodEmoji: selectedMood.emoji,
        decision: decision.trim(),
        habits,
      };

      let result;
      if (isEditing) {
        result = await updateEntry(todaysEntry.id, entryData);
      } else {
        result = await addEntry({
          date: getCurrentLocalDate(), // Use timezone-aware date
          ...entryData,
        });
      }

      if (result.error) {
        Alert.alert('Error', result.error);
      } else {
        Alert.alert(
          'Success!',
          isEditing ? 'Your entry has been updated.' : 'Your entry has been saved.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleHabit = (habit: string) => {
    setHabits(prev => ({
      ...prev,
      [habit]: !prev[habit]
    }));
  };

  const completedHabitsCount = Object.values(habits).filter(Boolean).length;

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
              <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                <X size={24} color="#ffffff" />
              </TouchableOpacity>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>
                  {isEditing ? "Edit Today's Entry" : "Today's Reflection"}
                </Text>
                <Text style={styles.headerSubtitle}>
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>
              <TouchableOpacity 
                style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
                onPress={handleSave}
                disabled={loading}
              >
                <Save size={20} color="#ffffff" />
                <Text style={styles.saveButtonText}>
                  {loading ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Mood Selection */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.section}>
          <Text style={styles.sectionTitle}>How are you feeling today?</Text>
          <View style={styles.moodCard}>
            <LinearGradient
              colors={['#ffffff', '#f8fafc']}
              style={styles.moodGradient}
            >
              <View style={styles.moodDisplay}>
                <Text style={styles.selectedMoodEmoji}>{selectedMood.emoji}</Text>
                <View style={styles.moodInfo}>
                  <Text style={styles.selectedMoodLabel}>{selectedMood.label}</Text>
                  <Text style={styles.moodScale}>Rate: {mood}/5</Text>
                </View>
              </View>
              
              <View style={styles.moodOptions}>
                {moodOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.moodOption,
                      mood === option.value && styles.moodOptionSelected,
                      { borderColor: option.color }
                    ]}
                    onPress={() => setMood(option.value)}
                  >
                    <Text style={styles.moodOptionEmoji}>{option.emoji}</Text>
                    <Text style={[
                      styles.moodOptionLabel,
                      mood === option.value && styles.moodOptionLabelSelected
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Decision/Reflection Input */}
        <Animated.View entering={SlideInRight.delay(200)} style={styles.section}>
          <Text style={styles.sectionTitle}>What's on your mind?</Text>
          <View style={styles.decisionCard}>
            <LinearGradient
              colors={['#ffffff', '#f8fafc']}
              style={styles.decisionGradient}
            >
              <View style={styles.decisionHeader}>
                <Calendar size={20} color="#667eea" />
                <Text style={styles.decisionTitle}>Daily Reflection</Text>
              </View>
              <TextInput
                style={styles.decisionInput}
                placeholder="Share your thoughts, decisions, or experiences from today. What went well? What could be improved? What are you grateful for?"
                placeholderTextColor="#9ca3af"
                value={decision}
                onChangeText={setDecision}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              <View style={styles.decisionMeta}>
                <Text style={styles.characterCount}>
                  {decision.length} characters
                </Text>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Habit Tracking */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Track Your Habits</Text>
            <View style={styles.habitProgress}>
              <Target size={16} color="#667eea" />
              <Text style={styles.habitProgressText}>
                {completedHabitsCount}/{Object.keys(habits).length}
              </Text>
            </View>
          </View>
          
          <View style={styles.habitsCard}>
            <LinearGradient
              colors={['#ffffff', '#f8fafc']}
              style={styles.habitsGradient}
            >
              <View style={styles.habitsList}>
                {Object.entries(habits).map(([habit, completed], index) => (
                  <Animated.View 
                    key={habit} 
                    entering={FadeInDown.delay(400 + index * 50)}
                    style={styles.habitItem}
                  >
                    <TouchableOpacity
                      style={styles.habitButton}
                      onPress={() => toggleHabit(habit)}
                    >
                      <View style={styles.habitLeft}>
                        <View style={[
                          styles.habitCheckbox,
                          completed && styles.habitCheckboxCompleted
                        ]}>
                          {completed ? (
                            <CheckCircle size={20} color="#10b981" />
                          ) : (
                            <Circle size={20} color="#d1d5db" />
                          )}
                        </View>
                        <Text style={[
                          styles.habitName,
                          completed && styles.habitNameCompleted
                        ]}>
                          {habit}
                        </Text>
                      </View>
                      {completed && (
                        <View style={styles.habitBadge}>
                          <Text style={styles.habitBadgeText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
              
              <View style={styles.habitsSummary}>
                <View style={styles.progressBar}>
                  <View style={[
                    styles.progressFill,
                    { width: `${(completedHabitsCount / Object.keys(habits).length) * 100}%` }
                  ]} />
                </View>
                <Text style={styles.progressText}>
                  {completedHabitsCount === Object.keys(habits).length 
                    ? "🎉 All habits completed!" 
                    : `${Object.keys(habits).length - completedHabitsCount} habits remaining`
                  }
                </Text>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Subscription Reminder for Free Users */}
        {subscription.plan === 'free' && (
          <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
            <View style={styles.subscriptionReminder}>
              <LinearGradient
                colors={['#dbeafe', '#bfdbfe']}
                style={styles.subscriptionGradient}
              >
                <View style={styles.subscriptionHeader}>
                  <Heart size={20} color="#3b82f6" />
                  <Text style={styles.subscriptionTitle}>Loving LifeMap?</Text>
                </View>
                <Text style={styles.subscriptionText}>
                  Upgrade to Pro for unlimited entries, AI insights, and personalized growth recommendations.
                </Text>
                <TouchableOpacity 
                  style={styles.upgradeButton}
                  onPress={() => router.push('/paywall')}
                >
                  <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </Animated.View>
        )}

        {/* Entry Limit Warning */}
        {subscription.plan === 'free' && subscription.entriesThisMonth >= subscription.maxEntriesPerMonth - 2 && (
          <Animated.View entering={FadeInDown.delay(500)} style={styles.section}>
            <View style={styles.warningCard}>
              <Text style={styles.warningTitle}>⚠️ Entry Limit Warning</Text>
              <Text style={styles.warningText}>
                You have {subscription.maxEntriesPerMonth - subscription.entriesThisMonth} entries remaining this month.
                {subscription.entriesThisMonth >= subscription.maxEntriesPerMonth && " You've reached your monthly limit."}
              </Text>
              {subscription.entriesThisMonth >= subscription.maxEntriesPerMonth && (
                <TouchableOpacity 
                  style={styles.warningButton}
                  onPress={() => router.push('/paywall')}
                >
                  <Text style={styles.warningButtonText}>Upgrade for Unlimited Entries</Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#e2e8f0',
    marginTop: 4,
    textAlign: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  habitProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  habitProgressText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#667eea',
  },
  moodCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  moodGradient: {
    padding: 24,
  },
  moodDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  selectedMoodEmoji: {
    fontSize: 48,
    marginRight: 20,
  },
  moodInfo: {
    flex: 1,
  },
  selectedMoodLabel: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
  },
  moodScale: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    marginTop: 4,
  },
  moodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  moodOption: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  moodOptionSelected: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  moodOptionEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  moodOptionLabel: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#64748b',
    textAlign: 'center',
  },
  moodOptionLabelSelected: {
    color: '#1e293b',
  },
  decisionCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  decisionGradient: {
    padding: 24,
  },
  decisionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  decisionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
  },
  decisionInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  decisionMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  characterCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
  },
  habitsCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  habitsGradient: {
    padding: 24,
  },
  habitsList: {
    gap: 12,
    marginBottom: 20,
  },
  habitItem: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  habitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  habitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitCheckbox: {
    marginRight: 12,
  },
  habitCheckboxCompleted: {
    // Additional styling for completed state if needed
  },
  habitName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    flex: 1,
  },
  habitNameCompleted: {
    color: '#10b981',
  },
  habitBadge: {
    backgroundColor: '#dcfce7',
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  habitBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#16a34a',
  },
  habitsSummary: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    textAlign: 'center',
  },
  subscriptionReminder: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  subscriptionGradient: {
    padding: 20,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1e40af',
  },
  subscriptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1e40af',
    marginBottom: 16,
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  warningCard: {
    backgroundColor: '#fef3c7',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  warningTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#92400e',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#78350f',
    marginBottom: 12,
    lineHeight: 20,
  },
  warningButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  warningButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});