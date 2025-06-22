import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get environment variables for different platforms
const getSupabaseUrl = () => {
  if (Platform.OS === 'web') {
    return process.env.EXPO_PUBLIC_SUPABASE_URL!;
  } else {
    return Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL!;
  }
};

const getSupabaseAnonKey = () => {
  if (Platform.OS === 'web') {
    return process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
  } else {
    return Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
  }
};

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

// Debug logging to verify the fix
console.log('Platform:', Platform.OS);
console.log('Supabase URL length:', supabaseUrl?.length || 0);
console.log('Supabase Key length:', supabaseAnonKey?.length || 0);

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});