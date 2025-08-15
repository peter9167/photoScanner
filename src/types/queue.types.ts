export interface QueueItem {
  id: string;
  projectId: string;
  projectTitle: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'paused';
  progress: number; // 0-100
  stage: string;
  eta?: string;
  photoCount: number;
  duration: number; // seconds
  style: string;
  priority: 'low' | 'medium' | 'high';
  
  // Timestamps
  queuedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  
  // Queue specific
  queuePosition?: number;
  renderTime?: number; // seconds, for completed items
  errorMessage?: string; // for failed items
  
  // Processing details
  processingDetails?: {
    currentStep: number;
    totalSteps: number;
    stepName: string;
    estimatedCompletion: Date;
  };
}

export interface QueueStats {
  processing: number;
  queued: number;
  completed: number;
  failed: number;
  totalProcessingTime: number; // minutes
  averageWaitTime: number; // minutes
  completionRate: number; // percentage
  queueCapacity: number;
  activeWorkers: number;
  maxWorkers: number;
}