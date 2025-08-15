export interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video';
  format: string; // JPEG, PNG, MP4, etc.
  size: number; // in MB
  dimensions: {
    width: number;
    height: number;
  };
  duration?: number; // in seconds, for videos
  uploadedAt: Date;
  thumbnailUrl?: string;
  tags: string[];
  projectIds: string[]; // Projects using this file
  isUsed: boolean;
}