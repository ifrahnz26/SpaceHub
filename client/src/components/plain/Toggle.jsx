import React from 'react';

const Toggle = ({ 
  pressed = false, 
  onPressedChange, 
  disabled = false,
  className = '',
  children,
  ...props 
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-pressed={pressed}
      disabled={disabled}
      onClick={() => onPressedChange?.(!pressed)}
      className={`
        inline-flex items-center justify-center rounded-md text-sm font-medium
        transition-colors focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none
        disabled:opacity-50 hover:bg-muted hover:text-muted-foreground
        data-[state=on]:bg-accent data-[state=on]:text-accent-foreground
        h-10 px-3
        ${pressed ? 'bg-accent text-accent-foreground' : 'bg-transparent'}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Toggle; 