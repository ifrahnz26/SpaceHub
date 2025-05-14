import React from 'react';

const Alert = ({ 
  variant = 'default', 
  title,
  description,
  className = '',
  children 
}) => {
  const variantStyles = {
    default: 'bg-background text-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
  };

  return (
    <div
      role="alert"
      className={`
        relative w-full rounded-lg border p-4
        ${variantStyles[variant] || variantStyles.default}
        ${className}
      `}
    >
      {title && (
        <h5 className="mb-1 font-medium leading-none tracking-tight">
          {title}
        </h5>
      )}
      {description && (
        <div className="text-sm [&_p]:leading-relaxed">
          {description}
        </div>
      )}
      {children}
    </div>
  );
};

export default Alert; 