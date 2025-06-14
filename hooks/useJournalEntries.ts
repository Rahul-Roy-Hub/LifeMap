import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { useAuth } from './useAuth';
import type { RealtimeChannel } from '@supabase/supabase-js';

type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];
type JournalEntryInsert = Database['public']['Tables']['journal_entries']['Insert'];

export function useJournalEntries() {
  const { user, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const subscriptionRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    // Wait for auth to complete
    if (authLoading) {
      return;
    }

    // Clean up any existing subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }

    if (user?.id) {
      fetchEntries();
      
      // Set up realtime subscription
      const channel = supabase
        .channel(`journal_entries_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'journal_entries',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            // Use functional updates to avoid stale closure issues
            if (payload.eventType === 'INSERT') {
              setEntries(prev => [payload.new as JournalEntry, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              setEntries(prev => 
                prev.map(entry => 
                  entry.id === payload.new.id ? payload.new as JournalEntry : entry
                )
              );
            } else if (payload.eventType === 'DELETE') {
              setEntries(prev => 
                prev.filter(entry => entry.id !== payload.old.id)
              );
            }
          }
        )
        .subscribe();

      subscriptionRef.current = channel;
    } else {
      setEntries([]);
      setLoading(false);
    }

    // Cleanup function
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [user?.id, authLoading]); // Include authLoading in dependencies

  const fetchEntries = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching entries:', error);
        setEntries([]);
      } else {
        setEntries(data || []);
      }
    } catch (error) {
      console.error('Error in fetchEntries:', error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async (entryData: Omit<JournalEntryInsert, 'user_id'>) => {
    if (!user?.id) return { error: new Error('User not authenticated') };

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          ...entryData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding entry:', error);
        return { error: new Error('Failed to add entry') };
      }

      return { data };
    } catch (error) {
      console.error('Error in addEntry:', error);
      return { error: new Error('Failed to add entry') };
    }
  };

  const updateEntry = async (id: string, updates: Partial<JournalEntry>) => {
    if (!user?.id) return { error: new Error('User not authenticated') };

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating entry:', error);
        return { error: new Error('Failed to update entry') };
      }

      return { data };
    } catch (error) {
      console.error('Error in updateEntry:', error);
      return { error: new Error('Failed to update entry') };
    }
  };

  const deleteEntry = async (id: string) => {
    if (!user?.id) return { error: new Error('User not authenticated') };

    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting entry:', error);
        return { error: new Error('Failed to delete entry') };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteEntry:', error);
      return { error: new Error('Failed to delete entry') };
    }
  };

  const getWeeklySummary = () => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    
    const thisWeekEntries = entries.filter(entry => 
      new Date(entry.created_at) >= startOfWeek
    );

    if (thisWeekEntries.length === 0) {
      return "No entries this week. Start journaling to get insights!";
    }

    const avgMood = thisWeekEntries.reduce((sum, entry) => sum + entry.mood, 0) / thisWeekEntries.length;
    const moodDescription = avgMood >= 4 ? 'positive' : avgMood >= 3 ? 'balanced' : 'challenging';
    
    const habitCounts = thisWeekEntries.reduce((acc, entry) => {
      const habits = entry.habits as { [key: string]: boolean };
      if (habits && typeof habits === 'object') {
        Object.entries(habits).forEach(([habit, completed]) => {
          if (completed) {
            acc[habit] = (acc[habit] || 0) + 1;
          }
        });
      }
      return acc;
    }, {} as { [key: string]: number });

    const topHabit = Object.entries(habitCounts).sort(([,a], [,b]) => b - a)[0];
    
    return `This week you had ${thisWeekEntries.length} journal entries with a ${moodDescription} mood overall. ${topHabit ? `Your most consistent habit was ${topHabit[0]} (${topHabit[1]} times).` : ''} Keep up the great work on your self-growth journey!`;
  };

  return {
    entries,
    loading,
    addEntry,
    updateEntry,
    deleteEntry,
    getWeeklySummary,
    refetch: fetchEntries,
  };
}