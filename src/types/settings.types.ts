export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  timezone: string;
  language: string;
}

export interface UserPreferences {
  defaultVideoStyle: string;
  defaultVideoQuality: 'low' | 'medium' | 'high' | 'ultra';
  autoProcessing: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  darkMode: boolean;
  autoSave: boolean;
}

export interface UserLimits {
  maxProjects: number;
  maxStorageGB: number;
  maxProcessingMinutes: number;
  usedStorageGB: number;
  usedProcessingMinutes: number;
  usedProjects: number;
}

export interface BillingInfo {
  plan: string;
  status: 'active' | 'canceled' | 'past_due';
  nextBillingDate: Date;
  amount: number;
  currency: string;
}

export interface UserSettings {
  profile: UserProfile;
  preferences: UserPreferences;
  limits: UserLimits;
  billing: BillingInfo;
}