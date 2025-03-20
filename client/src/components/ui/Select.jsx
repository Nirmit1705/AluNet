import React from 'react';
import { cn } from '../../lib/utils.jsx';

const Select = React.forwardRef(
  ({ className, error, children, ...props }, ref) => {
    return (
      <select
      className={cn(
        "flex h-11 w-full appearance-none rounded-md border px-3 py-2 text-sm transition-colors",
        "bg-white text-gray-900 shadow-sm",
        "focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-0",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "bg-no-repeat bg-[right_0.5rem_center]",
        "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 20 20%22%3E%3Cpath stroke=%22%236b7280%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%221.5%22 d=%22M6 8l4 4 4-4%22/%3E%3C/svg%3E')]",
        "bg-[length:1.25rem_1.25rem]",
        error ? "border-red-500 focus:ring-red-500" : "border-gray-300",
        "bg-white",
        className
      )}      
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";

export { Select }; 