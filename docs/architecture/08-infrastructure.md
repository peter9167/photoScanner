# Infrastructure & Deployment Architecture

## 🏗️ Infrastructure Overview

PhotoMemory AI uses a modern, cloud-native infrastructure stack optimized for scalability, security, and developer productivity.

### 🔧 Technology Stack

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Frontend Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │   Vercel    │  │ Cloudflare  │  │   Sentry    │                │
│  │ (Hosting)   │  │    (CDN)    │  │(Monitoring) │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         Backend Layer                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │  Supabase   │  │   OpenAI    │  │   Stripe    │                │
│  │(BaaS/DB/Auth│  │ (AI Service)│  │ (Payments)  │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      Infrastructure Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │   GitHub    │  │ Upstash     │  │  LogTail    │                │
│  │(CI/CD/Code) │  │(Redis/Edge) │  │  (Logging)  │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
```

## 🚀 Deployment Architecture

### Frontend Deployment (Vercel)

```yaml
# vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs18.x",
      "maxDuration": 30
    }
  },
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-key",
    "OPENAI_API_KEY": "@openai-api-key",
    "STRIPE_SECRET_KEY": "@stripe-secret-key",
    "STRIPE_WEBHOOK_SECRET": "@stripe-webhook-secret",
    "REDIS_URL": "@redis-url",
    "GOOGLE_TRANSLATE_API_KEY": "@google-translate-key"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Environment Configuration
```typescript
// src/config/environment.ts
import { z } from 'zod';

const envSchema = z.object({
  // Database
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  
  // AI Services
  OPENAI_API_KEY: z.string(),
  GOOGLE_TRANSLATE_API_KEY: z.string(),
  
  // Payments
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string(),
  
  // Cache
  REDIS_URL: z.string().url(),
  
  // Monitoring
  SENTRY_DSN: z.string().url().optional(),
  
  // General
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isStaging = env.NODE_ENV === 'staging';
```

## 🗄️ Supabase Configuration

### Database Setup
```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Set up Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- Create custom types
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'cancelled', 'unpaid');
CREATE TYPE video_style AS ENUM ('classic', 'modern', 'cinematic', 'vintage');
CREATE TYPE project_status AS ENUM ('draft', 'processing', 'completed', 'failed', 'cancelled');
CREATE TYPE generation_status AS ENUM ('queued', 'processing', 'completed', 'failed', 'cancelled');

-- Set up database functions for business logic
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
```

### Storage Configuration
```typescript
// supabase/storage/policies.sql

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to upload to their own folder
CREATE POLICY "Users can upload to own folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy for users to view their own files
CREATE POLICY "Users can view own files" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy for users to delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

### Real-time Configuration
```sql
-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE video_projects;
ALTER PUBLICATION supabase_realtime ADD TABLE generated_videos;
ALTER PUBLICATION supabase_realtime ADD TABLE photos;

-- Create triggers for realtime updates
CREATE OR REPLACE FUNCTION notify_video_generation_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify specific user channel
  PERFORM pg_notify(
    'video_generation_' || NEW.user_id,
    json_build_object(
      'type', 'generation_update',
      'data', row_to_json(NEW)
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER video_generation_update_trigger
  AFTER UPDATE ON generated_videos
  FOR EACH ROW
  EXECUTE FUNCTION notify_video_generation_update();
```

## 📊 Monitoring & Observability

### Sentry Integration
```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  beforeSend(event, hint) {
    // Filter out non-critical errors in production
    if (process.env.NODE_ENV === 'production') {
      if (event.exception?.values?.[0]?.type === 'ChunkLoadError') {
        return null;
      }
    }
    return event;
  },
  
  integrations: [
    new Sentry.BrowserTracing({
      tracingOrigins: ['localhost', /^https:\/\/yourapp\.com\/api/],
    }),
  ],
  
  beforeBreadcrumb(breadcrumb) {
    // Don't log sensitive data
    if (breadcrumb.category === 'xhr' || breadcrumb.category === 'fetch') {
      const url = breadcrumb.data?.url;
      if (url?.includes('password') || url?.includes('token')) {
        return null;
      }
    }
    return breadcrumb;
  },
});
```

### Performance Monitoring
```typescript
// src/lib/analytics.ts
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

// Custom performance metrics
export const trackPerformance = {
  // Track page load times
  pageLoad: (pageName: string, loadTime: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_load_time', {
        page: pageName,
        value: Math.round(loadTime),
        metric_id: 'PLT'
      });
    }
  },
  
  // Track API response times
  apiCall: (endpoint: string, method: string, responseTime: number, status: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'api_response_time', {
        endpoint,
        method,
        response_time: Math.round(responseTime),
        status_code: status
      });
    }
  },
  
  // Track video generation metrics
  videoGeneration: (duration: number, style: string, photoCount: number, success: boolean) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'video_generation', {
        generation_time: Math.round(duration),
        video_style: style,
        photo_count: photoCount,
        success: success ? 'true' : 'false'
      });
    }
  }
};

// React component wrapper
export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  return (
    <>
      {children}
      <Analytics />
      <SpeedInsights />
    </>
  );
};
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Run TypeScript check
        run: npm run type-check
      
      - name: Run tests
        run: npm run test:ci
        env:
          CI: true
      
      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

  deploy-preview:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    needs: lint-and-test
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Deploy to Vercel (Preview)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prebuilt'
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    needs: lint-and-test
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prebuilt --prod'
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
      
      - name: Run E2E tests against production
        run: npm run test:e2e
        env:
          PLAYWRIGHT_BASE_URL: https://photomemory-ai.vercel.app

  migrate-database:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    needs: deploy-production
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Run database migrations
        run: |
          npx supabase db push --db-url ${{ secrets.DATABASE_URL }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

### Automated Testing
```yaml
# .github/workflows/test.yml
name: Automated Testing

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit -- --coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          PLAYWRIGHT_BASE_URL: http://localhost:3000
      
      - name: Upload Playwright report
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## 🔒 Security Configuration

### Security Headers
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel.app *.google.com *.stripe.com",
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "img-src 'self' data: *.supabase.co *.stripe.com *.unsplash.com *.pixabay.com *.pexels.com",
      "font-src 'self' fonts.gstatic.com",
      "connect-src 'self' *.supabase.co *.openai.com *.stripe.com *.vercel.com wss://*.supabase.co",
      "media-src 'self' *.supabase.co",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'"
    ].join('; ')
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

### Environment Security
```bash
# .env.example
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Services
OPENAI_API_KEY=your_openai_api_key
GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key

# Payments
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Cache
REDIS_URL=your_redis_url

# Monitoring
SENTRY_DSN=your_sentry_dsn

# General
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## 📈 Scaling Strategy

### Database Scaling
```sql
-- Connection pooling configuration
-- In Supabase dashboard or supabase/config.toml
[db]
pool_size = 20
max_client_conn = 100
default_pool_size = 5

-- Read replicas for analytics queries
-- Separate reporting database for heavy analytics
CREATE SUBSCRIPTION analytics_subscription 
CONNECTION 'host=replica.supabase.co port=5432 user=postgres dbname=postgres'
PUBLICATION analytics_publication;
```

### Redis Caching Strategy
```typescript
// src/lib/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const cache = {
  // API response caching
  api: {
    get: async (key: string) => {
      const cached = await redis.get(`api:${key}`);
      return cached ? JSON.parse(cached) : null;
    },
    set: async (key: string, data: any, ttl = 300) => {
      await redis.setex(`api:${key}`, ttl, JSON.stringify(data));
    },
  },
  
  // User session caching
  user: {
    get: async (userId: string) => {
      return await redis.hgetall(`user:${userId}`);
    },
    set: async (userId: string, data: any, ttl = 3600) => {
      await redis.hmset(`user:${userId}`, data);
      await redis.expire(`user:${userId}`, ttl);
    },
  },
  
  // Generation queue management
  queue: {
    add: async (job: any) => {
      await redis.lpush('generation:queue', JSON.stringify(job));
    },
    get: async () => {
      const job = await redis.brpop('generation:queue', 30);
      return job ? JSON.parse(job[1]) : null;
    },
  },
};
```

### CDN & Asset Optimization
```typescript
// next.config.js
module.exports = {
  images: {
    domains: [
      'localhost',
      'supabase.co',
      'unsplash.com',
      'pixabay.com',
      'pexels.com'
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400, // 24 hours
  },
  
  compress: true,
  
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
  },
  
  // Bundle analysis
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all';
    }
    return config;
  },
};
```

## 🔧 Development Environment

### Docker Development Setup
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: photomemory
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  supabase-studio:
    image: supabase/studio:latest
    environment:
      POSTGRES_PASSWORD: postgres
    ports:
      - "3001:3000"

volumes:
  postgres_data:
  redis_data:
```

### Development Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "db:generate-types": "supabase gen types typescript --local > src/types/database.types.ts",
    "db:reset": "supabase db reset --local",
    "db:seed": "node scripts/seed.js",
    "analyze": "cross-env ANALYZE=true next build"
  }
}
```

This infrastructure design provides:
- **Scalability**: Auto-scaling with serverless architecture
- **Security**: Comprehensive security headers and policies
- **Monitoring**: Full observability with Sentry and Vercel Analytics
- **Performance**: Optimized caching and CDN integration
- **Developer Experience**: Streamlined CI/CD and development workflows
- **Cost Efficiency**: Pay-per-use pricing model
- **Reliability**: Multi-region deployment and failover strategies