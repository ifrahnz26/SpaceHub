import React, { forwardRef } from 'react';

const Checkbox = forwardRef(({ className = '', checked, onChange, disabled, id, ...props }, ref) => {
  return (
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        ref={ref}
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={`
          h-4 w-4 rounded border border-gray-300 
          text-primary focus:ring-2 focus:ring-primary 
          focus:ring-offset-2 focus:outline-none
          disabled:cursor-not-allowed disabled:opacity-50
          dark:border-gray-600 dark:bg-gray-700 
          dark:focus:ring-offset-gray-900
          ${className}
        `}
        {...props}
      />
      {props.children && (
        <label
          htmlFor={id}
          className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          {props.children}
        </label>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox; 