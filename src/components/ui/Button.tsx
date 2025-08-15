import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
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
}, ref) => {
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
      ref={ref}
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
});

Button.displayName = 'Button';

export default Button;