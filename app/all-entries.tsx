import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useUser, UserProvider } from '@/components/UserContext';
import { useRouter } from 'expo-router';

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
    <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ padding: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Text style={{ color: '#667eea', fontWeight: 'bold', fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>All Reflections</Text>
        {entries.map(entry => (
          <TouchableOpacity
            key={entry.id}
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
              {formatDate(entry.created_at)} - {entry.mood_emoji}
            </Text>
            <Text style={{ color: '#6b7280', fontSize: 14, marginBottom: 2 }}>
              {formatTime(entry.created_at)}
            </Text>
            <Text numberOfLines={2} style={{ color: '#374151', marginTop: 4 }}>
              {entry.decision}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

export default function AllEntriesScreen() {
  return (
    <UserProvider>
      <AllEntriesContent />
    </UserProvider>
  );
} 