import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Video, 
  Image as ImageIcon, 
  HardDrive, 
  Zap,
  TrendingUp
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from './StatsCard';
import ProjectCard from './ProjectCard';
import { QueueOverview } from '@/components/queue';
import FileUpload from '@/components/upload/FileUpload';
import { DashboardStats, Project, GenerationItem } from '@/types/dashboard.types';

interface DashboardSummaryProps {
  stats: DashboardStats;
  recentProjects: Project[];
  queueItems: GenerationItem[];
  className?: string;
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  stats,
  recentProjects,
  queueItems,
  className
}) => {
  // Mock handlers for demo purposes
  const handleFilesChange = (files: File[]) => {
    console.log('Files selected:', files);
  };

  const handleProjectPlay = (projectId: string) => {
    console.log('Play project:', projectId);
  };

  const handleProjectEdit = (projectId: string) => {
    console.log('Edit project:', projectId);
  };

  const handleQueuePause = () => {
    console.log('Pause queue');
  };

  const handleQueueResume = () => {
    console.log('Resume queue');
  };

  const handleViewAllQueue = () => {
    console.log('View all queue items');
  };

  return (
    <DashboardLayout currentPath="/dashboard">
      <div className={cn('space-y-8', className)}>
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-text-secondary">
            Here's what's happening with your photo memories today.
          </p>
        </div>

        {/* Stats Overview */}
        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">
            Dashboard Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Projects"
              value={stats.totalProjects}
              change={`+${stats.projectsChange}%`}
              trend="up"
              icon={<Video className="h-6 w-6" />}
            />
            
            <StatsCard
              title="Videos Generated"
              value={stats.videosGenerated}
              change={`+${stats.videosChange}%`}
              trend="up"
              icon={<ImageIcon className="h-6 w-6" />}
            />
            
            <StatsCard
              title="Storage Used"
              value={`${Math.round((stats.storageUsed / stats.storageLimit) * 100)}%`}
              progress={(stats.storageUsed / stats.storageLimit) * 100}
              icon={<HardDrive className="h-6 w-6" />}
            />
            
            <StatsCard
              title="AI Minutes"
              value={`${stats.aiMinutes}/${stats.aiLimit}`}
              progress={(stats.aiMinutes / stats.aiLimit) * 100}
              icon={<Zap className="h-6 w-6" />}
            />
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Projects and Upload */}
          <div className="lg:col-span-2 space-y-8">
            {/* File Upload */}
            <section aria-labelledby="upload-heading">
              <h2 id="upload-heading" className="text-xl font-semibold text-text-primary mb-4">
                Create New Project
              </h2>
              <FileUpload
                onFilesChange={handleFilesChange}
                accept="image/*"
                multiple={true}
                maxFiles={20}
                maxSize={10 * 1024 * 1024} // 10MB
              />
            </section>

            {/* Recent Projects */}
            <section aria-labelledby="projects-heading">
              <div className="flex items-center justify-between mb-4">
                <h2 id="projects-heading" className="text-xl font-semibold text-text-primary">
                  Recent Projects
                </h2>
                <a 
                  href="/projects" 
                  className="text-primary hover:text-primary-hover text-sm font-medium transition-colors"
                >
                  View all projects →
                </a>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentProjects.slice(0, 4).map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onPlay={() => handleProjectPlay(project.id)}
                    onEdit={() => handleProjectEdit(project.id)}
                  />
                ))}
              </div>
              
              {recentProjects.length === 0 && (
                <div className="text-center py-12 text-text-secondary">
                  <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                  <p className="mb-4">Upload some photos to create your first video memory!</p>
                </div>
              )}
            </section>
          </div>

          {/* Right Column - Queue and Quick Actions */}
          <div className="space-y-8">
            {/* Generation Queue */}
            <section aria-labelledby="queue-heading">
              <h2 id="queue-heading" className="sr-only">
                Generation Queue
              </h2>
              <QueueOverview
                items={queueItems}
                onPause={handleQueuePause}
                onResume={handleQueueResume}
                onViewAll={handleViewAllQueue}
              />
            </section>

            {/* Quick Stats */}
            <section aria-labelledby="quick-stats-heading">
              <h2 id="quick-stats-heading" className="text-lg font-semibold text-text-primary mb-4">
                Quick Stats
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-card-bg rounded-lg border border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        Active Projects
                      </p>
                      <p className="text-xs text-text-secondary">
                        Currently processing
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-text-primary">
                    {stats.activeProjects}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-card-bg rounded-lg border border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Video className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        Queued Generations
                      </p>
                      <p className="text-xs text-text-secondary">
                        Waiting to process
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-text-primary">
                    {stats.queuedGenerations}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardSummary;