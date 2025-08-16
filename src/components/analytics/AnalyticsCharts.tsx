'use client';

import React, { useState } from 'react';
import { AnalyticsData, StyleDistribution, ProjectsOverTime } from '@/types/analytics.types';
import { cn } from '@/lib/utils';

interface AnalyticsChartsProps {
  data: AnalyticsData;
}

interface BarChartProps {
  data: StyleDistribution[];
  title: string;
}

interface LineChartProps {
  data: ProjectsOverTime[];
  title: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, title }) => {
  const maxCount = Math.max(...data.map(item => item.count));

  return (
    <div className="bg-card-bg border border-gray-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-6">{title}</h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={item.style} className="flex items-center gap-4">
            <div className="w-20 text-sm text-text-secondary capitalize">
              {item.style}
            </div>
            <div className="flex-1 relative">
              <div className="h-8 bg-gray-700 rounded-lg overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-lg transition-all duration-1000 ease-out",
                    index % 6 === 0 ? "bg-gradient-to-r from-blue-500 to-blue-400" :
                    index % 6 === 1 ? "bg-gradient-to-r from-green-500 to-green-400" :
                    index % 6 === 2 ? "bg-gradient-to-r from-purple-500 to-purple-400" :
                    index % 6 === 3 ? "bg-gradient-to-r from-orange-500 to-orange-400" :
                    index % 6 === 4 ? "bg-gradient-to-r from-red-500 to-red-400" :
                    "bg-gradient-to-r from-pink-500 to-pink-400"
                  )}
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium text-white mix-blend-difference">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LineChart: React.FC<LineChartProps> = ({ data, title }) => {
  const [activeMetric, setActiveMetric] = useState<'projects' | 'videos'>('projects');
  
  const maxProjects = Math.max(...data.map(item => item.projects));
  const maxVideos = Math.max(...data.map(item => item.videos));
  const maxValue = activeMetric === 'projects' ? maxProjects : maxVideos;

  return (
    <div className="bg-card-bg border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <div className="flex bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveMetric('projects')}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              activeMetric === 'projects'
                ? "bg-primary text-white"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveMetric('videos')}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              activeMetric === 'videos'
                ? "bg-primary text-white"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            Videos
          </button>
        </div>
      </div>
      
      <div className="relative h-64">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-text-secondary">
          <span>{maxValue}</span>
          <span>{Math.round(maxValue * 0.75)}</span>
          <span>{Math.round(maxValue * 0.5)}</span>
          <span>{Math.round(maxValue * 0.25)}</span>
          <span>0</span>
        </div>
        
        {/* Chart area */}
        <div className="ml-12 h-full relative bg-gray-800/30 rounded-lg p-4">
          {/* Grid lines */}
          <div className="absolute inset-4 grid grid-rows-4 gap-0 opacity-20">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border-t border-gray-600"></div>
            ))}
          </div>
          
          {/* Data visualization */}
          <div className="relative h-full flex items-end justify-between gap-2">
            {data.map((item, index) => {
              const value = activeMetric === 'projects' ? item.projects : item.videos;
              const height = (value / maxValue) * 100;
              
              return (
                <div key={item.date} className="flex flex-col items-center group cursor-pointer">
                  <div className="relative flex-1 flex items-end">
                    <div
                      className={cn(
                        "w-8 rounded-t-md transition-all duration-500 ease-out hover:opacity-80",
                        activeMetric === 'projects'
                          ? "bg-gradient-to-t from-blue-600 to-blue-400"
                          : "bg-gradient-to-t from-green-600 to-green-400"
                      )}
                      style={{ height: `${height}%` }}
                    />
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-dark-bg border border-gray-600 rounded-lg px-2 py-1 text-xs text-text-primary whitespace-nowrap">
                        {activeMetric === 'projects' ? `${value} projects` : `${value} videos`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-text-secondary rotate-45 origin-left">
                    {item.date}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProcessingTimeChart: React.FC<{ data: AnalyticsData }> = ({ data }) => {
  const { processingStats } = data;
  
  const timeData = [
    { label: 'Fastest', value: processingStats.fastestProject, color: 'bg-green-500' },
    { label: 'Average', value: processingStats.averageProcessingTime, color: 'bg-blue-500' },
    { label: 'Slowest', value: processingStats.slowestProject, color: 'bg-red-500' }
  ];
  
  const maxValue = Math.max(...timeData.map(item => item.value));

  return (
    <div className="bg-card-bg border border-gray-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-6">Processing Time Distribution</h3>
      
      <div className="space-y-6">
        {timeData.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-text-primary">{item.label}</span>
              <span className="text-sm text-text-secondary">
                {Math.floor(item.value / 60)}h {item.value % 60}m
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className={cn("h-3 rounded-full transition-all duration-1000 ease-out", item.color)}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
        
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Queue Efficiency</span>
            <span className="font-medium text-green-400">{processingStats.queueEfficiency}%</span>
          </div>
          <div className="mt-2 text-xs text-text-secondary">
            Peak hours: {processingStats.peakProcessingHours.join(', ')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">Detailed Analytics</h2>
        <div className="text-sm text-text-secondary">
          Interactive charts and insights
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects and Videos Over Time */}
        <LineChart
          data={data.projectsOverTime}
          title="Projects & Videos Over Time"
        />
        
        {/* Style Distribution */}
        <BarChart
          data={data.styleDistribution}
          title="Video Style Distribution"
        />
      </div>
      
      {/* Processing Time Chart - Full Width */}
      <ProcessingTimeChart data={data} />
    </div>
  );
}