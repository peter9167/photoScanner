import React from 'react';
import { cn } from '@/lib/utils';
import { formatRelativeTime, formatDuration } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  Play, 
  Edit, 
  MoreHorizontal, 
  Calendar, 
  Clock,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Project } from '@/types/dashboard.types';

interface ProjectCardProps {
  project: Project;
  onPlay?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  compact?: boolean;
  className?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onPlay,
  onEdit,
  onDelete,
  compact = false,
  className
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'processing': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      case 'cancelled': return 'text-gray-400';
      default: return 'text-text-secondary';
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1';
    switch (status) {
      case 'completed':
        return {
          className: `${baseClasses} bg-green-500/20 text-green-400`,
          icon: <CheckCircle className="h-3 w-3" />
        };
      case 'processing':
        return {
          className: `${baseClasses} bg-yellow-500/20 text-yellow-400`,
          icon: <Loader2 className="h-3 w-3 animate-spin" />
        };
      case 'failed':
        return {
          className: `${baseClasses} bg-red-500/20 text-red-400`,
          icon: <AlertCircle className="h-3 w-3" />
        };
      case 'cancelled':
        return {
          className: `${baseClasses} bg-gray-500/20 text-gray-400`,
          icon: <AlertCircle className="h-3 w-3" />
        };
      default:
        return {
          className: `${baseClasses} bg-gray-500/20 text-gray-400`,
          icon: <Clock className="h-3 w-3" />
        };
    }
  };

  const statusBadge = getStatusBadge(project.status);

  return (
    <Card 
      variant="elevated" 
      padding="none"
      hover
      clickable
      className={cn('group overflow-hidden', className)}
      role="article"
      aria-labelledby={`project-${project.id}-title`}
      aria-describedby={`project-${project.id}-description`}
    >
      {/* Thumbnail/Preview */}
      <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900">
        {project.thumbnailUrl ? (
          <img
            src={project.thumbnailUrl}
            alt={`Thumbnail for ${project.title}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-gray-500" />
          </div>
        )}
        
        {/* Play overlay */}
        {project.status === 'completed' && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={onPlay}
              className="transform scale-90 group-hover:scale-100 transition-transform"
              aria-label={`Play video for ${project.title}`}
            >
              <Play className="w-5 h-5 mr-2" />
              Play
            </Button>
          </div>
        )}
        
        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span className={statusBadge.className}>
            {statusBadge.icon}
            <span className="capitalize">{project.status}</span>
          </span>
        </div>
        
        {/* Duration */}
        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 rounded text-white text-sm">
          {formatDuration(project.duration)}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 
              id={`project-${project.id}-title`}
              className="font-semibold text-text-primary truncate"
            >
              {project.title}
            </h3>
            {project.description && (
              <p 
                id={`project-${project.id}-description`}
                className="text-text-secondary text-sm mt-1 line-clamp-2"
              >
                {project.description}
              </p>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={`More actions for ${project.title}`}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Progress bar for processing projects */}
        {project.status === 'processing' && project.progress !== undefined && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
              <span>Progress</span>
              <span>{project.progress}%</span>
            </div>
            <div 
              className="w-full bg-gray-700 rounded-full h-2"
              role="progressbar"
              aria-valuenow={project.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Video generation progress: ${project.progress}% complete`}
            >
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${project.progress}%` }}
              />
            </div>
            {project.eta && (
              <p className="text-xs text-text-secondary mt-1" aria-live="polite">
                Estimated time remaining: {project.eta}
              </p>
            )}
          </div>
        )}
        
        {/* Meta information */}
        <div className="flex items-center justify-between text-xs text-text-secondary mb-3">
          <div className="flex items-center space-x-3">
            <span className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {formatRelativeTime(project.createdAt)}
            </span>
            <span className="flex items-center">
              <ImageIcon className="w-3 h-3 mr-1" />
              {project.photoCount} photos
            </span>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex space-x-2">
          {project.status === 'completed' && (
            <Button
              size="sm"
              onClick={onPlay}
              aria-label={`Play video for ${project.title}`}
            >
              <Play className="h-4 w-4 mr-1" />
              Play
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            aria-label={`Edit settings for ${project.title}`}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;