'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import QueueList from '@/components/queue/QueueList';
import QueueStats from '@/components/queue/QueueStats';
import QueueControls from '@/components/queue/QueueControls';
import { QueueItem, QueueStats as QueueStatsType } from '@/types/queue.types';

// Mock data for queue items
const mockQueueItems: QueueItem[] = [
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
    startedAt: new Date('2024-07-23T10:00:00'),
    priority: 'high',
    processingDetails: {
      currentStep: 3,
      totalSteps: 5,
      stepName: 'AI Enhancement',
      estimatedCompletion: new Date('2024-07-23T14:00:00')
    }
  },
  {
    id: 'q2',
    projectId: '7',
    projectTitle: 'Travel Vlog',
    status: 'processing',
    progress: 30,
    stage: 'Analyzing scenes',
    eta: '6 hours',
    photoCount: 156,
    duration: 420,
    style: 'documentary',
    startedAt: new Date('2024-07-23T08:30:00'),
    priority: 'medium',
    processingDetails: {
      currentStep: 2,
      totalSteps: 6,
      stepName: 'Scene Analysis',
      estimatedCompletion: new Date('2024-07-23T16:30:00')
    }
  },
  {
    id: 'q3',
    projectId: '5',
    projectTitle: 'Weekend Getaway',
    status: 'queued',
    progress: 0,
    stage: 'Waiting in queue',
    photoCount: 18,
    duration: 90,
    style: 'cinematic',
    priority: 'low',
    queuePosition: 1
  },
  {
    id: 'q4',
    projectId: '6',
    projectTitle: 'Pet Photos',
    status: 'queued',
    progress: 0,
    stage: 'Waiting in queue',
    photoCount: 35,
    duration: 150,
    style: 'classic',
    priority: 'medium',
    queuePosition: 2
  },
  {
    id: 'q5',
    projectId: '9',
    projectTitle: 'Corporate Presentation',
    status: 'queued',
    progress: 0,
    stage: 'Waiting in queue',
    photoCount: 24,
    duration: 180,
    style: 'professional',
    priority: 'high',
    queuePosition: 3
  },
  {
    id: 'q6',
    projectId: '10',
    projectTitle: 'Wedding Reception',
    status: 'completed',
    progress: 100,
    stage: 'Video generation complete',
    photoCount: 87,
    duration: 300,
    style: 'romantic',
    completedAt: new Date('2024-07-23T09:45:00'),
    startedAt: new Date('2024-07-23T07:15:00'),
    priority: 'high',
    renderTime: 150 // seconds
  },
  {
    id: 'q7',
    projectId: '11',
    projectTitle: 'Sports Event',
    status: 'failed',
    progress: 45,
    stage: 'Processing failed',
    photoCount: 67,
    duration: 240,
    style: 'dynamic',
    startedAt: new Date('2024-07-23T06:00:00'),
    failedAt: new Date('2024-07-23T07:30:00'),
    priority: 'medium',
    errorMessage: 'Insufficient storage space for processing'
  }
];

// Mock queue statistics
const mockQueueStats: QueueStatsType = {
  processing: 2,
  queued: 3,
  completed: 1,
  failed: 1,
  totalProcessingTime: 450, // minutes
  averageWaitTime: 125, // minutes
  completionRate: 85, // percentage
  queueCapacity: 10,
  activeWorkers: 2,
  maxWorkers: 4
};

export default function QueuePage() {
  const [queueItems, setQueueItems] = useState<QueueItem[]>(mockQueueItems);
  const [queueStats, setQueueStats] = useState<QueueStatsType>(mockQueueStats);
  const [filter, setFilter] = useState<string>('all');
  const [isPaused, setIsPaused] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setQueueItems(prev => prev.map(item => {
        if (item.status === 'processing' && item.progress < 100) {
          // Simulate progress increment
          const newProgress = Math.min(item.progress + Math.random() * 5, 100);
          return {
            ...item,
            progress: newProgress,
            ...(newProgress >= 100 && {
              status: 'completed' as const,
              stage: 'Video generation complete',
              completedAt: new Date(),
              renderTime: Math.floor(Math.random() * 300) + 60
            })
          };
        }
        return item;
      }));
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const filteredItems = queueItems.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const handleQueueAction = (action: string) => {
    switch (action) {
      case 'pause':
        setIsPaused(true);
        console.log('Queue paused');
        break;
      case 'resume':
        setIsPaused(false);
        console.log('Queue resumed');
        break;
      case 'clear_completed':
        setQueueItems(prev => prev.filter(item => item.status !== 'completed'));
        console.log('Completed items cleared');
        break;
      case 'retry_failed':
        setQueueItems(prev => prev.map(item => 
          item.status === 'failed' 
            ? { ...item, status: 'queued', progress: 0, stage: 'Waiting in queue' }
            : item
        ));
        console.log('Failed items queued for retry');
        break;
      default:
        console.log(`Unknown action: ${action}`);
    }
  };

  const handleItemAction = (itemId: string, action: string) => {
    console.log(`Action ${action} on item ${itemId}`);
    
    switch (action) {
      case 'cancel':
        setQueueItems(prev => prev.filter(item => item.id !== itemId));
        break;
      case 'priority_high':
        setQueueItems(prev => prev.map(item =>
          item.id === itemId ? { ...item, priority: 'high' } : item
        ));
        break;
      case 'priority_medium':
        setQueueItems(prev => prev.map(item =>
          item.id === itemId ? { ...item, priority: 'medium' } : item
        ));
        break;
      case 'priority_low':
        setQueueItems(prev => prev.map(item =>
          item.id === itemId ? { ...item, priority: 'low' } : item
        ));
        break;
      case 'retry':
        setQueueItems(prev => prev.map(item =>
          item.id === itemId 
            ? { ...item, status: 'queued', progress: 0, stage: 'Waiting in queue' }
            : item
        ));
        break;
    }
  };

  return (
    <DashboardLayout currentPath="/queue">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Generation Queue</h1>
            <p className="text-text-secondary mt-1">
              Monitor and manage your video generation progress
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
              isPaused 
                ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                : "bg-green-500/10 text-green-400 border border-green-500/20"
            )}>
              <div className={cn(
                "w-2 h-2 rounded-full",
                isPaused ? "bg-yellow-400" : "bg-green-400 animate-pulse"
              )} />
              {isPaused ? 'Queue Paused' : 'Queue Active'}
            </div>
          </div>
        </div>

        {/* Queue Statistics */}
        <QueueStats stats={queueStats} isPaused={isPaused} />

        {/* Queue Controls */}
        <QueueControls
          filter={filter}
          onFilterChange={setFilter}
          onQueueAction={handleQueueAction}
          isPaused={isPaused}
          itemCounts={{
            all: queueItems.length,
            processing: queueItems.filter(i => i.status === 'processing').length,
            queued: queueItems.filter(i => i.status === 'queued').length,
            completed: queueItems.filter(i => i.status === 'completed').length,
            failed: queueItems.filter(i => i.status === 'failed').length
          }}
        />

        {/* Queue List */}
        <QueueList
          items={filteredItems}
          onItemAction={handleItemAction}
          isPaused={isPaused}
        />

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              {filter === 'all' ? 'No items in queue' : `No ${filter} items`}
            </h3>
            <p className="text-text-secondary mb-6">
              {filter === 'all' 
                ? 'Start creating projects to see them in the generation queue'
                : `No items with ${filter} status found`
              }
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}