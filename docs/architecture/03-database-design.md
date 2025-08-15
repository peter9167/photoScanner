# Supabase Database Design

## 🗄️ Database Schema Overview

PhotoMemory AI uses Supabase (PostgreSQL) with Row Level Security (RLS) enabled for secure multi-tenant data access.

### 🔗 Entity Relationship Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      users      │    │ video_projects  │    │     photos      │
│                 │    │                 │    │                 │
│ + id (uuid)     │◄───┤ + id (uuid)     │◄───┤ + id (uuid)     │
│ + email         │    │ + user_id (fk)  │    │ + project_id    │
│ + display_name  │    │ + title_i18n    │    │ + file_url      │
│ + avatar_url    │    │ + desc_i18n     │    │ + thumbnail_url │
│ + language      │    │ + style         │    │ + metadata      │
│ + timezone      │    │ + duration      │    │ + upload_order  │
│ + created_at    │    │ + status        │    │ + created_at    │
│ + updated_at    │    │ + created_at    │    │ + updated_at    │
└─────────────────┘    │ + updated_at    │    └─────────────────┘
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │generated_videos │
                       │                 │
                       │ + id (uuid)     │
                       │ + project_id    │
                       │ + file_url      │
                       │ + thumbnail_url │
                       │ + duration      │
                       │ + status        │
                       │ + ai_prompt     │
                       │ + generation_id │
                       │ + created_at    │
                       └─────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ subscriptions   │    │  usage_records  │    │payment_methods  │
│                 │    │                 │    │                 │
│ + id (uuid)     │    │ + id (uuid)     │    │ + id (uuid)     │
│ + user_id (fk)  │◄───┤ + user_id (fk)  │    │ + user_id (fk)  │
│ + plan_id       │    │ + resource_type │    │ + provider      │
│ + status        │    │ + amount        │    │ + external_id   │
│ + current_start │    │ + created_at    │    │ + is_default    │
│ + current_end   │    │ + billing_month │    │ + card_last4    │
│ + auto_renew    │    └─────────────────┘    │ + card_brand    │
│ + created_at    │                           │ + expires_at    │
│ + updated_at    │                           │ + created_at    │
└─────────────────┘                           └─────────────────┘

┌─────────────────┐    ┌─────────────────┐
│    invoices     │    │  media_items    │
│                 │    │                 │
│ + id (uuid)     │    │ + id (uuid)     │
│ + user_id (fk)  │    │ + user_id (fk)  │
│ + amount_cents  │    │ + file_url      │
│ + currency      │    │ + thumbnail_url │
│ + status        │    │ + file_type     │
│ + stripe_id     │    │ + file_size     │
│ + issued_at     │    │ + metadata      │
│ + paid_at       │    │ + created_at    │
│ + created_at    │    └─────────────────┘
└─────────────────┘
```

## 📋 Database Tables

### 1. Core Tables

#### `auth.users` (Supabase Auth)
```sql
-- Managed by Supabase Auth
-- Linked to our users table via foreign key
```

#### `users` (User Profiles)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  language VARCHAR(5) DEFAULT 'en' NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC' NOT NULL,
  subscription_plan VARCHAR(20) DEFAULT 'free' NOT NULL,
  total_storage_bytes BIGINT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT valid_language CHECK (language IN ('en', 'ko', 'ja', 'zh', 'es', 'fr', 'de')),
  CONSTRAINT valid_subscription CHECK (subscription_plan IN ('free', 'pro', 'enterprise'))
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription ON users(subscription_plan);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

#### `video_projects` (Video Generation Projects)
```sql
CREATE TYPE project_status AS ENUM (
  'draft', 'processing', 'completed', 'failed', 'cancelled'
);

CREATE TYPE video_style AS ENUM (
  'classic', 'modern', 'cinematic', 'vintage'
);

CREATE TABLE video_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title_i18n JSONB NOT NULL DEFAULT '{}',
  description_i18n JSONB NOT NULL DEFAULT '{}',
  style video_style NOT NULL DEFAULT 'classic',
  duration_minutes INTEGER NOT NULL DEFAULT 1,
  status project_status NOT NULL DEFAULT 'draft',
  photo_count INTEGER NOT NULL DEFAULT 0,
  ai_prompt TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT valid_duration CHECK (duration_minutes BETWEEN 1 AND 30),
  CONSTRAINT valid_photo_count CHECK (photo_count >= 0 AND photo_count <= 20),
  CONSTRAINT valid_title_i18n CHECK (jsonb_typeof(title_i18n) = 'object'),
  CONSTRAINT valid_description_i18n CHECK (jsonb_typeof(description_i18n) = 'object')
);

-- Indexes
CREATE INDEX idx_projects_user_id ON video_projects(user_id);
CREATE INDEX idx_projects_status ON video_projects(status);
CREATE INDEX idx_projects_created_at ON video_projects(created_at DESC);

-- RLS Policies
ALTER TABLE video_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own projects" ON video_projects
  USING (auth.uid() = user_id);
```

#### `photos` (Project Photos)
```sql
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  original_filename VARCHAR(255),
  file_size_bytes BIGINT NOT NULL,
  mime_type VARCHAR(50) NOT NULL,
  width INTEGER,
  height INTEGER,
  upload_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT valid_file_size CHECK (file_size_bytes > 0 AND file_size_bytes <= 10485760), -- 10MB
  CONSTRAINT valid_mime_type CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp')),
  CONSTRAINT valid_dimensions CHECK ((width IS NULL AND height IS NULL) OR (width > 0 AND height > 0))
);

-- Indexes
CREATE INDEX idx_photos_project_id ON photos(project_id);
CREATE INDEX idx_photos_upload_order ON photos(project_id, upload_order);

-- RLS Policies
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage photos of own projects" ON photos
  USING (
    EXISTS (
      SELECT 1 FROM video_projects 
      WHERE id = photos.project_id AND user_id = auth.uid()
    )
  );
```

#### `generated_videos` (Generated Video Results)
```sql
CREATE TYPE generation_status AS ENUM (
  'queued', 'processing', 'completed', 'failed', 'cancelled'
);

CREATE TABLE generated_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  file_url TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  status generation_status NOT NULL DEFAULT 'queued',
  ai_prompt TEXT NOT NULL,
  generation_service VARCHAR(50) NOT NULL,
  external_generation_id VARCHAR(255),
  error_message TEXT,
  progress_percentage INTEGER DEFAULT 0,
  estimated_completion_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT valid_progress CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  CONSTRAINT valid_duration CHECK (duration_seconds IS NULL OR duration_seconds > 0),
  CONSTRAINT valid_file_size CHECK (file_size_bytes IS NULL OR file_size_bytes > 0),
  CONSTRAINT status_consistency CHECK (
    (status = 'completed' AND file_url IS NOT NULL AND completed_at IS NOT NULL) OR
    (status != 'completed')
  )
);

-- Indexes
CREATE INDEX idx_generated_videos_project_id ON generated_videos(project_id);
CREATE INDEX idx_generated_videos_status ON generated_videos(status);
CREATE INDEX idx_generated_videos_external_id ON generated_videos(external_generation_id);

-- RLS Policies
ALTER TABLE generated_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view generated videos of own projects" ON generated_videos
  USING (
    EXISTS (
      SELECT 1 FROM video_projects 
      WHERE id = generated_videos.project_id AND user_id = auth.uid()
    )
  );
```

### 2. Business Logic Tables

#### `subscriptions` (User Subscriptions)
```sql
CREATE TYPE subscription_status AS ENUM (
  'active', 'past_due', 'cancelled', 'unpaid'
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id VARCHAR(50) NOT NULL,
  status subscription_status NOT NULL DEFAULT 'active',
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT valid_plan CHECK (plan_id IN ('free', 'pro', 'enterprise')),
  CONSTRAINT valid_period CHECK (current_period_end > current_period_start),
  CONSTRAINT stripe_id_required CHECK (
    (plan_id = 'free') OR 
    (plan_id != 'free' AND stripe_subscription_id IS NOT NULL)
  )
);

-- Indexes
CREATE UNIQUE INDEX idx_subscriptions_user_active ON subscriptions(user_id) 
  WHERE status = 'active';
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);

-- RLS Policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON subscriptions
  USING (auth.uid() = user_id);
```

#### `usage_records` (Usage Tracking)
```sql
CREATE TYPE resource_type AS ENUM (
  'video_generation', 'storage_bytes', 'project_creation'
);

CREATE TABLE usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_type resource_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  billing_month DATE NOT NULL, -- First day of month
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT positive_amount CHECK (amount >= 0),
  CONSTRAINT valid_unit CHECK (unit IN ('count', 'bytes', 'seconds'))
);

-- Indexes
CREATE INDEX idx_usage_user_month ON usage_records(user_id, billing_month);
CREATE INDEX idx_usage_type_month ON usage_records(resource_type, billing_month);

-- RLS Policies
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage" ON usage_records
  USING (auth.uid() = user_id);
```

#### `media_items` (Media Library)
```sql
CREATE TABLE media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  original_filename VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  mime_type VARCHAR(50) NOT NULL,
  width INTEGER,
  height INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT valid_file_size CHECK (file_size_bytes > 0),
  CONSTRAINT valid_file_type CHECK (file_type IN ('image', 'video')),
  CONSTRAINT valid_image_mime CHECK (
    file_type != 'image' OR mime_type IN ('image/jpeg', 'image/png', 'image/webp')
  )
);

-- Indexes
CREATE INDEX idx_media_user_id ON media_items(user_id);
CREATE INDEX idx_media_created_at ON media_items(created_at DESC);
CREATE INDEX idx_media_type ON media_items(file_type);

-- RLS Policies
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own media" ON media_items
  USING (auth.uid() = user_id);
```

## 🔧 Database Functions & Triggers

### Automatic Timestamps
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON video_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... (apply to other tables)
```

### Photo Count Trigger
```sql
CREATE OR REPLACE FUNCTION update_project_photo_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE video_projects 
    SET photo_count = (
      SELECT COUNT(*) FROM photos WHERE project_id = NEW.project_id
    )
    WHERE id = NEW.project_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE video_projects 
    SET photo_count = (
      SELECT COUNT(*) FROM photos WHERE project_id = OLD.project_id
    )
    WHERE id = OLD.project_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_photo_count
  AFTER INSERT OR DELETE ON photos
  FOR EACH ROW EXECUTE FUNCTION update_project_photo_count();
```

### Storage Usage Tracking
```sql
CREATE OR REPLACE FUNCTION track_storage_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Add to user's total storage
    UPDATE users 
    SET total_storage_bytes = total_storage_bytes + NEW.file_size_bytes
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Subtract from user's total storage
    UPDATE users 
    SET total_storage_bytes = total_storage_bytes - OLD.file_size_bytes
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_photo_storage
  AFTER INSERT OR DELETE ON photos
  FOR EACH ROW EXECUTE FUNCTION track_storage_usage();

CREATE TRIGGER trigger_track_media_storage
  AFTER INSERT OR DELETE ON media_items
  FOR EACH ROW EXECUTE FUNCTION track_storage_usage();
```

## 📊 Database Views

### User Dashboard View
```sql
CREATE VIEW user_dashboard_stats AS
SELECT 
  u.id,
  u.display_name,
  u.subscription_plan,
  u.total_storage_bytes,
  COUNT(DISTINCT p.id) as project_count,
  COUNT(DISTINCT CASE WHEN p.status = 'completed' THEN p.id END) as completed_projects,
  COUNT(DISTINCT gv.id) as generated_videos,
  COALESCE(SUM(ph.file_size_bytes), 0) as photos_storage_bytes
FROM users u
LEFT JOIN video_projects p ON u.id = p.user_id
LEFT JOIN photos ph ON p.id = ph.project_id
LEFT JOIN generated_videos gv ON p.id = gv.project_id AND gv.status = 'completed'
GROUP BY u.id, u.display_name, u.subscription_plan, u.total_storage_bytes;

-- RLS for view
ALTER VIEW user_dashboard_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own dashboard stats" ON user_dashboard_stats
  USING (auth.uid() = id);
```

### Monthly Usage Summary
```sql
CREATE VIEW monthly_usage_summary AS
SELECT 
  user_id,
  billing_month,
  SUM(CASE WHEN resource_type = 'video_generation' THEN amount ELSE 0 END) as videos_generated,
  SUM(CASE WHEN resource_type = 'storage_bytes' THEN amount ELSE 0 END) as storage_used_bytes,
  SUM(CASE WHEN resource_type = 'project_creation' THEN amount ELSE 0 END) as projects_created
FROM usage_records
GROUP BY user_id, billing_month;
```

## 🔐 Security Policies

### Row Level Security (RLS) Implementation
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;

-- Admin bypass (for service accounts)
CREATE POLICY "Service account full access" ON users
  FOR ALL USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');
  
-- Apply similar service account policies to all tables
```

### Data Validation Functions
```sql
CREATE OR REPLACE FUNCTION validate_i18n_json(i18n_data JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if it's an object
  IF jsonb_typeof(i18n_data) != 'object' THEN
    RETURN FALSE;
  END IF;
  
  -- Check if all values are strings
  RETURN NOT EXISTS (
    SELECT 1 FROM jsonb_each(i18n_data)
    WHERE jsonb_typeof(value) != 'string'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Use in constraints
ALTER TABLE video_projects 
ADD CONSTRAINT valid_title_i18n_format 
CHECK (validate_i18n_json(title_i18n));
```

## 📈 Performance Optimizations

### Indexing Strategy
```sql
-- Composite indexes for common queries
CREATE INDEX idx_projects_user_status_created 
  ON video_projects(user_id, status, created_at DESC);

CREATE INDEX idx_photos_project_order 
  ON photos(project_id, upload_order);

CREATE INDEX idx_usage_user_type_month 
  ON usage_records(user_id, resource_type, billing_month);

-- Partial indexes for specific use cases
CREATE INDEX idx_active_subscriptions 
  ON subscriptions(user_id) 
  WHERE status = 'active';

CREATE INDEX idx_processing_videos 
  ON generated_videos(created_at) 
  WHERE status IN ('queued', 'processing');
```

### Query Optimization
```sql
-- Materialized view for expensive analytics
CREATE MATERIALIZED VIEW user_analytics_daily AS
SELECT 
  date_trunc('day', created_at) as date,
  COUNT(*) as new_users,
  COUNT(*) FILTER (WHERE subscription_plan != 'free') as paid_users
FROM users 
GROUP BY date_trunc('day', created_at);

-- Refresh daily
CREATE INDEX idx_user_analytics_date ON user_analytics_daily(date);
```

This database design provides:
- **Scalability**: Optimized indexes and partitioning ready
- **Security**: Comprehensive RLS policies
- **Data Integrity**: Strong constraints and triggers
- **Multi-language Support**: JSONB i18n fields
- **Audit Trail**: Automatic timestamps and usage tracking
- **Business Logic**: Subscription limits and usage quotas