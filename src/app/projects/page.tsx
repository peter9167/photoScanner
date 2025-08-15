'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProjectsGrid from '@/components/projects/ProjectsGrid';
import ProjectFilters from '@/components/projects/ProjectFilters';
import { Project } from '@/types/dashboard.types';

// Mock data for projects
const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Summer Vacation 2024',
    description: 'Beach memories with family and friends from our amazing trip to Hawaii',
    status: 'completed',
    thumbnailUrl: undefined,
    photoCount: 45,
    duration: 180,
    style: 'cinematic',
    progress: 100,
    createdAt: new Date('2024-07-20'),
    updatedAt: new Date('2024-07-22')
  },
  {
    id: '2', 
    title: 'Birthday Party',
    description: 'Emma\'s 5th birthday celebration with friends and family',
    status: 'processing',
    thumbnailUrl: undefined,
    photoCount: 28,
    duration: 120,
    style: 'modern',
    progress: 65,
    eta: '2 hours',
    createdAt: new Date('2024-07-22'),
    updatedAt: new Date('2024-07-23')
  },
  {
    id: '3',
    title: 'Wedding Highlights',
    description: 'Beautiful ceremony moments from Sarah and John\'s wedding day',
    status: 'completed',
    thumbnailUrl: undefined,
    photoCount: 120,
    duration: 300,
    style: 'classic',
    progress: 100,
    createdAt: new Date('2024-07-18'),
    updatedAt: new Date('2024-07-19')
  },
  {
    id: '4',
    title: 'Nature Hike',
    description: 'Mountain trail adventure in the beautiful Rocky Mountains',
    status: 'draft',
    thumbnailUrl: undefined,
    photoCount: 32,
    duration: 90,
    style: 'vintage',
    createdAt: new Date('2024-07-23'),
    updatedAt: new Date('2024-07-23')
  },
  {
    id: '5',
    title: 'Corporate Event',
    description: 'Annual company meeting and team building activities',
    status: 'completed',
    thumbnailUrl: undefined,
    photoCount: 67,
    duration: 210,
    style: 'professional',
    progress: 100,
    createdAt: new Date('2024-07-15'),
    updatedAt: new Date('2024-07-16')
  },
  {
    id: '6',
    title: 'Christmas 2023',
    description: 'Holiday celebration with extended family',
    status: 'completed',
    thumbnailUrl: undefined,
    photoCount: 89,
    duration: 240,
    style: 'festive',
    progress: 100,
    createdAt: new Date('2023-12-25'),
    updatedAt: new Date('2023-12-26')
  },
  {
    id: '7',
    title: 'Travel Vlog',
    description: 'Cross-country road trip adventure',
    status: 'processing',
    thumbnailUrl: undefined,
    photoCount: 156,
    duration: 420,
    style: 'documentary',
    progress: 30,
    eta: '6 hours',
    createdAt: new Date('2024-07-21'),
    updatedAt: new Date('2024-07-23')
  },
  {
    id: '8',
    title: 'Pet Compilation',
    description: 'Funny moments with our furry friends',
    status: 'draft',
    thumbnailUrl: undefined,
    photoCount: 43,
    duration: 150,
    style: 'playful',
    createdAt: new Date('2024-07-20'),
    updatedAt: new Date('2024-07-20')
  }
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(mockProjects);
  const [currentFilter, setCurrentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
    applyFilters(filter, searchQuery);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    applyFilters(currentFilter, query);
  };

  const applyFilters = (filter: string, query: string) => {
    let filtered = projects;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(project => project.status === filter);
    }

    // Apply search filter
    if (query.trim()) {
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(query.toLowerCase()) ||
        project.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredProjects(filtered);
  };

  const handleProjectAction = (projectId: string, action: string) => {
    console.log(`Action ${action} on project ${projectId}`);
    // Handle project actions (edit, delete, duplicate, etc.)
  };

  return (
    <DashboardLayout currentPath="/projects">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Projects</h1>
            <p className="text-text-secondary mt-1">
              Manage your video generation projects and view their status
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary">
              {filteredProjects.length} of {projects.length} projects
            </span>
          </div>
        </div>

        {/* Filters and Search */}
        <ProjectFilters
          currentFilter={currentFilter}
          searchQuery={searchQuery}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
          projectCounts={{
            all: projects.length,
            completed: projects.filter(p => p.status === 'completed').length,
            processing: projects.filter(p => p.status === 'processing').length,
            draft: projects.filter(p => p.status === 'draft').length,
            failed: projects.filter(p => p.status === 'failed').length
          }}
        />

        {/* Projects Grid */}
        <ProjectsGrid 
          projects={filteredProjects}
          onProjectAction={handleProjectAction}
        />

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📹</div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              {searchQuery || currentFilter !== 'all' ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-text-secondary mb-6">
              {searchQuery || currentFilter !== 'all' 
                ? 'Try adjusting your filters or search terms'
                : 'Create your first video project to get started'
              }
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}