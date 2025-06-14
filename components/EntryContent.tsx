import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { X, Save, Heart, Target, Smile, Frown, Meh } from 'lucide-react-native';
import { useUser } from '@/components/UserContext';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const moodOptions = [
  { value: 1, emoji: '😞', label: 'Very Bad', color: '#ef4444' },
  { value: 2, emoji: '😔', label: 'Bad', color: '#f97316' },
  { value: 3, emoji: '😐', label: 'Okay', color: '#eab308' },
  { value: 4, emoji: '😊', label: 'Good', color: '#22c55e' },
  { value: 5, emoji: '😄', label: 'Excellent', color: '#10b981' },
];

const defaultHabits = [
  'Exercise',
  'Meditation',
  'Reading',
  'Healthy Eating',
  'Early Sleep',
];

export default function EntryContent() {
  const { addEntry, subscription } = useUser();
  const [mood, setMood] = useState<number>(3);
  const [decision, setDecision] = useState('');
  const [habits, setHabits] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);

  const selectedMood = moodOptions.find(option => option.value === mood);

  const handleSave = async () => {
    if (!decision.trim()) {
      Alert.alert('Missing Information', 'Please write about your day or a decision you made.');
      return;
    }

    if (subscription.plan === 'free' && subscription.entriesThisWeek >= subscription.maxEntriesPerWeek) {
      Alert.alert('Entry Limit Reached', 'You have reached your weekly entry limit. Upgrade to Pro for unlimited entries.');
      router.push('/paywall');
      return;
    }

    setLoading(true);

    try {
      const today = new Date();
      const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format

      const { error } = await addEntry({
        date: dateString,
        mood,
        moodEmoji: selectedMood?.emoji || '😐',
        decision: decision.trim(),
        habits,
      });

      if (error) {
        console.error('Error saving entry:', error);
        Alert.alert('Error', 'Failed to save your entry. Please try again.');
      } else {
        Alert.alert('Entry Saved!', 'Your reflection has been saved successfully.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error('Error in handleSave:', error);
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Header */}
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
                <Text style={styles.headerTitle}>Today's Reflection</Text>
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
            <View style={styles.moodContainer}>
              {moodOptions.map((option, index) => (
                <Animated.View 
                  key={option.value} 
                  entering={FadeInDown.delay(200 + index * 50)}
                >
                  <TouchableOpacity
                    style={[
                      styles.moodOption,
                      mood === option.value && styles.moodOptionSelected,
                      mood === option.value && { borderColor: option.color }
                    ]}
                    onPress={() => setMood(option.value)}
                  >
                    <Text style={styles.moodEmoji}>{option.emoji}</Text>
                    <Text style={[
                      styles.moodLabel,
                      mood === option.value && styles.moodLabelSelected
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Decision/Reflection */}
          <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
            <Text style={styles.sectionTitle}>What's on your mind?</Text>
            <Text style={styles.sectionSubtitle}>
              Reflect on your day, a decision you made, or something you learned.
            </Text>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Write about your thoughts, feelings, or experiences today..."
                placeholderTextColor="#9ca3af"
                value={decision}
                onChangeText={setDecision}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
            </View>
          </Animated.View>

          {/* Habits Tracking */}
          <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Habits</Text>
            <Text style={styles.sectionSubtitle}>
              Track the positive habits you practiced today.
            </Text>
            <View style={styles.habitsContainer}>
              {defaultHabits.map((habit, index) => (
                <Animated.View 
                  key={habit} 
                  entering={FadeInDown.delay(500 + index * 50)}
                >
                  <TouchableOpacity
                    style={[
                      styles.habitItem,
                      habits[habit] && styles.habitItemSelected
                    ]}
                    onPress={() => toggleHabit(habit)}
                  >
                    <View style={[
                      styles.habitCheckbox,
                      habits[habit] && styles.habitCheckboxSelected
                    ]}>
                      {habits[habit] && (
                        <Text style={styles.habitCheckmark}>✓</Text>
                      )}
                    </View>
                    <Text style={[
                      styles.habitText,
                      habits[habit] && styles.habitTextSelected
                    ]}>
                      {habit}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Usage Info for Free Users */}
          {subscription.plan === 'free' && (
            <Animated.View entering={FadeInDown.delay(600)} style={styles.usageContainer}>
              <LinearGradient
                colors={['#dbeafe', '#bfdbfe']}
                style={styles.usageGradient}
              >
                <View style={styles.usageHeader}>
                  <Target size={20} color="#3b82f6" />
                  <Text style={styles.usageTitle}>Free Plan Usage</Text>
                </View>
                <Text style={styles.usageText}>
                  {subscription.entriesThisWeek}/{subscription.maxEntriesPerWeek} entries this week
                </Text>
                <View style={styles.usageBar}>
                  <View style={[
                    styles.usageBarFill,
                    { width: `${(subscription.entriesThisWeek / subscription.maxEntriesPerWeek) * 100}%` }
                  ]} />
                </View>
                {subscription.entriesThisWeek >= subscription.maxEntriesPerWeek && (
                  <TouchableOpacity 
                    style={styles.upgradeButton}
                    onPress={() => router.push('/paywall')}
                  >
                    <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
                  </TouchableOpacity>
                )}
              </LinearGradient>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardView: {
    flex: 1,
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
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
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
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    paddingHorizontal: 20,
    marginBottom: 16,
    lineHeight: 20,
  },
  moodContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  moodOption: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  moodOptionSelected: {
    borderWidth: 2,
    backgroundColor: '#fefefe',
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#64748b',
    textAlign: 'center',
  },
  moodLabelSelected: {
    color: '#1e293b',
  },
  textInputContainer: {
    marginHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  textInput: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 24,
    minHeight: 120,
  },
  habitsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  habitItemSelected: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  habitCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  habitCheckboxSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  habitCheckmark: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  habitText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    flex: 1,
  },
  habitTextSelected: {
    color: '#065f46',
  },
  usageContainer: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  usageGradient: {
    padding: 20,
  },
  usageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  usageTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1e40af',
  },
  usageText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1e40af',
    marginBottom: 12,
  },
  usageBar: {
    height: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  usageBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
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
});