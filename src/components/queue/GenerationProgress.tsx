import React from 'react';
import { cn } from '@/lib/utils';
import { Clock, Zap } from 'lucide-react';

interface GenerationProgressProps {
  progress: number; // 0-100
  stage: string;
  eta?: string;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const GenerationProgress: React.FC<GenerationProgressProps> = ({
  progress,
  stage,
  eta,
  showDetails = true,
  size = 'md',
  className
}) => {
  const getStageColor = (stageName: string) => {
    const lowerStage = stageName.toLowerCase();
    if (lowerStage.includes('analyzing') || lowerStage.includes('preparing')) {
      return 'text-blue-400';
    }
    if (lowerStage.includes('processing') || lowerStage.includes('generating')) {
      return 'text-primary';
    }
    if (lowerStage.includes('rendering') || lowerStage.includes('finalizing')) {
      return 'text-green-400';
    }
    return 'text-text-secondary';
  };

  const getProgressBarHeight = () => {
    switch (size) {
      case 'sm': return 'h-1';
      case 'lg': return 'h-3';
      default: return 'h-2';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'lg': return 'text-sm';
      default: return 'text-xs';
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Progress Info */}
      {showDetails && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className={cn('w-3 h-3', getStageColor(stage))} />
            <span className={cn('font-medium', getStageColor(stage), getTextSize())}>
              {stage}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={cn('font-mono font-medium text-text-primary', getTextSize())}>
              {progress}%
            </span>
            {eta && (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-text-secondary" />
                <span className={cn('text-text-secondary', getTextSize())}>
                  {eta}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Progress Bar */}
      <div className="space-y-1">
        <div 
          className={cn(
            'w-full bg-gray-700 rounded-full overflow-hidden',
            getProgressBarHeight()
          )}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${stage}: ${progress}% complete${eta ? `, ${eta} remaining` : ''}`}
        >
          <div 
            className={cn(
              'bg-gradient-to-r from-primary via-orange-400 to-pink-500 rounded-full transition-all duration-500 ease-out relative overflow-hidden',
              getProgressBarHeight()
            )}
            style={{ width: `${Math.min(progress, 100)}%` }}
          >
            {/* Animated shimmer effect for active progress */}
            {progress > 0 && progress < 100 && (
              <div 
                className={cn(
                  'absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer',
                  getProgressBarHeight()
                )}
                style={{
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s infinite'
                }}
              />
            )}
          </div>
        </div>
        
        {/* Stage indicators */}
        {showDetails && size !== 'sm' && (
          <div className="flex justify-between text-xs text-text-secondary">
            <span className={progress >= 0 ? 'text-primary' : ''}>
              Preparing
            </span>
            <span className={progress >= 25 ? 'text-primary' : ''}>
              Processing
            </span>
            <span className={progress >= 75 ? 'text-primary' : ''}>
              Rendering
            </span>
            <span className={progress >= 100 ? 'text-green-400' : ''}>
              Complete
            </span>
          </div>
        )}
      </div>
      
      {/* Detailed progress for large size */}
      {size === 'lg' && showDetails && (
        <div className="mt-3 p-3 bg-card-bg rounded-lg border border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-text-secondary">Current Stage:</span>
              <div className={cn('font-medium mt-1', getStageColor(stage))}>
                {stage}
              </div>
            </div>
            <div>
              <span className="text-text-secondary">Progress:</span>
              <div className="font-mono font-medium text-text-primary mt-1">
                {progress}% complete
              </div>
            </div>
            {eta && (
              <>
                <div>
                  <span className="text-text-secondary">Time Remaining:</span>
                  <div className="font-medium text-text-primary mt-1">
                    {eta}
                  </div>
                </div>
                <div>
                  <span className="text-text-secondary">Status:</span>
                  <div className="font-medium text-primary mt-1">
                    Processing
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerationProgress;