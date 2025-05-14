import React from 'react';

const RadioGroup = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`grid gap-2 ${className || ''}`}
      role="radiogroup"
      {...props}
    />
  );
});
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="radio"
        ref={ref}
        className={`h-4 w-4 rounded-full border border-primary text-primary 
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 
          disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
        {...props}
      />
      {children}
    </div>
  );
});
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
