import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get environment variables for different platforms
const getSupabaseUrl = (): string => {
  if (Platform.OS === 'web') {
    return process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  } else {
    return Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  }
};

const getSupabaseAnonKey = (): string => {
  if (Platform.OS === 'web') {
    return process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
  } else {
    return Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
  }
};

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

// Debug logging to verify the fix
console.log('Platform:', Platform.OS);
console.log('Supabase URL length:', supabaseUrl?.length || 0);
console.log('Supabase Key length:', supabaseAnonKey?.length || 0);

// Check if we have valid credentials
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Please add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file');
  console.warn('For now, using placeholder values to prevent app crash');
}

// Use placeholder values if credentials are missing to prevent app crash
const finalSupabaseUrl = supabaseUrl || 'https://placeholder.supabase.co';
const finalSupabaseAnonKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient<Database>(finalSupabaseUrl, finalSupabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: AsyncStorage,
  },
});

// Export a function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey);
};