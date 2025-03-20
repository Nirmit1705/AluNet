import React from 'react';
import { cn } from '../../lib/utils.jsx';

const Label = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <label
        className={cn(
          "text-sm font-medium text-gray-700",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Label.displayName = "Label";

export { Label }; 