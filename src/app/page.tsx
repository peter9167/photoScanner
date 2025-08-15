'use client';

import React from 'react';
import DashboardSummary from '@/components/dashboard/DashboardSummary';
import { DashboardStats, Project, GenerationItem } from '@/types/dashboard.types';

// Mock data for demonstration
const mockStats: DashboardStats = {
  totalProjects: 24,
  projectsChange: 12,
  videosGenerated: 189,
  videosChange: 8,
  storageUsed: 8.5, // GB
  storageLimit: 100, // GB
  aiMinutes: 450,
  aiLimit: 1000,
  activeProjects: 3,
  queuedGenerations: 5
};

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Summer Vacation 2024',
    description: 'Beach memories with family',
    status: 'completed',
    thumbnailUrl: undefined,
    photoCount: 45,
    duration: 180,
    style: 'cinematic',
    progress: 100,
    createdAt: new Date('2024-07-20'),
    updatedAt: new Date('2024-07-22')
  },
  {
    id: '2',
    title: 'Birthday Party',
    description: 'Emma\'s 5th birthday celebration',
    status: 'processing',
    thumbnailUrl: undefined,
    photoCount: 28,
    duration: 120,
    style: 'modern',
    progress: 65,
    eta: '2 hours',
    createdAt: new Date('2024-07-22'),
    updatedAt: new Date('2024-07-23')
  },
  {
    id: '3',
    title: 'Wedding Highlights',
    description: 'Beautiful ceremony moments',
    status: 'completed',
    thumbnailUrl: undefined,
    photoCount: 120,
    duration: 300,
    style: 'classic',
    progress: 100,
    createdAt: new Date('2024-07-18'),
    updatedAt: new Date('2024-07-19')
  },
  {
    id: '4',
    title: 'Nature Hike',
    description: 'Mountain trail adventure',
    status: 'draft',
    thumbnailUrl: undefined,
    photoCount: 32,
    duration: 90,
    style: 'vintage',
    createdAt: new Date('2024-07-23'),
    updatedAt: new Date('2024-07-23')
  }
];

const mockQueueItems: GenerationItem[] = [
  {
    id: 'q1',
    projectId: '2',
    projectTitle: 'Birthday Party',
    status: 'processing',
    progress: 65,
    stage: 'Applying AI enhancements',
    eta: '2 hours',
    photoCount: 28,
    duration: 120,
    style: 'modern',
    startedAt: new Date('2024-07-23T10:00:00')
  },
  {
    id: 'q2',
    projectId: '5',
    projectTitle: 'Weekend Getaway',
    status: 'queued',
    progress: 0,
    stage: 'Waiting in queue',
    photoCount: 18,
    duration: 90,
    style: 'cinematic'
  },
  {
    id: 'q3',
    projectId: '6',
    projectTitle: 'Pet Photos',
    status: 'queued',
    progress: 0,
    stage: 'Waiting in queue',
    photoCount: 35,
    duration: 150,
    style: 'classic'
  }
];

export default function HomePage() {
  return (
    <DashboardSummary
      stats={mockStats}
      recentProjects={mockProjects}
      queueItems={mockQueueItems}
    />
  );
}