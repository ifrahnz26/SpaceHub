import React from 'react';

const Separator = ({ orientation = 'horizontal', className = '' }) => {
  const baseStyles = 'bg-gray-200 dark:bg-gray-700';
  const orientationStyles = orientation === 'horizontal' 
    ? 'h-[1px] w-full' 
    : 'w-[1px] h-full';

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={`${baseStyles} ${orientationStyles} ${className}`}
    />
  );
};

export default Separator; 