'use client';

import React from 'react';
import { Search, Filter, CheckCircle, Loader, FileText, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface ProjectFiltersProps {
  currentFilter: string;
  searchQuery: string;
  onFilterChange: (filter: string) => void;
  onSearchChange: (query: string) => void;
  projectCounts: {
    all: number;
    completed: number;
    processing: number;
    draft: number;
    failed: number;
  };
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  currentFilter,
  searchQuery,
  onFilterChange,
  onSearchChange,
  projectCounts
}) => {
  const filters = [
    {
      key: 'all',
      label: 'All Projects',
      count: projectCounts.all,
      icon: Filter,
      color: 'text-gray-400'
    },
    {
      key: 'completed',
      label: 'Completed',
      count: projectCounts.completed,
      icon: CheckCircle,
      color: 'text-green-500'
    },
    {
      key: 'processing',
      label: 'Processing',
      count: projectCounts.processing,
      icon: Loader,
      color: 'text-blue-500'
    },
    {
      key: 'draft',
      label: 'Draft',
      count: projectCounts.draft,
      icon: FileText,
      color: 'text-gray-500'
    },
    {
      key: 'failed',
      label: 'Failed',
      count: projectCounts.failed,
      icon: AlertCircle,
      color: 'text-red-500'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-md">
          <Input
            type="search"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-card-bg border-gray-600 focus:border-primary focus:ring-primary/20"
            leftIcon={<Search className="h-4 w-4 text-text-secondary" />}
          />
        </div>
      </div>

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
              Search: "{searchQuery}"
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

export default ProjectFilters;