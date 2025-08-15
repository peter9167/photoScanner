import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  language: string;
  subscriptionPlan: string;
  totalStorageBytes: number;
}

interface SignUpData {
  email: string;
  password: string;
  displayName: string;
  language: string;
}

interface AuthState {
  // State
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshUser: () => Promise<void>;
  
  // Internal
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        profile: null,
        isLoading: false,
        isAuthenticated: false,

        // Actions
        signIn: async (email: string, password: string) => {
          set({ isLoading: true });
          
          try {
            const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });

            if (error) throw error;

            set({
              user: data.user,
              isAuthenticated: true,
            });

            // Fetch profile
            await get().refreshUser();
          } catch (error) {
            console.error('Sign in error:', error);
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        signUp: async (data: SignUpData) => {
          set({ isLoading: true });
          
          try {
            const { data: authData, error } = await supabase.auth.signUp({
              email: data.email,
              password: data.password,
              options: {
                data: {
                  display_name: data.displayName,
                  language: data.language,
                },
              },
            });

            if (error) throw error;

            set({
              user: authData.user,
              isAuthenticated: !!authData.user,
            });
          } catch (error) {
            console.error('Sign up error:', error);
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        signOut: async () => {
          set({ isLoading: true });
          
          try {
            await supabase.auth.signOut();
            
            set({
              user: null,
              profile: null,
              isAuthenticated: false,
            });
          } catch (error) {
            console.error('Sign out error:', error);
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        updateProfile: async (updates: Partial<UserProfile>) => {
          const { profile } = get();
          if (!profile) return;

          try {
            const { error } = await supabase
              .from('users')
              .update(updates)
              .eq('id', profile.id);

            if (error) throw error;

            set({
              profile: { ...profile, ...updates },
            });
          } catch (error) {
            console.error('Update profile error:', error);
            throw error;
          }
        },

        refreshUser: async () => {
          const { user } = get();
          if (!user) return;

          try {
            const { data, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', user.id)
              .single();

            if (error) {
              console.warn('Could not fetch user profile:', error);
              return;
            }

            const userData = data as any;
            set({
              profile: {
                id: userData?.id,
                email: userData?.email,
                displayName: userData?.display_name,
                avatarUrl: userData?.avatar_url,
                language: userData?.language,
                subscriptionPlan: userData?.subscription_plan,
                totalStorageBytes: userData?.total_storage_bytes,
              },
            });
          } catch (error) {
            console.error('Refresh user error:', error);
          }
        },

        // Internal setters
        setUser: (user) => set({ 
          user, 
          isAuthenticated: !!user 
        }),
        setProfile: (profile) => set({ profile }),
        setLoading: (isLoading) => set({ isLoading }),
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          profile: state.profile,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);