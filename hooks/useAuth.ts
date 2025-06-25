import { useEffect, useState, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mountedRef.current) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      if (mountedRef.current) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      if (mountedRef.current) {
        setLoading(true);
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      if (mountedRef.current) {
        setLoading(true);
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      return { data, error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const signOut = async () => {
    try {
      if (mountedRef.current) {
        setLoading(true);
      }
      console.log('Signing out user...');
      
      // Clear local state immediately
      if (mountedRef.current) {
        setSession(null);
        setUser(null);
      }
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        return { error };
      }
      
      console.log('Successfully signed out');
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  };

  return {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
}