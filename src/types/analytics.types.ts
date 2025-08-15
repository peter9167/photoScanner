export interface AnalyticsOverview {
  totalProjects: number;
  totalVideos: number;
  totalPhotos: number;
  totalProcessingTime: number; // minutes
  averageProjectSize: number; // photos per project
  mostUsedStyle: string;
  completionRate: number; // percentage
  storageUsed: number; // GB
}

export interface ProjectsOverTime {
  date: string;
  projects: number;
  videos: number;
}

export interface StyleDistribution {
  style: string;
  count: number;
  percentage: number;
}

export interface ProcessingStats {
  averageProcessingTime: number; // minutes
  fastestProject: number; // minutes
  slowestProject: number; // minutes
  peakProcessingHours: string[];
  queueEfficiency: number; // percentage
}

export interface StorageBreakdown {
  photos: number; // GB
  videos: number; // GB
  cache: number; // GB
  total: number; // GB
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  projectsOverTime: ProjectsOverTime[];
  styleDistribution: StyleDistribution[];
  processingStats: ProcessingStats;
  storageBreakdown: StorageBreakdown;
}