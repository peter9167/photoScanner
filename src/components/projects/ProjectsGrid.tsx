'use client';

import React from 'react';
import { Project } from '@/types/dashboard.types';
import { 
  Play, 
  Edit, 
  MoreHorizontal, 
  Calendar, 
  Image as ImageIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Loader
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ProjectsGridProps {
  projects: Project[];
  onProjectAction: (projectId: string, action: string) => void;
}

const ProjectsGrid: React.FC<ProjectsGridProps> = ({ projects, onProjectAction }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Loader className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'draft':
        return <FileText className="h-4 w-4 text-gray-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'processing':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'draft':
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m${remainingSeconds > 0 ? ` ${remainingSeconds}s` : ''}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {projects.map((project) => (
        <div
          key={project.id}
          className="group bg-card-bg border border-gray-700 rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/10"
        >
          {/* Thumbnail */}
          <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            {project.thumbnailUrl ? (
              <img 
                src={project.thumbnailUrl} 
                alt={project.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-500">
                <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                <span className="text-sm">No preview</span>
              </div>
            )}
            
            {/* Status Badge */}
            <div className={cn(
              "absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1",
              getStatusColor(project.status)
            )}>
              {getStatusIcon(project.status)}
              <span className="capitalize">{project.status}</span>
            </div>

            {/* Duration */}
            <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
              {formatDuration(project.duration)}
            </div>

            {/* Play Button Overlay */}
            {project.status === 'completed' && (
              <button
                onClick={() => onProjectAction(project.id, 'play')}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                aria-label={`Play ${project.title}`}
              >
                <div className="bg-primary text-white rounded-full p-3 hover:bg-primary/90 transition-colors">
                  <Play className="h-6 w-6" />
                </div>
              </button>
            )}

            {/* Progress Bar for Processing */}
            {project.status === 'processing' && project.progress !== undefined && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-3">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2 text-xs text-white">
                  <span>Processing...</span>
                  <span>{project.progress}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Title and Actions */}
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-text-primary text-sm leading-tight flex-1 pr-2">
                {project.title}
              </h3>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {project.status === 'completed' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-card-hover"
                    onClick={() => onProjectAction(project.id, 'play')}
                    aria-label="Play video"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-card-hover"
                  onClick={() => onProjectAction(project.id, 'edit')}
                  aria-label="Edit project"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-card-hover"
                  onClick={() => onProjectAction(project.id, 'menu')}
                  aria-label="More options"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Description */}
            <p className="text-text-secondary text-xs mb-3 line-clamp-2">
              {project.description}
            </p>

            {/* Meta Information */}
            <div className="space-y-2 text-xs text-text-secondary">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(project.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" />
                  <span>{project.photoCount} photos</span>
                </div>
              </div>

              {/* Style and ETA */}
              <div className="flex items-center justify-between">
                <span className="px-2 py-1 bg-gray-700/50 rounded text-xs capitalize">
                  {project.style}
                </span>
                {project.eta && (
                  <div className="flex items-center gap-1 text-blue-400">
                    <Clock className="h-3 w-3" />
                    <span>{project.eta}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectsGrid;