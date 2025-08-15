import React from 'react';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string | number;
  icon: React.ReactNode;
  progress?: number; // 0-100 for progress bar
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  progress,
  trend = 'neutral',
  className
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-text-secondary';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3" />;
      case 'down':
        return <TrendingDown className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <Card 
      variant="default" 
      padding="md" 
      hover 
      className={cn('relative overflow-hidden', className)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <p className="text-2xl font-bold text-text-primary">{value}</p>
            {change && (
              <div className={cn('flex items-center text-xs font-medium', getTrendColor())}>
                {getTrendIcon()}
                <span className="ml-1">{change}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
      </div>
      
      {progress !== undefined && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
            <span>Usage</span>
            <span>{progress}%</span>
          </div>
          <div 
            className="w-full bg-gray-700 rounded-full h-2"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${title} usage: ${progress}%`}
          >
            <div 
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                progress > 80 ? "bg-red-500" : progress > 60 ? "bg-yellow-500" : "bg-primary"
              )}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}
    </Card>
  );
};

export default StatsCard;