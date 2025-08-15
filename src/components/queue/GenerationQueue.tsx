import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  Play, 
  Pause, 
  Square, 
  Trash2, 
  Clock, 
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Image as ImageIcon
} from 'lucide-react';
import { GenerationItem } from '@/types/dashboard.types';
import GenerationProgress from './GenerationProgress';

interface GenerationQueueProps {
  items: GenerationItem[];
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onCancel?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPriorityChange?: (id: string, direction: 'up' | 'down') => void;
  isPaused?: boolean;
  className?: string;
}

const GenerationQueue: React.FC<GenerationQueueProps> = ({
  items,
  onPause,
  onResume,
  onCancel,
  onDelete,
  onPriorityChange,
  isPaused = false,
  className
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'cancelled':
        return <Square className="w-4 h-4 text-gray-400" />;
      default:
        return <Clock className="w-4 h-4 text-text-secondary" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium capitalize';
    switch (status) {
      case 'processing':
        return `${baseClasses} bg-yellow-500/20 text-yellow-400`;
      case 'completed':
        return `${baseClasses} bg-green-500/20 text-green-400`;
      case 'failed':
        return `${baseClasses} bg-red-500/20 text-red-400`;
      case 'cancelled':
        return `${baseClasses} bg-gray-500/20 text-gray-400`;
      default:
        return `${baseClasses} bg-blue-500/20 text-blue-400`;
    }
  };

  const activeItems = items.filter(item => item.status === 'processing');
  const queuedItems = items.filter(item => item.status === 'queued');
  const completedItems = items.filter(item => 
    item.status === 'completed' || item.status === 'failed' || item.status === 'cancelled'
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* Queue Controls */}
      <Card variant="default" padding="md">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-1">
              Generation Queue
            </h2>
            <p className="text-sm text-text-secondary">
              {activeItems.length} active, {queuedItems.length} queued, {completedItems.length} completed
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {isPaused ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onResume?.('all')}
                leftIcon={<Play className="w-4 h-4" />}
                aria-label="Resume queue processing"
              >
                Resume Queue
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPause?.('all')}
                leftIcon={<Pause className="w-4 h-4" />}
                aria-label="Pause queue processing"
              >
                Pause Queue
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              aria-label="Queue options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Active Generations */}
      {activeItems.length > 0 && (
        <div>
          <h3 className="text-md font-medium text-text-primary mb-3 flex items-center">
            <Loader2 className="w-4 h-4 mr-2 animate-spin text-primary" />
            Active Generations ({activeItems.length})
          </h3>
          <div className="space-y-3">
            {activeItems.map((item, index) => (
              <Card 
                key={item.id} 
                variant="elevated" 
                padding="none"
                className="overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {getStatusIcon(item.status)}
                        <h4 className="font-medium text-text-primary truncate">
                          {item.projectTitle}
                        </h4>
                        <span className={getStatusBadge(item.status)}>
                          {item.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-text-secondary">
                        <span className="flex items-center">
                          <ImageIcon className="w-3 h-3 mr-1" />
                          {item.photoCount} photos
                        </span>
                        <span>{item.style}</span>
                        {item.eta && (
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {item.eta} remaining
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCancel?.(item.id)}
                        className="text-red-400 hover:text-red-300"
                        aria-label={`Cancel generation for ${item.projectTitle}`}
                      >
                        <Square className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <GenerationProgress 
                    progress={item.progress}
                    stage={item.stage}
                    eta={item.eta}
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Queued Generations */}
      {queuedItems.length > 0 && (
        <div>
          <h3 className="text-md font-medium text-text-primary mb-3 flex items-center">
            <Clock className="w-4 h-4 mr-2 text-blue-400" />
            Queue ({queuedItems.length})
          </h3>
          <div className="space-y-2">
            {queuedItems.map((item, index) => (
              <Card 
                key={item.id} 
                variant="default" 
                padding="md"
                className="group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 text-sm font-mono text-text-secondary bg-gray-700 rounded px-2 py-1">
                      #{index + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {getStatusIcon(item.status)}
                        <h4 className="font-medium text-text-primary truncate">
                          {item.projectTitle}
                        </h4>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-text-secondary">
                        <span className="flex items-center">
                          <ImageIcon className="w-3 h-3 mr-1" />
                          {item.photoCount} photos
                        </span>
                        <span>{item.style}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {index > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPriorityChange?.(item.id, 'up')}
                        aria-label={`Move ${item.projectTitle} up in queue`}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {index < queuedItems.length - 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPriorityChange?.(item.id, 'down')}
                        aria-label={`Move ${item.projectTitle} down in queue`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCancel?.(item.id)}
                      className="text-red-400 hover:text-red-300"
                      aria-label={`Remove ${item.projectTitle} from queue`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recently Completed */}
      {completedItems.length > 0 && (
        <div>
          <h3 className="text-md font-medium text-text-primary mb-3">
            Recently Completed ({completedItems.length})
          </h3>
          <div className="space-y-2">
            {completedItems.slice(0, 5).map((item) => (
              <Card 
                key={item.id} 
                variant="default" 
                padding="md"
                className="group opacity-75"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {getStatusIcon(item.status)}
                        <h4 className="font-medium text-text-primary truncate">
                          {item.projectTitle}
                        </h4>
                        <span className={getStatusBadge(item.status)}>
                          {item.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-text-secondary">
                        <span className="flex items-center">
                          <ImageIcon className="w-3 h-3 mr-1" />
                          {item.photoCount} photos
                        </span>
                        <span>{item.style}</span>
                        {item.completedAt && (
                          <span>
                            Completed {new Date(item.completedAt).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete?.(item.id)}
                      className="text-gray-400 hover:text-red-400"
                      aria-label={`Remove ${item.projectTitle} from history`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 && (
        <Card variant="default" padding="lg" className="text-center">
          <div className="py-12">
            <Clock className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              No generations in queue
            </h3>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              Start a new project and begin generating your photo memories into amazing videos.
            </p>
            <Button variant="primary">
              Create New Project
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default GenerationQueue;