import React, { createContext, useContext } from 'react';
import { useAuthContext } from './AuthProvider';
import { useJournalEntries } from '@/hooks/useJournalEntries';
import { Database } from '@/types/database';
import { getCurrentLocalDate, getStartOfWeek, getStartOfMonth, formatDateForDatabase, isThisWeek, isThisMonth } from '@/lib/dateUtils';

type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export interface UserSubscription {
  plan: 'free' | 'pro';
  entriesThisWeek: number;
  maxEntriesPerWeek: number;
  entriesThisMonth: number;
  maxEntriesPerMonth: number;
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
  updateEntry: (id: string, entry: {
    mood: number;
    moodEmoji: string;
    decision: string;
    habits: { [key: string]: boolean };
  }) => Promise<any>;
  getTodaysEntry: () => JournalEntry | null;
  updateSubscription: (plan: 'free' | 'pro') => Promise<any>;
  setCustomDomain: (domain: string) => Promise<any>;
  getWeeklySummary: () => string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { profile, updateProfile, loading: authLoading } = useAuthContext();
  const { entries, addEntry: addJournalEntry, updateEntry: updateJournalEntry, getWeeklySummary, loading: entriesLoading } = useJournalEntries();

  const loading = authLoading || entriesLoading;

  // Calculate entries this week using local timezone
  const thisWeekEntries = entries.filter(entry => isThisWeek(entry.date));

  // Calculate entries this month using local timezone
  const thisMonthEntries = entries.filter(entry => isThisMonth(entry.date));

  const subscription: UserSubscription = {
    plan: profile?.subscription_plan || 'free',
    entriesThisWeek: thisWeekEntries.length,
    maxEntriesPerWeek: 999, // Unlimited for all users now
    entriesThisMonth: thisMonthEntries.length,
    maxEntriesPerMonth: 30, // Both free and pro users get 30 entries per month
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

  const updateEntry = async (id: string, entryData: {
    mood: number;
    moodEmoji: string;
    decision: string;
    habits: { [key: string]: boolean };
  }) => {
    return await updateJournalEntry(id, {
      mood: entryData.mood,
      mood_emoji: entryData.moodEmoji,
      decision: entryData.decision,
      habits: entryData.habits,
    });
  };

  const getTodaysEntry = (): JournalEntry | null => {
    const today = getCurrentLocalDate();
    return entries.find(entry => entry.date === today) || null;
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
      updateEntry,
      getTodaysEntry,
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