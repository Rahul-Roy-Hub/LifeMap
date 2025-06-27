import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useUser, UserProvider } from '@/components/UserContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${dd}-${mm}-${yyyy}`;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

function parseHabits(habits: any): Record<string, boolean> {
  if (!habits || typeof habits !== 'object') return {};
  return Object.fromEntries(
    Object.entries(habits).map(([key, value]) => [key, Boolean(value)])
  );
}

function EntryDetailContent() {
  const { id } = useLocalSearchParams();
  const { entries } = useUser();
  const router = useRouter();
  const entry = entries.find(e => String(e.id) === String(id));

  if (!entry) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Entry not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const habits = parseHabits(entry.habits);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.container}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Entry Details</Text>
          </View>
        </LinearGradient>
        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.entryDate}>{formatDate(entry.created_at)} - {entry.mood_emoji}</Text>
              <Text style={styles.entryTime}>{formatTime(entry.created_at)}</Text>
            </View>
            <View style={styles.sectionRow}>
              <Text style={styles.label}>Mood:</Text>
              <Text style={styles.moodValue}>{entry.mood} / 5</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>Reflection:</Text>
              <Text style={styles.entryText}>{entry.decision}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>Habits:</Text>
              {Object.keys(habits).length === 0 && <Text style={styles.value}>No habits recorded.</Text>}
              {Object.entries(habits).map(([habit, completed]) => (
                <Text key={habit} style={styles.value}>
                  {completed ? '✅' : '⬜'} {habit}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function EntryDetailScreen() {
  return (
    <UserProvider>
      <EntryDetailContent />
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
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginTop: 8,
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  content: {
    padding: 20,
  },
  entryDate: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1e293b',
  },
  entryTime: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 2,
    fontFamily: 'Inter-Regular',
  },
  label: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#667eea',
    marginTop: 0,
    lineHeight: 22,
  },
  value: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginTop: 4,
  },
  entryText: {
    color: '#374151',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 18,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  section: {
    marginTop: 16,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 16,
    marginBottom: 4,
  },
  moodValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#fbbf24',
    marginLeft: 8,
    lineHeight: 22,
  },
}); 