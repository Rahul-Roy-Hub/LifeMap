import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useUser, UserProvider } from '@/components/UserContext';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';

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
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${hours}:${minutes} ${ampm}`;
}

function AllEntriesContent() {
  const { entries } = useUser();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <Animated.View entering={FadeInUp} style={styles.headerContainer}>
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
              <Text style={styles.headerTitle}>All Reflections</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Content */}
        <View style={styles.content}>
          {entries.map(entry => (
            <TouchableOpacity
              key={entry.id}
              style={styles.entryCard}
              onPress={() => router.push(`/entry-detail?id=${entry.id}`)}
            >
              <Text style={styles.entryDate}>
                {formatDate(entry.created_at)} - {entry.mood_emoji}
              </Text>
              <Text style={styles.entryTime}>
                {formatTime(entry.created_at)}
              </Text>
              <Text numberOfLines={2} style={styles.entryText}>
                {entry.decision}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function AllEntriesScreen() {
  return (
    <UserProvider>
      <AllEntriesContent />
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
  headerTitle: {
    fontSize: 32,
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
  entryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
  entryText: {
    color: '#374151',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
}); 