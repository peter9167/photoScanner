import React from 'react';

interface QueueListProps {
  items: any[];
  onItemAction: (itemId: string, action: string) => void;
  isPaused: boolean;
}

export default function QueueList({ items, onItemAction, isPaused }: QueueListProps) {
  return (
    <div className="bg-card p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Queue List</h3>
      <div className="space-y-3">
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">No items in queue</p>
        </div>
      </div>
    </div>
  );
}