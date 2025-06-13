import React, { createContext, useContext } from 'react';
import { useAuthContext } from './AuthProvider';
import { useJournalEntries } from '@/hooks/useJournalEntries';
import { Database } from '@/types/database';

type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export interface UserSubscription {
  plan: 'free' | 'pro';
  entriesThisWeek: number;
  maxEntriesPerWeek: number;
  customDomain?: string;
}

interface UserContextType {
  entries: JournalEntry[];
  subscription: UserSubscription;
  profile: Profile | null;
  loading: boolean;
  addEntry: (entry: {
    date: string;
    mood: number;
    moodEmoji: string;
    decision: string;
    habits: { [key: string]: boolean };
  }) => Promise<any>;
  updateSubscription: (plan: 'free' | 'pro') => Promise<any>;
  setCustomDomain: (domain: string) => Promise<any>;
  getWeeklySummary: () => string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { profile, updateProfile, loading: authLoading } = useAuthContext();
  const { entries, addEntry: addJournalEntry, getWeeklySummary, loading: entriesLoading } = useJournalEntries();

  const loading = authLoading || entriesLoading;

  // Calculate entries this week
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  startOfWeek.setHours(0, 0, 0, 0);
  
  const thisWeekEntries = entries.filter(entry => 
    new Date(entry.created_at) >= startOfWeek
  );

  const subscription: UserSubscription = {
    plan: profile?.subscription_plan || 'free',
    entriesThisWeek: thisWeekEntries.length,
    maxEntriesPerWeek: profile?.subscription_plan === 'pro' ? 999 : 3,
    customDomain: profile?.custom_domain || undefined,
  };

  const addEntry = async (entryData: {
    date: string;
    mood: number;
    moodEmoji: string;
    decision: string;
    habits: { [key: string]: boolean };
  }) => {
    return await addJournalEntry({
      date: entryData.date,
      mood: entryData.mood,
      mood_emoji: entryData.moodEmoji,
      decision: entryData.decision,
      habits: entryData.habits,
    });
  };

  const updateSubscription = async (plan: 'free' | 'pro') => {
    if (!profile) return { error: 'No profile found' };
    
    return await updateProfile({
      subscription_plan: plan,
    });
  };

  const setCustomDomain = async (domain: string) => {
    if (!profile) return { error: 'No profile found' };
    
    return await updateProfile({
      custom_domain: domain,
    });
  };

  return (
    <UserContext.Provider value={{
      entries,
      subscription,
      profile,
      loading,
      addEntry,
      updateSubscription,
      setCustomDomain,
      getWeeklySummary,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}