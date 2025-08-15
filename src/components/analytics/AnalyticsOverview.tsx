'use client';

import React from 'react';
import { AnalyticsOverview as AnalyticsOverviewType } from '@/types/analytics.types';

interface AnalyticsOverviewProps {
  data: AnalyticsOverviewType;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  className = ""
}) => {
  return (
    <div className={`bg-card-bg border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{icon}</span>
            <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide">
              {title}
            </h3>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-text-primary">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {subtitle && (
              <p className="text-sm text-text-secondary">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend.isPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            <span>{trend.isPositive ? '↗' : '↘'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ data }) => {
  // Format processing time from minutes to hours and minutes
  const formatProcessingTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  // Format storage with proper units
  const formatStorage = (gb: number): string => {
    if (gb >= 1) {
      return `${gb.toFixed(1)} GB`;
    }
    return `${(gb * 1024).toFixed(0)} MB`;
  };

  // Calculate completion rate color
  const getCompletionRateColor = (rate: number): string => {
    if (rate >= 95) return 'text-green-400';
    if (rate >= 85) return 'text-yellow-400';
    return 'text-red-400';
  };

  const metrics = [
    {
      title: 'Total Projects',
      value: data.totalProjects,
      subtitle: 'Created projects',
      icon: '📁',
      trend: { value: 12.5, isPositive: true }
    },
    {
      title: 'Generated Videos',
      value: data.totalVideos,
      subtitle: 'Completed videos',
      icon: '🎬',
      trend: { value: 8.3, isPositive: true }
    },
    {
      title: 'Total Photos',
      value: data.totalPhotos,
      subtitle: 'Processed images',
      icon: '📸',
      trend: { value: 15.7, isPositive: true }
    },
    {
      title: 'Processing Time',
      value: formatProcessingTime(data.totalProcessingTime),
      subtitle: 'Total compute time',
      icon: '⏱️',
      trend: { value: 5.2, isPositive: false }
    },
    {
      title: 'Avg Project Size',
      value: data.averageProjectSize,
      subtitle: 'Photos per project',
      icon: '📊',
      trend: { value: 3.1, isPositive: true }
    },
    {
      title: 'Popular Style',
      value: data.mostUsedStyle,
      subtitle: 'Most used style',
      icon: '🎨',
      className: 'md:col-span-1'
    },
    {
      title: 'Completion Rate',
      value: `${data.completionRate}%`,
      subtitle: 'Success rate',
      icon: '✅',
      className: `${getCompletionRateColor(data.completionRate)}`
    },
    {
      title: 'Storage Used',
      value: formatStorage(data.storageUsed),
      subtitle: 'Total storage',
      icon: '💾',
      trend: { value: 2.8, isPositive: true }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">
          Overview
        </h2>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span>Live data</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            subtitle={metric.subtitle}
            icon={metric.icon}
            trend={metric.trend}
            className={metric.className}
          />
        ))}
      </div>

      {/* Summary Insights */}
      <div className="bg-card-bg border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Quick Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {Math.round(data.totalPhotos / data.totalProjects)}
            </div>
            <div className="text-sm text-text-secondary">
              Average photos per project
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {Math.round(data.totalProcessingTime / data.totalVideos)}m
            </div>
            <div className="text-sm text-text-secondary">
              Average processing time per video
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold mb-1 ${getCompletionRateColor(data.completionRate)}`}>
              {data.completionRate}%
            </div>
            <div className="text-sm text-text-secondary">
              Project success rate
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverview;