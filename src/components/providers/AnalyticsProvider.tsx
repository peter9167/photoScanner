'use client';

import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  return (
    <>
      {children}
      {(process.env.NODE_ENV || 'production') === 'production' && (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      )}
    </>
  );
}