'use client';

import React, { useState } from 'react';
import { UserSettings } from '@/types/settings.types';
import { 
  Save, 
  Upload, 
  Download, 
  Bell, 
  Globe, 
  Shield, 
  CreditCard,
  User,
  Eye,
  EyeOff,
  Camera,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface SettingsFormProps {
  settings: UserSettings;
  activeSection: string;
  onUpdate: (newSettings: Partial<UserSettings>) => void;
}

const SettingsForm: React.FC<SettingsFormProps> = ({ settings, activeSection, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('sk-...abcd1234');

  const handleSave = async (sectionData: any) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onUpdate(sectionData);
    } finally {
      setIsLoading(false);
    }
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">Profile Settings</h2>
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleSave({ profile: settings.profile })}
          loading={isLoading}
          leftIcon={<Save className="h-4 w-4" />}
        >
          Save Profile
        </Button>
      </div>

      {/* Profile Picture */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
            {settings.profile.avatar ? (
              <img 
                src={settings.profile.avatar} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-white" />
            )}
          </div>
          <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors">
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <div>
          <h3 className="font-medium text-text-primary">Profile Picture</h3>
          <p className="text-sm text-text-secondary mt-1">
            Upload a new profile picture. Recommended size: 400x400px
          </p>
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" leftIcon={<Upload className="h-4 w-4" />}>
              Upload New
            </Button>
            <Button variant="ghost" size="sm">Remove</Button>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Full Name</label>
          <Input
            value={settings.profile.name}
            onChange={(e) => onUpdate({
              profile: { ...settings.profile, name: e.target.value }
            })}
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Email Address</label>
          <Input
            type="email"
            value={settings.profile.email}
            onChange={(e) => onUpdate({
              profile: { ...settings.profile, email: e.target.value }
            })}
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Timezone</label>
          <select 
            value={settings.profile.timezone}
            onChange={(e) => onUpdate({
              profile: { ...settings.profile, timezone: e.target.value }
            })}
            className="w-full px-3 py-2 bg-card-bg border border-gray-600 rounded-lg text-text-primary focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="America/New_York">Eastern Time (UTC-5)</option>
            <option value="America/Chicago">Central Time (UTC-6)</option>
            <option value="America/Denver">Mountain Time (UTC-7)</option>
            <option value="America/Los_Angeles">Pacific Time (UTC-8)</option>
            <option value="Europe/London">London (UTC+0)</option>
            <option value="Europe/Paris">Paris (UTC+1)</option>
            <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Language</label>
          <select 
            value={settings.profile.language}
            onChange={(e) => onUpdate({
              profile: { ...settings.profile, language: e.target.value }
            })}
            className="w-full px-3 py-2 bg-card-bg border border-gray-600 rounded-lg text-text-primary focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="ja">日本語</option>
            <option value="ko">한국어</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderPreferencesSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">Preferences</h2>
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleSave({ preferences: settings.preferences })}
          loading={isLoading}
          leftIcon={<Save className="h-4 w-4" />}
        >
          Save Preferences
        </Button>
      </div>

      <div className="space-y-6">
        {/* Video Settings */}
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-4">Default Video Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Default Style</label>
              <select 
                value={settings.preferences.defaultVideoStyle}
                onChange={(e) => onUpdate({
                  preferences: { ...settings.preferences, defaultVideoStyle: e.target.value }
                })}
                className="w-full px-3 py-2 bg-card-bg border border-gray-600 rounded-lg text-text-primary focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="cinematic">Cinematic</option>
                <option value="modern">Modern</option>
                <option value="classic">Classic</option>
                <option value="vintage">Vintage</option>
                <option value="professional">Professional</option>
                <option value="festive">Festive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Default Quality</label>
              <select 
                value={settings.preferences.defaultVideoQuality}
                onChange={(e) => onUpdate({
                  preferences: { ...settings.preferences, defaultVideoQuality: e.target.value as 'low' | 'medium' | 'high' | 'ultra' }
                })}
                className="w-full px-3 py-2 bg-card-bg border border-gray-600 rounded-lg text-text-primary focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="ultra">Ultra (4K)</option>
                <option value="high">High (1080p)</option>
                <option value="medium">Medium (720p)</option>
                <option value="low">Low (480p)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Automation Settings */}
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-4">Automation</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-card-hover rounded-lg">
              <div>
                <h4 className="font-medium text-text-primary">Auto Processing</h4>
                <p className="text-sm text-text-secondary">Automatically start video generation when uploads complete</p>
              </div>
              <input
                type="checkbox"
                checked={settings.preferences.autoProcessing}
                onChange={(e) => onUpdate({
                  preferences: { ...settings.preferences, autoProcessing: e.target.checked }
                })}
                className="w-5 h-5 text-primary bg-card-bg border-gray-600 rounded focus:ring-primary focus:ring-2"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-card-hover rounded-lg">
              <div>
                <h4 className="font-medium text-text-primary">Auto Save</h4>
                <p className="text-sm text-text-secondary">Automatically save project changes</p>
              </div>
              <input
                type="checkbox"
                checked={settings.preferences.autoSave}
                onChange={(e) => onUpdate({
                  preferences: { ...settings.preferences, autoSave: e.target.checked }
                })}
                className="w-5 h-5 text-primary bg-card-bg border-gray-600 rounded focus:ring-primary focus:ring-2"
              />
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-4">Appearance</h3>
          <div className="flex items-center justify-between p-4 bg-card-hover rounded-lg">
            <div>
              <h4 className="font-medium text-text-primary">Dark Mode</h4>
              <p className="text-sm text-text-secondary">Use dark theme for the interface</p>
            </div>
            <input
              type="checkbox"
              checked={settings.preferences.darkMode}
              onChange={(e) => onUpdate({
                preferences: { ...settings.preferences, darkMode: e.target.checked }
              })}
              className="w-5 h-5 text-primary bg-card-bg border-gray-600 rounded focus:ring-primary focus:ring-2"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStorageSection = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-text-primary">Storage & Usage</h2>

      {/* Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card-hover rounded-xl p-6">
          <h3 className="font-medium text-text-primary mb-4">Storage Usage</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Used</span>
              <span className="text-text-primary">{settings.limits.usedStorageGB} GB</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full"
                style={{ width: `${(settings.limits.usedStorageGB / settings.limits.maxStorageGB) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Limit</span>
              <span className="text-text-primary">{settings.limits.maxStorageGB} GB</span>
            </div>
          </div>
        </div>

        <div className="bg-card-hover rounded-xl p-6">
          <h3 className="font-medium text-text-primary mb-4">Processing Minutes</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Used</span>
              <span className="text-text-primary">{settings.limits.usedProcessingMinutes} min</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${(settings.limits.usedProcessingMinutes / settings.limits.maxProcessingMinutes) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Limit</span>
              <span className="text-text-primary">{settings.limits.maxProcessingMinutes} min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Storage Actions */}
      <div className="bg-card-hover rounded-xl p-6">
        <h3 className="font-medium text-text-primary mb-4">Storage Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
            Export Data
          </Button>
          <Button variant="outline" leftIcon={<Upload className="h-4 w-4" />}>
            Import Data
          </Button>
          <Button variant="outline" className="text-red-400 border-red-500 hover:bg-red-500/10">
            Clear Cache
          </Button>
        </div>
      </div>
    </div>
  );

  const renderBillingSection = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-text-primary">Billing & Subscription</h2>

      {/* Current Plan */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-text-primary">{settings.billing.plan} Plan</h3>
            <p className="text-text-secondary">Status: <span className="text-green-400 capitalize">{settings.billing.status}</span></p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-text-primary">${settings.billing.amount}</div>
            <div className="text-sm text-text-secondary">per month</div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">
            Next billing: {settings.billing.nextBillingDate.toLocaleDateString()}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Change Plan</Button>
            <Button variant="outline" size="sm">Cancel</Button>
          </div>
        </div>
      </div>

      {/* Usage Limits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card-hover rounded-xl p-4">
          <h4 className="font-medium text-text-primary mb-2">Projects</h4>
          <div className="text-2xl font-bold text-text-primary">
            {settings.limits.usedProjects}/{settings.limits.maxProjects}
          </div>
          <div className="text-sm text-text-secondary">Used/Limit</div>
        </div>
        <div className="bg-card-hover rounded-xl p-4">
          <h4 className="font-medium text-text-primary mb-2">Storage</h4>
          <div className="text-2xl font-bold text-text-primary">
            {settings.limits.usedStorageGB}/{settings.limits.maxStorageGB} GB
          </div>
          <div className="text-sm text-text-secondary">Used/Limit</div>
        </div>
        <div className="bg-card-hover rounded-xl p-4">
          <h4 className="font-medium text-text-primary mb-2">AI Minutes</h4>
          <div className="text-2xl font-bold text-text-primary">
            {settings.limits.usedProcessingMinutes}/{settings.limits.maxProcessingMinutes}
          </div>
          <div className="text-sm text-text-secondary">Used/Limit</div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-text-primary">Security & API</h2>

      {/* API Configuration */}
      <div className="bg-card-hover rounded-xl p-6">
        <h3 className="font-medium text-text-primary mb-4">API Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              OpenAI API Key
            </label>
            <div className="relative">
              <Input
                type={showApiKey ? "text" : "password"}
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="sk-..."
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Your API key is encrypted and stored securely
            </p>
          </div>
          
          <Button variant="primary" size="sm">
            Update API Key
          </Button>
        </div>
      </div>

      {/* Security Options */}
      <div className="bg-card-hover rounded-xl p-6">
        <h3 className="font-medium text-text-primary mb-4">Security Options</h3>
        <div className="space-y-4">
          <Button variant="outline" leftIcon={<Shield className="h-4 w-4" />}>
            Change Password
          </Button>
          <Button variant="outline" leftIcon={<Shield className="h-4 w-4" />}>
            Enable Two-Factor Authentication
          </Button>
          <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
            Download Account Data
          </Button>
        </div>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">Notifications</h2>
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleSave({ preferences: settings.preferences })}
          loading={isLoading}
          leftIcon={<Save className="h-4 w-4" />}
        >
          Save Notifications
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-card-hover rounded-lg">
          <div>
            <h4 className="font-medium text-text-primary">Email Notifications</h4>
            <p className="text-sm text-text-secondary">Receive notifications via email</p>
          </div>
          <input
            type="checkbox"
            checked={settings.preferences.emailNotifications}
            onChange={(e) => onUpdate({
              preferences: { ...settings.preferences, emailNotifications: e.target.checked }
            })}
            className="w-5 h-5 text-primary bg-card-bg border-gray-600 rounded focus:ring-primary focus:ring-2"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-card-hover rounded-lg">
          <div>
            <h4 className="font-medium text-text-primary">Push Notifications</h4>
            <p className="text-sm text-text-secondary">Receive browser push notifications</p>
          </div>
          <input
            type="checkbox"
            checked={settings.preferences.pushNotifications}
            onChange={(e) => onUpdate({
              preferences: { ...settings.preferences, pushNotifications: e.target.checked }
            })}
            className="w-5 h-5 text-primary bg-card-bg border-gray-600 rounded focus:ring-primary focus:ring-2"
          />
        </div>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection();
      case 'preferences':
        return renderPreferencesSection();
      case 'storage':
        return renderStorageSection();
      case 'billing':
        return renderBillingSection();
      case 'security':
        return renderSecuritySection();
      case 'notifications':
        return renderNotificationsSection();
      default:
        return renderProfileSection();
    }
  };

  return (
    <div className="min-h-96">
      {renderSection()}
    </div>
  );
};

export default SettingsForm;