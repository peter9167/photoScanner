import React from 'react';

interface SettingsFormProps {
  settings: any;
  activeSection: string;
  onUpdate: (newSettings: any) => void;
}

export default function SettingsForm({ settings, activeSection, onUpdate }: SettingsFormProps) {
  return (
    <div className="bg-card p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Settings</h3>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">API Key</label>
          <input
            type="password"
            className="w-full p-2 border border-gray-300 rounded-lg"
            placeholder="Enter your API key"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Quality</label>
          <select className="w-full p-2 border border-gray-300 rounded-lg">
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
}