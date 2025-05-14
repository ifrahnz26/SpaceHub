"use client";

import React, { useState } from 'react';
import { cn } from "@/lib/utils.js";

const TooltipProvider = ({ children }) => {
  return <>{children}</>;
};

const Tooltip = React.forwardRef(({ children, content, className, delayDuration = 200, ...props }, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = React.useRef(null);

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: rect.left + window.scrollX + rect.width / 2,
      y: rect.top + window.scrollY + rect.height
    });
    const timer = setTimeout(() => setIsVisible(true), delayDuration);
    return () => clearTimeout(timer);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative inline-block"
      {...props}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            "absolute z-50 px-3 py-2 text-sm text-popover-foreground bg-popover rounded-md shadow-md",
            "animate-in fade-in-0 zoom-in-95",
            className
          )}
          style={{
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y + 8}px`,
            transform: 'translateX(-50%)'
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
});

Tooltip.displayName = "Tooltip";

export { Tooltip, TooltipProvider };
