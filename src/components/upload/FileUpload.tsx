import React, { useRef, useState, useCallback } from 'react';
import { cn, formatBytes, generateId } from '@/lib/utils';
import { Upload, X, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';
import Button from '@/components/ui/Button';
import { UploadProgress } from '@/types/dashboard.types';

export interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  onPromptChange?: (prompt: string) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  disabled?: boolean;
  preview?: boolean;
  showPromptInput?: boolean;
  className?: string;
}

interface UploadedFile {
  file: File;
  id: string;
  preview?: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesChange,
  onPromptChange,
  accept = 'image/*',
  multiple = true,
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 20,
  disabled = false,
  preview = true,
  showPromptInput = true,
  className
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [prompt, setPrompt] = useState('');

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > maxSize) {
      return `File size must be less than ${formatBytes(maxSize)}`;
    }
    
    if (accept && !file.type.match(accept.replace('*', '.*'))) {
      return 'Invalid file type';
    }
    
    return null;
  }, [maxSize, accept]);

  const handleFiles = useCallback((newFiles: File[]) => {
    const validFiles: UploadedFile[] = [];
    
    for (const file of newFiles) {
      if (files.length + validFiles.length >= maxFiles) {
        break;
      }
      
      const error = validateFile(file);
      const uploadedFile: UploadedFile = {
        file,
        id: generateId(),
        status: error ? 'error' : 'success',
        progress: error ? 0 : 100,
        error: error || undefined
      };
      
      // Create preview for images
      if (preview && file.type.startsWith('image/') && !error) {
        uploadedFile.preview = URL.createObjectURL(file);
      }
      
      validFiles.push(uploadedFile);
    }
    
    const updatedFiles = [...files, ...validFiles];
    setFiles(updatedFiles);
    
    // Return only valid files to parent
    const validFileObjects = updatedFiles
      .filter(f => f.status === 'success')
      .map(f => f.file);
    
    onFilesChange(validFileObjects);
  }, [files, maxFiles, validateFile, preview, onFilesChange]);

  const removeFile = useCallback((id: string) => {
    const fileToRemove = files.find(f => f.id === id);
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    
    const validFiles = updatedFiles
      .filter(f => f.status === 'success')
      .map(f => f.file);
    
    onFilesChange(validFiles);
  }, [files, onFilesChange]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, [disabled]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, [disabled, handleFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
    
    // Reset input
    e.target.value = '';
  }, [handleFiles]);

  const openFileDialog = useCallback(() => {
    if (disabled) return;
    fileInputRef.current?.click();
  }, [disabled]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openFileDialog();
    }
  }, [disabled, openFileDialog]);

  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value;
    setPrompt(newPrompt);
    onPromptChange?.(newPrompt);
  }, [onPromptChange]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label="Drag and drop files or press Enter to open file dialog"
        aria-describedby="upload-instructions upload-requirements"
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark-bg',
          'hover:border-primary hover:bg-primary/5',
          {
            'border-primary bg-primary/10': dragActive && !disabled,
            'border-gray-600': !dragActive && !disabled,
            'border-gray-700 bg-gray-800/50 cursor-not-allowed opacity-50': disabled
          }
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="sr-only"
          aria-describedby="upload-requirements"
        />
        
        <div id="upload-instructions" className="space-y-3">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary via-orange-400 to-pink-500 rounded-xl flex items-center justify-center">
            <Upload className="w-8 h-8 text-white" aria-hidden="true" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">
              Drop photos here or click to browse
            </h3>
            <p className="text-text-secondary text-sm">
              Upload your photos to create an amazing video
            </p>
          </div>
        </div>
        
        <div id="upload-requirements" className="mt-4 text-xs text-text-secondary space-y-1">
          <p>Supported formats: {accept.replace('image/', '').toUpperCase()}</p>
          <p>Maximum size: {formatBytes(maxSize)} per file</p>
          <p>Up to {maxFiles} files per project</p>
        </div>
      </div>
      
      {/* File Preview Grid */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-text-primary">
            Uploaded Files ({files.filter(f => f.status === 'success').length}/{maxFiles})
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((uploadedFile) => (
              <div
                key={uploadedFile.id}
                className="relative group bg-card-bg rounded-lg overflow-hidden border border-gray-700"
              >
                {/* Preview */}
                <div className="aspect-square bg-gray-800">
                  {uploadedFile.preview ? (
                    <img
                      src={uploadedFile.preview}
                      alt={uploadedFile.file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Status indicator */}
                <div className="absolute top-2 right-2">
                  {uploadedFile.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : uploadedFile.status === 'error' ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                
                {/* Remove button */}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => removeFile(uploadedFile.id)}
                  className="absolute top-2 left-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remove ${uploadedFile.file.name}`}
                >
                  <X className="w-3 h-3" />
                </Button>
                
                {/* File info */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-xs font-medium truncate" title={uploadedFile.file.name}>
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-white/80 text-xs">
                    {formatBytes(uploadedFile.file.size)}
                  </p>
                  {uploadedFile.error && (
                    <p className="text-red-300 text-xs mt-1" role="alert">
                      {uploadedFile.error}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Video Description Input */}
      {showPromptInput && files.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-text-primary">Video Description</h4>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={handlePromptChange}
              placeholder="Describe your video... 
              
🎂 Example for birthday party:
&quot;This is Emma's 5th birthday celebration with family and friends. We want a joyful, bright video that captures the excitement and happiness of this special day. Please include smooth transitions between photos showing the cake, decorations, and all the smiling faces.&quot;

✈️ Example for vacation:
&quot;Our family trip to Hawaii - 7 days of beautiful beaches, amazing sunsets, and quality time together. Create a relaxing, cinematic video that tells the story of our adventure with peaceful music and scenic transitions.&quot;

🎓 Example for graduation:
&quot;Sarah's college graduation day - 4 years of hard work paying off. We want an inspiring, uplifting video that shows her journey and this proud moment. Please emphasize the achievement and celebration with elegant transitions.&quot;"
              className="w-full h-32 p-4 bg-card-bg border border-gray-600 rounded-lg text-text-primary placeholder-text-secondary resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              maxLength={500}
            />
            <div className="absolute bottom-2 right-2 text-xs text-text-secondary">
              {prompt.length}/500
            </div>
          </div>
          <div className="flex items-center text-sm text-text-secondary">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>Adding a description helps AI create a better video that matches your vision</span>
          </div>
        </div>
      )}
      
      {/* Upload Summary */}
      {files.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-card-bg rounded-lg border border-gray-700">
          <div className="text-sm text-text-secondary">
            {files.filter(f => f.status === 'success').length} of {files.length} files ready
            {prompt && <span className="ml-2">• Description added</span>}
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFiles([])}
              disabled={files.length === 0}
            >
              Clear All
            </Button>
            
            <Button
              variant="primary"
              size="sm"
              disabled={files.filter(f => f.status === 'success').length === 0}
              onClick={() => {
                const validFiles = files.filter(f => f.status === 'success');
                const projectData = {
                  files: validFiles.map(f => f.file),
                  prompt: prompt.trim(),
                  fileCount: validFiles.length
                };
                
                console.log('Starting video generation with:', projectData);
                alert(`🎬 Starting video generation!\n\nFiles: ${projectData.fileCount}\nDescription: ${projectData.prompt ? 'Added' : 'None'}\n\nThis will redirect to the generation queue.`);
                
                // In a real app, this would create a new project and redirect
                window.location.href = '/queue';
              }}
            >
              Continue to Generation
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;