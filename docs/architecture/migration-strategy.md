# Database Migration Strategy
# PhotoMemory AI - Database Migration Strategy

## 🎯 Migration Overview

**Objective**: Migrate from current denormalized schema to optimized 3NF schema with zero downtime

**Strategy**: Phased migration with backward compatibility and progressive data transformation

## 📋 Migration Phases

### **Phase 1: Foundation Setup (Week 1-2)**
**Goal**: Create new normalized tables alongside existing schema

#### 1.1 Create New Tables
```sql
-- Migration script: 001_create_normalized_tables.sql

-- Create new subscription management tables
CREATE TABLE subscription_plans (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  price_cents INTEGER NOT NULL,
  billing_interval VARCHAR(20) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
  max_projects INTEGER,
  max_videos_per_month INTEGER,
  max_storage_gb INTEGER,
  features JSONB DEFAULT '[]' NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Seed subscription plans
INSERT INTO subscription_plans (id, name, price_cents, billing_interval, max_projects, max_videos_per_month, max_storage_gb, features) VALUES
('free', 'Free Plan', 0, 'month', 3, 5, 1, '["watermark"]'),
('pro', 'Pro Plan', 1900, 'month', 50, 100, 50, '["no_watermark", "priority_support"]'),
('enterprise', 'Enterprise Plan', 9900, 'month', -1, -1, 500, '["no_watermark", "priority_support", "custom_branding", "api_access"]');

-- Create enhanced user subscriptions table
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id VARCHAR(50) NOT NULL REFERENCES subscription_plans(id),
  status subscription_status NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMPTZ,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create unified media files table
CREATE TABLE media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_filename VARCHAR(255) NOT NULL,
  file_key TEXT NOT NULL UNIQUE,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_type VARCHAR(20) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  width INTEGER,
  height INTEGER,
  duration_seconds INTEGER,
  processing_status VARCHAR(20) DEFAULT 'completed',
  processing_error TEXT,
  metadata JSONB DEFAULT '{}',
  content_hash VARCHAR(64),
  folder_path TEXT DEFAULT '/',
  tags TEXT[] DEFAULT '{}',
  uploaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create project-media relationship table
CREATE TABLE project_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  media_file_id UUID NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  duration_seconds NUMERIC(5,2),
  transition_type VARCHAR(50) DEFAULT 'fade',
  settings JSONB DEFAULT '{}',
  added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(project_id, media_file_id),
  UNIQUE(project_id, display_order)
);

-- Create enhanced generation jobs table
CREATE TABLE generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  job_type VARCHAR(20) NOT NULL DEFAULT 'video',
  priority INTEGER DEFAULT 5,
  status generation_status NOT NULL DEFAULT 'queued',
  progress_percentage INTEGER DEFAULT 0,
  generation_service VARCHAR(50) NOT NULL,
  external_job_id VARCHAR(255),
  estimated_duration_seconds INTEGER,
  actual_duration_seconds INTEGER,
  compute_cost_cents INTEGER,
  output_file_id UUID REFERENCES media_files(id),
  output_metadata JSONB DEFAULT '{}',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  queued_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ
);

-- Create audit and system tables
CREATE TABLE system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  changes JSONB,
  metadata JSONB DEFAULT '{}',
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
) PARTITION BY RANGE (created_at);

-- Create initial audit log partition
CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs
  FOR VALUES FROM ('2024-01-01 00:00:00') TO ('2024-02-01 00:00:00');
```

#### 1.2 Create Indexes and Constraints
```sql
-- Migration script: 002_create_indexes.sql

-- Subscription plans indexes
CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active, display_order);
CREATE INDEX idx_subscription_plans_features_gin ON subscription_plans USING gin(features);

-- User subscriptions indexes
CREATE UNIQUE INDEX idx_user_subscriptions_active ON user_subscriptions(user_id) WHERE status = 'active';
CREATE INDEX idx_user_subscriptions_stripe ON user_subscriptions(stripe_subscription_id);
CREATE INDEX idx_user_subscriptions_period ON user_subscriptions(current_period_end) WHERE status = 'active';

-- Media files indexes
CREATE INDEX idx_media_files_user_id ON media_files(user_id, created_at DESC);
CREATE INDEX idx_media_files_type ON media_files(file_type, created_at DESC);
CREATE INDEX idx_media_files_hash ON media_files(content_hash) WHERE content_hash IS NOT NULL;
CREATE INDEX idx_media_files_folder ON media_files(user_id, folder_path);
CREATE INDEX idx_media_files_tags_gin ON media_files USING gin(tags);

-- Project media indexes
CREATE INDEX idx_project_media_project_order ON project_media(project_id, display_order);
CREATE INDEX idx_project_media_file ON project_media(media_file_id);

-- Generation jobs indexes
CREATE INDEX idx_generation_jobs_status_priority ON generation_jobs(status, priority DESC, queued_at);
CREATE INDEX idx_generation_jobs_project ON generation_jobs(project_id, created_at DESC);
CREATE INDEX idx_generation_jobs_user ON generation_jobs(user_id, created_at DESC);
CREATE INDEX idx_generation_jobs_service ON generation_jobs(generation_service, external_job_id);

-- System settings indexes
CREATE INDEX idx_system_settings_public ON system_settings(is_public) WHERE is_public = true;

-- Audit logs indexes (on partition)
CREATE INDEX idx_audit_logs_user_2024_01 ON audit_logs_2024_01(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_resource_2024_01 ON audit_logs_2024_01(resource_type, resource_id, created_at DESC);
CREATE INDEX idx_audit_logs_action_2024_01 ON audit_logs_2024_01(action, created_at DESC);
```

#### 1.3 Create Business Logic Functions
```sql
-- Migration script: 003_create_functions.sql

-- User subscription features function
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

-- User limit checking function
CREATE OR REPLACE FUNCTION check_user_limit(
  p_user_id UUID,
  p_limit_type VARCHAR(50),
  p_requested_amount INTEGER DEFAULT 1
) RETURNS BOOLEAN AS $$
DECLARE
  current_usage INTEGER;
  user_limit INTEGER;
  subscription_active BOOLEAN;
  subscription_features RECORD;
BEGIN
  -- Get subscription features
  SELECT * INTO subscription_features
  FROM get_user_subscription_features(p_user_id);
  
  IF subscription_features IS NULL OR NOT subscription_features.is_active THEN
    RETURN FALSE;
  END IF;
  
  -- Get current usage based on limit type
  CASE p_limit_type
    WHEN 'projects' THEN
      SELECT COUNT(*) INTO current_usage 
      FROM video_projects 
      WHERE user_id = p_user_id AND status != 'deleted';
      user_limit := subscription_features.max_projects;
      
    WHEN 'videos_per_month' THEN
      SELECT COUNT(*) INTO current_usage
      FROM generation_jobs gj
      JOIN video_projects vp ON gj.project_id = vp.id
      WHERE vp.user_id = p_user_id 
        AND gj.job_type = 'video'
        AND gj.status = 'completed'
        AND gj.completed_at >= date_trunc('month', NOW());
      user_limit := subscription_features.max_videos_per_month;
        
    WHEN 'storage_gb' THEN
      SELECT COALESCE(SUM(file_size_bytes), 0) / (1024^3) INTO current_usage
      FROM media_files
      WHERE user_id = p_user_id;
      user_limit := subscription_features.max_storage_gb;
        
    ELSE
      RETURN FALSE;
  END CASE;
  
  -- Check if adding requested amount would exceed limit (-1 means unlimited)
  RETURN (user_limit = -1) OR (current_usage + p_requested_amount <= user_limit);
END;
$$ LANGUAGE plpgsql STABLE;

-- Audit logging function
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID,
  p_action VARCHAR(100),
  p_resource_type VARCHAR(50),
  p_resource_id UUID DEFAULT NULL,
  p_changes JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id, action, resource_type, resource_id, 
    changes, metadata, success
  ) VALUES (
    p_user_id, p_action, p_resource_type, p_resource_id,
    p_changes, p_metadata, true
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql;
```

### **Phase 2: Data Migration (Week 3-4)**
**Goal**: Migrate existing data to new normalized structure

#### 2.1 Subscription Data Migration
```sql
-- Migration script: 004_migrate_subscription_data.sql

-- Create user subscriptions from existing users.subscription_plan
INSERT INTO user_subscriptions (
  user_id,
  plan_id,
  status,
  current_period_start,
  current_period_end,
  stripe_subscription_id,
  stripe_customer_id,
  created_at,
  updated_at
)
SELECT 
  u.id,
  u.subscription_plan,
  CASE 
    WHEN s.status IS NOT NULL THEN s.status::TEXT::subscription_status
    ELSE 'active'::subscription_status
  END,
  COALESCE(s.current_period_start, u.created_at),
  COALESCE(s.current_period_end, u.created_at + INTERVAL '1 month'),
  s.stripe_subscription_id,
  s.stripe_customer_id,
  u.created_at,
  u.updated_at
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE NOT EXISTS (
  SELECT 1 FROM user_subscriptions us 
  WHERE us.user_id = u.id
);

-- Verify migration
SELECT 
  'Original users count' as metric,
  COUNT(*) as count
FROM users
UNION ALL
SELECT 
  'Migrated subscriptions count' as metric,
  COUNT(*) as count
FROM user_subscriptions;
```

#### 2.2 Media Files Migration  
```sql
-- Migration script: 005_migrate_media_files.sql

-- Migrate from photos table
INSERT INTO media_files (
  id,
  user_id,
  original_filename,
  file_key,
  file_url,
  thumbnail_url,
  file_type,
  mime_type,
  file_size_bytes,
  width,
  height,
  processing_status,
  metadata,
  folder_path,
  uploaded_at,
  created_at,
  updated_at
)
SELECT 
  p.id,
  vp.user_id,
  p.original_filename,
  'legacy/photos/' || p.id::TEXT, -- Generate file key
  p.file_url,
  p.thumbnail_url,
  'image',
  p.mime_type,
  p.file_size_bytes,
  p.width,
  p.height,
  'completed',
  p.metadata,
  '/projects/' || p.project_id::TEXT,
  p.created_at,
  p.created_at,
  p.updated_at
FROM photos p
JOIN video_projects vp ON p.project_id = vp.id
WHERE NOT EXISTS (
  SELECT 1 FROM media_files mf 
  WHERE mf.id = p.id
);

-- Migrate from media_items table (if exists)
INSERT INTO media_files (
  id,
  user_id,
  original_filename,
  file_key,
  file_url,
  thumbnail_url,
  file_type,
  mime_type,
  file_size_bytes,
  width,
  height,
  processing_status,
  metadata,
  folder_path,
  uploaded_at,
  created_at,
  updated_at
)
SELECT 
  mi.id,
  mi.user_id,
  mi.original_filename,
  'legacy/media/' || mi.id::TEXT,
  mi.file_url,
  mi.thumbnail_url,
  mi.file_type,
  mi.mime_type,
  mi.file_size_bytes,
  mi.width,
  mi.height,
  'completed',
  mi.metadata,
  '/library',
  mi.created_at,
  mi.created_at,
  mi.updated_at
FROM media_items mi
WHERE NOT EXISTS (
  SELECT 1 FROM media_files mf 
  WHERE mf.id = mi.id
);

-- Create project-media relationships
INSERT INTO project_media (
  project_id,
  media_file_id,
  display_order,
  duration_seconds,
  transition_type,
  added_at
)
SELECT 
  p.project_id,
  p.id, -- This is now the media_file_id
  p.upload_order,
  3.0, -- Default 3 seconds per photo
  'fade',
  p.created_at
FROM photos p
WHERE NOT EXISTS (
  SELECT 1 FROM project_media pm 
  WHERE pm.project_id = p.project_id 
    AND pm.media_file_id = p.id
);

-- Verify migration
SELECT 
  'Original photos count' as metric,
  COUNT(*) as count
FROM photos
UNION ALL
SELECT 
  'Original media_items count' as metric,
  COUNT(*) as count
FROM media_items
UNION ALL  
SELECT 
  'Migrated media_files count' as metric,
  COUNT(*) as count
FROM media_files
UNION ALL
SELECT 
  'Created project_media relationships' as metric,
  COUNT(*) as count
FROM project_media;
```

#### 2.3 Generation Jobs Migration
```sql
-- Migration script: 006_migrate_generation_jobs.sql

-- Migrate from generated_videos table
INSERT INTO generation_jobs (
  id,
  project_id,
  user_id,
  job_type,
  status,
  progress_percentage,
  generation_service,
  external_job_id,
  actual_duration_seconds,
  output_metadata,
  error_message,
  queued_at,
  started_at,
  completed_at,
  failed_at
)
SELECT 
  gv.id,
  gv.project_id,
  vp.user_id,
  'video',
  gv.status::TEXT::generation_status,
  gv.progress_percentage,
  gv.generation_service,
  gv.external_generation_id,
  gv.duration_seconds,
  jsonb_build_object(
    'file_url', gv.file_url,
    'thumbnail_url', gv.thumbnail_url,
    'file_size_bytes', gv.file_size_bytes,
    'duration_seconds', gv.duration_seconds
  ),
  gv.error_message,
  gv.created_at,
  gv.started_at,
  gv.completed_at,
  CASE WHEN gv.status = 'failed' THEN gv.updated_at END
FROM generated_videos gv
JOIN video_projects vp ON gv.project_id = vp.id
WHERE NOT EXISTS (
  SELECT 1 FROM generation_jobs gj 
  WHERE gj.id = gv.id
);

-- Create media files for completed videos
INSERT INTO media_files (
  user_id,
  original_filename,
  file_key,
  file_url,
  thumbnail_url,
  file_type,
  mime_type,
  file_size_bytes,
  duration_seconds,
  processing_status,
  metadata,
  folder_path,
  uploaded_at,
  created_at,
  updated_at
)
SELECT 
  vp.user_id,
  'generated_video_' || gv.id::TEXT || '.mp4',
  'generated/videos/' || gv.id::TEXT,
  gv.file_url,
  gv.thumbnail_url,
  'video',
  'video/mp4',
  COALESCE(gv.file_size_bytes, 0),
  gv.duration_seconds,
  CASE gv.status 
    WHEN 'completed' THEN 'completed'
    WHEN 'failed' THEN 'failed'
    ELSE 'processing'
  END,
  jsonb_build_object(
    'generation_job_id', gv.id,
    'ai_prompt', gv.ai_prompt
  ),
  '/generated/' || gv.project_id::TEXT,
  gv.completed_at,
  gv.created_at,
  gv.updated_at
FROM generated_videos gv
JOIN video_projects vp ON gv.project_id = vp.id
WHERE gv.file_url IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM media_files mf 
    WHERE mf.metadata->>'generation_job_id' = gv.id::TEXT
  );

-- Update generation jobs with output file references
UPDATE generation_jobs gj
SET output_file_id = mf.id
FROM media_files mf
WHERE mf.metadata->>'generation_job_id' = gj.id::TEXT
  AND gj.output_file_id IS NULL;

-- Verify migration
SELECT 
  'Original generated_videos count' as metric,
  COUNT(*) as count
FROM generated_videos
UNION ALL
SELECT 
  'Migrated generation_jobs count' as metric,
  COUNT(*) as count  
FROM generation_jobs
UNION ALL
SELECT 
  'Created video media files' as metric,
  COUNT(*) as count
FROM media_files 
WHERE file_type = 'video';
```

### **Phase 3: Application Update (Week 5-6)**
**Goal**: Update application code to use new schema with fallback support

#### 3.1 Database Access Layer Updates
```typescript
// New repository interfaces supporting both schemas

interface ISubscriptionRepository {
  // New methods using normalized schema
  getUserSubscription(userId: string): Promise<UserSubscription | null>;
  getSubscriptionPlan(planId: string): Promise<SubscriptionPlan | null>;
  updateSubscription(userId: string, updates: Partial<UserSubscription>): Promise<void>;
  
  // Legacy fallback methods
  getUserSubscriptionLegacy(userId: string): Promise<LegacySubscription | null>;
}

interface IMediaRepository {
  // New unified media methods
  getMediaFile(id: string): Promise<MediaFile | null>;
  getUserMediaFiles(userId: string, options?: MediaQueryOptions): Promise<MediaFile[]>;
  getProjectMedia(projectId: string): Promise<ProjectMedia[]>;
  
  // Legacy fallback methods  
  getPhotoLegacy(id: string): Promise<Photo | null>;
  getMediaItemLegacy(id: string): Promise<MediaItem | null>;
}

interface IGenerationRepository {
  // New generation job methods
  createGenerationJob(job: CreateGenerationJobRequest): Promise<GenerationJob>;
  getGenerationJob(id: string): Promise<GenerationJob | null>;
  updateGenerationJob(id: string, updates: Partial<GenerationJob>): Promise<void>;
  
  // Legacy fallback
  getGeneratedVideoLegacy(id: string): Promise<GeneratedVideo | null>;
}
```

#### 3.2 Gradual Schema Transition
```typescript
// Feature flag based schema selection
class SchemaManager {
  constructor(
    private readonly featureFlags: IFeatureFlags,
    private readonly legacyRepo: ILegacyRepository,
    private readonly newRepo: INewRepository
  ) {}
  
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    if (await this.featureFlags.isEnabled('use_normalized_subscriptions', userId)) {
      try {
        return await this.newRepo.getUserSubscription(userId);
      } catch (error) {
        // Fallback to legacy on error
        console.warn('New schema failed, falling back to legacy', error);
        return await this.legacyRepo.getUserSubscriptionLegacy(userId);
      }
    }
    
    return await this.legacyRepo.getUserSubscriptionLegacy(userId);
  }
  
  async getMediaFile(id: string): Promise<MediaFile | null> {
    if (await this.featureFlags.isEnabled('use_unified_media')) {
      const mediaFile = await this.newRepo.getMediaFile(id);
      if (mediaFile) return mediaFile;
      
      // Try legacy tables
      const photo = await this.legacyRepo.getPhotoLegacy(id);
      if (photo) return this.transformPhotoToMediaFile(photo);
      
      const mediaItem = await this.legacyRepo.getMediaItemLegacy(id);
      if (mediaItem) return this.transformMediaItemToMediaFile(mediaItem);
    }
    
    // Legacy path
    const photo = await this.legacyRepo.getPhotoLegacy(id);
    if (photo) return this.transformPhotoToMediaFile(photo);
    
    const mediaItem = await this.legacyRepo.getMediaItemLegacy(id);  
    if (mediaItem) return this.transformMediaItemToMediaFile(mediaItem);
    
    return null;
  }
}
```

#### 3.3 Data Validation and Consistency Checks
```sql
-- Migration script: 007_validation_checks.sql

-- Function to validate data consistency between old and new schemas
CREATE OR REPLACE FUNCTION validate_migration_consistency()
RETURNS TABLE(
  check_name TEXT,
  status TEXT,
  old_count BIGINT,
  new_count BIGINT,
  difference BIGINT
) AS $$
BEGIN
  -- Check subscription migration
  RETURN QUERY
  SELECT 
    'subscription_migration'::TEXT,
    CASE WHEN u.user_count = us.subscription_count THEN 'PASS' ELSE 'FAIL' END,
    u.user_count,
    us.subscription_count,
    u.user_count - us.subscription_count
  FROM 
    (SELECT COUNT(*) as user_count FROM users) u,
    (SELECT COUNT(*) as subscription_count FROM user_subscriptions) us;
    
  -- Check media migration
  RETURN QUERY
  SELECT 
    'media_migration'::TEXT,
    CASE WHEN (p.photo_count + mi.media_count) = mf.media_file_count THEN 'PASS' ELSE 'FAIL' END,
    (p.photo_count + mi.media_count),
    mf.media_file_count,
    (p.photo_count + mi.media_count) - mf.media_file_count
  FROM 
    (SELECT COUNT(*) as photo_count FROM photos) p,
    (SELECT COUNT(*) as media_count FROM media_items) mi,
    (SELECT COUNT(*) as media_file_count FROM media_files) mf;
    
  -- Check generation jobs migration
  RETURN QUERY
  SELECT 
    'generation_migration'::TEXT,
    CASE WHEN gv.generated_video_count = gj.generation_job_count THEN 'PASS' ELSE 'FAIL' END,
    gv.generated_video_count,
    gj.generation_job_count,  
    gv.generated_video_count - gj.generation_job_count
  FROM 
    (SELECT COUNT(*) as generated_video_count FROM generated_videos) gv,
    (SELECT COUNT(*) as generation_job_count FROM generation_jobs) gj;
    
  -- Check project-media relationships
  RETURN QUERY
  SELECT 
    'project_media_relationships'::TEXT,
    CASE WHEN p.photo_count = pm.project_media_count THEN 'PASS' ELSE 'FAIL' END,
    p.photo_count,
    pm.project_media_count,
    p.photo_count - pm.project_media_count
  FROM 
    (SELECT COUNT(*) as photo_count FROM photos) p,
    (SELECT COUNT(*) as project_media_count FROM project_media) pm;
END;
$$ LANGUAGE plpgsql;

-- Run validation
SELECT * FROM validate_migration_consistency();
```

### **Phase 4: Schema Cleanup (Week 7-8)**
**Goal**: Remove legacy tables and finalize new schema

#### 4.1 Create Schema Backup
```sql
-- Migration script: 008_create_backup.sql

-- Create backup schema
CREATE SCHEMA migration_backup;

-- Backup original tables
CREATE TABLE migration_backup.subscriptions_backup AS SELECT * FROM subscriptions;
CREATE TABLE migration_backup.photos_backup AS SELECT * FROM photos;  
CREATE TABLE migration_backup.media_items_backup AS SELECT * FROM media_items;
CREATE TABLE migration_backup.generated_videos_backup AS SELECT * FROM generated_videos;
CREATE TABLE migration_backup.usage_records_backup AS SELECT * FROM usage_records;

-- Create backup metadata
CREATE TABLE migration_backup.migration_log (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(100),
  backup_row_count BIGINT,
  backup_created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO migration_backup.migration_log (table_name, backup_row_count)
SELECT 'subscriptions', COUNT(*) FROM subscriptions
UNION ALL
SELECT 'photos', COUNT(*) FROM photos
UNION ALL  
SELECT 'media_items', COUNT(*) FROM media_items
UNION ALL
SELECT 'generated_videos', COUNT(*) FROM generated_videos
UNION ALL
SELECT 'usage_records', COUNT(*) FROM usage_records;
```

#### 4.2 Update Application Configuration
```typescript
// Remove feature flags and legacy code paths
const config = {
  database: {
    // Remove legacy table references
    useNormalizedSchema: true,
    legacyFallback: false, // Disable fallback
  },
  features: {
    // Remove migration feature flags
    use_normalized_subscriptions: true,
    use_unified_media: true,
    use_enhanced_generation_jobs: true,
  }
};

// Clean up repository implementations
class SubscriptionRepository implements ISubscriptionRepository {
  // Remove legacy methods
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    return await this.db.query(`
      SELECT us.*, sp.* 
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = $1 AND us.status = 'active'
    `, [userId]);
  }
}
```

#### 4.3 Performance Optimization
```sql
-- Migration script: 009_optimize_performance.sql

-- Update table statistics
ANALYZE user_subscriptions;
ANALYZE media_files;
ANALYZE project_media;
ANALYZE generation_jobs;
ANALYZE usage_records;
ANALYZE audit_logs;

-- Create additional performance indexes based on usage patterns
CREATE INDEX CONCURRENTLY idx_user_subscriptions_period_end 
  ON user_subscriptions(current_period_end) 
  WHERE status = 'active';

CREATE INDEX CONCURRENTLY idx_media_files_user_type_created 
  ON media_files(user_id, file_type, created_at DESC);

CREATE INDEX CONCURRENTLY idx_generation_jobs_user_status_created 
  ON generation_jobs(user_id, status, created_at DESC);

-- Create materialized views for analytics
CREATE MATERIALIZED VIEW user_analytics_summary AS
SELECT 
  u.id as user_id,
  u.display_name,
  us.plan_id as current_plan,
  COUNT(DISTINCT vp.id) as total_projects,
  COUNT(DISTINCT gj.id) as total_generations,
  SUM(mf.file_size_bytes) as total_storage_bytes
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.status = 'active'
LEFT JOIN video_projects vp ON u.id = vp.user_id
LEFT JOIN generation_jobs gj ON vp.id = gj.project_id
LEFT JOIN media_files mf ON u.id = mf.user_id
GROUP BY u.id, u.display_name, us.plan_id;

CREATE UNIQUE INDEX idx_user_analytics_summary_user_id ON user_analytics_summary(user_id);

-- Set up automatic refresh
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('refresh-user-analytics', '0 2 * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY user_analytics_summary;');
```

#### 4.4 Drop Legacy Tables
```sql
-- Migration script: 010_drop_legacy_tables.sql

-- Final validation before dropping tables
DO $$
DECLARE
  validation_results RECORD;
  failed_checks INTEGER := 0;
BEGIN
  -- Run final validation
  FOR validation_results IN 
    SELECT * FROM validate_migration_consistency()
  LOOP
    IF validation_results.status != 'PASS' THEN
      failed_checks := failed_checks + 1;
      RAISE NOTICE 'VALIDATION FAILED: % - Expected: %, Got: %', 
        validation_results.check_name, 
        validation_results.old_count, 
        validation_results.new_count;
    END IF;
  END LOOP;
  
  -- Only proceed if all validations pass
  IF failed_checks > 0 THEN
    RAISE EXCEPTION 'Migration validation failed. Cannot proceed with legacy table cleanup.';
  END IF;
  
  RAISE NOTICE 'All validations passed. Proceeding with legacy table cleanup.';
END $$;

-- Remove foreign key constraints that reference legacy tables
ALTER TABLE IF EXISTS subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;

-- Drop legacy tables (with CASCADE to handle dependencies)
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS photos CASCADE;
DROP TABLE IF EXISTS media_items CASCADE;
DROP TABLE IF EXISTS generated_videos CASCADE;

-- Remove legacy columns from users table
ALTER TABLE users DROP COLUMN IF EXISTS subscription_plan;
ALTER TABLE users DROP COLUMN IF EXISTS total_storage_bytes;

-- Clean up legacy indexes and constraints
DROP INDEX IF EXISTS idx_users_subscription;

-- Log completion
INSERT INTO migration_backup.migration_log (table_name, backup_row_count) 
VALUES ('MIGRATION_COMPLETED', 0);

RAISE NOTICE 'Legacy table cleanup completed successfully.';
```

## 🚨 Rollback Strategy

### Emergency Rollback Procedure
```sql
-- Rollback script: rollback_to_legacy.sql

-- Step 1: Recreate legacy tables from backup
CREATE TABLE subscriptions AS SELECT * FROM migration_backup.subscriptions_backup;
CREATE TABLE photos AS SELECT * FROM migration_backup.photos_backup;
CREATE TABLE media_items AS SELECT * FROM migration_backup.media_items_backup;
CREATE TABLE generated_videos AS SELECT * FROM migration_backup.generated_videos_backup;

-- Step 2: Restore foreign key constraints
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE photos ADD CONSTRAINT photos_project_id_fkey 
  FOREIGN KEY (project_id) REFERENCES video_projects(id) ON DELETE CASCADE;

-- Step 3: Recreate legacy indexes
CREATE INDEX idx_photos_project_id ON photos(project_id);
CREATE INDEX idx_photos_upload_order ON photos(project_id, upload_order);
CREATE INDEX idx_generated_videos_project_id ON generated_videos(project_id);
CREATE INDEX idx_generated_videos_status ON generated_videos(status);

-- Step 4: Restore legacy columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(20) DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_storage_bytes BIGINT DEFAULT 0;

-- Update from new schema
UPDATE users 
SET subscription_plan = us.plan_id
FROM user_subscriptions us 
WHERE users.id = us.user_id AND us.status = 'active';

-- Step 5: Update application configuration to use legacy schema
-- (This would be done in application deployment)

RAISE NOTICE 'Rollback to legacy schema completed.';
```

## 📊 Migration Monitoring

### Key Metrics to Track
```sql
-- Migration monitoring queries

-- 1. Data consistency checks
SELECT 
  'Users vs Subscriptions' as check_name,
  u.count as users_count,
  us.count as subscriptions_count,
  (u.count - us.count) as difference
FROM 
  (SELECT COUNT(*) as count FROM users) u,
  (SELECT COUNT(*) as count FROM user_subscriptions WHERE status = 'active') us;

-- 2. Migration progress tracking
SELECT 
  table_name,
  backup_row_count,
  backup_created_at,
  EXTRACT(EPOCH FROM (NOW() - backup_created_at))/3600 as hours_since_backup
FROM migration_backup.migration_log
ORDER BY backup_created_at DESC;

-- 3. Performance impact monitoring
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  n_tup_hot_upd as hot_updates,
  seq_scan,
  seq_tup_read,
  idx_scan,
  idx_tup_fetch
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND tablename IN ('user_subscriptions', 'media_files', 'project_media', 'generation_jobs')
ORDER BY seq_scan DESC;

-- 4. Query performance comparison
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements 
WHERE query ILIKE '%user_subscriptions%' 
   OR query ILIKE '%media_files%'
   OR query ILIKE '%generation_jobs%'
ORDER BY mean_time DESC
LIMIT 10;
```

### Alerts and Thresholds
```yaml
# Monitoring configuration
migration_monitoring:
  data_consistency:
    - check: user_subscription_count_match
      threshold: 0  # No missing subscriptions allowed
      severity: critical
      
    - check: media_file_migration_complete  
      threshold: 0  # No missing media files allowed
      severity: critical
      
  performance_impact:
    - metric: query_response_time_p95
      threshold: 500ms  # 95th percentile under 500ms
      severity: warning
      
    - metric: database_cpu_usage
      threshold: 80%  # CPU usage under 80%
      severity: warning
      
  migration_progress:
    - phase: data_migration
      expected_duration: 7_days
      severity: warning_if_delayed
```

## 🎯 Success Criteria

### Phase Completion Criteria

**Phase 1 (Foundation)**: ✅
- [ ] All new tables created successfully
- [ ] Indexes and constraints in place  
- [ ] Business logic functions deployed
- [ ] No performance degradation

**Phase 2 (Migration)**: ✅
- [ ] 100% data migrated with zero loss
- [ ] All validation checks pass
- [ ] Rollback procedure tested
- [ ] Performance within acceptable limits

**Phase 3 (Application Update)**: ✅
- [ ] Application uses new schema
- [ ] Feature flags working correctly
- [ ] Legacy fallback functional
- [ ] No user-facing errors

**Phase 4 (Cleanup)**: ✅  
- [ ] Legacy tables backed up and dropped
- [ ] Application fully migrated
- [ ] Performance optimizations applied
- [ ] Documentation updated

### Final Validation Checklist
- [ ] All business logic functions correctly
- [ ] API responses match expected format
- [ ] Real-time updates working
- [ ] Performance meets SLA requirements
- [ ] Backup and recovery procedures tested
- [ ] Monitoring and alerting configured
- [ ] Team trained on new schema

This migration strategy ensures zero-downtime transition to the optimized, normalized database schema while maintaining data integrity and system performance throughout the process.