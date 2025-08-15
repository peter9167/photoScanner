import React from 'react';

interface QueueControlsProps {
  filter: string;
  onFilterChange: (filter: string) => void;
  onQueueAction: (action: string) => void;
  isPaused: boolean;
  itemCounts: any;
}

export default function QueueControls({ 
  filter, 
  onFilterChange, 
  onQueueAction, 
  isPaused, 
  itemCounts 
}: QueueControlsProps) {
  return (
    <div className="flex gap-2 mb-6">
      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Start Processing
      </button>
      <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
        Pause Queue
      </button>
      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
        Clear Queue
      </button>
    </div>
  );
}