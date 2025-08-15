import React from 'react';

export default function QueueStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-card p-4 rounded-lg border">
        <h3 className="text-sm font-medium text-gray-600">Total Jobs</h3>
        <p className="text-2xl font-bold">0</p>
      </div>
      <div className="bg-card p-4 rounded-lg border">
        <h3 className="text-sm font-medium text-gray-600">Processing</h3>
        <p className="text-2xl font-bold">0</p>
      </div>
      <div className="bg-card p-4 rounded-lg border">
        <h3 className="text-sm font-medium text-gray-600">Completed</h3>
        <p className="text-2xl font-bold">0</p>
      </div>
    </div>
  );
}