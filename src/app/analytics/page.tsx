'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AnalyticsOverview from '@/components/analytics/AnalyticsOverview';
import AnalyticsCharts from '@/components/analytics/AnalyticsCharts';
import { AnalyticsData } from '@/types/analytics.types';

// Mock analytics data
const mockAnalyticsData: AnalyticsData = {
  overview: {
    totalProjects: 24,
    totalVideos: 189,
    totalPhotos: 1250,
    totalProcessingTime: 3420, // minutes
    averageProjectSize: 52, // photos per project
    mostUsedStyle: 'cinematic',
    completionRate: 94.5, // percentage
    storageUsed: 8.5 // GB
  },
  projectsOverTime: [
    { date: '2024-01', projects: 2, videos: 8 },
    { date: '2024-02', projects: 4, videos: 15 },
    { date: '2024-03', projects: 6, videos: 28 },
    { date: '2024-04', projects: 3, videos: 18 },
    { date: '2024-05', projects: 5, videos: 32 },
    { date: '2024-06', projects: 8, videos: 45 },
    { date: '2024-07', projects: 12, videos: 63 }
  ],
  styleDistribution: [
    { style: 'cinematic', count: 7, percentage: 29.2 },
    { style: 'modern', count: 5, percentage: 20.8 },
    { style: 'classic', count: 4, percentage: 16.7 },
    { style: 'vintage', count: 3, percentage: 12.5 },
    { style: 'professional', count: 3, percentage: 12.5 },
    { style: 'festive', count: 2, percentage: 8.3 }
  ],
  processingStats: {
    averageProcessingTime: 145, // minutes
    fastestProject: 45, // minutes
    slowestProject: 380, // minutes
    peakProcessingHours: ['14:00', '15:00', '16:00'],
    queueEfficiency: 87.3 // percentage
  },
  storageBreakdown: {
    photos: 6.2, // GB
    videos: 2.1, // GB
    cache: 0.2, // GB
    total: 8.5 // GB
  }
};

export default function AnalyticsPage() {
  return (
    <DashboardLayout currentPath="/analytics">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Analytics</h1>
            <p className="text-text-secondary mt-1">
              Insights and statistics about your video generation projects
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary">
              Last updated: {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Analytics Overview */}
        <AnalyticsOverview data={mockAnalyticsData.overview} />

        {/* Charts and Detailed Analytics */}
        <AnalyticsCharts data={mockAnalyticsData} />

        {/* Additional Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Performance Insights */}
          <div className="bg-card-bg border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Performance Insights
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Average Processing Time</span>
                <span className="font-medium text-text-primary">
                  {Math.floor(mockAnalyticsData.processingStats.averageProcessingTime / 60)}h{' '}
                  {mockAnalyticsData.processingStats.averageProcessingTime % 60}m
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Queue Efficiency</span>
                <span className="font-medium text-green-400">
                  {mockAnalyticsData.processingStats.queueEfficiency}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Peak Hours</span>
                <span className="font-medium text-text-primary">
                  {mockAnalyticsData.processingStats.peakProcessingHours.join(', ')}
                </span>
              </div>
            </div>
          </div>

          {/* Storage Insights */}
          <div className="bg-card-bg border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Storage Usage
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Photos</span>
                <span className="font-medium text-text-primary">
                  {mockAnalyticsData.storageBreakdown.photos} GB
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Generated Videos</span>
                <span className="font-medium text-text-primary">
                  {mockAnalyticsData.storageBreakdown.videos} GB
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Cache & Temp</span>
                <span className="font-medium text-text-primary">
                  {mockAnalyticsData.storageBreakdown.cache} GB
                </span>
              </div>
              <div className="h-px bg-gray-700 my-2" />
              <div className="flex items-center justify-between font-semibold">
                <span className="text-text-primary">Total Used</span>
                <span className="text-primary">
                  {mockAnalyticsData.storageBreakdown.total} GB
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}