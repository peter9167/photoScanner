'use client';

import React from 'react';
import { QueueStats as QueueStatsType } from '@/types/queue.types';
import { 
  Loader, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Zap, 
  Timer,
  TrendingUp,
  Users,
  Server,
  Gauge
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QueueStatsProps {
  stats: QueueStatsType;
  isPaused: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "text-primary"
}) => {
  return (
    <div className="bg-card-bg border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2 rounded-lg bg-gray-700/50", color)}>
          {icon}
        </div>
        {trend && (
          <div className={cn("flex items-center gap-1 text-sm font-medium", 
            trend.isPositive ? 'text-green-400' : 'text-red-400'
          )}>
            <TrendingUp className={cn("h-3 w-3", trend.isPositive ? '' : 'rotate-180')} />
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      
      <div>
        <p className="text-2xl font-bold text-text-primary mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-sm font-medium text-text-secondary uppercase tracking-wide">
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-text-secondary mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

const QueueStats: React.FC<QueueStatsProps> = ({ stats, isPaused }) => {
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  const statsData = [
    {
      title: 'Processing',
      value: stats.processing,
      subtitle: isPaused ? 'Queue paused' : 'Currently processing',
      icon: <Loader className={cn("h-5 w-5", isPaused ? 'text-gray-400' : 'text-blue-400 animate-spin')} />,
      color: isPaused ? 'bg-gray-500/10' : 'bg-blue-500/10'
    },
    {
      title: 'In Queue',
      value: stats.queued,
      subtitle: 'Waiting to process',
      icon: <Clock className="h-5 w-5 text-yellow-400" />,
      color: 'bg-yellow-500/10'
    },
    {
      title: 'Completed',
      value: stats.completed,
      subtitle: 'Successfully processed',
      icon: <CheckCircle className="h-5 w-5 text-green-400" />,
      color: 'bg-green-500/10',
      trend: { value: 12.5, isPositive: true }
    },
    {
      title: 'Failed',
      value: stats.failed,
      subtitle: 'Processing errors',
      icon: <AlertCircle className="h-5 w-5 text-red-400" />,
      color: 'bg-red-500/10'
    },
    {
      title: 'Avg Wait Time',
      value: formatTime(stats.averageWaitTime),
      subtitle: 'Time in queue',
      icon: <Timer className="h-5 w-5 text-purple-400" />,
      color: 'bg-purple-500/10'
    },
    {
      title: 'Processing Time',
      value: formatTime(stats.totalProcessingTime),
      subtitle: 'Total compute time',
      icon: <Zap className="h-5 w-5 text-orange-400" />,
      color: 'bg-orange-500/10'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsData.map((stat, index) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            trend={stat.trend}
            color={stat.color}
          />
        ))}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completion Rate */}
        <div className="bg-card-bg border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-text-secondary">Completion Rate</span>
            </div>
            <span className="text-2xl font-bold text-green-400">{stats.completionRate}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>

        {/* Queue Capacity */}
        <div className="bg-card-bg border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-text-secondary">Queue Usage</span>
            </div>
            <span className="text-2xl font-bold text-text-primary">
              {stats.processing + stats.queued}/{stats.queueCapacity}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-1000"
              style={{ width: `${((stats.processing + stats.queued) / stats.queueCapacity) * 100}%` }}
            />
          </div>
        </div>

        {/* Workers */}
        <div className="bg-card-bg border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-text-secondary">Active Workers</span>
            </div>
            <span className="text-2xl font-bold text-text-primary">
              {stats.activeWorkers}/{stats.maxWorkers}
            </span>
          </div>
          <div className="space-y-1">
            {Array.from({ length: stats.maxWorkers }, (_, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-2 rounded-full transition-all duration-500",
                  i < stats.activeWorkers 
                    ? "bg-green-500" 
                    : "bg-gray-700"
                )}
              />
            ))}
          </div>
        </div>

        {/* Status Summary */}
        <div className="bg-card-bg border border-gray-700 rounded-xl p-6">
          <div className="mb-3">
            <span className="text-sm font-medium text-text-secondary">System Status</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Queue</span>
              <span className={cn(
                "text-xs font-medium",
                isPaused ? "text-yellow-400" : "text-green-400"
              )}>
                {isPaused ? 'Paused' : 'Active'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Workers</span>
              <span className="text-xs font-medium text-primary">
                {stats.activeWorkers} Running
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Capacity</span>
              <span className="text-xs font-medium text-text-primary">
                {Math.round(((stats.processing + stats.queued) / stats.queueCapacity) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueStats;