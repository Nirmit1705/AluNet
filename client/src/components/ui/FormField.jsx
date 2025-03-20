import React from 'react';
import { cn } from '../../lib/utils';
import { Label } from './Label';

const FormField = ({
  label,
  name,
  error,
  children,
  className,
  optional = false,
  ...props
}) => {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      <div className="flex justify-between">
        <Label htmlFor={name} className="block">
          {label}
          {optional && <span className="ml-1 text-gray-500 text-xs">(Optional)</span>}
        </Label>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
      {children}
    </div>
  );
};

export { FormField }; 