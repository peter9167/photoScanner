'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SettingsForm from '@/components/settings/SettingsForm';
import { UserSettings } from '@/types/settings.types';
import { cn } from '@/lib/utils';

// Mock user settings
const mockSettings: UserSettings = {
  profile: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: '/images/img (4).jpg',
    timezone: 'America/New_York',
    language: 'en'
  },
  preferences: {
    defaultVideoStyle: 'cinematic',
    defaultVideoQuality: 'high',
    autoProcessing: true,
    emailNotifications: true,
    pushNotifications: false,
    darkMode: true,
    autoSave: true
  },
  limits: {
    maxProjects: 50,
    maxStorageGB: 100,
    maxProcessingMinutes: 1000,
    usedStorageGB: 8.5,
    usedProcessingMinutes: 450,
    usedProjects: 24
  },
  billing: {
    plan: 'Pro',
    status: 'active',
    nextBillingDate: new Date('2024-08-23'),
    amount: 29.99,
    currency: 'USD'
  }
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(mockSettings);
  const [activeSection, setActiveSection] = useState<string>('profile');

  const handleSettingsUpdate = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    console.log('Settings updated:', newSettings);
    // Handle settings update logic
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'storage', label: 'Storage', icon: '💾' },
    { id: 'billing', label: 'Billing', icon: '💳' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' }
  ];

  return (
    <DashboardLayout currentPath="/settings">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
            <p className="text-text-secondary mt-1">
              Manage your account and application preferences
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-card-bg border border-gray-700 rounded-xl p-4">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors text-left",
                      activeSection === section.id
                        ? "bg-primary text-white"
                        : "text-text-secondary hover:text-text-primary hover:bg-card-hover"
                    )}
                  >
                    <span className="text-base">{section.icon}</span>
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="bg-card-bg border border-gray-700 rounded-xl p-6">
              <SettingsForm
                settings={settings}
                activeSection={activeSection}
                onUpdate={handleSettingsUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}