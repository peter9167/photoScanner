import React from 'react';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  Clock, 
  Loader2, 
  Play, 
  Pause,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { GenerationItem } from '@/types/dashboard.types';
import GenerationProgress from './GenerationProgress';

interface QueueOverviewProps {
  items: GenerationItem[];
  isPaused?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onViewAll?: () => void;
  className?: string;
}

const QueueOverview: React.FC<QueueOverviewProps> = ({
  items,
  isPaused = false,
  onPause,
  onResume,
  onViewAll,
  className
}) => {
  const activeItems = items.filter(item => item.status === 'processing');
  const queuedItems = items.filter(item => item.status === 'queued');
  const currentGeneration = activeItems[0];

  const getQueueStatus = () => {
    if (isPaused) return { text: 'Queue Paused', color: 'text-yellow-400' };
    if (activeItems.length > 0) return { text: 'Processing', color: 'text-primary' };
    if (queuedItems.length > 0) return { text: 'Queue Ready', color: 'text-blue-400' };
    return { text: 'Queue Empty', color: 'text-text-secondary' };
  };

  const status = getQueueStatus();

  return (
    <Card variant="elevated" padding="none" className={cn('overflow-hidden', className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-text-primary mb-1 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Generation Queue
            </h3>
            <div className="flex items-center space-x-4 text-sm">
              <span className={cn('font-medium', status.color)}>
                {status.text}
              </span>
              <span className="text-text-secondary">
                {activeItems.length} active, {queuedItems.length} queued
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isPaused ? (
              <Button
                variant="primary"
                size="sm"
                onClick={onResume}
                leftIcon={<Play className="w-3 h-3" />}
                aria-label="Resume queue"
              >
                Resume
              </Button>
            ) : activeItems.length > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onPause}
                leftIcon={<Pause className="w-3 h-3" />}
                aria-label="Pause queue"
              >
                Pause
              </Button>
            ) : null}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAll}
              rightIcon={<ArrowRight className="w-3 h-3" />}
            >
              View All
            </Button>
          </div>
        </div>
      </div>

      {/* Current Generation */}
      {currentGeneration && (
        <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-primary/5 to-orange-500/5">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-text-primary truncate">
                  {currentGeneration.projectTitle}
                </h4>
                <span className="text-xs text-text-secondary">
                  Currently Processing
                </span>
              </div>
              
              <GenerationProgress
                progress={currentGeneration.progress}
                stage={currentGeneration.stage}
                eta={currentGeneration.eta}
                size="sm"
                showDetails={false}
              />
              
              <div className="flex items-center justify-between mt-2 text-xs text-text-secondary">
                <span>{currentGeneration.stage}</span>
                <span>{currentGeneration.progress}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Queue Summary */}
      <div className="p-4">
        {queuedItems.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-text-secondary">
              Next in Queue ({queuedItems.length})
            </h4>
            
            <div className="space-y-2">
              {queuedItems.slice(0, 3).map((item, index) => (
                <div 
                  key={item.id}
                  className="flex items-center space-x-3 p-2 rounded-lg bg-card-bg border border-gray-700"
                >
                  <div className="flex-shrink-0 text-xs font-mono text-text-secondary bg-gray-700 rounded px-2 py-1">
                    #{index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {item.projectTitle}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {item.photoCount} photos • {item.style}
                    </p>
                  </div>
                  
                  <Clock className="w-4 h-4 text-text-secondary flex-shrink-0" />
                </div>
              ))}
              
              {queuedItems.length > 3 && (
                <div className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onViewAll}
                    className="text-text-secondary hover:text-text-primary"
                  >
                    +{queuedItems.length - 3} more in queue
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : !currentGeneration ? (
          // Empty State
          <div className="text-center py-6">
            <Clock className="w-8 h-8 text-gray-500 mx-auto mb-3" />
            <h4 className="text-sm font-medium text-text-primary mb-1">
              No active generations
            </h4>
            <p className="text-xs text-text-secondary mb-4">
              Your queue is empty. Create a new project to get started.
            </p>
            <Button size="sm" variant="primary">
              Create Project
            </Button>
          </div>
        ) : (
          // Queue cleared but generation active
          <div className="text-center py-4">
            <p className="text-sm text-text-secondary">
              Queue cleared. Current generation will complete.
            </p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {items.some(item => item.status === 'completed' || item.status === 'failed') && (
        <div className="p-4 border-t border-gray-700 bg-gray-800/20">
          <h4 className="text-sm font-medium text-text-secondary mb-2">
            Recent Activity
          </h4>
          
          <div className="space-y-2">
            {items
              .filter(item => item.status === 'completed' || item.status === 'failed')
              .slice(0, 2)
              .map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center space-x-3 text-xs"
                >
                  <div className="flex-shrink-0">
                    {item.status === 'completed' ? (
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-red-400" />
                    )}
                  </div>
                  
                  <span className="flex-1 text-text-secondary truncate">
                    {item.projectTitle}
                  </span>
                  
                  <span className={cn(
                    'capitalize',
                    item.status === 'completed' ? 'text-green-400' : 'text-red-400'
                  )}>
                    {item.status}
                  </span>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </Card>
  );
};

export default QueueOverview;