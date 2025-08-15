import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper functions for common operations
export const supabaseHelpers = {
  // Auth helpers
  auth: {
    signUp: async (email: string, password: string, metadata?: any) => {
      return await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
    },
    
    signIn: async (email: string, password: string) => {
      return await supabase.auth.signInWithPassword({
        email,
        password,
      });
    },
    
    signOut: async () => {
      return await supabase.auth.signOut();
    },
    
    getUser: async () => {
      return await supabase.auth.getUser();
    },
    
    getSession: async () => {
      return await supabase.auth.getSession();
    },
  },
  
  // Storage helpers
  storage: {
    uploadFile: async (bucket: string, path: string, file: File) => {
      return await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });
    },
    
    getPublicUrl: (bucket: string, path: string) => {
      return supabase.storage
        .from(bucket)
        .getPublicUrl(path);
    },
    
    deleteFile: async (bucket: string, paths: string[]) => {
      return await supabase.storage
        .from(bucket)
        .remove(paths);
    },
    
    createSignedUploadUrl: async (bucket: string, path: string) => {
      return await supabase.storage
        .from(bucket)
        .createSignedUploadUrl(path);
    },
  },
};