'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Video, File, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface MediaUploadProps {
  onUpload: (files: File[]) => void;
}

const MediaUpload: React.FC<MediaUploadProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = {
    images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'],
    videos: ['.mp4', '.mov', '.avi', '.mkv', '.wmv', '.flv', '.webm']
  };

  const allAcceptedTypes = [...acceptedTypes.images, ...acceptedTypes.videos].join(',');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      return [...acceptedTypes.images, ...acceptedTypes.videos].includes(extension);
    });
    
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
      setSelectedFiles([]);
    }
  };

  const getFileIcon = (file: File) => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (acceptedTypes.images.includes(extension)) {
      return <ImageIcon className="h-6 w-6 text-green-400" />;
    } else if (acceptedTypes.videos.includes(extension)) {
      return <Video className="h-6 w-6 text-blue-400" />;
    }
    return <File className="h-6 w-6 text-gray-400" />;
  };

  const formatFileSize = (bytes: number) => {
    const MB = bytes / (1024 * 1024);
    if (MB > 1) {
      return `${MB.toFixed(1)} MB`;
    }
    const KB = bytes / 1024;
    return `${KB.toFixed(0)} KB`;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-gray-600 hover:border-gray-500 hover:bg-card-bg/50"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allAcceptedTypes}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className={cn(
            "p-4 rounded-full transition-colors",
            isDragging ? "bg-primary/20" : "bg-gray-700/50"
          )}>
            <Upload className={cn(
              "h-8 w-8",
              isDragging ? "text-primary" : "text-gray-400"
            )} />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {isDragging ? "Drop files here" : "Upload Media Files"}
            </h3>
            <p className="text-text-secondary mb-4">
              Drag and drop your photos and videos, or{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-primary hover:text-primary/80 underline"
              >
                browse files
              </button>
            </p>
            
            <div className="text-xs text-text-secondary space-y-1">
              <p>
                <strong>Supported formats:</strong>{' '}
                {[...acceptedTypes.images, ...acceptedTypes.videos].join(', ')}
              </p>
              <p><strong>Maximum size:</strong> 100 MB per file</p>
              <p><strong>Maximum files:</strong> 50 files at once</p>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="bg-card-bg border border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-text-primary">
              Selected Files ({selectedFiles.length})
            </h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedFiles([])}
              >
                Clear All
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleUpload}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}
              </Button>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 bg-card-hover rounded-lg"
              >
                <div className="flex-shrink-0">
                  {getFileIcon(file)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                <button
                  onClick={() => removeFile(index)}
                  className="flex-shrink-0 p-1 text-text-secondary hover:text-red-400 transition-colors"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Upload Progress Placeholder */}
          <div className="mt-4 text-xs text-text-secondary">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Ready to upload</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Upload Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Files
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Create a new input for folder selection
            const input = document.createElement('input');
            input.type = 'file';
            input.webkitdirectory = true;
            input.multiple = true;
            input.accept = allAcceptedTypes;
            input.onchange = (e) => {
              const files = Array.from((e.target as HTMLInputElement).files || []);
              const validFiles = files.filter(file => {
                const extension = '.' + file.name.split('.').pop()?.toLowerCase();
                return [...acceptedTypes.images, ...acceptedTypes.videos].includes(extension);
              });
              if (validFiles.length > 0) {
                setSelectedFiles(prev => [...prev, ...validFiles]);
              }
            };
            input.click();
          }}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload Folder
        </Button>
      </div>
    </div>
  );
};

export default MediaUpload;