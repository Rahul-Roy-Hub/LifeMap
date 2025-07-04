import React, { createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Session, User } from '@supabase/supabase-js';
import { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, fullName?: string) => Promise<any>;
  signOut: () => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  updateProfile: (updates: Partial<Profile>) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();

  const loading = auth.loading || profileLoading;

  // Enhanced signOut that clears all state
  const enhancedSignOut = async () => {
    try {
      const result = await auth.signOut();
      
      // Force a small delay to ensure state propagation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return result;
    } catch (error) {
      console.error('Enhanced sign out error:', error);
      return { error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        profile,
        loading,
        updateProfile,
        signOut: enhancedSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}