# API Design & Service Layer

## 🚀 API Architecture Overview

PhotoMemory AI uses a hybrid approach combining tRPC for type-safe client-server communication and Supabase's built-in APIs for real-time features and file storage.

### 🏗️ API Stack
- **tRPC**: Type-safe API layer with automatic TypeScript inference
- **Supabase**: Database, Authentication, Storage, and Real-time subscriptions
- **Zod**: Runtime validation and type inference
- **React Query**: Client-side caching and synchronization

## 📡 tRPC Router Structure

```typescript
// src/server/api/root.ts
import { createTRPCRouter } from './trpc';
import { authRouter } from './routers/auth';
import { userRouter } from './routers/user';
import { videoRouter } from './routers/video';
import { mediaRouter } from './routers/media';
import { billingRouter } from './routers/billing';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  video: videoRouter,
  media: mediaRouter,
  billing: billingRouter,
});

export type AppRouter = typeof appRouter;
```

### Authentication Router
```typescript
// src/server/api/routers/auth.ts
import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const authRouter = createTRPCRouter({
  // Sign up with email/password
  signUp: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8),
      displayName: z.string().min(2),
      language: z.enum(['en', 'ko', 'ja', 'zh-cn']).default('en')
    }))
    .mutation(async ({ input, ctx }) => {
      const { email, password, displayName, language } = input;
      
      // Create auth user
      const { data: authData, error: authError } = await ctx.supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: authError.message,
        });
      }
      
      if (!authData.user) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create user',
        });
      }
      
      // Create user profile
      const { error: profileError } = await ctx.supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          display_name: displayName,
          language,
        });
      
      if (profileError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create user profile',
        });
      }
      
      return {
        user: authData.user,
        message: 'User created successfully'
      };
    }),

  // Sign in
  signIn: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;
      
      const { data, error } = await ctx.supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: error.message,
        });
      }
      
      return {
        user: data.user,
        session: data.session,
      };
    }),

  // Sign out
  signOut: protectedProcedure
    .mutation(async ({ ctx }) => {
      const { error } = await ctx.supabase.auth.signOut();
      
      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }
      
      return { message: 'Signed out successfully' };
    }),

  // Get current user
  me: protectedProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabase
        .from('users')
        .select('*')
        .eq('id', ctx.user.id)
        .single();
      
      if (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User profile not found',
        });
      }
      
      return data;
    }),
});
```

### Video Router
```typescript
// src/server/api/routers/video.ts
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { CreateVideoProjectCommand } from '@/application/use-cases/video-generation/CreateVideoProject';
import { videoGenerationService } from '@/infrastructure/services/VideoGenerationService';

const videoStyleSchema = z.enum(['classic', 'modern', 'cinematic', 'vintage']);
const projectStatusSchema = z.enum(['draft', 'processing', 'completed', 'failed', 'cancelled']);

export const videoRouter = createTRPCRouter({
  // Create new video project
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(100),
      description: z.string().max(500).optional(),
      style: videoStyleSchema,
      durationMinutes: z.number().min(1).max(30),
      autoTranslate: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      const command = new CreateVideoProjectCommand(
        ctx.repositories.videoProject,
        ctx.services.translation,
        ctx.repositories.user
      );
      
      const result = await command.execute({
        userId: ctx.user.id,
        ...input,
      });
      
      return result;
    }),

  // Get user's video projects
  list: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
      offset: z.number().min(0).default(0),
      status: projectStatusSchema.optional(),
    }))
    .query(async ({ input, ctx }) => {
      const { limit, offset, status } = input;
      
      let query = ctx.supabase
        .from('video_projects')
        .select(`
          *,
          photos:photos(count),
          generated_videos:generated_videos(*)
        `)
        .eq('user_id', ctx.user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }
      
      return data;
    }),

  // Get single project
  get: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from('video_projects')
        .select(`
          *,
          photos:photos(*),
          generated_videos:generated_videos(*)
        `)
        .eq('id', input.id)
        .eq('user_id', ctx.user.id)
        .single();
      
      if (error || !data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }
      
      return data;
    }),

  // Update project
  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      title: z.string().min(1).max(100).optional(),
      description: z.string().max(500).optional(),
      style: videoStyleSchema.optional(),
      durationMinutes: z.number().min(1).max(30).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...updates } = input;
      
      const { data, error } = await ctx.supabase
        .from('video_projects')
        .update(updates)
        .eq('id', id)
        .eq('user_id', ctx.user.id)
        .select()
        .single();
      
      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }
      
      if (!data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }
      
      return data;
    }),

  // Request video generation
  generateVideo: protectedProcedure
    .input(z.object({
      projectId: z.string().uuid(),
      prompt: z.string().max(1000).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { projectId, prompt } = input;
      
      // Check if project exists and belongs to user
      const { data: project, error: projectError } = await ctx.supabase
        .from('video_projects')
        .select('*, photos(count)')
        .eq('id', projectId)
        .eq('user_id', ctx.user.id)
        .single();
      
      if (projectError || !project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }
      
      // Validate business rules
      if (project.photos[0].count === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Project must have at least one photo',
        });
      }
      
      if (project.status !== 'draft') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Project is not in draft status',
        });
      }
      
      // Check user's subscription limits
      const canGenerate = await ctx.services.subscriptionLimitChecker
        .checkVideoGenerationLimit(ctx.user.id);
      
      if (!canGenerate) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Video generation limit exceeded',
        });
      }
      
      // Start generation process
      const generationResult = await videoGenerationService.requestGeneration({
        projectId,
        userId: ctx.user.id,
        photos: project.photos,
        style: project.style,
        duration: project.duration_minutes,
        prompt: prompt || project.ai_prompt,
      });
      
      return generationResult;
    }),

  // Get generation status
  getGenerationStatus: protectedProcedure
    .input(z.object({
      generationId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from('generated_videos')
        .select('*')
        .eq('id', input.generationId)
        .single();
      
      if (error || !data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Generation not found',
        });
      }
      
      // Verify ownership through project
      const { data: project, error: projectError } = await ctx.supabase
        .from('video_projects')
        .select('user_id')
        .eq('id', data.project_id)
        .single();
      
      if (projectError || project?.user_id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }
      
      return data;
    }),

  // Delete project
  delete: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from('video_projects')
        .delete()
        .eq('id', input.id)
        .eq('user_id', ctx.user.id)
        .select()
        .single();
      
      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }
      
      if (!data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }
      
      return { message: 'Project deleted successfully' };
    }),
});
```

### Media Router
```typescript
// src/server/api/routers/media.ts
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const mediaRouter = createTRPCRouter({
  // Get signed upload URL
  getUploadUrl: protectedProcedure
    .input(z.object({
      projectId: z.string().uuid(),
      filename: z.string(),
      contentType: z.string(),
      fileSize: z.number().max(10 * 1024 * 1024), // 10MB limit
    }))
    .mutation(async ({ input, ctx }) => {
      const { projectId, filename, contentType, fileSize } = input;
      
      // Verify project ownership
      const { data: project, error: projectError } = await ctx.supabase
        .from('video_projects')
        .select('user_id, photo_count')
        .eq('id', projectId)
        .eq('user_id', ctx.user.id)
        .single();
      
      if (projectError || !project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }
      
      // Check photo limit
      if (project.photo_count >= 20) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Maximum photos per project exceeded',
        });
      }
      
      // Check storage quota
      const storageQuotaExceeded = await ctx.services.storageQuotaChecker
        .checkStorageQuota(ctx.user.id, fileSize);
      
      if (storageQuotaExceeded) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Storage quota exceeded',
        });
      }
      
      // Generate signed upload URL
      const path = `projects/${projectId}/photos/${Date.now()}-${filename}`;
      
      const { data, error } = await ctx.supabase.storage
        .from('media')
        .createSignedUploadUrl(path);
      
      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate upload URL',
        });
      }
      
      return {
        uploadUrl: data.signedUrl,
        path: data.path,
        token: data.token,
      };
    }),

  // Confirm photo upload and save metadata
  confirmUpload: protectedProcedure
    .input(z.object({
      projectId: z.string().uuid(),
      path: z.string(),
      filename: z.string(),
      fileSize: z.number(),
      width: z.number().optional(),
      height: z.number().optional(),
      uploadOrder: z.number().default(0),
    }))
    .mutation(async ({ input, ctx }) => {
      const { projectId, path, filename, fileSize, width, height, uploadOrder } = input;
      
      // Verify project ownership
      const { data: project, error: projectError } = await ctx.supabase
        .from('video_projects')
        .select('user_id')
        .eq('id', projectId)
        .eq('user_id', ctx.user.id)
        .single();
      
      if (projectError || !project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }
      
      // Get public URL
      const { data: publicUrlData } = ctx.supabase.storage
        .from('media')
        .getPublicUrl(path);
      
      // Save photo record
      const { data, error } = await ctx.supabase
        .from('photos')
        .insert({
          project_id: projectId,
          file_url: publicUrlData.publicUrl,
          original_filename: filename,
          file_size_bytes: fileSize,
          mime_type: 'image/jpeg', // Detect from file
          width,
          height,
          upload_order: uploadOrder,
        })
        .select()
        .single();
      
      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save photo record',
        });
      }
      
      return data;
    }),

  // Get project photos
  getProjectPhotos: protectedProcedure
    .input(z.object({
      projectId: z.string().uuid(),
    }))
    .query(async ({ input, ctx }) => {
      // Verify project ownership
      const { data: project, error: projectError } = await ctx.supabase
        .from('video_projects')
        .select('user_id')
        .eq('id', input.projectId)
        .eq('user_id', ctx.user.id)
        .single();
      
      if (projectError || !project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }
      
      const { data, error } = await ctx.supabase
        .from('photos')
        .select('*')
        .eq('project_id', input.projectId)
        .order('upload_order');
      
      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }
      
      return data;
    }),

  // Delete photo
  deletePhoto: protectedProcedure
    .input(z.object({
      photoId: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Get photo with project ownership check
      const { data: photo, error: photoError } = await ctx.supabase
        .from('photos')
        .select(`
          *,
          project:video_projects!inner(user_id)
        `)
        .eq('id', input.photoId)
        .eq('project.user_id', ctx.user.id)
        .single();
      
      if (photoError || !photo) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Photo not found',
        });
      }
      
      // Delete from storage
      const path = photo.file_url.split('/').pop();
      if (path) {
        await ctx.supabase.storage
          .from('media')
          .remove([path]);
      }
      
      // Delete record
      const { error: deleteError } = await ctx.supabase
        .from('photos')
        .delete()
        .eq('id', input.photoId);
      
      if (deleteError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete photo',
        });
      }
      
      return { message: 'Photo deleted successfully' };
    }),
});
```

## 🔌 tRPC Context Setup

```typescript
// src/server/api/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { createClient } from '@supabase/supabase-js';
import superjson from 'superjson';
import { ZodError } from 'zod';

// Create context type
interface CreateContextOptions {
  supabaseUrl: string;
  supabaseKey: string;
  req?: Request;
}

export const createContext = async (opts: CreateContextOptions) => {
  const { supabaseUrl, supabaseKey, req } = opts;
  
  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Get user from request headers
  let user = null;
  if (req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data } = await supabase.auth.getUser(token);
      user = data.user;
    }
  }
  
  return {
    supabase,
    user,
    // Add repositories and services
    repositories: {
      user: new SupabaseUserRepository(supabase),
      videoProject: new SupabaseVideoProjectRepository(supabase),
      media: new SupabaseMediaRepository(supabase),
    },
    services: {
      translation: new GoogleTranslateService(process.env.GOOGLE_TRANSLATE_API_KEY!),
      subscriptionLimitChecker: new SubscriptionLimitChecker(supabase),
      storageQuotaChecker: new StorageQuotaChecker(supabase),
      videoGeneration: new OpenAIVideoGenerationService(),
    },
  };
};

type Context = Awaited<ReturnType<typeof createContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// Auth middleware
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
```

## 🌐 Client-Side API Integration

```typescript
// src/utils/api.ts
import { createTRPCNext } from '@trpc/next';
import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink, loggerLink } from '@trpc/client';
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import superjson from 'superjson';
import { AppRouter } from '@/server/api/root';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return ''; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

// Create tRPC client
export const api = createTRPCNext<AppRouter>({
  config() {
    return {
      transformer: superjson,
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          headers() {
            const token = localStorage.getItem('supabase.auth.token');
            return token ? { authorization: `Bearer ${token}` } : {};
          },
        }),
      ],
    };
  },
  ssr: false,
});

// Export type helpers
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
```

## 🎣 Custom React Hooks

```typescript
// src/hooks/api/useVideoProjects.ts
import { api } from '@/utils/api';
import { useQueryClient } from '@tanstack/react-query';

export const useVideoProjects = (options?: { status?: string }) => {
  const queryClient = useQueryClient();

  const projects = api.video.list.useQuery({
    status: options?.status,
  });

  const createProject = api.video.create.useMutation({
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(['video', 'list']);
    },
  });

  const updateProject = api.video.update.useMutation({
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(['video', 'get', data.id], data);
      queryClient.invalidateQueries(['video', 'list']);
    },
  });

  const deleteProject = api.video.delete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(['video', 'list']);
    },
  });

  const generateVideo = api.video.generateVideo.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(['video', 'list']);
    },
  });

  return {
    projects: projects.data,
    isLoading: projects.isLoading,
    error: projects.error,
    createProject,
    updateProject,
    deleteProject,
    generateVideo,
  };
};

// src/hooks/api/useFileUpload.ts
import { api } from '@/utils/api';
import { useState } from 'react';

export const useFileUpload = (projectId: string) => {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const getUploadUrl = api.media.getUploadUrl.useMutation();
  const confirmUpload = api.media.confirmUpload.useMutation();

  const uploadFile = async (file: File, uploadOrder: number = 0) => {
    try {
      // Get signed upload URL
      const uploadData = await getUploadUrl.mutateAsync({
        projectId,
        filename: file.name,
        contentType: file.type,
        fileSize: file.size,
      });

      // Upload file to storage
      const formData = new FormData();
      formData.append('file', file);
      
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
          }
        });

        xhr.onload = async () => {
          if (xhr.status === 200) {
            try {
              // Get image dimensions
              const img = new Image();
              img.onload = async () => {
                // Confirm upload
                const result = await confirmUpload.mutateAsync({
                  projectId,
                  path: uploadData.path,
                  filename: file.name,
                  fileSize: file.size,
                  width: img.width,
                  height: img.height,
                  uploadOrder,
                });
                
                resolve(result);
              };
              img.src = URL.createObjectURL(file);
            } catch (error) {
              reject(error);
            }
          } else {
            reject(new Error('Upload failed'));
          }
        };

        xhr.onerror = () => reject(new Error('Upload failed'));
        
        xhr.open('POST', uploadData.uploadUrl);
        xhr.send(formData);
      });
    } catch (error) {
      throw error;
    }
  };

  return {
    uploadFile,
    uploadProgress,
    isUploading: getUploadUrl.isLoading || confirmUpload.isLoading,
  };
};
```

## 🔄 Real-time Updates with Supabase

```typescript
// src/hooks/useRealtimeSubscription.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const useRealtimeVideoUpdates = (userId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const subscription = supabase
      .channel('video_generation_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'generated_videos',
          filter: `project_id=in.(SELECT id FROM video_projects WHERE user_id=${userId})`,
        },
        (payload) => {
          // Update generation status cache
          queryClient.setQueryData(
            ['video', 'generation-status', payload.new.id],
            payload.new
          );
          
          // Invalidate project list to show updated status
          queryClient.invalidateQueries(['video', 'list']);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, queryClient]);
};

// Usage in component
const VideoGenerationPage = () => {
  const { user } = useAuth();
  
  // Subscribe to real-time updates
  useRealtimeVideoUpdates(user?.id);
  
  // ... rest of component
};
```

## 📈 API Performance Optimization

### Response Caching
```typescript
// src/server/api/middleware/cache.ts
import { TRPCError } from '@trpc/server';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const cached = (ttlSeconds: number = 300) => {
  return async ({ ctx, next, path, input }: any) => {
    const cacheKey = `trpc:${path}:${JSON.stringify(input)}:${ctx.user?.id || 'anonymous'}`;
    
    // Try to get from cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return { data: JSON.parse(cached) };
    }
    
    // Execute procedure
    const result = await next();
    
    // Cache successful results
    if (result.ok) {
      await redis.setex(cacheKey, ttlSeconds, JSON.stringify(result.data));
    }
    
    return result;
  };
};

// Usage
export const videoRouter = createTRPCRouter({
  list: protectedProcedure
    .use(cached(60)) // Cache for 1 minute
    .input(listSchema)
    .query(async ({ input, ctx }) => {
      // ...
    }),
});
```

### Request Batching
```typescript
// Client automatically batches requests within 10ms window
export const api = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        httpBatchLink({
          url: '/api/trpc',
          maxBatchSize: 10,
          maxURLLength: 2083,
        }),
      ],
    };
  },
});
```

## 🛡️ API Security

### Rate Limiting
```typescript
// src/server/api/middleware/rateLimit.ts
import { TRPCError } from '@trpc/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
});

export const rateLimited = async ({ ctx, next }: any) => {
  const identifier = ctx.user?.id || ctx.req?.ip || 'anonymous';
  
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);
  
  if (!success) {
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: `Rate limit exceeded. Try again in ${Math.round((reset - Date.now()) / 1000)} seconds.`,
    });
  }
  
  return next();
};

// Usage on expensive endpoints
export const videoRouter = createTRPCRouter({
  generateVideo: protectedProcedure
    .use(rateLimited)
    .input(generateVideoSchema)
    .mutation(async ({ input, ctx }) => {
      // ...
    }),
});
```

This API design provides:
- **Type Safety**: Full TypeScript inference from server to client
- **Performance**: Efficient batching, caching, and real-time updates
- **Security**: Authentication, authorization, rate limiting
- **Developer Experience**: Automatic code generation and error handling
- **Scalability**: Modular router structure and middleware system
- **Real-time**: WebSocket subscriptions for live updates