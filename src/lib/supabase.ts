import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Supabase configuration
// Replace these with your actual Supabase project credentials
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Custom storage adapter using SecureStore for sensitive data
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      // SecureStore has limitations on key length and characters
      // Fall back to AsyncStorage for problematic keys
      return await AsyncStorage.getItem(key);
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      // Fall back to AsyncStorage
      await AsyncStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      await AsyncStorage.removeItem(key);
    }
  },
};

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper types for Supabase responses
export type SupabaseError = {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
};

// Auth helpers
export const auth = {
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'homenest://reset-password',
    });
    return { data, error };
  },

  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error };
  },

  getUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    return { user: data.user, error };
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Real-time subscription helpers
export const realtime = {
  subscribeToProject: (projectId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`project:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          filter: `project_id=eq.${projectId}`,
        },
        callback
      )
      .subscribe();
  },

  subscribeToTable: (
    table: string,
    filter: string | undefined,
    callback: (payload: any) => void
  ) => {
    const channel = supabase.channel(`${table}:${filter || 'all'}`);

    const config: any = {
      event: '*',
      schema: 'public',
      table,
    };

    if (filter) {
      config.filter = filter;
    }

    return channel.on('postgres_changes', config, callback).subscribe();
  },

  unsubscribe: (channel: any) => {
    return supabase.removeChannel(channel);
  },
};

// Storage helpers
export const storage = {
  uploadFile: async (
    bucket: string,
    path: string,
    file: Blob | ArrayBuffer,
    contentType: string
  ) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { contentType });
    return { data, error };
  },

  getSignedUrl: async (bucket: string, path: string, expiresIn: number = 3600) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);
    return { url: data?.signedUrl, error };
  },

  deleteFile: async (bucket: string, paths: string[]) => {
    const { data, error } = await supabase.storage.from(bucket).remove(paths);
    return { data, error };
  },

  getPublicUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },
};

export default supabase;
