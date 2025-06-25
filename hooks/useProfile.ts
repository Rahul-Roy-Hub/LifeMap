import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { useAuth } from './useAuth';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    
    if (user) {
      fetchProfile();
    } else {
      // Clear profile when user is null (signed out)
      if (mountedRef.current) {
        setProfile(null);
        setLoading(false);
      }
    }

    return () => {
      mountedRef.current = false;
    };
  }, [user]);

  const fetchProfile = async () => {
    if (!user) {
      if (mountedRef.current) {
        setProfile(null);
        setLoading(false);
      }
      return;
    }

    try {
      if (mountedRef.current) {
        setLoading(true);
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!mountedRef.current) return;

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        await createProfile();
      } else if (error) {
        console.error('Error fetching profile:', error);
        if (mountedRef.current) {
          setProfile(null);
        }
      } else {
        if (mountedRef.current) {
          setProfile(data);
        }
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      if (mountedRef.current) {
        setProfile(null);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const createProfile = async () => {
    if (!user) return;

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

      if (!mountedRef.current) return;

      if (error) {
        console.error('Error creating profile:', error);
        if (mountedRef.current) {
          setProfile(null);
        }
      } else {
        if (mountedRef.current) {
          setProfile(data);
        }
      }
    } catch (error) {
      console.error('Error in createProfile:', error);
      if (mountedRef.current) {
        setProfile(null);
      }
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return { error: 'No user or profile found' };

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

      if (!mountedRef.current) return { error: 'Component unmounted' };

      if (error) {
        console.error('Error updating profile:', error);
        return { error };
      } else {
        if (mountedRef.current) {
          setProfile(data);
        }
        return { data };
      }
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return { error };
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile,
  };
}