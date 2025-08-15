export interface DashboardStats {
  totalProjects: number;
  projectsChange: number;
  videosGenerated: number;
  videosChange: number;
  storageUsed: number;
  storageLimit: number;
  aiMinutes: number;
  aiLimit: number;
  activeProjects: number;
  queuedGenerations: number;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'processing' | 'completed' | 'failed' | 'cancelled';
  thumbnailUrl?: string;
  photoCount: number;
  duration: number; // in seconds
  style: 'classic' | 'modern' | 'cinematic' | 'vintage' | 'professional';
  progress?: number; // 0-100 for processing projects
  eta?: string; // estimated time remaining
  createdAt: Date;
  updatedAt: Date;
}

export interface GenerationItem {
  id: string;
  projectId: string;
  projectTitle: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  stage: string;
  eta?: string;
  photoCount: number;
  duration: number;
  style: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface NavigationLink {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
  isActive?: boolean;
}

export interface UploadProgress {
  filename: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  size: number;
  id: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  subscriptionPlan: 'free' | 'pro' | 'enterprise';
  language: string;
  timezone: string;
}

export type ViewMode = 'grid' | 'list';