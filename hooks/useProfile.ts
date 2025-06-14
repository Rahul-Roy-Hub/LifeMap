import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { useAuth } from './useAuth';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    if (user) {
      fetchProfile();
    } else {
      if (mounted) {
        setProfile(null);
        setLoading(false);
      }
    }

    async function fetchProfile() {
      if (!user || !mounted) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          await createProfile();
        } else if (error) {
          console.error('Error fetching profile:', error);
          if (mounted) {
            setLoading(false);
          }
        } else {
          if (mounted) {
            setProfile(data);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error in fetchProfile:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    }

    async function createProfile() {
      if (!user || !mounted) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name || null,
            subscription_plan: 'free',
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating profile:', error);
          // If profile creation fails, still set loading to false
          if (mounted) {
            setLoading(false);
          }
        } else {
          if (mounted) {
            setProfile(data);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error in createProfile:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    }

    return () => {
      mounted = false;
    };
  }, [user?.id]); // Only depend on user.id

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return { error: new Error('No user or profile found') };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return { error: new Error('Failed to update profile') };
      } else {
        setProfile(data);
        return { data };
      }
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return { error: new Error('Failed to update profile') };
    }
  };

  const refetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error refetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in refetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    refetch: refetchProfile,
  };
}