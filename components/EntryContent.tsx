import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions, Platform, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { X, Check, Sparkles, Target, Lightbulb, Heart } from 'lucide-react-native';
import { router } from 'expo-router';
import { useUser } from '@/components/UserContext';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, SlideInRight, useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

const moodOptions = [
  { value: 1, emoji: '😞', label: 'Very Bad', color: '#ef4444', description: 'Struggling today' },
  { value: 2, emoji: '😔', label: 'Bad', color: '#f97316', description: 'Not my best day' },
  { value: 3, emoji: '😐', label: 'Okay', color: '#eab308', description: 'Getting by' },
  { value: 4, emoji: '😊', label: 'Good', color: '#22c55e', description: 'Feeling positive' },
  { value: 5, emoji: '😄', label: 'Excellent', color: '#10b981', description: 'Amazing day!' },
];

const defaultHabits = [
  { name: 'Exercise', icon: '💪', color: '#ef4444', description: 'Physical activity' },
  { name: 'Meditation', icon: '🧘', color: '#8b5cf6', description: 'Mindfulness practice' },
  { name: 'Reading', icon: '📚', color: '#3b82f6', description: 'Learning & growth' },
  { name: 'Healthy Eating', icon: '🥗', color: '#10b981', description: 'Nutritious meals' },
  { name: 'Early Sleep', icon: '😴', color: '#6366f1', description: 'Quality rest' },
  { name: 'Gratitude', icon: '🙏', color: '#f59e0b', description: 'Appreciation practice' },
];

const journalPrompts = [
  "What decision challenged me the most today?",
  "What am I most grateful for right now?",
  "How did I grow as a person today?",
  "What would I do differently if I could?",
  "What brought me the most joy today?",
  "What lesson did today teach me?",
];

// Helper function to convert to IST
const convertToIST = (date: Date): Date => {
  return new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
};

// Helper function to format date consistently
const formatDateForDatabase = (date: Date): string => {
  // Always use UTC to avoid timezone issues
  return date.toISOString().split('T')[0];
};

export default function EntryContent() {
  const { addEntry, updateEntry, getTodaysEntry } = useUser();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [decision, setDecision] = useState('');
  const [habits, setHabits] = useState<{ [key: string]: boolean }>({
    'Exercise': false,
    'Meditation': false,
    'Reading': false,
    'Healthy Eating': false,
    'Early Sleep': false,
    'Gratitude': false,
  });
  const [currentPrompt] = useState(journalPrompts[Math.floor(Math.random() * journalPrompts.length)]);
  const [isSaving, setIsSaving] = useState(false);

  const progressValue = useSharedValue(0);
  const selectedMoodData = moodOptions.find(mood => mood.value === selectedMood);

  // Get today's entry
  const todaysEntry = getTodaysEntry();
  const isEditing = !!todaysEntry;

  // Initialize form with existing entry data if editing
  useEffect(() => {
    if (todaysEntry) {
      setSelectedMood(todaysEntry.mood);
      setDecision(todaysEntry.decision);
      
      // Parse habits safely
      const entryHabits = todaysEntry.habits as { [key: string]: boolean } | null;
      if (entryHabits && typeof entryHabits === 'object') {
        setHabits(prev => ({
          ...prev,
          ...entryHabits
        }));
      }
    }
  }, [todaysEntry]);

  // Haptic feedback function
  const triggerHapticFeedback = () => {
    if (Platform.OS !== 'web') {
      // Would use Haptics.impactAsync() on native platforms
    }
  };

  const handleHabitPress = (habit: string) => {
    console.log('Habit pressed:', habit);
    setHabits(prev => {
      const newState = {
        ...prev,
        [habit]: !prev[habit],
      };
      console.log('New habits state:', newState);
      return newState;
    });
    triggerHapticFeedback();
  };

  const selectMood = (moodValue: number) => {
    triggerHapticFeedback();
    setSelectedMood(moodValue);
  };

  const handleSave = async () => {
    Keyboard.dismiss();
    console.log('Save button pressed');
    if (!selectedMood) {
      Alert.alert('Missing Information', 'Please select your mood.');
      return;
    }

    setIsSaving(true);

    try {
      const entryData = {
        mood: selectedMood,
        moodEmoji: selectedMoodData?.emoji || '😐',
        decision: decision.trim(),
        habits: habits,
      };

      let result;
      if (isEditing && todaysEntry) {
        console.log('Updating existing entry:', todaysEntry.id);
        result = await updateEntry(todaysEntry.id, {
          date: todaysEntry.date,
          ...entryData,
        });
      } else {
        console.log('Creating new entry for today');
        const todayDateString = formatDateForDatabase(new Date());
        result = await addEntry({
          date: todayDateString,
          ...entryData,
        });
      }

      console.log('Result from update/add:', result);

      if (result.error) {
        console.error('Save error:', result.error);
        Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'save'} entry: ${result.error}`);
      } else {
        console.log('Entry saved successfully:', result.data);
        // Show a toast and auto-navigate after a short delay
        Toast.show({
          type: 'success',
          text1: 'Entry saved successfully!',
          position: 'bottom',
          visibilityTime: 1500,
        });
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1000);
      }
    } catch (error) {
      console.error('Unexpected error saving entry:', error);
      Alert.alert('Error', `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const completedHabits = Object.values(habits).filter(Boolean).length;
  const totalFields = 3; // mood, decision, habits
  const completedFields = (selectedMood ? 1 : 0) + (decision.trim() ? 1 : 0) + (completedHabits > 0 ? 1 : 0);
  const progress = completedFields / totalFields;

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(`${progress * 100}%`),
    };
  });

  // Enhanced responsive calculations with better breakpoints
  const isTablet = width >= 768;
  const isLargeTablet = width >= 1024;
  const isSmallMobile = width < 375;
  const isMobile = width < 768;
  
  // Perfect mood layout calculations for all screen sizes
  const getMoodLayout = () => {
    if (isLargeTablet) {
      // Large tablets (iPad Pro): Single row with generous spacing
      return {
        layout: 'single-row',
        itemsPerRow: 5,
        itemWidth: Math.min((width - 160) / 5 - 16, 180), // Max width 180px with gaps
        containerPadding: 60,
        itemSpacing: 16,
        minHeight: 200,
      };
    } else if (isTablet) {
      // Regular tablets (iPad): Single row with good spacing
      return {
        layout: 'single-row',
        itemsPerRow: 5,
        itemWidth: Math.min((width - 120) / 5 - 12, 160), // Max width 160px with gaps
        containerPadding: 40,
        itemSpacing: 12,
        minHeight: 180,
      };
    } else if (isSmallMobile) {
      // Small phones: 2 columns, 3 rows
      return {
        layout: 'grid-2x3',
        itemsPerRow: 2,
        itemWidth: (width - 60) / 2 - 8, // Account for padding and gap
        containerPadding: 20,
        itemSpacing: 8,
        minHeight: 110,
      };
    } else {
      // Regular mobile: 3 columns, 2 rows
      return {
        layout: 'grid-3x2',
        itemsPerRow: 3,
        itemWidth: (width - 60) / 3 - 8, // Account for padding and gap
        containerPadding: 20,
        itemSpacing: 8,
        minHeight: 130,
      };
    }
  };

  const moodLayout = getMoodLayout();

  // Habits layout for different screen sizes
  const getHabitsLayout = () => {
    if (isLargeTablet) {
      return { columns: 3, gap: 20 };
    } else if (isTablet) {
      return { columns: 2, gap: 16 };
    }
    return { columns: 1, gap: 12 };
  };

  const habitsLayout = getHabitsLayout();

  // Render mood options based on layout
  const renderMoodOptions = () => {
    if (moodLayout.layout === 'single-row') {
      // Single row for tablets
      return (
        <View style={[styles.moodRowSingle, { 
          paddingHorizontal: moodLayout.containerPadding,
          gap: moodLayout.itemSpacing 
        }]}>
          {moodOptions.map((mood, index) => (
            <Animated.View 
              key={mood.value} 
              entering={SlideInRight.delay(200 + index * 50)} 
              style={[styles.moodOptionWrapper, { 
                width: moodLayout.itemWidth,
                minWidth: moodLayout.itemWidth 
              }]}
            >
              <TouchableOpacity
                style={[
                  styles.moodOption,
                  isLargeTablet ? styles.moodOptionLargeTablet : styles.moodOptionTablet,
                  { minHeight: moodLayout.minHeight },
                  selectedMood === mood.value && [
                    styles.moodOptionSelected,
                    { 
                      borderColor: mood.color, 
                      backgroundColor: `${mood.color}15`,
                      transform: [{ scale: 1.02 }]
                    }
                  ]
                ]}
                onPress={() => selectMood(mood.value)}
              >
                <Text style={isLargeTablet ? styles.moodEmojiLargeTablet : styles.moodEmojiTablet}>
                  {mood.emoji}
                </Text>
                <Text style={[
                  isLargeTablet ? styles.moodLabelLargeTablet : styles.moodLabelTablet,
                  selectedMood === mood.value && { color: mood.color, fontFamily: 'Inter-Bold' }
                ]}>
                  {mood.label}
                </Text>
                <Text style={isLargeTablet ? styles.moodDescriptionLargeTablet : styles.moodDescriptionTablet}>
                  {mood.description}
                </Text>
                {selectedMood === mood.value && (
                  <View style={[
                    styles.moodSelectedIndicator,
                    isLargeTablet ? styles.moodSelectedIndicatorLargeTablet : styles.moodSelectedIndicatorTablet,
                    { backgroundColor: mood.color }
                  ]}>
                    <Check size={isLargeTablet ? 20 : 16} color="#ffffff" />
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      );
    } else if (moodLayout.layout === 'grid-2x3') {
      // 2x3 grid for small mobile
      return (
        <View style={[styles.moodGridContainer, { paddingHorizontal: moodLayout.containerPadding }]}>
          {/* First row - 2 items */}
          <View style={[styles.moodRow, { gap: moodLayout.itemSpacing, marginBottom: moodLayout.itemSpacing }]}>
            {moodOptions.slice(0, 2).map((mood, index) => (
              <Animated.View 
                key={mood.value} 
                entering={SlideInRight.delay(200 + index * 50)} 
                style={[styles.moodOptionWrapper, { width: moodLayout.itemWidth }]}
              >
                <TouchableOpacity
                  style={[
                    styles.moodOption,
                    styles.moodOptionSmall,
                    { minHeight: moodLayout.minHeight },
                    selectedMood === mood.value && [
                      styles.moodOptionSelected,
                      { borderColor: mood.color, backgroundColor: `${mood.color}15` }
                    ]
                  ]}
                  onPress={() => selectMood(mood.value)}
                >
                  <Text style={styles.moodEmojiSmall}>{mood.emoji}</Text>
                  <Text style={[
                    styles.moodLabelSmall,
                    selectedMood === mood.value && { color: mood.color, fontFamily: 'Inter-SemiBold' }
                  ]}>
                    {mood.label}
                  </Text>
                  <Text style={styles.moodDescriptionSmall}>{mood.description}</Text>
                  {selectedMood === mood.value && (
                    <View style={[styles.moodSelectedIndicator, { backgroundColor: mood.color }]}>
                      <Check size={12} color="#ffffff" />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
          
          {/* Second row - 2 items */}
          <View style={[styles.moodRow, { gap: moodLayout.itemSpacing, marginBottom: moodLayout.itemSpacing }]}>
            {moodOptions.slice(2, 4).map((mood, index) => (
              <Animated.View 
                key={mood.value} 
                entering={SlideInRight.delay(300 + index * 50)} 
                style={[styles.moodOptionWrapper, { width: moodLayout.itemWidth }]}
              >
                <TouchableOpacity
                  style={[
                    styles.moodOption,
                    styles.moodOptionSmall,
                    { minHeight: moodLayout.minHeight },
                    selectedMood === mood.value && [
                      styles.moodOptionSelected,
                      { borderColor: mood.color, backgroundColor: `${mood.color}15` }
                    ]
                  ]}
                  onPress={() => selectMood(mood.value)}
                >
                  <Text style={styles.moodEmojiSmall}>{mood.emoji}</Text>
                  <Text style={[
                    styles.moodLabelSmall,
                    selectedMood === mood.value && { color: mood.color, fontFamily: 'Inter-SemiBold' }
                  ]}>
                    {mood.label}
                  </Text>
                  <Text style={styles.moodDescriptionSmall}>{mood.description}</Text>
                  {selectedMood === mood.value && (
                    <View style={[styles.moodSelectedIndicator, { backgroundColor: mood.color }]}>
                      <Check size={12} color="#ffffff" />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
          
          {/* Third row - 1 item centered */}
          <View style={[styles.moodRowCenter, { gap: moodLayout.itemSpacing }]}>
            <Animated.View 
              entering={SlideInRight.delay(400)} 
              style={[styles.moodOptionWrapper, { width: moodLayout.itemWidth }]}
            >
              <TouchableOpacity
                style={[
                  styles.moodOption,
                  styles.moodOptionSmall,
                  { minHeight: moodLayout.minHeight },
                  selectedMood === moodOptions[4].value && [
                    styles.moodOptionSelected,
                    { borderColor: moodOptions[4].color, backgroundColor: `${moodOptions[4].color}15` }
                  ]
                ]}
                onPress={() => selectMood(moodOptions[4].value)}
              >
                <Text style={styles.moodEmojiSmall}>{moodOptions[4].emoji}</Text>
                <Text style={[
                  styles.moodLabelSmall,
                  selectedMood === moodOptions[4].value && { color: moodOptions[4].color, fontFamily: 'Inter-SemiBold' }
                ]}>
                  {moodOptions[4].label}
                </Text>
                <Text style={styles.moodDescriptionSmall}>{moodOptions[4].description}</Text>
                {selectedMood === moodOptions[4].value && (
                  <View style={[styles.moodSelectedIndicator, { backgroundColor: moodOptions[4].color }]}>
                    <Check size={12} color="#ffffff" />
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      );
    } else {
      // 3x2 grid for regular mobile
      return (
        <View style={[styles.moodGridContainer, { paddingHorizontal: moodLayout.containerPadding }]}>
          {/* First row - 3 items */}
          <View style={[styles.moodRow, { gap: moodLayout.itemSpacing, marginBottom: moodLayout.itemSpacing }]}>
            {moodOptions.slice(0, 3).map((mood, index) => (
              <Animated.View 
                key={mood.value} 
                entering={SlideInRight.delay(200 + index * 50)} 
                style={[styles.moodOptionWrapper, { width: moodLayout.itemWidth }]}
              >
                <TouchableOpacity
                  style={[
                    styles.moodOption,
                    styles.moodOptionMedium,
                    { minHeight: moodLayout.minHeight },
                    selectedMood === mood.value && [
                      styles.moodOptionSelected,
                      { borderColor: mood.color, backgroundColor: `${mood.color}15` }
                    ]
                  ]}
                  onPress={() => selectMood(mood.value)}
                >
                  <Text style={styles.moodEmojiMedium}>{mood.emoji}</Text>
                  <Text style={[
                    styles.moodLabelMedium,
                    selectedMood === mood.value && { color: mood.color, fontFamily: 'Inter-SemiBold' }
                  ]}>
                    {mood.label}
                  </Text>
                  <Text style={styles.moodDescriptionMedium}>{mood.description}</Text>
                  {selectedMood === mood.value && (
                    <View style={[styles.moodSelectedIndicator, { backgroundColor: mood.color }]}>
                      <Check size={14} color="#ffffff" />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
          
          {/* Second row - 2 items centered */}
          <View style={[styles.moodRowCenter, { gap: moodLayout.itemSpacing }]}>
            {moodOptions.slice(3, 5).map((mood, index) => (
              <Animated.View 
                key={mood.value} 
                entering={SlideInRight.delay(350 + index * 50)} 
                style={[styles.moodOptionWrapper, { width: moodLayout.itemWidth }]}
              >
                <TouchableOpacity
                  style={[
                    styles.moodOption,
                    styles.moodOptionMedium,
                    { minHeight: moodLayout.minHeight },
                    selectedMood === mood.value && [
                      styles.moodOptionSelected,
                      { borderColor: mood.color, backgroundColor: `${mood.color}15` }
                    ]
                  ]}
                  onPress={() => selectMood(mood.value)}
                >
                  <Text style={styles.moodEmojiMedium}>{mood.emoji}</Text>
                  <Text style={[
                    styles.moodLabelMedium,
                    selectedMood === mood.value && { color: mood.color, fontFamily: 'Inter-SemiBold' }
                  ]}>
                    {mood.label}
                  </Text>
                  <Text style={styles.moodDescriptionMedium}>{mood.description}</Text>
                  {selectedMood === mood.value && (
                    <View style={[styles.moodSelectedIndicator, { backgroundColor: mood.color }]}>
                      <Check size={14} color="#ffffff" />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Enhanced Header with better responsive design */}
      <Animated.View entering={FadeInUp} style={styles.headerContainer}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={[
            styles.header, 
            isTablet && styles.headerTablet,
            isLargeTablet && styles.headerLargeTablet
          ]}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={[
                styles.closeButton, 
                isTablet && styles.buttonTablet,
                isLargeTablet && styles.buttonLargeTablet
              ]}
            >
              <X size={isLargeTablet ? 32 : isTablet ? 28 : 24} color="#ffffff" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={[
                styles.headerTitle, 
                isTablet && styles.headerTitleTablet,
                isLargeTablet && styles.headerTitleLargeTablet
              ]}>
                {isEditing ? 'Edit Reflection' : 'Daily Reflection'}
              </Text>
              <Text style={[
                styles.headerSubtitle, 
                isTablet && styles.headerSubtitleTablet,
                isLargeTablet && styles.headerSubtitleLargeTablet
              ]}>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={handleSave} 
              style={[
                styles.saveButton, 
                isTablet && styles.buttonTablet,
                isLargeTablet && styles.buttonLargeTablet,
                isSaving && styles.saveButtonDisabled
              ]}
              disabled={isSaving}
            >
              <Check size={isLargeTablet ? 32 : isTablet ? 28 : 24} color="#ffffff" />
            </TouchableOpacity>
          </View>
          
          {/* Enhanced Progress Bar */}
          <View style={[
            styles.progressContainer, 
            isTablet && styles.progressContainerTablet,
            isLargeTablet && styles.progressContainerLargeTablet
          ]}>
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, progressStyle]} />
            </View>
            <View style={styles.progressInfo}>
              <Text style={[
                styles.progressText, 
                isTablet && styles.progressTextTablet,
                isLargeTablet && styles.progressTextLargeTablet
              ]}>
                {Math.round(progress * 100)}% Complete
              </Text>
              <Text style={[
                styles.progressSteps, 
                isTablet && styles.progressStepsTablet,
                isLargeTablet && styles.progressStepsLargeTablet
              ]}>
                {completedFields}/3 sections
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent, 
          isTablet && styles.scrollContentTablet,
          isLargeTablet && styles.scrollContentLargeTablet
        ]}
      >
        {/* Enhanced Mood Section with Perfect Responsive Design */}
        <Animated.View entering={FadeInDown.delay(100)} style={[
          styles.section, 
          isTablet && styles.sectionTablet,
          isLargeTablet && styles.sectionLargeTablet
        ]}>
          <View style={styles.sectionHeader}>
            <Heart size={isLargeTablet ? 28 : isTablet ? 24 : 20} color="#ef4444" />
            <Text style={[
              styles.sectionTitle, 
              isTablet && styles.sectionTitleTablet,
              isLargeTablet && styles.sectionTitleLargeTablet
            ]}>
              How do you feel today?
            </Text>
          </View>
          <Text style={[
            styles.sectionSubtitle, 
            isTablet && styles.sectionSubtitleTablet,
            isLargeTablet && styles.sectionSubtitleLargeTablet
          ]}>
            Your emotional state is the foundation of growth
          </Text>
          
          {/* Responsive Mood Selection */}
          <View style={styles.moodContainer}>
            {renderMoodOptions()}
          </View>
        </Animated.View>

        {/* Decision Section with enhanced responsive design */}
        <Animated.View entering={FadeInDown.delay(300)} style={[
          styles.section, 
          isTablet && styles.sectionTablet,
          isLargeTablet && styles.sectionLargeTablet
        ]}>
          <View style={styles.sectionHeader}>
            <Lightbulb size={isLargeTablet ? 28 : isTablet ? 24 : 20} color="#f59e0b" />
            <Text style={[
              styles.sectionTitle, 
              isTablet && styles.sectionTitleTablet,
              isLargeTablet && styles.sectionTitleLargeTablet
            ]}>
              Reflect on your day
            </Text>
          </View>
          <Text style={[
            styles.sectionSubtitle, 
            isTablet && styles.sectionSubtitleTablet,
            isLargeTablet && styles.sectionSubtitleLargeTablet
          ]}>
            What shaped your journey today?
          </Text>
          
          <View style={[
            styles.promptCard, 
            isTablet && styles.promptCardTablet,
            isLargeTablet && styles.promptCardLargeTablet
          ]}>
            <Text style={[
              styles.promptText, 
              isTablet && styles.promptTextTablet,
              isLargeTablet && styles.promptTextLargeTablet
            ]}>
              💭 {currentPrompt}
            </Text>
          </View>
          
          <View style={styles.textInputContainer}>
            <TextInput
              style={[
                styles.textInput, 
                isTablet && styles.textInputTablet,
                isLargeTablet && styles.textInputLargeTablet,
                decision.length > 0 && {
                  borderColor: '#f97316',
                  borderWidth: 2,
                }
              ]}
              multiline
              numberOfLines={isLargeTablet ? 10 : isTablet ? 8 : 6}
              placeholder="Share your thoughts, decisions, and reflections from today. What mattered most to you?"
              placeholderTextColor="#9ca3af"
              value={decision}
              onChangeText={setDecision}
              maxLength={1000}
            />
            <View style={styles.inputFooter}>
              <View style={styles.characterCount}>
                <Text style={[
                  styles.characterCountText, 
                  isTablet && styles.characterCountTextTablet,
                  isLargeTablet && styles.characterCountTextLargeTablet
                ]}>
                  {decision.length}/1000
                </Text>
              </View>
              <View style={[
                styles.inputProgress,
                decision.length > 0 && styles.inputProgressActive
              ]}>
                <View style={[
                  styles.inputProgressBar,
                  { width: `${Math.min((decision.length / 200) * 100, 100)}%` }
                ]} />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Enhanced Habits Section with responsive layout */}
        <Animated.View entering={FadeInDown.delay(400)} style={[
          styles.section, 
          isTablet && styles.sectionTablet,
          isLargeTablet && styles.sectionLargeTablet
        ]}>
          <View style={styles.sectionHeader}>
            <Target size={isLargeTablet ? 28 : isTablet ? 24 : 20} color="#10b981" />
            <Text style={[
              styles.sectionTitle, 
              isTablet && styles.sectionTitleTablet,
              isLargeTablet && styles.sectionTitleLargeTablet
            ]}>
              Daily Habits
            </Text>
          </View>
          <Text style={[
            styles.sectionSubtitle, 
            isTablet && styles.sectionSubtitleTablet,
            isLargeTablet && styles.sectionSubtitleLargeTablet
          ]}>
            Building consistency <Text>•</Text> {completedHabits}/{defaultHabits.length} completed
          </Text>
          
          <View style={[
            styles.habitsGrid,
            isLargeTablet && styles.habitsGridLargeTablet,
            isTablet && styles.habitsGridTablet,
            { gap: habitsLayout.gap }
          ]}>
            {defaultHabits.map((habit, index) => (
              <Animated.View 
                key={habit.name} 
                entering={FadeInDown.delay(500 + index * 50)}
                style={[
                  isLargeTablet ? styles.habitItemLargeTablet : 
                  isTablet ? styles.habitItemTablet : 
                  styles.habitItemMobile
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.habitOption,
                    isLargeTablet && styles.habitOptionLargeTablet,
                    isTablet && styles.habitOptionTablet,
                    habits[habit.name] && [
                      styles.habitOptionSelected,
                      { borderColor: habit.color }
                    ]
                  ]}
                  onPress={() => handleHabitPress(habit.name)}
                  activeOpacity={0.7}
                >
                  <View style={styles.habitContent}>
                    <View style={[
                      styles.habitIcon,
                      isLargeTablet && styles.habitIconLargeTablet,
                      isTablet && styles.habitIconTablet,
                      habits[habit.name] && { backgroundColor: habit.color }
                    ]}>
                      <Text style={[
                        styles.habitEmoji, 
                        isLargeTablet && styles.habitEmojiLargeTablet,
                        isTablet && styles.habitEmojiTablet
                      ]}>
                        {habit.icon}
                      </Text>
                    </View>
                    <View style={[styles.habitInfo, { flex: 1 }]}>
                      <Text style={[
                        styles.habitLabel,
                        isLargeTablet && styles.habitLabelLargeTablet,
                        isTablet && styles.habitLabelTablet,
                        habits[habit.name] && { color: habit.color }
                      ]}>
                        {habit.name}
                      </Text>
                      <Text style={[
                        styles.habitDescription, 
                        isLargeTablet && styles.habitDescriptionLargeTablet,
                        isTablet && styles.habitDescriptionTablet
                      ]}>
                        {habit.description}
                      </Text>
                    </View>
                  </View>
                  <View style={[
                    styles.habitCheckbox,
                    isLargeTablet && styles.habitCheckboxLargeTablet,
                    isTablet && styles.habitCheckboxTablet,
                    habits[habit.name] && [
                      styles.habitCheckboxSelected,
                      { backgroundColor: habit.color }
                    ]
                  ]}>
                    {habits[habit.name] && (
                      <Check size={isLargeTablet ? 24 : isTablet ? 20 : 16} color="#ffffff" />
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Enhanced Progress Summary */}
        {(selectedMood || decision || completedHabits > 0) && (
          <Animated.View entering={FadeInDown.delay(600)} style={[
            styles.summarySection, 
            isTablet && styles.summarySectionTablet,
            isLargeTablet && styles.summarySectionLargeTablet
          ]}>
            <LinearGradient
              colors={['#f0f9ff', '#e0f2fe']}
              style={[
                styles.summaryGradient, 
                isTablet && styles.summaryGradientTablet,
                isLargeTablet && styles.summaryGradientLargeTablet
              ]}
            >
              <View style={styles.summaryHeader}>
                <Sparkles size={isLargeTablet ? 28 : isTablet ? 24 : 20} color="#0ea5e9" />
                <Text style={[
                  styles.summaryTitle, 
                  isTablet && styles.summaryTitleTablet,
                  isLargeTablet && styles.summaryTitleLargeTablet
                ]}>
                  Today's Progress
                </Text>
                <View style={[
                  styles.summaryBadge, 
                  isTablet && styles.summaryBadgeTablet,
                  isLargeTablet && styles.summaryBadgeLargeTablet
                ]}>
                  <Text style={[
                    styles.summaryBadgeText, 
                    isTablet && styles.summaryBadgeTextTablet,
                    isLargeTablet && styles.summaryBadgeTextLargeTablet
                  ]}>
                    {Math.round(progress * 100)}%
                  </Text>
                </View>
              </View>
              <View style={styles.summaryItems}>
                {selectedMood && (
                  <View style={styles.summaryItem}>
                    <Text style={[
                      styles.summaryItemIcon, 
                      isTablet && styles.summaryItemIconTablet,
                      isLargeTablet && styles.summaryItemIconLargeTablet
                    ]}>
                      🎯
                    </Text>
                    <Text style={[
                      styles.summaryItemText, 
                      isTablet && styles.summaryItemTextTablet,
                      isLargeTablet && styles.summaryItemTextLargeTablet
                    ]}>
                      Mood: {selectedMoodData?.emoji} {selectedMoodData?.label}
                    </Text>
                  </View>
                )}
                {completedHabits > 0 && (
                  <View style={styles.summaryItem}>
                    <Text style={[
                      styles.summaryItemIcon, 
                      isTablet && styles.summaryItemIconTablet,
                      isLargeTablet && styles.summaryItemIconLargeTablet
                    ]}>
                      ✅
                    </Text>
                    <Text style={[
                      styles.summaryItemText, 
                      isTablet && styles.summaryItemTextTablet,
                      isLargeTablet && styles.summaryItemTextLargeTablet
                    ]}>
                      Completed {completedHabits} habit{completedHabits > 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
                {decision && (
                  <View style={styles.summaryItem}>
                    <Text style={[
                      styles.summaryItemIcon, 
                      isTablet && styles.summaryItemIconTablet,
                      isLargeTablet && styles.summaryItemIconLargeTablet
                    ]}>
                      💭
                    </Text>
                    <Text style={[
                      styles.summaryItemText, 
                      isTablet && styles.summaryItemTextTablet,
                      isLargeTablet && styles.summaryItemTextLargeTablet
                    ]}>
                      Reflection documented ({decision.length} characters)
                    </Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Motivational Quote */}
        <Animated.View entering={FadeInDown.delay(700)} style={[
          styles.quoteSection, 
          isTablet && styles.quoteSectionTablet,
          isLargeTablet && styles.quoteSectionLargeTablet
        ]}>
          <LinearGradient
            colors={['#fef7ff', '#faf5ff']}
            style={[
              styles.quoteGradient, 
              isTablet && styles.quoteGradientTablet,
              isLargeTablet && styles.quoteGradientLargeTablet
            ]}
          >
            <Text style={[
              styles.quote, 
              isTablet && styles.quoteTablet,
              isLargeTablet && styles.quoteLargeTablet
            ]}>
              "The journey of a thousand miles begins with one step."
            </Text>
            <Text style={[
              styles.quoteAuthor, 
              isTablet && styles.quoteAuthorTablet,
              isLargeTablet && styles.quoteAuthorLargeTablet
            ]}>
              - Lao Tzu
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Save Button */}
        <Animated.View entering={FadeInDown.delay(800)} style={styles.saveSection}>
          <TouchableOpacity 
            style={[
              styles.saveButtonLarge,
              isTablet && styles.saveButtonLargeTablet,
              isLargeTablet && styles.saveButtonLargeLargeTablet,
              selectedMood && decision.trim() ? styles.saveButtonActive : null,
              isSaving && styles.saveButtonDisabled
            ]} 
            onPress={handleSave}
            disabled={isSaving}
          >
            <LinearGradient
              colors={(selectedMood && decision.trim()) && !isSaving ? ['#667eea', '#764ba2'] : ['#9ca3af', '#6b7280']}
              style={[
                styles.saveButtonGradient, 
                isTablet && styles.saveButtonGradientTablet,
                isLargeTablet && styles.saveButtonGradientLargeTablet
              ]}
            >
              <Check size={isLargeTablet ? 28 : isTablet ? 24 : 20} color="#ffffff" />
              <Text style={[
                styles.saveButtonText, 
                isTablet && styles.saveButtonTextTablet,
                isLargeTablet && styles.saveButtonTextLargeTablet
              ]}>
                {isSaving ? 'Saving...' : isEditing ? 'Update Entry' : 'Save Entry'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerContainer: {
    marginBottom: 24,
  },
  headerGradient: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTablet: {
    paddingHorizontal: 40,
    paddingTop: 24,
    paddingBottom: 28,
  },
  headerLargeTablet: {
    paddingHorizontal: 60,
    paddingTop: 32,
    paddingBottom: 36,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTablet: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  buttonLargeTablet: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  headerTitleTablet: {
    fontSize: 28,
  },
  headerTitleLargeTablet: {
    fontSize: 36,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#e2e8f0',
    marginTop: 4,
  },
  headerSubtitleTablet: {
    fontSize: 16,
    marginTop: 6,
  },
  headerSubtitleLargeTablet: {
    fontSize: 20,
    marginTop: 8,
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  progressContainerTablet: {
    paddingHorizontal: 40,
    paddingBottom: 28,
  },
  progressContainerLargeTablet: {
    paddingHorizontal: 60,
    paddingBottom: 36,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 3,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  progressTextTablet: {
    fontSize: 14,
  },
  progressTextLargeTablet: {
    fontSize: 16,
  },
  progressSteps: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#e2e8f0',
  },
  progressStepsTablet: {
    fontSize: 14,
  },
  progressStepsLargeTablet: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  scrollContentTablet: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  scrollContentLargeTablet: {
    paddingHorizontal: 40,
    paddingBottom: 64,
    maxWidth: 1000,
  },
  section: {
    marginBottom: 32,
  },
  sectionTablet: {
    marginBottom: 48,
  },
  sectionLargeTablet: {
    marginBottom: 64,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
  },
  sectionTitleTablet: {
    fontSize: 24,
  },
  sectionTitleLargeTablet: {
    fontSize: 32,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    marginBottom: 20,
  },
  sectionSubtitleTablet: {
    fontSize: 16,
    marginBottom: 28,
  },
  sectionSubtitleLargeTablet: {
    fontSize: 20,
    marginBottom: 36,
  },
  promptCard: {
    backgroundColor: '#fef7ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  promptCardTablet: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  promptCardLargeTablet: {
    borderRadius: 20,
    padding: 32,
    marginBottom: 32,
  },
  promptText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#5b21b6',
    lineHeight: 20,
  },
  promptTextTablet: {
    fontSize: 16,
    lineHeight: 24,
  },
  promptTextLargeTablet: {
    fontSize: 20,
    lineHeight: 30,
  },
  
  // Enhanced Mood Selection Styles
  moodContainer: {
    width: '100%',
  },
  
  // Single row layout for tablets
  moodRowSingle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  // Grid layouts for different screen sizes
  moodGridContainer: {
    gap: 0, // Remove gap here, handle in individual rows
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodRowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  
  moodOptionWrapper: {
    alignItems: 'center',
  },
  moodOption: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f1f5f9',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    width: '100%',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  
  // Tablet mood styles
  moodOptionTablet: {
    borderRadius: 20,
    padding: 24,
    minHeight: 180,
  },
  moodOptionLargeTablet: {
    borderRadius: 24,
    padding: 32,
    minHeight: 200,
  },
  
  // Small screen styles
  moodOptionSmall: {
    padding: 12,
    minHeight: 110,
    borderRadius: 12,
  },
  
  // Medium screen styles
  moodOptionMedium: {
    padding: 14,
    minHeight: 130,
    borderRadius: 14,
  },
  
  moodOptionSelected: {
    transform: [{ scale: 1.02 }],
  },
  
  // Updated emoji styles for better cross-platform compatibility
  moodEmojiSmall: {
    fontSize: 24,
    marginBottom: 4,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  moodEmojiMedium: {
    fontSize: 28,
    marginBottom: 6,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  moodEmojiTablet: {
    fontSize: 48,
    marginBottom: 12,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  moodEmojiLargeTablet: {
    fontSize: 64,
    marginBottom: 16,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  
  // Label styles for different screen sizes
  moodLabelSmall: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 2,
  },
  moodLabelMedium: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 3,
  },
  moodLabelTablet: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 6,
  },
  moodLabelLargeTablet: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  // Description styles for different screen sizes
  moodDescriptionSmall: {
    fontSize: 8,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 10,
  },
  moodDescriptionMedium: {
    fontSize: 9,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 12,
  },
  moodDescriptionTablet: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
    textAlign: 'center',
  },
  moodDescriptionLargeTablet: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
    textAlign: 'center',
  },
  
  moodSelectedIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodSelectedIndicatorTablet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    top: 12,
    right: 12,
  },
  moodSelectedIndicatorLargeTablet: {
    width: 32,
    height: 32,
    borderRadius: 16,
    top: 16,
    right: 16,
  },
  
  textInputContainer: {
    position: 'relative',
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    textAlignVertical: 'top',
    borderWidth: 2,
    borderColor: '#f1f5f9',
    minHeight: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  textInputActive: {
    borderColor: '#f1f5f9',
  },
  textInputTablet: {
    borderRadius: 20,
    padding: 28,
    fontSize: 18,
    minHeight: 200,
  },
  textInputLargeTablet: {
    borderRadius: 24,
    padding: 36,
    fontSize: 20,
    minHeight: 240,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  characterCount: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  characterCountText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  characterCountTextTablet: {
    fontSize: 14,
  },
  characterCountTextLargeTablet: {
    fontSize: 16,
  },
  inputProgress: {
    width: 60,
    height: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 2,
    overflow: 'hidden',
  },
  inputProgressActive: {
    backgroundColor: '#e2e8f0',
  },
  inputProgressBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  habitsGrid: {
    gap: 12,
  },
  habitsGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  habitsGridLargeTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  habitItemMobile: {
    width: '100%',
  },
  habitItemTablet: {
    width: '48%',
  },
  habitItemLargeTablet: {
    width: '31%',
  },
  habitOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  habitOptionTablet: {
    borderRadius: 20,
    padding: 20,
  },
  habitOptionLargeTablet: {
    borderRadius: 24,
    padding: 24,
  },
  habitOptionSelected: {
    backgroundColor: '#fefefe',
    transform: [{ scale: 1.01 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  habitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  habitIconTablet: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  habitIconLargeTablet: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 20,
  },
  habitEmoji: {
    fontSize: 20,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  habitEmojiTablet: {
    fontSize: 24,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  habitEmojiLargeTablet: {
    fontSize: 28,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  habitInfo: {
    flex: 1,
  },
  habitLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  habitLabelTablet: {
    fontSize: 18,
  },
  habitLabelLargeTablet: {
    fontSize: 20,
  },
  habitDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
    marginTop: 2,
  },
  habitDescriptionTablet: {
    fontSize: 14,
    marginTop: 4,
  },
  habitDescriptionLargeTablet: {
    fontSize: 16,
    marginTop: 6,
  },
  habitCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitCheckboxTablet: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  habitCheckboxLargeTablet: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  habitCheckboxSelected: {
    borderColor: 'transparent',
  },
  summarySection: {
    marginBottom: 32,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  summarySectionTablet: {
    marginBottom: 48,
    borderRadius: 24,
  },
  summarySectionLargeTablet: {
    marginBottom: 64,
    borderRadius: 28,
  },
  summaryGradient: {
    padding: 20,
  },
  summaryGradientTablet: {
    padding: 28,
  },
  summaryGradientLargeTablet: {
    padding: 36,
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
  summaryTitleTablet: {
    fontSize: 22,
    marginLeft: 12,
  },
  summaryTitleLargeTablet: {
    fontSize: 26,
    marginLeft: 16,
  },
  summaryBadge: {
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  summaryBadgeTablet: {
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  summaryBadgeLargeTablet: {
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  summaryBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  summaryBadgeTextTablet: {
    fontSize: 14,
  },
  summaryBadgeTextLargeTablet: {
    fontSize: 16,
  },
  summaryItems: {
    gap: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItemIcon: {
    fontSize: 16,
    marginRight: 8,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  summaryItemIconTablet: {
    fontSize: 20,
    marginRight: 12,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  summaryItemIconLargeTablet: {
    fontSize: 24,
    marginRight: 16,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  summaryItemText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  summaryItemTextTablet: {
    fontSize: 16,
  },
  summaryItemTextLargeTablet: {
    fontSize: 18,
  },
  quoteSection: {
    marginBottom: 32,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quoteSectionTablet: {
    marginBottom: 48,
    borderRadius: 20,
  },
  quoteSectionLargeTablet: {
    marginBottom: 64,
    borderRadius: 24,
  },
  quoteGradient: {
    padding: 24,
    alignItems: 'center',
  },
  quoteGradientTablet: {
    padding: 32,
  },
  quoteGradientLargeTablet: {
    padding: 40,
  },
  quote: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#5b21b6',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 24,
  },
  quoteTablet: {
    fontSize: 20,
    lineHeight: 30,
    marginBottom: 12,
  },
  quoteLargeTablet: {
    fontSize: 24,
    lineHeight: 36,
    marginBottom: 16,
  },
  quoteAuthor: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8b5cf6',
  },
  quoteAuthorTablet: {
    fontSize: 16,
  },
  quoteAuthorLargeTablet: {
    fontSize: 18,
  },
  saveSection: {
    marginBottom: 32,
  },
  saveButtonLarge: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  saveButtonLargeTablet: {
    borderRadius: 20,
  },
  saveButtonLargeLargeTablet: {
    borderRadius: 24,
  },
  saveButtonActive: {
    shadowColor: '#667eea',
    shadowOpacity: 0.3,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 8,
  },
  saveButtonGradientTablet: {
    padding: 24,
    gap: 12,
  },
  saveButtonGradientLargeTablet: {
    padding: 32,
    gap: 16,
  },
  saveButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  saveButtonTextTablet: {
    fontSize: 22,
  },
  saveButtonTextLargeTablet: {
    fontSize: 26,
  },
});