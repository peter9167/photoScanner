import React from 'react';

interface AnalyticsChartsProps {
  data: any;
}

export default function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  return (
    <div className="bg-card p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Analytics Charts</h3>
      <div className="space-y-4">
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Charts will be implemented here</p>
        </div>
      </div>
    </div>
  );
}