import React, { forwardRef } from 'react';

const Select = forwardRef(({ className = '', options = [], placeholder, disabled, ...props }, ref) => {
  return (
    <select
      ref={ref}
      disabled={disabled}
      className={`
        flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm
        ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 
        focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
        dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200
        ${className}
      `}
      {...props}
    >
      {placeholder && (
        <option value="" disabled selected hidden>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
});

Select.displayName = 'Select';

export default Select; 