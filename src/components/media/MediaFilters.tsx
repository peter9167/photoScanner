'use client';

import React from 'react';
import { 
  Search, 
  Image as ImageIcon, 
  Video, 
  Filter, 
  Grid3X3, 
  List, 
  CheckSquare,
  Trash2,
  Tag,
  Download,
  FolderOpen,
  Eye,
  EyeOff
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface MediaFiltersProps {
  currentFilter: string;
  searchQuery: string;
  viewMode: 'grid' | 'list';
  selectedCount: number;
  totalCount: number;
  onFilterChange: (filter: string) => void;
  onSearchChange: (query: string) => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onSelectAll: () => void;
  onBulkAction: (action: string) => void;
  fileCounts: {
    all: number;
    images: number;
    videos: number;
    used: number;
    unused: number;
  };
}

const MediaFilters: React.FC<MediaFiltersProps> = ({
  currentFilter,
  searchQuery,
  viewMode,
  selectedCount,
  totalCount,
  onFilterChange,
  onSearchChange,
  onViewModeChange,
  onSelectAll,
  onBulkAction,
  fileCounts
}) => {
  const filters = [
    {
      key: 'all',
      label: 'All Files',
      count: fileCounts.all,
      icon: Filter,
      color: 'text-gray-400'
    },
    {
      key: 'images',
      label: 'Images',
      count: fileCounts.images,
      icon: ImageIcon,
      color: 'text-green-500'
    },
    {
      key: 'videos',
      label: 'Videos',
      count: fileCounts.videos,
      icon: Video,
      color: 'text-blue-500'
    },
    {
      key: 'used',
      label: 'Used',
      count: fileCounts.used,
      icon: Eye,
      color: 'text-purple-500'
    },
    {
      key: 'unused',
      label: 'Unused',
      count: fileCounts.unused,
      icon: EyeOff,
      color: 'text-gray-500'
    }
  ];

  const bulkActions = [
    { key: 'download', label: 'Download', icon: Download },
    { key: 'tag', label: 'Add Tags', icon: Tag },
    { key: 'move', label: 'Move to Folder', icon: FolderOpen },
    { key: 'delete', label: 'Delete', icon: Trash2, variant: 'danger' as const }
  ];

  return (
    <div className="space-y-4">
      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <Input
            type="search"
            placeholder="Search files and tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-card-bg border-gray-600 focus:border-primary focus:ring-primary/20"
            leftIcon={<Search className="h-4 w-4 text-text-secondary" />}
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex bg-card-bg border border-gray-700 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={cn(
                "p-2 rounded text-sm font-medium transition-colors",
                viewMode === 'grid'
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:text-text-primary hover:bg-card-hover"
              )}
              aria-label="Grid view"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={cn(
                "p-2 rounded text-sm font-medium transition-colors",
                viewMode === 'list'
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:text-text-primary hover:bg-card-hover"
              )}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Bulk Actions */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = currentFilter === filter.key;
            
            return (
              <button
                key={filter.key}
                onClick={() => onFilterChange(filter.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  "border border-transparent hover:border-gray-600",
                  isActive
                    ? "bg-primary text-white border-primary"
                    : "bg-card-bg text-text-secondary hover:bg-card-hover hover:text-text-primary"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-white" : filter.color)} />
                <span>{filter.label}</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-gray-700 text-gray-300"
                )}>
                  {filter.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bulk Actions */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <button
                onClick={onSelectAll}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-card-hover transition-colors"
              >
                <CheckSquare className="h-4 w-4" />
                {selectedCount === totalCount ? 'Deselect All' : 'Select All'}
              </button>
              <span>|</span>
              <span>{selectedCount} selected</span>
            </div>
            
            <div className="flex items-center gap-1">
              {bulkActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.key}
                    variant={action.variant || "outline"}
                    size="sm"
                    onClick={() => onBulkAction(action.key)}
                    className="h-8"
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {action.label}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Summary */}
      {(searchQuery || currentFilter !== 'all') && (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <span>Active filters:</span>
          {currentFilter !== 'all' && (
            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
              {filters.find(f => f.key === currentFilter)?.label}
            </span>
          )}
          {searchQuery && (
            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
              Search: &quot;{searchQuery}&quot;
            </span>
          )}
          <button
            onClick={() => {
              onFilterChange('all');
              onSearchChange('');
            }}
            className="text-primary hover:text-primary/80 text-xs underline ml-2"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default MediaFilters;