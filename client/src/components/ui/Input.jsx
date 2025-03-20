import React from 'react';
import { cn } from '../../lib/utils.jsx';

const Input = React.forwardRef(
  ({ className, type = 'text', error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-md border px-3 py-2 text-sm transition-colors",
          "bg-white text-gray-900 shadow-sm placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-red-500 focus:ring-red-500" : "border-gray-300",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input }; 