import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-primary-blue text-white hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5",
        secondary: "bg-primary-dark text-white hover:bg-gray-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5",
        outline: "border-2 border-primary-blue text-primary-blue bg-transparent hover:bg-primary-blue/10",
        ghost: "bg-transparent hover:bg-gray-100 text-gray-800",
        link: "text-primary-blue underline-offset-4 hover:underline bg-transparent",
        danger: "bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 px-3 py-2 text-sm",
        lg: "h-12 px-8 py-3 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? "slot" : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button"; 