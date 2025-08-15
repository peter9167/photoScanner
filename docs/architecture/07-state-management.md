# State Management & Data Flow Architecture

## 🔄 State Management Strategy

PhotoMemory AI uses a hybrid approach combining multiple state management solutions optimized for different use cases.

### 🏗️ State Management Stack

```
┌─────────────────────────────────────────────────────────────────────┐
│                       Global State Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │   Zustand   │  │ React Query │  │  Supabase   │                │
│  │  (UI State) │  │ (Server)    │  │ (Realtime)  │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      Component State Layer                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │   useState  │  │ useReducer  │  │   Custom    │                │
│  │ (Local UI)  │  │ (Complex)   │  │   Hooks     │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
```

## 🎯 State Categories

### 1. UI State (Zustand)
- Theme preferences
- Navigation state
- Modal visibility
- Form states
- Loading indicators

### 2. Server State (React Query + tRPC)
- User data
- Video projects
- Media files
- Billing information
- API cache management

### 3. Real-time State (Supabase Subscriptions)
- Video generation progress
- Collaborative editing
- System notifications
- Live user presence

### 4. Local Component State (React Hooks)
- Form inputs
- Component visibility
- Temporary UI state
- Animation states

## 🏪 Zustand Store Architecture

### Auth Store
```typescript
// src/stores/auth.store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';
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

            if (error) throw error;

            set({
              profile: {
                id: data.id,
                email: data.email,
                displayName: data.display_name,
                avatarUrl: data.avatar_url,
                language: data.language,
                subscriptionPlan: data.subscription_plan,
                totalStorageBytes: data.total_storage_bytes,
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

// Auth initialization hook
export const useInitializeAuth = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const refreshUser = useAuthStore((state) => state.refreshUser);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        refreshUser();
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        refreshUser();
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, refreshUser]);
};
```

### UI Store
```typescript
// src/stores/ui.store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Navigation
  sidebarOpen: boolean;
  currentPage: string;
  
  // Modals
  modals: {
    [key: string]: {
      isOpen: boolean;
      data?: any;
    };
  };
  
  // Notifications
  notifications: Notification[];
  
  // Loading states
  globalLoading: boolean;
  loadingStates: Record<string, boolean>;
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentPage: (page: string) => void;
  openModal: (key: string, data?: any) => void;
  closeModal: (key: string) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  setGlobalLoading: (loading: boolean) => void;
  setLoadingState: (key: string, loading: boolean) => void;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      // Initial state
      theme: 'dark',
      sidebarOpen: true,
      currentPage: 'home',
      modals: {},
      notifications: [],
      globalLoading: false,
      loadingStates: {},

      // Theme actions
      setTheme: (theme) => {
        set({ theme });
        
        // Update document class
        document.documentElement.className = '';
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (theme === 'light') {
          document.documentElement.classList.add('light');
        } else {
          // System theme
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.classList.add(prefersDark ? 'dark' : 'light');
        }
        
        localStorage.setItem('theme', theme);
      },

      // Navigation actions
      toggleSidebar: () => set((state) => ({ 
        sidebarOpen: !state.sidebarOpen 
      })),
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      setCurrentPage: (page) => set({ currentPage: page }),

      // Modal actions
      openModal: (key, data) => set((state) => ({
        modals: {
          ...state.modals,
          [key]: { isOpen: true, data },
        },
      })),

      closeModal: (key) => set((state) => ({
        modals: {
          ...state.modals,
          [key]: { isOpen: false, data: undefined },
        },
      })),

      // Notification actions
      addNotification: (notification) => {
        const id = Math.random().toString(36).substring(2, 15);
        const newNotification = { ...notification, id };
        
        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));

        // Auto-remove after duration
        const duration = notification.duration || 5000;
        if (duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, duration);
        }
      },

      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      })),

      // Loading actions
      setGlobalLoading: (globalLoading) => set({ globalLoading }),
      
      setLoadingState: (key, loading) => set((state) => ({
        loadingStates: {
          ...state.loadingStates,
          [key]: loading,
        },
      })),
    }),
    { name: 'UIStore' }
  )
);

// Convenience hooks
export const useModal = (key: string) => {
  const modal = useUIStore((state) => state.modals[key]);
  const openModal = useUIStore((state) => state.openModal);
  const closeModal = useUIStore((state) => state.closeModal);

  return {
    isOpen: modal?.isOpen || false,
    data: modal?.data,
    open: (data?: any) => openModal(key, data),
    close: () => closeModal(key),
  };
};

export const useNotifications = () => {
  const notifications = useUIStore((state) => state.notifications);
  const addNotification = useUIStore((state) => state.addNotification);
  const removeNotification = useUIStore((state) => state.removeNotification);

  const notify = {
    success: (title: string, message?: string, options?: Partial<Notification>) => 
      addNotification({ type: 'success', title, message, ...options }),
    error: (title: string, message?: string, options?: Partial<Notification>) => 
      addNotification({ type: 'error', title, message, ...options }),
    warning: (title: string, message?: string, options?: Partial<Notification>) => 
      addNotification({ type: 'warning', title, message, ...options }),
    info: (title: string, message?: string, options?: Partial<Notification>) => 
      addNotification({ type: 'info', title, message, ...options }),
  };

  return {
    notifications,
    notify,
    removeNotification,
  };
};
```

### Video Project Store
```typescript
// src/stores/video.store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface VideoState {
  // Current editing project
  currentProject: VideoProject | null;
  
  // Form states
  projectForm: {
    title: string;
    description: string;
    style: VideoStyle;
    duration: number;
    photos: File[];
  };
  
  // Upload states
  uploadProgress: Record<string, number>;
  isUploading: boolean;
  
  // Generation states
  generationQueue: GenerationJob[];
  
  // Actions
  setCurrentProject: (project: VideoProject | null) => void;
  updateProjectForm: (updates: Partial<VideoState['projectForm']>) => void;
  resetProjectForm: () => void;
  addPhotos: (photos: File[]) => void;
  removePhoto: (index: number) => void;
  reorderPhotos: (from: number, to: number) => void;
  setUploadProgress: (filename: string, progress: number) => void;
  clearUploadProgress: () => void;
  addToGenerationQueue: (job: GenerationJob) => void;
  updateGenerationJob: (id: string, updates: Partial<GenerationJob>) => void;
  removeFromGenerationQueue: (id: string) => void;
}

interface VideoProject {
  id: string;
  title: string;
  description: string;
  style: VideoStyle;
  duration: number;
  status: 'draft' | 'processing' | 'completed' | 'failed';
  photos: Photo[];
  createdAt: Date;
  updatedAt: Date;
}

interface GenerationJob {
  id: string;
  projectId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  estimatedCompletion?: Date;
  error?: string;
}

const initialProjectForm = {
  title: '',
  description: '',
  style: 'classic' as VideoStyle,
  duration: 1,
  photos: [],
};

export const useVideoStore = create<VideoState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentProject: null,
      projectForm: { ...initialProjectForm },
      uploadProgress: {},
      isUploading: false,
      generationQueue: [],

      // Project actions
      setCurrentProject: (project) => set({ currentProject: project }),

      // Form actions
      updateProjectForm: (updates) => set((state) => ({
        projectForm: { ...state.projectForm, ...updates },
      })),

      resetProjectForm: () => set({
        projectForm: { ...initialProjectForm },
      }),

      // Photo actions
      addPhotos: (photos) => set((state) => ({
        projectForm: {
          ...state.projectForm,
          photos: [...state.projectForm.photos, ...photos],
        },
      })),

      removePhoto: (index) => set((state) => ({
        projectForm: {
          ...state.projectForm,
          photos: state.projectForm.photos.filter((_, i) => i !== index),
        },
      })),

      reorderPhotos: (from, to) => set((state) => {
        const photos = [...state.projectForm.photos];
        const [moved] = photos.splice(from, 1);
        photos.splice(to, 0, moved);
        
        return {
          projectForm: {
            ...state.projectForm,
            photos,
          },
        };
      }),

      // Upload actions
      setUploadProgress: (filename, progress) => set((state) => ({
        uploadProgress: {
          ...state.uploadProgress,
          [filename]: progress,
        },
        isUploading: Object.values({ ...state.uploadProgress, [filename]: progress })
          .some(p => p < 100),
      })),

      clearUploadProgress: () => set({
        uploadProgress: {},
        isUploading: false,
      }),

      // Generation queue actions
      addToGenerationQueue: (job) => set((state) => ({
        generationQueue: [...state.generationQueue, job],
      })),

      updateGenerationJob: (id, updates) => set((state) => ({
        generationQueue: state.generationQueue.map(job =>
          job.id === id ? { ...job, ...updates } : job
        ),
      })),

      removeFromGenerationQueue: (id) => set((state) => ({
        generationQueue: state.generationQueue.filter(job => job.id !== id),
      })),
    }),
    { name: 'VideoStore' }
  )
);

// Custom hooks for video store
export const useProjectForm = () => {
  const projectForm = useVideoStore((state) => state.projectForm);
  const updateProjectForm = useVideoStore((state) => state.updateProjectForm);
  const resetProjectForm = useVideoStore((state) => state.resetProjectForm);

  return {
    form: projectForm,
    update: updateProjectForm,
    reset: resetProjectForm,
  };
};

export const usePhotoManager = () => {
  const photos = useVideoStore((state) => state.projectForm.photos);
  const addPhotos = useVideoStore((state) => state.addPhotos);
  const removePhoto = useVideoStore((state) => state.removePhoto);
  const reorderPhotos = useVideoStore((state) => state.reorderPhotos);

  return {
    photos,
    add: addPhotos,
    remove: removePhoto,
    reorder: reorderPhotos,
  };
};

export const useGenerationQueue = () => {
  const queue = useVideoStore((state) => state.generationQueue);
  const addToQueue = useVideoStore((state) => state.addToGenerationQueue);
  const updateJob = useVideoStore((state) => state.updateGenerationJob);
  const removeFromQueue = useVideoStore((state) => state.removeFromGenerationQueue);

  return {
    queue,
    addJob: addToQueue,
    updateJob,
    removeJob: removeFromQueue,
    inProgress: queue.filter(job => job.status === 'processing'),
    completed: queue.filter(job => job.status === 'completed'),
    failed: queue.filter(job => job.status === 'failed'),
  };
};
```

## 🔄 React Query Integration

### Query Client Setup
```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import { useNotifications } from '@/stores/ui.store';

export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          return failureCount < 3;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        onError: (error: any) => {
          // Global error handling
          const { notify } = useNotifications();
          notify.error(
            'Operation Failed',
            error?.message || 'An unexpected error occurred'
          );
        },
      },
    },
  });
};

// Query keys factory
export const queryKeys = {
  all: ['api'] as const,
  
  // Auth
  auth: () => [...queryKeys.all, 'auth'] as const,
  me: () => [...queryKeys.auth(), 'me'] as const,
  
  // Video projects
  videos: () => [...queryKeys.all, 'videos'] as const,
  videoList: (filters: any) => [...queryKeys.videos(), 'list', filters] as const,
  videoDetail: (id: string) => [...queryKeys.videos(), 'detail', id] as const,
  videoPhotos: (id: string) => [...queryKeys.videos(), 'photos', id] as const,
  
  // Media
  media: () => [...queryKeys.all, 'media'] as const,
  mediaLibrary: (userId: string) => [...queryKeys.media(), 'library', userId] as const,
  
  // Generation
  generation: () => [...queryKeys.all, 'generation'] as const,
  generationStatus: (id: string) => [...queryKeys.generation(), 'status', id] as const,
};
```

### Custom Query Hooks
```typescript
// src/hooks/queries/useVideoQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { queryKeys } from '@/lib/queryClient';
import { useNotifications } from '@/stores/ui.store';

export const useVideoProjects = (filters?: { status?: string }) => {
  return useQuery({
    queryKey: queryKeys.videoList(filters),
    queryFn: () => api.video.list.query(filters),
    keepPreviousData: true,
  });
};

export const useVideoProject = (id: string) => {
  return useQuery({
    queryKey: queryKeys.videoDetail(id),
    queryFn: () => api.video.get.query({ id }),
    enabled: !!id,
  });
};

export const useCreateVideoProject = () => {
  const queryClient = useQueryClient();
  const { notify } = useNotifications();

  return useMutation({
    mutationFn: api.video.create.mutate,
    onSuccess: (data) => {
      // Invalidate projects list
      queryClient.invalidateQueries(queryKeys.videos());
      
      // Add new project to cache
      queryClient.setQueryData(
        queryKeys.videoDetail(data.id),
        data
      );
      
      notify.success('Project Created', 'Your video project has been created successfully');
    },
  });
};

export const useUpdateVideoProject = () => {
  const queryClient = useQueryClient();
  const { notify } = useNotifications();

  return useMutation({
    mutationFn: api.video.update.mutate,
    onMutate: async (variables) => {
      // Optimistic update
      const queryKey = queryKeys.videoDetail(variables.id);
      
      await queryClient.cancelQueries(queryKey);
      const previousData = queryClient.getQueryData(queryKey);
      
      queryClient.setQueryData(queryKey, (old: any) => ({
        ...old,
        ...variables,
      }));
      
      return { previousData, queryKey };
    },
    onError: (error, variables, context) => {
      // Revert optimistic update
      if (context) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
    },
    onSettled: (data, error, variables) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries(queryKeys.videoDetail(variables.id));
    },
    onSuccess: () => {
      notify.success('Project Updated', 'Your changes have been saved');
    },
  });
};

export const useGenerateVideo = () => {
  const queryClient = useQueryClient();
  const { notify } = useNotifications();

  return useMutation({
    mutationFn: api.video.generateVideo.mutate,
    onSuccess: (data, variables) => {
      // Update project status
      queryClient.setQueryData(
        queryKeys.videoDetail(variables.projectId),
        (old: any) => ({
          ...old,
          status: 'processing',
        })
      );
      
      // Invalidate projects list to show updated status
      queryClient.invalidateQueries(queryKeys.videos());
      
      notify.success(
        'Video Generation Started',
        'Your video is being generated. You will be notified when it\'s ready.'
      );
    },
  });
};
```

## 🔄 Real-time State Synchronization

### Supabase Realtime Integration
```typescript
// src/hooks/useRealtimeSync.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { useVideoStore } from '@/stores/video.store';
import { useNotifications } from '@/stores/ui.store';
import { queryKeys } from '@/lib/queryClient';

export const useRealtimeSync = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const updateGenerationJob = useVideoStore((state) => state.updateGenerationJob);
  const { notify } = useNotifications();

  useEffect(() => {
    if (!user) return;

    // Subscribe to video generation updates
    const generationSubscription = supabase
      .channel(`generation-updates-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'generated_videos',
          filter: `project_id=in.(SELECT id FROM video_projects WHERE user_id=${user.id})`,
        },
        (payload) => {
          const updatedVideo = payload.new;
          
          // Update React Query cache
          queryClient.setQueryData(
            queryKeys.generationStatus(updatedVideo.id),
            updatedVideo
          );
          
          // Update Zustand store
          updateGenerationJob(updatedVideo.id, {
            status: updatedVideo.status,
            progress: updatedVideo.progress_percentage,
            error: updatedVideo.error_message,
          });
          
          // Show notifications for status changes
          if (updatedVideo.status === 'completed') {
            notify.success(
              'Video Ready!',
              'Your video has been generated successfully',
              {
                action: {
                  label: 'View Video',
                  onClick: () => {
                    // Navigate to video
                    window.location.href = `/projects/${updatedVideo.project_id}`;
                  },
                },
              }
            );
          } else if (updatedVideo.status === 'failed') {
            notify.error(
              'Generation Failed',
              updatedVideo.error_message || 'Video generation failed',
              { duration: 10000 }
            );
          }
          
          // Invalidate related queries
          queryClient.invalidateQueries(queryKeys.videos());
          queryClient.invalidateQueries(queryKeys.videoDetail(updatedVideo.project_id));
        }
      )
      .subscribe();

    // Subscribe to project updates
    const projectSubscription = supabase
      .channel(`project-updates-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'video_projects',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Update project cache
          if (payload.new) {
            queryClient.setQueryData(
              queryKeys.videoDetail(payload.new.id),
              payload.new
            );
          }
          
          // Invalidate projects list
          queryClient.invalidateQueries(queryKeys.videos());
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      generationSubscription.unsubscribe();
      projectSubscription.unsubscribe();
    };
  }, [user?.id, queryClient, updateGenerationJob, notify]);
};
```

## 📱 State Persistence Strategy

### Persistent Storage Configuration
```typescript
// src/lib/storage.ts
interface PersistentStore {
  auth: {
    user: User | null;
    profile: UserProfile | null;
    isAuthenticated: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'system';
    sidebarOpen: boolean;
  };
  video: {
    projectForm: ProjectFormState;
  };
}

export const persistentStorage = {
  getItem: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  
  setItem: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },
  
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
};

// Auto-save draft projects
export const useAutoSave = () => {
  const projectForm = useVideoStore((state) => state.projectForm);
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (projectForm.title || projectForm.description || projectForm.photos.length > 0) {
        persistentStorage.setItem('draft-project', projectForm);
      }
    }, 2000); // Auto-save after 2 seconds of inactivity
    
    return () => clearTimeout(timeoutId);
  }, [projectForm]);
};
```

## 🎯 State Management Best Practices

### Performance Optimization
```typescript
// Memoized selectors
const useOptimizedVideoProjects = () => {
  return useVideoStore(
    useCallback(
      (state) => ({
        projects: state.projects,
        isLoading: state.isLoading,
        error: state.error,
      }),
      []
    )
  );
};

// Shallow comparison for objects
const useProjectForm = () => {
  return useVideoStore((state) => state.projectForm, shallow);
};

// Component-specific stores
const useVideoEditorState = create((set) => ({
  selectedTool: 'select',
  timeline: { position: 0, zoom: 1 },
  setSelectedTool: (tool) => set({ selectedTool: tool }),
  updateTimeline: (updates) => set((state) => ({
    timeline: { ...state.timeline, ...updates }
  })),
}));
```

### Error Boundary Integration
```typescript
// src/components/ErrorBoundary.tsx
import React from 'react';
import { useNotifications } from '@/stores/ui.store';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Reset stores to prevent cascade failures
    this.resetStores();
  }

  resetStores = () => {
    // Reset to initial state
    useUIStore.getState().setGlobalLoading(false);
    useVideoStore.getState().clearUploadProgress();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

This state management architecture provides:
- **Performance**: Optimized updates and minimal re-renders
- **Developer Experience**: Type-safe stores with DevTools
- **Scalability**: Modular store architecture
- **Real-time**: Synchronized with server state
- **Persistence**: Automatic draft saving and session recovery
- **Error Handling**: Robust error boundaries and recovery
- **Testing**: Easy to test with pure functions