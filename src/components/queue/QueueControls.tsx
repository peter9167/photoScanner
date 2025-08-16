'use client';

import React from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Trash2, 
  Filter,
  Loader,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface QueueControlsProps {
  filter: string;
  onFilterChange: (filter: string) => void;
  onQueueAction: (action: string) => void;
  isPaused: boolean;
  itemCounts: {
    all: number;
    processing: number;
    queued: number;
    completed: number;
    failed: number;
  };
}

const QueueControls: React.FC<QueueControlsProps> = ({ 
  filter, 
  onFilterChange, 
  onQueueAction, 
  isPaused, 
  itemCounts 
}) => {
  const filters = [
    {
      key: 'all',
      label: 'All Items',
      count: itemCounts.all,
      icon: Filter,
      color: 'text-gray-400'
    },
    {
      key: 'processing',
      label: 'Processing',
      count: itemCounts.processing,
      icon: Loader,
      color: 'text-blue-500'
    },
    {
      key: 'queued',
      label: 'Queued',
      count: itemCounts.queued,
      icon: Clock,
      color: 'text-yellow-500'
    },
    {
      key: 'completed',
      label: 'Completed',
      count: itemCounts.completed,
      icon: CheckCircle,
      color: 'text-green-500'
    },
    {
      key: 'failed',
      label: 'Failed',
      count: itemCounts.failed,
      icon: AlertCircle,
      color: 'text-red-500'
    }
  ];

  const queueActions = [
    {
      key: isPaused ? 'resume' : 'pause',
      label: isPaused ? 'Resume Queue' : 'Pause Queue',
      icon: isPaused ? Play : Pause,
      variant: isPaused ? 'primary' as const : 'secondary' as const,
      disabled: false
    },
    {
      key: 'clear_completed',
      label: 'Clear Completed',
      icon: CheckCircle,
      variant: 'outline' as const,
      disabled: itemCounts.completed === 0
    },
    {
      key: 'retry_failed',
      label: 'Retry Failed',
      icon: RotateCcw,
      variant: 'outline' as const,
      disabled: itemCounts.failed === 0
    }
  ];

  return (
    <div className="bg-card-bg border border-gray-700 rounded-xl p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filter Tabs */}
        <div className="flex-1">
          <h4 className="text-sm font-medium text-text-secondary mb-3">Filter Queue</h4>
          <div className="flex flex-wrap gap-2">
            {filters.map((filterOption) => {
              const Icon = filterOption.icon;
              const isActive = filter === filterOption.key;
              
              return (
                <button
                  key={filterOption.key}
                  onClick={() => onFilterChange(filterOption.key)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    "border border-transparent hover:border-gray-600",
                    isActive
                      ? "bg-primary text-white border-primary"
                      : "bg-card-hover text-text-secondary hover:bg-gray-700 hover:text-text-primary"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive ? "text-white" : filterOption.color)} />
                  <span>{filterOption.label}</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-gray-700 text-gray-300"
                  )}>
                    {filterOption.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Queue Actions */}
        <div className="flex-shrink-0">
          <h4 className="text-sm font-medium text-text-secondary mb-3">Queue Actions</h4>
          <div className="flex flex-wrap gap-2">
            {queueActions.map((action) => {
              const Icon = action.icon;
              
              return (
                <Button
                  key={action.key}
                  variant={action.variant}
                  size="sm"
                  onClick={() => onQueueAction(action.key)}
                  disabled={action.disabled}
                  className={cn(
                    "flex items-center gap-2 transition-all duration-200",
                    action.disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Queue Status Indicator */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isPaused ? "bg-yellow-400" : "bg-green-400 animate-pulse"
            )} />
            <span className="text-text-secondary">
              Queue Status: <span className={cn("font-medium", isPaused ? "text-yellow-400" : "text-green-400")}>
                {isPaused ? 'Paused' : 'Active'}
              </span>
            </span>
          </div>
          
          <div className="text-text-secondary">
            Total: <span className="font-medium text-text-primary">{itemCounts.all}</span> items
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueControls;