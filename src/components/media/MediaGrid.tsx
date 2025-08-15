'use client';

import React from 'react';
import { MediaFile } from '@/types/media.types';
import { 
  Image as ImageIcon, 
  Video, 
  Download, 
  MoreHorizontal,
  Eye,
  Trash2,
  Tag,
  Calendar,
  HardDrive,
  Monitor
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface MediaGridProps {
  mediaFiles: MediaFile[];
  viewMode: 'grid' | 'list';
  selectedFiles: string[];
  onFileSelect: (fileId: string, isSelected: boolean) => void;
  onFileAction: (fileId: string, action: string) => void;
}

const MediaGrid: React.FC<MediaGridProps> = ({
  mediaFiles,
  viewMode,
  selectedFiles,
  onFileSelect,
  onFileAction
}) => {
  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB < 1) {
      return `${(sizeInMB * 1024).toFixed(0)} KB`;
    }
    return `${sizeInMB.toFixed(1)} MB`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getFileIcon = (file: MediaFile) => {
    return file.type === 'video' ? 
      <Video className="h-8 w-8 text-blue-400" /> : 
      <ImageIcon className="h-8 w-8 text-green-400" />;
  };

  if (viewMode === 'list') {
    return (
      <div className="space-y-2">
        {/* List Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-text-secondary border-b border-gray-700">
          <div className="col-span-1">
            <input
              type="checkbox"
              checked={selectedFiles.length === mediaFiles.length && mediaFiles.length > 0}
              onChange={() => {
                const allSelected = selectedFiles.length === mediaFiles.length;
                mediaFiles.forEach(file => {
                  onFileSelect(file.id, !allSelected);
                });
              }}
              className="rounded border-gray-600 bg-transparent focus:ring-primary"
            />
          </div>
          <div className="col-span-4">Name</div>
          <div className="col-span-1">Type</div>
          <div className="col-span-1">Size</div>
          <div className="col-span-2">Dimensions</div>
          <div className="col-span-2">Uploaded</div>
          <div className="col-span-1">Actions</div>
        </div>

        {/* List Items */}
        {mediaFiles.map((file) => (
          <div
            key={file.id}
            className={cn(
              "grid grid-cols-12 gap-4 px-4 py-3 rounded-lg border transition-all duration-200 hover:bg-card-hover",
              selectedFiles.includes(file.id) 
                ? "bg-primary/10 border-primary/50" 
                : "bg-card-bg border-gray-700"
            )}
          >
            <div className="col-span-1 flex items-center">
              <input
                type="checkbox"
                checked={selectedFiles.includes(file.id)}
                onChange={(e) => onFileSelect(file.id, e.target.checked)}
                className="rounded border-gray-600 bg-transparent focus:ring-primary"
              />
            </div>
            
            <div className="col-span-4 flex items-center gap-3">
              <div className="flex-shrink-0">
                {getFileIcon(file)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {file.name}
                </p>
                {file.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {file.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-1 py-0.5 bg-gray-700 text-gray-300 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                    {file.tags.length > 3 && (
                      <span className="text-xs text-text-secondary">+{file.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-1 flex items-center">
              <span className="text-sm text-text-secondary uppercase">{file.format}</span>
            </div>

            <div className="col-span-1 flex items-center">
              <span className="text-sm text-text-secondary">{formatFileSize(file.size)}</span>
            </div>

            <div className="col-span-2 flex items-center">
              <span className="text-sm text-text-secondary">
                {file.dimensions.width} × {file.dimensions.height}
                {file.duration && (
                  <span className="ml-2 text-blue-400">({formatDuration(file.duration)})</span>
                )}
              </span>
            </div>

            <div className="col-span-2 flex items-center">
              <span className="text-sm text-text-secondary">{formatDate(file.uploadedAt)}</span>
            </div>

            <div className="col-span-1 flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-card-hover"
                onClick={() => onFileAction(file.id, 'preview')}
                aria-label="Preview file"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-card-hover"
                onClick={() => onFileAction(file.id, 'download')}
                aria-label="Download file"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-card-hover"
                onClick={() => onFileAction(file.id, 'menu')}
                aria-label="More options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Grid View
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {mediaFiles.map((file) => (
        <div
          key={file.id}
          className={cn(
            "group relative bg-card-bg border rounded-xl overflow-hidden transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
            selectedFiles.includes(file.id) 
              ? "border-primary bg-primary/5" 
              : "border-gray-700"
          )}
        >
          {/* Selection Checkbox */}
          <div className="absolute top-2 left-2 z-10">
            <input
              type="checkbox"
              checked={selectedFiles.includes(file.id)}
              onChange={(e) => onFileSelect(file.id, e.target.checked)}
              className="rounded border-gray-600 bg-black/50 focus:ring-primary"
            />
          </div>

          {/* Usage Indicator */}
          {file.isUsed && (
            <div className="absolute top-2 right-2 z-10 bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-medium">
              Used
            </div>
          )}

          {/* File Preview */}
          <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
            {file.thumbnailUrl ? (
              <img 
                src={file.thumbnailUrl} 
                alt={file.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-500 text-center">
                {getFileIcon(file)}
                <span className="block text-xs mt-2 uppercase">{file.format}</span>
              </div>
            )}

            {/* Video Duration */}
            {file.type === 'video' && file.duration && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                {formatDuration(file.duration)}
              </div>
            )}

            {/* Preview Overlay */}
            <button
              onClick={() => onFileAction(file.id, 'preview')}
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              aria-label={`Preview ${file.name}`}
            >
              <div className="bg-primary text-white rounded-full p-2 hover:bg-primary/90 transition-colors">
                <Eye className="h-5 w-5" />
              </div>
            </button>
          </div>

          {/* File Info */}
          <div className="p-3">
            {/* File Name and Actions */}
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-text-primary text-sm leading-tight flex-1 pr-2 truncate">
                {file.name}
              </h3>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-card-hover"
                  onClick={() => onFileAction(file.id, 'download')}
                  aria-label="Download"
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-card-hover"
                  onClick={() => onFileAction(file.id, 'menu')}
                  aria-label="More options"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* File Metadata */}
            <div className="space-y-1 text-xs text-text-secondary">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  <span>{formatFileSize(file.size)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Monitor className="h-3 w-3" />
                  <span>{file.dimensions.width}×{file.dimensions.height}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(file.uploadedAt)}</span>
              </div>

              {/* Projects using this file */}
              {file.projectIds.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-blue-400">{file.projectIds.length} project{file.projectIds.length > 1 ? 's' : ''}</span>
                </div>
              )}

              {/* Tags */}
              {file.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {file.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="px-1.5 py-0.5 bg-gray-700 text-gray-300 text-xs rounded flex items-center gap-1">
                      <Tag className="h-2 w-2" />
                      {tag}
                    </span>
                  ))}
                  {file.tags.length > 2 && (
                    <span className="text-xs text-text-secondary">+{file.tags.length - 2}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MediaGrid;