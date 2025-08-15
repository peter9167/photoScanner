# Optimized Database Schema Design
# PhotoMemory AI - Enhanced Database Architecture

## 🎯 Schema Design Principles

### **Normalization Level**: 3NF with Strategic Denormalization
- **3NF**: Eliminate transitive dependencies
- **Strategic Denormalization**: Performance-critical aggregates
- **JSONB Usage**: Flexible metadata and i18n content

### **Performance Strategy**
- Composite indexes for query patterns
- Partial indexes for filtered queries
- Materialized views for analytics
- Table partitioning for time-series data

## 🗄️ Enhanced Schema Design

### **1. User Management Domain**

#### `users` (Enhanced)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  language VARCHAR(5) DEFAULT 'en' NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC' NOT NULL,
  
  -- Metadata
  preferences JSONB DEFAULT '{}' NOT NULL,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  last_activity_at TIMESTAMPTZ,
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT valid_language CHECK (language IN ('en', 'ko', 'ja', 'zh-cn', 'es', 'fr', 'de')),
  CONSTRAINT valid_preferences CHECK (jsonb_typeof(preferences) = 'object')
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_language ON users(language);
CREATE INDEX idx_users_last_activity ON users(last_activity_at DESC) WHERE last_activity_at IS NOT NULL;
CREATE INDEX idx_users_preferences_gin ON users USING gin(preferences);
```

### **2. Subscription Management Domain (Normalized)**

#### `subscription_plans` (New - Lookup Table)
```sql
CREATE TABLE subscription_plans (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  
  -- Pricing
  price_cents INTEGER NOT NULL,
  billing_interval VARCHAR(20) NOT NULL, -- 'month', 'year'
  currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
  
  -- Features
  max_projects INTEGER,
  max_videos_per_month INTEGER,
  max_storage_gb INTEGER,
  features JSONB DEFAULT '[]' NOT NULL, -- Array of feature flags
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT positive_price CHECK (price_cents >= 0),
  CONSTRAINT valid_billing_interval CHECK (billing_interval IN ('month', 'year')),
  CONSTRAINT valid_features CHECK (jsonb_typeof(features) = 'array')
);

-- Seed data
INSERT INTO subscription_plans (id, name, price_cents, billing_interval, max_projects, max_videos_per_month, max_storage_gb, features) VALUES
('free', 'Free Plan', 0, 'month', 3, 5, 1, '["watermark"]'),
('pro', 'Pro Plan', 1900, 'month', 50, 100, 50, '["no_watermark", "priority_support"]'),
('enterprise', 'Enterprise Plan', 9900, 'month', -1, -1, 500, '["no_watermark", "priority_support", "custom_branding", "api_access"]');

CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active, display_order);
```

#### `user_subscriptions` (Enhanced)
```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id VARCHAR(50) NOT NULL REFERENCES subscription_plans(id),
  
  -- Subscription lifecycle
  status subscription_status NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMPTZ,
  
  -- External provider data
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT valid_period CHECK (current_period_end > current_period_start),
  CONSTRAINT stripe_id_required CHECK (
    (plan_id = 'free') OR 
    (plan_id != 'free' AND stripe_subscription_id IS NOT NULL)
  )
);

-- Indexes
CREATE UNIQUE INDEX idx_user_subscriptions_active ON user_subscriptions(user_id) 
  WHERE status = 'active';
CREATE INDEX idx_user_subscriptions_stripe ON user_subscriptions(stripe_subscription_id);
CREATE INDEX idx_user_subscriptions_period ON user_subscriptions(current_period_end) 
  WHERE status = 'active';
```

#### `payment_methods` (Enhanced)
```sql
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Payment provider
  provider VARCHAR(20) NOT NULL DEFAULT 'stripe',
  external_id VARCHAR(255) NOT NULL,
  
  -- Card information (encrypted/tokenized)
  card_last4 VARCHAR(4),
  card_brand VARCHAR(20),
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  
  -- Status
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT valid_provider CHECK (provider IN ('stripe', 'paypal')),
  CONSTRAINT valid_exp_month CHECK (card_exp_month BETWEEN 1 AND 12),
  CONSTRAINT valid_exp_year CHECK (card_exp_year > EXTRACT(YEAR FROM NOW())),
  
  UNIQUE(user_id, external_id, provider)
);

-- Indexes
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id, is_active);
CREATE UNIQUE INDEX idx_payment_methods_default ON payment_methods(user_id) 
  WHERE is_default = TRUE AND is_active = TRUE;
```

#### `payment_transactions` (New - Payment History)
```sql
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  subscription_id UUID REFERENCES user_subscriptions(id),
  payment_method_id UUID REFERENCES payment_methods(id),
  
  -- Transaction details
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
  status VARCHAR(20) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'subscription', 'usage', 'refund'
  
  -- External provider
  provider VARCHAR(20) NOT NULL DEFAULT 'stripe',
  external_transaction_id VARCHAR(255) NOT NULL,
  
  -- Metadata
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  processed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT positive_amount CHECK (amount_cents > 0),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled', 'refunded')),
  CONSTRAINT valid_type CHECK (type IN ('subscription', 'usage', 'refund', 'credit')),
  
  UNIQUE(provider, external_transaction_id)
);

-- Partitioning by month for better performance
CREATE TABLE payment_transactions_y2024m01 PARTITION OF payment_transactions
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Indexes
CREATE INDEX idx_payment_transactions_user_date ON payment_transactions(user_id, created_at DESC);
CREATE INDEX idx_payment_transactions_subscription ON payment_transactions(subscription_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status, created_at);
```

### **3. Media Management Domain (Unified)**

#### `media_files` (Unified Media Architecture)
```sql
CREATE TABLE media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- File information
  original_filename VARCHAR(255) NOT NULL,
  file_key TEXT NOT NULL UNIQUE, -- S3/Supabase storage key
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- File metadata
  file_type VARCHAR(20) NOT NULL, -- 'image', 'video', 'audio'
  mime_type VARCHAR(100) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  
  -- Dimensions (for images/videos)
  width INTEGER,
  height INTEGER,
  duration_seconds INTEGER, -- for videos/audio
  
  -- Processing status
  processing_status VARCHAR(20) DEFAULT 'completed',
  processing_error TEXT,
  
  -- Content metadata
  metadata JSONB DEFAULT '{}',
  content_hash VARCHAR(64), -- For deduplication
  
  -- Organization
  folder_path TEXT DEFAULT '/',
  tags TEXT[] DEFAULT '{}',
  
  -- Audit fields
  uploaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT valid_file_type CHECK (file_type IN ('image', 'video', 'audio', 'document')),
  CONSTRAINT positive_file_size CHECK (file_size_bytes > 0),
  CONSTRAINT valid_processing_status CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  CONSTRAINT valid_dimensions CHECK (
    (file_type != 'image' AND file_type != 'video') OR 
    (width > 0 AND height > 0)
  )
);

-- Indexes
CREATE INDEX idx_media_files_user_id ON media_files(user_id, created_at DESC);
CREATE INDEX idx_media_files_type ON media_files(file_type, created_at DESC);
CREATE INDEX idx_media_files_hash ON media_files(content_hash) WHERE content_hash IS NOT NULL;
CREATE INDEX idx_media_files_folder ON media_files(user_id, folder_path);
CREATE INDEX idx_media_files_tags_gin ON media_files USING gin(tags);
```

### **4. Video Generation Domain (Enhanced)**

#### `video_projects` (Enhanced)
```sql
CREATE TABLE video_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Project metadata
  title_i18n JSONB NOT NULL DEFAULT '{}',
  description_i18n JSONB NOT NULL DEFAULT '{}',
  
  -- Video configuration
  style video_style NOT NULL DEFAULT 'classic',
  duration_minutes INTEGER NOT NULL DEFAULT 1,
  aspect_ratio VARCHAR(10) DEFAULT '16:9',
  resolution VARCHAR(10) DEFAULT '1080p',
  
  -- Project state
  status project_status NOT NULL DEFAULT 'draft',
  progress_percentage INTEGER DEFAULT 0,
  
  -- AI generation settings
  ai_prompt TEXT,
  generation_settings JSONB DEFAULT '{}',
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  template_id UUID, -- For project templates
  
  -- Statistics (denormalized for performance)
  photo_count INTEGER DEFAULT 0,
  total_file_size_bytes BIGINT DEFAULT 0,
  
  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT valid_duration CHECK (duration_minutes BETWEEN 1 AND 30),
  CONSTRAINT valid_progress CHECK (progress_percentage BETWEEN 0 AND 100),
  CONSTRAINT valid_aspect_ratio CHECK (aspect_ratio IN ('16:9', '9:16', '1:1', '4:3')),
  CONSTRAINT valid_resolution CHECK (resolution IN ('720p', '1080p', '4k')),
  CONSTRAINT valid_title_i18n CHECK (jsonb_typeof(title_i18n) = 'object'),
  CONSTRAINT valid_description_i18n CHECK (jsonb_typeof(description_i18n) = 'object')
);

-- Indexes
CREATE INDEX idx_video_projects_user_id ON video_projects(user_id, created_at DESC);
CREATE INDEX idx_video_projects_status ON video_projects(status, created_at DESC);
CREATE INDEX idx_video_projects_template ON video_projects(template_id) WHERE template_id IS NOT NULL;
```

#### `project_media` (Join Table for Media Files)
```sql
CREATE TABLE project_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  media_file_id UUID NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,
  
  -- Ordering and configuration
  display_order INTEGER NOT NULL DEFAULT 0,
  duration_seconds NUMERIC(5,2), -- How long to show this media
  transition_type VARCHAR(50) DEFAULT 'fade',
  
  -- Media-specific settings
  settings JSONB DEFAULT '{}',
  
  -- Timestamps
  added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT positive_duration CHECK (duration_seconds > 0),
  CONSTRAINT valid_transition CHECK (transition_type IN ('fade', 'slide', 'zoom', 'none')),
  
  UNIQUE(project_id, media_file_id),
  UNIQUE(project_id, display_order)
);

-- Indexes
CREATE INDEX idx_project_media_project_order ON project_media(project_id, display_order);
CREATE INDEX idx_project_media_file ON project_media(media_file_id);
```

#### `generation_jobs` (Enhanced Generation Tracking)
```sql
CREATE TABLE generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- Job configuration
  job_type VARCHAR(20) NOT NULL DEFAULT 'video', -- 'video', 'thumbnail', 'preview'
  priority INTEGER DEFAULT 5, -- 1-10, higher = more priority
  
  -- Processing details
  status generation_status NOT NULL DEFAULT 'queued',
  progress_percentage INTEGER DEFAULT 0,
  
  -- Service integration
  generation_service VARCHAR(50) NOT NULL,
  external_job_id VARCHAR(255),
  
  -- Resource allocation
  estimated_duration_seconds INTEGER,
  actual_duration_seconds INTEGER,
  compute_cost_cents INTEGER,
  
  -- Output
  output_file_id UUID REFERENCES media_files(id),
  output_metadata JSONB DEFAULT '{}',
  
  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- Timestamps
  queued_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  
  CONSTRAINT valid_job_type CHECK (job_type IN ('video', 'thumbnail', 'preview', 'audio')),
  CONSTRAINT valid_priority CHECK (priority BETWEEN 1 AND 10),
  CONSTRAINT valid_progress CHECK (progress_percentage BETWEEN 0 AND 100),
  CONSTRAINT valid_retry_count CHECK (retry_count >= 0 AND retry_count <= max_retries),
  CONSTRAINT status_consistency CHECK (
    (status = 'completed' AND output_file_id IS NOT NULL AND completed_at IS NOT NULL) OR
    (status != 'completed')
  )
);

-- Indexes
CREATE INDEX idx_generation_jobs_status_priority ON generation_jobs(status, priority DESC, queued_at);
CREATE INDEX idx_generation_jobs_project ON generation_jobs(project_id, created_at DESC);
CREATE INDEX idx_generation_jobs_user ON generation_jobs(user_id, created_at DESC);
CREATE INDEX idx_generation_jobs_service ON generation_jobs(generation_service, external_job_id);
```

### **5. Usage Tracking & Analytics (Enhanced)**

#### `usage_records` (Enhanced with better normalization)
```sql
CREATE TABLE usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id),
  
  -- Usage categorization
  resource_type resource_type NOT NULL,
  resource_subtype VARCHAR(50), -- e.g., 'video_generation.hd', 'storage.images'
  
  -- Measurement
  quantity DECIMAL(12,4) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  cost_cents INTEGER DEFAULT 0,
  
  -- Billing period
  billing_period DATE NOT NULL, -- First day of billing month
  
  -- Context
  project_id UUID REFERENCES video_projects(id),
  generation_job_id UUID REFERENCES generation_jobs(id),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Audit
  recorded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  billed_at TIMESTAMPTZ,
  
  CONSTRAINT positive_quantity CHECK (quantity >= 0),
  CONSTRAINT positive_cost CHECK (cost_cents >= 0),
  CONSTRAINT valid_unit CHECK (unit IN ('count', 'bytes', 'seconds', 'requests', 'gb_hours'))
)
PARTITION BY RANGE (billing_period);

-- Create partitions for current and future months
CREATE TABLE usage_records_2024_01 PARTITION OF usage_records
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Indexes on partitions
CREATE INDEX idx_usage_records_user_period_2024_01 ON usage_records_2024_01(user_id, billing_period);
CREATE INDEX idx_usage_records_type_2024_01 ON usage_records_2024_01(resource_type, resource_subtype);
```

### **6. System Configuration & Metadata**

#### `system_settings` (New - Application Configuration)
```sql
CREATE TABLE system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE, -- Can be accessed by frontend
  
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT valid_value CHECK (jsonb_typeof(value) IN ('string', 'number', 'boolean', 'object', 'array'))
);

-- Initial settings
INSERT INTO system_settings (key, value, description, is_public) VALUES
('max_file_size_mb', '10', 'Maximum file upload size in MB', true),
('supported_video_formats', '["mp4", "mov", "avi"]', 'Supported video formats', true),
('generation_queue_max_concurrent', '5', 'Max concurrent generation jobs', false),
('free_plan_limits', '{"projects": 3, "videos_per_month": 5, "storage_gb": 1}', 'Free plan limitations', false);

CREATE INDEX idx_system_settings_public ON system_settings(is_public) WHERE is_public = true;
```

#### `audit_logs` (New - Audit Trail)
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Actor
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  
  -- Action
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  
  -- Details
  changes JSONB, -- Before/after state
  metadata JSONB DEFAULT '{}',
  
  -- Result
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT valid_action CHECK (action ~ '^[a-z_]+$') -- snake_case actions
)
PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs
  FOR VALUES FROM ('2024-01-01 00:00:00') TO ('2024-02-01 00:00:00');

-- Indexes
CREATE INDEX idx_audit_logs_user_2024_01 ON audit_logs_2024_01(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_resource_2024_01 ON audit_logs_2024_01(resource_type, resource_id, created_at DESC);
CREATE INDEX idx_audit_logs_action_2024_01 ON audit_logs_2024_01(action, created_at DESC);
```

## 🔧 Advanced Database Features

### **1. Custom Types and Functions**

#### Enhanced ENUM Types
```sql
-- Enhanced status types
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'deleted', 'pending_verification');
CREATE TYPE generation_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE audit_action AS ENUM (
  'create', 'update', 'delete', 'login', 'logout', 
  'upload', 'download', 'generate', 'cancel', 'share'
);

-- File processing status
CREATE TYPE processing_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
```

#### Business Logic Functions
```sql
-- Get user's current subscription with features
CREATE OR REPLACE FUNCTION get_user_subscription_features(p_user_id UUID)
RETURNS TABLE(
  plan_id VARCHAR(50),
  features JSONB,
  max_projects INTEGER,
  max_videos_per_month INTEGER,
  max_storage_gb INTEGER,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id,
    sp.features,
    sp.max_projects,
    sp.max_videos_per_month,
    sp.max_storage_gb,
    us.status = 'active' AND us.current_period_end > NOW()
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id
    AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- Check if user can perform action based on subscription
CREATE OR REPLACE FUNCTION check_user_limit(
  p_user_id UUID,
  p_limit_type VARCHAR(50),
  p_requested_amount INTEGER DEFAULT 1
) RETURNS BOOLEAN AS $$
DECLARE
  current_usage INTEGER;
  user_limit INTEGER;
  subscription_active BOOLEAN;
BEGIN
  -- Get subscription features
  SELECT max_projects, max_videos_per_month, max_storage_gb, is_active
  INTO user_limit, subscription_active
  FROM get_user_subscription_features(p_user_id);
  
  IF NOT subscription_active THEN
    RETURN FALSE;
  END IF;
  
  -- Get current usage based on limit type
  CASE p_limit_type
    WHEN 'projects' THEN
      SELECT COUNT(*) INTO current_usage 
      FROM video_projects 
      WHERE user_id = p_user_id AND status != 'deleted';
      
    WHEN 'videos_per_month' THEN
      SELECT COUNT(*) INTO current_usage
      FROM generation_jobs gj
      JOIN video_projects vp ON gj.project_id = vp.id
      WHERE vp.user_id = p_user_id 
        AND gj.job_type = 'video'
        AND gj.status = 'completed'
        AND gj.completed_at >= date_trunc('month', NOW());
        
    WHEN 'storage_gb' THEN
      SELECT COALESCE(SUM(file_size_bytes), 0) / (1024^3) INTO current_usage
      FROM media_files
      WHERE user_id = p_user_id;
      
    ELSE
      RETURN FALSE;
  END CASE;
  
  -- Check if adding requested amount would exceed limit
  RETURN (user_limit = -1) OR (current_usage + p_requested_amount <= user_limit);
END;
$$ LANGUAGE plpgsql STABLE;
```

### **2. Materialized Views for Analytics**

#### User Analytics Dashboard
```sql
CREATE MATERIALIZED VIEW user_analytics_summary AS
SELECT 
  u.id as user_id,
  u.display_name,
  u.language,
  u.created_at as user_created_at,
  
  -- Subscription info
  us.plan_id as current_plan,
  us.status as subscription_status,
  
  -- Project statistics
  COUNT(DISTINCT vp.id) as total_projects,
  COUNT(DISTINCT CASE WHEN vp.status = 'completed' THEN vp.id END) as completed_projects,
  
  -- Generation statistics  
  COUNT(DISTINCT gj.id) as total_generations,
  COUNT(DISTINCT CASE WHEN gj.status = 'completed' THEN gj.id END) as successful_generations,
  
  -- Storage usage
  COALESCE(SUM(mf.file_size_bytes), 0) as total_storage_bytes,
  COUNT(DISTINCT mf.id) as total_files,
  
  -- Activity metrics
  u.last_activity_at,
  MAX(vp.created_at) as last_project_created,
  MAX(gj.completed_at) as last_generation_completed,
  
  -- Computed metrics
  CASE 
    WHEN COUNT(DISTINCT gj.id) > 0 THEN
      COUNT(DISTINCT CASE WHEN gj.status = 'completed' THEN gj.id END)::FLOAT / 
      COUNT(DISTINCT gj.id)::FLOAT
    ELSE 0 
  END as success_rate
  
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.status = 'active'
LEFT JOIN video_projects vp ON u.id = vp.user_id
LEFT JOIN generation_jobs gj ON vp.id = gj.project_id
LEFT JOIN media_files mf ON u.id = mf.user_id
GROUP BY u.id, u.display_name, u.language, u.created_at, us.plan_id, us.status, u.last_activity_at;

-- Refresh schedule (daily)
CREATE INDEX idx_user_analytics_summary_plan ON user_analytics_summary(current_plan);
CREATE INDEX idx_user_analytics_summary_activity ON user_analytics_summary(last_activity_at DESC NULLS LAST);
```

#### Generation Performance Metrics
```sql
CREATE MATERIALIZED VIEW generation_performance_metrics AS
SELECT 
  DATE(gj.created_at) as date,
  gj.generation_service,
  gj.job_type,
  
  -- Volume metrics
  COUNT(*) as total_jobs,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_jobs,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_jobs,
  
  -- Performance metrics
  AVG(CASE WHEN status = 'completed' THEN actual_duration_seconds END) as avg_duration_seconds,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY actual_duration_seconds) as median_duration_seconds,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY actual_duration_seconds) as p95_duration_seconds,
  
  -- Cost metrics
  SUM(compute_cost_cents) as total_cost_cents,
  AVG(compute_cost_cents) as avg_cost_cents,
  
  -- Quality metrics
  AVG(retry_count) as avg_retry_count
  
FROM generation_jobs gj
WHERE gj.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(gj.created_at), gj.generation_service, gj.job_type;

CREATE UNIQUE INDEX idx_generation_performance_metrics_unique 
  ON generation_performance_metrics(date, generation_service, job_type);
```

## 🚀 Performance Optimizations

### **1. Advanced Indexing Strategy**

#### Composite Indexes for Complex Queries
```sql
-- User dashboard query optimization
CREATE INDEX idx_video_projects_user_status_updated 
  ON video_projects(user_id, status, updated_at DESC)
  WHERE status IN ('draft', 'processing', 'completed');

-- Generation queue processing
CREATE INDEX idx_generation_jobs_queue_processing 
  ON generation_jobs(status, priority DESC, queued_at ASC)
  WHERE status IN ('queued', 'processing');

-- Analytics queries
CREATE INDEX idx_usage_records_user_period_type 
  ON usage_records(user_id, billing_period, resource_type, resource_subtype);

-- Media file organization
CREATE INDEX idx_media_files_user_folder_type 
  ON media_files(user_id, folder_path, file_type, created_at DESC);
```

#### JSONB Performance Indexes
```sql
-- Subscription plan features lookup
CREATE INDEX idx_subscription_plans_features_gin 
  ON subscription_plans USING gin(features);

-- Video project search and filtering
CREATE INDEX idx_video_projects_title_gin 
  ON video_projects USING gin(title_i18n);

-- Media file metadata search
CREATE INDEX idx_media_files_metadata_gin 
  ON media_files USING gin(metadata);

-- User preferences lookup
CREATE INDEX idx_users_preferences_gin 
  ON users USING gin(preferences);
```

### **2. Table Partitioning Strategy**

#### Time-based Partitioning for Growing Tables
```sql
-- Usage records partitioned by month
ALTER TABLE usage_records PARTITION BY RANGE (billing_period);

-- Audit logs partitioned by month  
ALTER TABLE audit_logs PARTITION BY RANGE (created_at);

-- Payment transactions partitioned by month
ALTER TABLE payment_transactions PARTITION BY RANGE (created_at);

-- Auto-create partitions function
CREATE OR REPLACE FUNCTION create_monthly_partition(
  table_name TEXT,
  partition_date DATE
) RETURNS VOID AS $$
DECLARE
  partition_name TEXT;
  start_date DATE;
  end_date DATE;
BEGIN
  start_date := date_trunc('month', partition_date);
  end_date := start_date + INTERVAL '1 month';
  partition_name := table_name || '_' || to_char(start_date, 'YYYY_MM');
  
  EXECUTE format(
    'CREATE TABLE %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)',
    partition_name, table_name, start_date, end_date
  );
  
  -- Create indexes on new partition
  CASE table_name
    WHEN 'usage_records' THEN
      EXECUTE format('CREATE INDEX idx_%I_user_period ON %I(user_id, billing_period)', partition_name, partition_name);
    WHEN 'audit_logs' THEN  
      EXECUTE format('CREATE INDEX idx_%I_user_created ON %I(user_id, created_at DESC)', partition_name, partition_name);
    WHEN 'payment_transactions' THEN
      EXECUTE format('CREATE INDEX idx_%I_user_created ON %I(user_id, created_at DESC)', partition_name, partition_name);
  END CASE;
END;
$$ LANGUAGE plpgsql;
```

## 🔒 Enhanced Security Features

### **1. Row Level Security Policies**

#### Comprehensive RLS Implementation
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- User data access policies
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users  
  FOR UPDATE USING (auth.uid() = id);

-- Project access policies
CREATE POLICY "Users can manage own projects" ON video_projects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage project media" ON project_media
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM video_projects 
      WHERE id = project_media.project_id 
        AND user_id = auth.uid()
    )
  );

-- Media file access policies  
CREATE POLICY "Users can manage own media" ON media_files
  FOR ALL USING (auth.uid() = user_id);

-- Payment data policies (read-only for users)
CREATE POLICY "Users can view own payment data" ON payment_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Admin policies (for service role)
CREATE POLICY "Service role has full access" ON users
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Apply service role policies to all tables
DO $$ 
DECLARE 
  table_name TEXT;
BEGIN
  FOR table_name IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename NOT LIKE '%_old'
  LOOP
    EXECUTE format('
      CREATE POLICY "Service role full access" ON %I
        FOR ALL USING (auth.jwt() ->> ''role'' = ''service_role'')
    ', table_name);
  END LOOP;
END $$;
```

### **2. Data Validation and Integrity**

#### Advanced Constraint Functions
```sql
-- Validate file upload limits based on subscription
CREATE OR REPLACE FUNCTION validate_file_upload() 
RETURNS TRIGGER AS $$
BEGIN
  IF NOT check_user_limit(NEW.user_id, 'storage_gb', 
    (NEW.file_size_bytes::FLOAT / (1024^3))::INTEGER) THEN
    RAISE EXCEPTION 'Storage limit exceeded for user subscription plan';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_media_file_upload
  BEFORE INSERT ON media_files
  FOR EACH ROW EXECUTE FUNCTION validate_file_upload();

-- Validate project creation limits
CREATE OR REPLACE FUNCTION validate_project_creation()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT check_user_limit(NEW.user_id, 'projects', 1) THEN
    RAISE EXCEPTION 'Project limit exceeded for user subscription plan';  
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_project_creation_limit
  BEFORE INSERT ON video_projects
  FOR EACH ROW EXECUTE FUNCTION validate_project_creation();
```

## 📊 Monitoring and Observability

### **1. Performance Monitoring Views**

#### Database Performance Metrics
```sql
CREATE VIEW db_performance_metrics AS
SELECT 
  schemaname,
  tablename,
  attname as column_name,
  n_distinct,
  correlation,
  most_common_vals,
  most_common_freqs
FROM pg_stats 
WHERE schemaname = 'public'
  AND n_distinct > 100; -- Focus on high-cardinality columns

-- Query performance tracking
CREATE VIEW slow_queries AS
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows,
  100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements 
WHERE mean_time > 100 -- Queries slower than 100ms
ORDER BY mean_time DESC;
```

#### Business Metrics Dashboard
```sql
CREATE VIEW business_metrics_daily AS
SELECT 
  date,
  new_users,
  active_users,
  new_projects,
  completed_generations,
  revenue_cents,
  avg_generation_time_seconds,
  success_rate
FROM (
  SELECT 
    DATE(created_at) as date,
    COUNT(*) as new_users
  FROM users 
  GROUP BY DATE(created_at)
) u
FULL OUTER JOIN (
  SELECT 
    DATE(last_activity_at) as date,
    COUNT(DISTINCT user_id) as active_users
  FROM users 
  WHERE last_activity_at IS NOT NULL
  GROUP BY DATE(last_activity_at)
) a USING (date)
FULL OUTER JOIN (
  SELECT 
    DATE(created_at) as date,
    COUNT(*) as new_projects
  FROM video_projects
  GROUP BY DATE(created_at)
) p USING (date)
FULL OUTER JOIN (
  SELECT 
    DATE(completed_at) as date,
    COUNT(*) as completed_generations,
    AVG(actual_duration_seconds) as avg_generation_time_seconds,
    COUNT(CASE WHEN status = 'completed' THEN 1 END)::FLOAT / COUNT(*)::FLOAT as success_rate
  FROM generation_jobs
  WHERE completed_at IS NOT NULL
  GROUP BY DATE(completed_at)  
) g USING (date)
FULL OUTER JOIN (
  SELECT 
    DATE(created_at) as date,
    SUM(amount_cents) as revenue_cents
  FROM payment_transactions
  WHERE status = 'succeeded' AND type = 'subscription'
  GROUP BY DATE(created_at)
) r USING (date);
```

This optimized database schema provides:

- ✅ **3NF Normalization** with strategic denormalization for performance
- ✅ **Comprehensive indexing** for query optimization  
- ✅ **Partitioning strategy** for scalability
- ✅ **Enhanced security** with granular RLS policies
- ✅ **Business logic enforcement** through database functions
- ✅ **Audit trail** for compliance and debugging
- ✅ **Performance monitoring** with built-in metrics
- ✅ **Data integrity** with advanced constraints