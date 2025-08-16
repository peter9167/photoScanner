'use client';

import React from 'react';
import { QueueItem } from '@/types/queue.types';
import { 
  Play, 
  Pause, 
  Square, 
  MoreHorizontal, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Loader,
  Film,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  X,
  RefreshCw
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface QueueListProps {
  items: QueueItem[];
  onItemAction: (itemId: string, action: string) => void;
  isPaused: boolean;
}

const QueueList: React.FC<QueueListProps> = ({ items, onItemAction, isPaused }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Loader className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'queued':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'queued':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'completed':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m${seconds % 60 > 0 ? ` ${seconds % 60}s` : ''}`;
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <div className="bg-card-bg border border-gray-700 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-text-primary">Generation Queue</h3>
        <p className="text-sm text-text-secondary mt-1">
          {items.length} {items.length === 1 ? 'item' : 'items'} in queue
        </p>
      </div>

      <div className="divide-y divide-gray-700">
        {items.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">⚡</div>
            <h4 className="text-lg font-medium text-text-primary mb-2">Queue is empty</h4>
            <p className="text-text-secondary">No video generation jobs in queue</p>
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "p-6 hover:bg-card-hover transition-colors",
                item.status === 'processing' && "bg-blue-500/5"
              )}
            >
              <div className="flex items-start gap-4">
                {/* Queue Position */}
                {item.status === 'queued' && item.queuePosition && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm font-medium text-text-primary">
                    {item.queuePosition}
                  </div>
                )}

                {/* Status Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(item.status)}
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-medium text-text-primary truncate">
                        {item.projectTitle}
                      </h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-text-secondary">
                        <div className="flex items-center gap-1">
                          <ImageIcon className="h-3 w-3" />
                          <span>{item.photoCount} photos</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Film className="h-3 w-3" />
                          <span>{formatDuration(item.duration)}</span>
                        </div>
                        <span className="capitalize text-primary">{item.style}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {/* Priority */}
                      <div className={cn("text-xs font-medium uppercase", getPriorityColor(item.priority))}>
                        {item.priority}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1">
                        {item.status === 'processing' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => onItemAction(item.id, 'cancel')}
                            aria-label="Cancel processing"
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {item.status === 'queued' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => onItemAction(item.id, 'priority_high')}
                              aria-label="Increase priority"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => onItemAction(item.id, 'priority_low')}
                              aria-label="Decrease priority"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => onItemAction(item.id, 'cancel')}
                              aria-label="Remove from queue"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}

                        {item.status === 'failed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => onItemAction(item.id, 'retry')}
                            aria-label="Retry"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => onItemAction(item.id, 'menu')}
                          aria-label="More options"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Status and Progress */}
                  <div className="space-y-3">
                    {/* Status Badge and Stage */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1",
                          getStatusColor(item.status)
                        )}>
                          <span className="capitalize">{item.status}</span>
                        </span>
                        <span className="text-sm text-text-secondary">{item.stage}</span>
                      </div>

                      {/* Time Information */}
                      <div className="text-xs text-text-secondary">
                        {item.status === 'processing' && item.eta && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>ETA: {item.eta}</span>
                          </div>
                        )}
                        {item.startedAt && (
                          <div>Started: {formatTime(item.startedAt)}</div>
                        )}
                        {item.completedAt && (
                          <div>Completed: {formatTime(item.completedAt)}</div>
                        )}
                        {item.failedAt && (
                          <div>Failed: {formatTime(item.failedAt)}</div>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {item.status === 'processing' && item.progress !== undefined && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-text-secondary">
                            {item.processingDetails?.stepName || 'Processing'}
                            {item.processingDetails && (
                              <span className="ml-1">
                                ({item.processingDetails.currentStep}/{item.processingDetails.totalSteps})
                              </span>
                            )}
                          </span>
                          <span className="text-text-primary font-medium">{item.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {item.status === 'failed' && item.errorMessage && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-red-400">Processing Failed</p>
                            <p className="text-xs text-red-300 mt-1">{item.errorMessage}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Completion Info */}
                    {item.status === 'completed' && item.renderTime && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <p className="text-sm text-green-400">
                            Video generated successfully in {Math.floor(item.renderTime / 60)}m {item.renderTime % 60}s
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QueueList;