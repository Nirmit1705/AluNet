import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils.jsx';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-primary-blue text-white hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5",
        secondary: "bg-primary-dark text-white hover:bg-gray-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5",
        outline: "border-2 border-primary-blue text-primary-blue bg-transparent hover:bg-primary-blue/10",
        ghost: "bg-transparent hover:bg-gray-100 text-gray-800",
        link: "text-primary-blue underline-offset-4 hover:underline bg-transparent p-0 h-auto",
        danger: "bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg",
        success: "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg",
        warning: "bg-yellow-500 text-white hover:bg-yellow-600 shadow-md hover:shadow-lg",
        info: "bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg",
        light: "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200",
        saved: "bg-blue-100 text-primary-blue hover:bg-blue-200 border border-blue-200",
        rsvp: "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 px-3 py-2 text-sm",
        lg: "h-12 px-8 py-3 text-base",
        xl: "h-14 px-10 py-4 text-lg",
        icon: "h-10 w-10",
        iconSm: "h-8 w-8",
        iconLg: "h-12 w-12",
        pill: "h-8 px-4 py-1 text-xs rounded-full",
      },
      fullWidth: {
        true: "w-full",
      },
      loading: {
        true: "relative !text-transparent",
      },
      iconPosition: {
        left: "flex-row",
        right: "flex-row-reverse",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
      loading: false,
      iconPosition: "left",
    },
  }
);

export const Button = React.forwardRef(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth,
    loading,
    iconPosition,
    leftIcon,
    rightIcon,
    children,
    asChild = false, 
    ...props 
  }, ref) => {
    const Comp = asChild ? "slot" : "button";
    
    const renderLeftIcon = () => {
      if (loading) return null;
      if (leftIcon && iconPosition === 'left') return <span className="mr-2">{leftIcon}</span>;
      if (rightIcon && iconPosition === 'right') return <span className="ml-2">{rightIcon}</span>;
      return null;
    };
    
    const renderRightIcon = () => {
      if (loading) return null;
      if (rightIcon && iconPosition === 'left') return <span className="ml-2">{rightIcon}</span>;
      if (leftIcon && iconPosition === 'right') return <span className="mr-2">{leftIcon}</span>;
      return null;
    };
    
    const renderLoader = () => {
      if (!loading) return null;
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      );
    };
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, loading, iconPosition, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {renderLeftIcon()}
        {children}
        {renderRightIcon()}
        {renderLoader()}
      </Comp>
    );
  }
);

Button.displayName = "Button"; 