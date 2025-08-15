'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import MediaGrid from '@/components/media/MediaGrid';
import MediaFilters from '@/components/media/MediaFilters';
import MediaUpload from '@/components/media/MediaUpload';
import { MediaFile } from '@/types/media.types';

// Mock data for media files
const mockMediaFiles: MediaFile[] = [
  {
    id: '1',
    name: 'sunset-beach.jpg',
    type: 'image',
    format: 'JPEG',
    size: 2.4, // MB
    dimensions: { width: 1920, height: 1080 },
    uploadedAt: new Date('2024-07-23'),
    thumbnailUrl: undefined,
    tags: ['beach', 'sunset', 'vacation'],
    projectIds: ['1', '3'],
    isUsed: true
  },
  {
    id: '2', 
    name: 'birthday-cake.jpg',
    type: 'image',
    format: 'JPEG',
    size: 1.8,
    dimensions: { width: 1280, height: 960 },
    uploadedAt: new Date('2024-07-22'),
    thumbnailUrl: undefined,
    tags: ['birthday', 'celebration', 'cake'],
    projectIds: ['2'],
    isUsed: true
  },
  {
    id: '3',
    name: 'mountain-hike.jpg',
    type: 'image',
    format: 'JPEG',
    size: 3.2,
    dimensions: { width: 2048, height: 1536 },
    uploadedAt: new Date('2024-07-21'),
    thumbnailUrl: undefined,
    tags: ['nature', 'hiking', 'mountains'],
    projectIds: ['4'],
    isUsed: false
  },
  {
    id: '4',
    name: 'wedding-dance.mp4',
    type: 'video',
    format: 'MP4',
    size: 45.6,
    dimensions: { width: 1920, height: 1080 },
    duration: 120, // seconds
    uploadedAt: new Date('2024-07-20'),
    thumbnailUrl: undefined,
    tags: ['wedding', 'dance', 'celebration'],
    projectIds: ['3'],
    isUsed: true
  },
  {
    id: '5',
    name: 'family-portrait.jpg',
    type: 'image',
    format: 'JPEG',
    size: 2.1,
    dimensions: { width: 1600, height: 1200 },
    uploadedAt: new Date('2024-07-19'),
    thumbnailUrl: undefined,
    tags: ['family', 'portrait', 'indoor'],
    projectIds: [],
    isUsed: false
  },
  {
    id: '6',
    name: 'corporate-meeting.jpg',
    type: 'image',
    format: 'JPEG',
    size: 1.9,
    dimensions: { width: 1440, height: 900 },
    uploadedAt: new Date('2024-07-18'),
    thumbnailUrl: undefined,
    tags: ['business', 'meeting', 'professional'],
    projectIds: ['5'],
    isUsed: true
  },
  {
    id: '7',
    name: 'christmas-tree.png',
    type: 'image',
    format: 'PNG',
    size: 4.1,
    dimensions: { width: 2560, height: 1440 },
    uploadedAt: new Date('2023-12-24'),
    thumbnailUrl: undefined,
    tags: ['christmas', 'holiday', 'family'],
    projectIds: ['6'],
    isUsed: true
  },
  {
    id: '8',
    name: 'pet-playing.mp4',
    type: 'video',
    format: 'MP4',
    size: 12.3,
    dimensions: { width: 1280, height: 720 },
    duration: 45,
    uploadedAt: new Date('2024-07-17'),
    thumbnailUrl: undefined,
    tags: ['pets', 'playing', 'funny'],
    projectIds: ['8'],
    isUsed: false
  }
];

export default function MediaPage() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(mockMediaFiles);
  const [filteredMedia, setFilteredMedia] = useState<MediaFile[]>(mockMediaFiles);
  const [currentFilter, setCurrentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
    applyFilters(filter, searchQuery);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    applyFilters(currentFilter, query);
  };

  const applyFilters = (filter: string, query: string) => {
    let filtered = mediaFiles;

    // Apply type filter
    if (filter === 'images') {
      filtered = filtered.filter(file => file.type === 'image');
    } else if (filter === 'videos') {
      filtered = filtered.filter(file => file.type === 'video');
    } else if (filter === 'used') {
      filtered = filtered.filter(file => file.isUsed);
    } else if (filter === 'unused') {
      filtered = filtered.filter(file => !file.isUsed);
    }

    // Apply search filter
    if (query.trim()) {
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(query.toLowerCase()) ||
        file.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }

    setFilteredMedia(filtered);
  };

  const handleFileSelect = (fileId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedFiles(prev => [...prev, fileId]);
    } else {
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
    }
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredMedia.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredMedia.map(file => file.id));
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action ${action} on files:`, selectedFiles);
    // Handle bulk actions (delete, move, tag, etc.)
  };

  const handleFileAction = (fileId: string, action: string) => {
    console.log(`Action ${action} on file ${fileId}`);
    // Handle individual file actions
  };

  const handleUpload = (files: File[]) => {
    console.log('Uploading files:', files);
    // Handle file upload logic
  };

  return (
    <DashboardLayout currentPath="/media">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Media Library</h1>
            <p className="text-text-secondary mt-1">
              Manage your photos and videos for video generation projects
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary">
              {filteredMedia.length} of {mediaFiles.length} files
            </span>
            {selectedFiles.length > 0 && (
              <span className="text-sm text-primary">
                {selectedFiles.length} selected
              </span>
            )}
          </div>
        </div>

        {/* Upload Area */}
        <MediaUpload onUpload={handleUpload} />

        {/* Filters and Search */}
        <MediaFilters
          currentFilter={currentFilter}
          searchQuery={searchQuery}
          viewMode={viewMode}
          selectedCount={selectedFiles.length}
          totalCount={filteredMedia.length}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
          onViewModeChange={setViewMode}
          onSelectAll={handleSelectAll}
          onBulkAction={handleBulkAction}
          fileCounts={{
            all: mediaFiles.length,
            images: mediaFiles.filter(f => f.type === 'image').length,
            videos: mediaFiles.filter(f => f.type === 'video').length,
            used: mediaFiles.filter(f => f.isUsed).length,
            unused: mediaFiles.filter(f => !f.isUsed).length
          }}
        />

        {/* Media Grid */}
        <MediaGrid
          mediaFiles={filteredMedia}
          viewMode={viewMode}
          selectedFiles={selectedFiles}
          onFileSelect={handleFileSelect}
          onFileAction={handleFileAction}
        />

        {/* Empty State */}
        {filteredMedia.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              {searchQuery || currentFilter !== 'all' ? 'No files found' : 'No media files yet'}
            </h3>
            <p className="text-text-secondary mb-6">
              {searchQuery || currentFilter !== 'all' 
                ? 'Try adjusting your filters or search terms'
                : 'Upload your first photos or videos to get started'
              }
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}