# Component Architecture & Design System

## 🎨 Design System Overview

PhotoMemory AI follows an atomic design methodology with a comprehensive design system that ensures consistency, accessibility, and maintainability.

### 🏗️ Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│                            PAGES                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │  Dashboard  │  │ VideoEditor │  │   Profile   │                │
│  │    Page     │  │    Page     │  │    Page     │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
                              ↓ (composed of)
┌─────────────────────────────────────────────────────────────────────┐
│                         TEMPLATES                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │   Layout    │  │   Form      │  │   Grid      │                │
│  │  Templates  │  │ Templates   │  │ Templates   │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
                              ↓ (composed of)
┌─────────────────────────────────────────────────────────────────────┐
│                        ORGANISMS                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │   Header    │  │  VideoForm  │  │   Gallery   │                │
│  │  Navbar     │  │  PhotoGrid  │  │  Sidebar    │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
                              ↓ (composed of)
┌─────────────────────────────────────────────────────────────────────┐
│                        MOLECULES                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │   Card      │  │  FileUpload │  │   Modal     │                │
│  │ SearchBox   │  │  Dropdown   │  │ Breadcrumb  │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
                              ↓ (composed of)
┌─────────────────────────────────────────────────────────────────────┐
│                          ATOMS                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │   Button    │  │    Input    │  │    Text     │                │
│  │    Icon     │  │   Image     │  │   Badge     │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
```

## 🎯 Design Tokens

### Color System
```typescript
// src/design-system/tokens/colors.ts
export const colors = {
  // Primary brand colors
  primary: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74', 
    400: '#fb923c',
    500: '#f7931e', // Main brand color
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12'
  },
  
  // Neutral colors (dark theme optimized)
  neutral: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b'
  },
  
  // Semantic colors
  semantic: {
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a',
      900: '#14532d'
    },
    warning: {
      50: '#fefce8',
      500: '#eab308',
      600: '#ca8a04',
      900: '#713f12'
    },
    danger: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
      900: '#7f1d1d'
    },
    info: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb',
      900: '#1e3a8a'
    }
  },
  
  // Dark theme specific
  dark: {
    bg: '#0d1117',
    cardBg: '#161b22',
    cardHover: '#21262d',
    border: '#30363d',
    text: {
      primary: '#ffffff',
      secondary: '#8b949e',
      muted: '#656d76'
    }
  }
} as const;
```

### Typography Scale
```typescript
// src/design-system/tokens/typography.ts
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
    mono: ['JetBrains Mono', 'Monaco', 'Cascadia Code', 'monospace'],
    korean: ['Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', 'sans-serif'],
    japanese: ['Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', 'sans-serif']
  },
  
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
    '5xl': ['3rem', { lineHeight: '1' }],           // 48px
    '6xl': ['3.75rem', { lineHeight: '1' }]         // 60px
  },
  
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900'
  }
} as const;
```

### Spacing System
```typescript
// src/design-system/tokens/spacing.ts
export const spacing = {
  // Base 4px scale
  px: '1px',
  0: '0px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem'       // 384px
} as const;
```

## ⚛️ Atomic Components

### Button Component
```typescript
// src/components/ui/Button/Button.tsx
import React from 'react';
import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  children,
  className,
  ...props
}) => {
  const baseClasses = cn(
    // Base styles
    'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    
    // Size variants
    {
      'px-3 py-1.5 text-sm': size === 'sm',
      'px-4 py-2 text-sm': size === 'md',
      'px-6 py-3 text-base': size === 'lg',
      'px-8 py-4 text-lg': size === 'xl'
    },
    
    // Color variants
    {
      // Primary
      'bg-primary hover:bg-primary-hover text-white shadow-lg hover:shadow-xl focus:ring-primary': 
        variant === 'primary',
      // Secondary  
      'bg-card-bg hover:bg-card-hover text-text-primary border border-gray-600 hover:border-gray-500': 
        variant === 'secondary',
      // Outline
      'border-2 border-primary text-primary hover:bg-primary hover:text-white': 
        variant === 'outline',
      // Ghost
      'text-text-primary hover:bg-card-hover': 
        variant === 'ghost',
      // Danger
      'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500': 
        variant === 'danger'
    },
    
    // Full width
    { 'w-full': fullWidth },
    
    className
  );

  return (
    <button
      className={baseClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : leftIcon ? (
        <span className="mr-2">{leftIcon}</span>
      ) : null}
      
      {children}
      
      {rightIcon && !loading && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </button>
  );
};

export default Button;
```

### Input Component
```typescript
// src/components/ui/Input/Input.tsx
import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helper?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    helper,
    error,
    leftIcon,
    rightIcon,
    showPasswordToggle,
    fullWidth = true,
    type = 'text',
    className,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [inputType, setInputType] = React.useState(type);

    React.useEffect(() => {
      if (type === 'password') {
        setInputType(showPassword ? 'text' : 'password');
      }
    }, [type, showPassword]);

    const inputClasses = cn(
      // Base styles
      'block rounded-lg border transition-colors duration-200',
      'placeholder:text-text-secondary',
      'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
      
      // Sizes
      'px-4 py-3 text-sm',
      
      // State styles
      {
        // Default
        'bg-card-hover border-gray-600 text-text-primary hover:border-gray-500': 
          !error,
        // Error state
        'bg-red-50 border-red-300 text-red-900 focus:ring-red-500': 
          error,
        // With icons
        'pl-12': leftIcon,
        'pr-12': rightIcon || (showPasswordToggle && type === 'password')
      },
      
      // Full width
      { 'w-full': fullWidth },
      
      className
    );

    return (
      <div className={cn('relative', { 'w-full': fullWidth })}>
        {label && (
          <label className="block text-sm font-medium text-text-primary mb-2">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={inputType}
            className={inputClasses}
            {...props}
          />
          
          {(rightIcon || (showPasswordToggle && type === 'password') || error) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {error ? (
                <AlertCircle className="w-5 h-5 text-red-500" />
              ) : showPasswordToggle && type === 'password' ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              ) : rightIcon ? (
                rightIcon
              ) : null}
            </div>
          )}
        </div>
        
        {(helper || error) && (
          <p className={cn(
            'mt-2 text-sm',
            error ? 'text-red-600' : 'text-text-secondary'
          )}>
            {error || helper}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
```

## 🧩 Molecular Components

### File Upload Component
```typescript
// src/components/ui/FileUpload/FileUpload.tsx
import React, { useRef, useState } from 'react';
import { cn } from '@/utils/cn';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLocalization } from '@/hooks/useLocalization';

export interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  disabled?: boolean;
  preview?: boolean;
  className?: string;
}

interface UploadedFile {
  file: File;
  id: string;
  preview?: string;
  status: 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesChange,
  accept = 'image/*',
  multiple = true,
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 10,
  disabled = false,
  preview = true,
  className
}) => {
  const { t } = useTranslation();
  const { formatFileSize } = useLocalization();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return t('validation.fileSize', { size: formatFileSize(maxSize) });
    }
    
    if (accept && !file.type.match(accept.replace('*', '.*'))) {
      return t('validation.fileType');
    }
    
    return null;
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles: UploadedFile[] = [];
    
    for (const file of newFiles) {
      if (files.length + validFiles.length >= maxFiles) {
        break;
      }
      
      const error = validateFile(file);
      const uploadedFile: UploadedFile = {
        file,
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        status: error ? 'error' : 'success',
        error
      };
      
      if (preview && file.type.startsWith('image/')) {
        uploadedFile.preview = URL.createObjectURL(file);
      }
      
      validFiles.push(uploadedFile);
    }
    
    const updatedFiles = [...files, ...validFiles];
    setFiles(updatedFiles);
    
    const validFileObjects = updatedFiles
      .filter(f => f.status === 'success')
      .map(f => f.file);
    
    onFilesChange(validFileObjects);
  };

  const removeFile = (id: string) => {
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    
    const validFiles = updatedFiles
      .filter(f => f.status === 'success')
      .map(f => f.file);
    
    onFilesChange(validFiles);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
    
    // Reset input
    e.target.value = '';
  };

  const openFileDialog = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
          'hover:border-primary hover:bg-primary/5',
          {
            'border-primary bg-primary/10': dragActive,
            'border-gray-600': !dragActive && !disabled,
            'border-gray-700 bg-gray-800/50 cursor-not-allowed': disabled
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
          className="hidden"
        />
        
        <div className="space-y-3">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary via-orange-400 to-pink-500 rounded-xl flex items-center justify-center">
            <Upload className="w-8 h-8 text-white" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">
              {t('upload.title')}
            </h3>
            <p className="text-text-secondary text-sm">
              {t('upload.description')}
            </p>
          </div>
          
          <div className="flex items-center justify-center space-x-4 text-xs text-text-secondary">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1" />
              {accept.replace('image/', '').toUpperCase()}
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-1" />
              {t('upload.maxSize', { size: formatFileSize(maxSize) })}
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-1" />
              {t('upload.maxFiles', { count: maxFiles })}
            </span>
          </div>
        </div>
      </div>
      
      {/* File Preview Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((uploadedFile) => (
            <div
              key={uploadedFile.id}
              className="relative group bg-card-bg rounded-lg overflow-hidden border border-gray-700"
            >
              {uploadedFile.preview ? (
                <img
                  src={uploadedFile.preview}
                  alt={uploadedFile.file.name}
                  className="w-full h-32 object-cover"
                />
              ) : (
                <div className="w-full h-32 bg-gray-700 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
              )}
              
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
              <button
                onClick={() => removeFile(uploadedFile.id)}
                className="absolute top-2 left-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </button>
              
              {/* File info */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white text-xs font-medium truncate">
                  {uploadedFile.file.name}
                </p>
                <p className="text-white/80 text-xs">
                  {formatFileSize(uploadedFile.file.size)}
                </p>
                {uploadedFile.error && (
                  <p className="text-red-300 text-xs mt-1">
                    {uploadedFile.error}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
```

### Card Component
```typescript
// src/components/ui/Card/Card.tsx
import React from 'react';
import { cn } from '@/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  hover = false,
  clickable = false,
  className,
  children,
  ...props
}) => {
  const cardClasses = cn(
    // Base styles
    'rounded-xl transition-all duration-200',
    
    // Variant styles
    {
      // Default
      'bg-card-bg border border-gray-700': variant === 'default',
      // Elevated
      'bg-card-bg shadow-lg shadow-black/10': variant === 'elevated',
      // Outlined
      'bg-transparent border-2 border-gray-600': variant === 'outlined'
    },
    
    // Padding variants
    {
      'p-0': padding === 'none',
      'p-3': padding === 'sm',
      'p-6': padding === 'md',
      'p-8': padding === 'lg'
    },
    
    // Interactive styles
    {
      'hover:bg-card-hover hover:border-gray-600 hover:shadow-xl hover:shadow-black/20': 
        hover,
      'cursor-pointer': clickable,
      'hover:scale-[1.02] active:scale-[0.98]': clickable
    },
    
    className
  );

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

// Card sub-components
const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props}>
    {children}
  </div>
);

const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3 className={cn('text-xl font-semibold text-text-primary', className)} {...props}>
    {children}
  </h3>
);

const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => (
  <p className={cn('text-text-secondary', className)} {...props}>
    {children}
  </p>
);

const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('p-6 pt-0', className)} {...props}>
    {children}
  </div>
);

const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('flex items-center p-6 pt-0', className)} {...props}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
```

## 🏛️ Organism Components

### VideoProjectCard
```typescript
// src/components/features/video-generation/VideoProjectCard.tsx
import React from 'react';
import { Play, MoreHorizontal, Calendar, Clock } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { useLocalization } from '@/hooks/useLocalization';
import { VideoProject } from '@/domain/entities/VideoProject';

interface VideoProjectCardProps {
  project: VideoProject;
  onPlay?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const VideoProjectCard: React.FC<VideoProjectCardProps> = ({
  project,
  onPlay,
  onEdit,
  onDelete
}) => {
  const { t } = useTranslation();
  const { formatDate, formatDuration } = useLocalization();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'processing': return 'text-yellow-500';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-500/20 text-green-400`;
      case 'processing':
        return `${baseClasses} bg-yellow-500/20 text-yellow-400`;
      case 'failed':
        return `${baseClasses} bg-red-500/20 text-red-400`;
      default:
        return `${baseClasses} bg-gray-500/20 text-gray-400`;
    }
  };

  return (
    <Card 
      variant="elevated" 
      padding="none"
      hover
      clickable
      className="group overflow-hidden"
    >
      {/* Thumbnail/Preview */}
      <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900">
        {project.thumbnailUrl ? (
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-12 h-12 text-gray-500" />
          </div>
        )}
        
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={onPlay}
            className="transform scale-90 group-hover:scale-100 transition-transform"
          >
            <Play className="w-5 h-5 mr-2" />
            {t('video.play')}
          </Button>
        </div>
        
        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span className={getStatusBadge(project.status)}>
            {t(`video.status.${project.status}`)}
          </span>
        </div>
        
        {/* Duration */}
        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 rounded text-white text-sm">
          {formatDuration(project.duration)}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-primary truncate">
              {project.title}
            </h3>
            <p className="text-text-secondary text-sm mt-1 line-clamp-2">
              {project.description}
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Meta information */}
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {formatDate(project.createdAt, { dateStyle: 'short' })}
            </span>
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {project.photoCount} {t('video.photos')}
            </span>
          </div>
          
          <span className={cn('font-medium', getStatusColor(project.status))}>
            {project.generationProgress && project.status === 'processing' 
              ? `${project.generationProgress}%`
              : t(`video.status.${project.status}`)
            }
          </span>
        </div>
      </div>
    </Card>
  );
};

export default VideoProjectCard;
```

## 📱 Responsive Design Strategy

### Breakpoints
```typescript
// src/design-system/tokens/breakpoints.ts
export const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet portrait
  lg: '1024px',  // Tablet landscape / Small desktop
  xl: '1280px',  // Desktop
  '2xl': '1536px' // Large desktop
} as const;

// Responsive utilities
export const mediaQueries = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`
} as const;
```

### Layout Grid System
```typescript
// src/components/layout/Grid/Grid.tsx
import React from 'react';
import { cn } from '@/utils/cn';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 6 | 12;
    md?: 1 | 2 | 3 | 4 | 6 | 12;
    lg?: 1 | 2 | 3 | 4 | 6 | 12;
    xl?: 1 | 2 | 3 | 4 | 6 | 12;
  };
}

const Grid: React.FC<GridProps> = ({
  cols = 1,
  gap = 'md',
  responsive,
  className,
  children,
  ...props
}) => {
  const gridClasses = cn(
    'grid',
    
    // Base columns
    {
      'grid-cols-1': cols === 1,
      'grid-cols-2': cols === 2,
      'grid-cols-3': cols === 3,
      'grid-cols-4': cols === 4,
      'grid-cols-6': cols === 6,
      'grid-cols-12': cols === 12
    },
    
    // Responsive columns
    responsive && {
      [`sm:grid-cols-${responsive.sm}`]: responsive.sm,
      [`md:grid-cols-${responsive.md}`]: responsive.md,
      [`lg:grid-cols-${responsive.lg}`]: responsive.lg,
      [`xl:grid-cols-${responsive.xl}`]: responsive.xl
    },
    
    // Gap
    {
      'gap-2': gap === 'sm',
      'gap-4': gap === 'md',
      'gap-6': gap === 'lg',
      'gap-8': gap === 'xl'
    },
    
    className
  );

  return (
    <div className={gridClasses} {...props}>
      {children}
    </div>
  );
};

export default Grid;
```

## 🎨 Theme System

### Theme Provider
```typescript
// src/providers/ThemeProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'dark' | 'light';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [actualTheme, setActualTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    let newActualTheme: 'dark' | 'light';
    
    if (theme === 'system') {
      newActualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? 'dark' 
        : 'light';
    } else {
      newActualTheme = theme;
    }
    
    setActualTheme(newActualTheme);
    
    // Update document class
    document.documentElement.classList.toggle('dark', newActualTheme === 'dark');
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const value = {
    theme,
    setTheme,
    actualTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

This component architecture provides:
- **Consistency**: Unified design tokens and components
- **Accessibility**: WCAG 2.1 AA compliant components
- **Scalability**: Modular, reusable component system
- **Maintainability**: Clear component hierarchy
- **Performance**: Optimized with React best practices
- **Internationalization**: Built-in i18n support
- **Responsiveness**: Mobile-first design approach