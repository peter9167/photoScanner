import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  variant = 'default',
  padding = 'md',
  hover = false,
  clickable = false,
  className,
  children,
  ...props
}, ref) => {
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
    <div ref={ref} className={cardClasses} {...props}>
      {children}
    </div>
  );
});

Card.displayName = 'Card';

// Card sub-components
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  children,
  ...props
}, ref) => (
  <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props}>
    {children}
  </div>
));

CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({
  className,
  children,
  ...props
}, ref) => (
  <h3 ref={ref} className={cn('text-xl font-semibold text-text-primary', className)} {...props}>
    {children}
  </h3>
));

CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({
  className,
  children,
  ...props
}, ref) => (
  <p ref={ref} className={cn('text-text-secondary', className)} {...props}>
    {children}
  </p>
));

CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  children,
  ...props
}, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props}>
    {children}
  </div>
));

CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  children,
  ...props
}, ref) => (
  <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props}>
    {children}
  </div>
));

CardFooter.displayName = 'CardFooter';

// Attach sub-components to main Card component
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
export { CardHeader, CardTitle, CardDescription, CardContent, CardFooter };