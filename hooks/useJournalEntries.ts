import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { useAuth } from './useAuth';
import type { RealtimeChannel } from '@supabase/supabase-js';

type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];
type JournalEntryInsert = Database['public']['Tables']['journal_entries']['Insert'];
type JournalEntryUpdate = Database['public']['Tables']['journal_entries']['Update'];

export function useJournalEntries() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEntries();
      
      // Remove any existing channel with the same name before creating a new one
      supabase.removeChannel(supabase.channel('journal_entries'));
      
      // Set up realtime subscription
      const subscription: RealtimeChannel = supabase
        .channel('journal_entries')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'journal_entries',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Realtime update:', payload);
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

      return () => {
        subscription.unsubscribe();
        supabase.removeChannel(subscription);
      };
    } else {
      setEntries([]);
      setLoading(false);
    }
  }, [user]);

  const fetchEntries = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Fetching entries for user:', user.id);
      
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching entries:', error);
      } else {
        console.log('Fetched entries:', data?.length || 0);
        setEntries(data || []);
      }
    } catch (error) {
      console.error('Error in fetchEntries:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async (entryData: Omit<JournalEntryInsert, 'user_id'>) => {
    if (!user) {
      console.error('No user found for addEntry');
      return { error: 'User not authenticated' };
    }

    try {
      console.log('Adding entry:', entryData);
      
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
        return { error: error.message };
      }

      console.log('Entry added successfully:', data);
      return { data };
    } catch (error) {
      console.error('Error in addEntry:', error);
      return { error: 'Failed to add entry' };
    }
  };

  const updateEntry = async (id: string, updates: Partial<JournalEntryUpdate>) => {
    if (!user) {
      console.error('No user found for updateEntry');
      return { error: 'User not authenticated' };
    }

    try {
      console.log('Updating entry:', id, updates);
      
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
        return { error: error.message };
      }

      console.log('Entry updated successfully:', data);
      return { data };
    } catch (error) {
      console.error('Error in updateEntry:', error);
      return { error: 'Failed to update entry' };
    }
  };

  const deleteEntry = async (id: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting entry:', error);
        return { error };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteEntry:', error);
      return { error };
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