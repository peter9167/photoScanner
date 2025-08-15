import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
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

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  helper,
  error,
  leftIcon,
  rightIcon,
  showPasswordToggle,
  fullWidth = true,
  type = 'text',
  className,
  id,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [inputType, setInputType] = React.useState(type);

  React.useEffect(() => {
    if (type === 'password') {
      setInputType(showPassword ? 'text' : 'password');
    }
  }, [type, showPassword]);

  const inputId = id || `input-${React.useId()}`;

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
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-text-primary mb-2"
        >
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
          id={inputId}
          type={inputType}
          className={inputClasses}
          aria-describedby={helper ? `${inputId}-helper` : error ? `${inputId}-error` : undefined}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />
        
        {(rightIcon || (showPasswordToggle && type === 'password') || error) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {error ? (
              <AlertCircle className="w-5 h-5 text-red-500" aria-hidden="true" />
            ) : showPasswordToggle && type === 'password' ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-text-secondary hover:text-text-primary transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <Eye className="w-5 h-5" aria-hidden="true" />
                )}
              </button>
            ) : rightIcon ? (
              rightIcon
            ) : null}
          </div>
        )}
      </div>
      
      {(helper || error) && (
        <p 
          id={error ? `${inputId}-error` : `${inputId}-helper`}
          className={cn(
            'mt-2 text-sm',
            error ? 'text-red-600' : 'text-text-secondary'
          )}
          role={error ? 'alert' : undefined}
        >
          {error || helper}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;