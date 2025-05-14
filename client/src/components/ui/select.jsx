"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils.js";

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </button>
));
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = React.forwardRef(({ className, children, placeholder = "Select an option...", ...props }, ref) => (
  <span className={cn("block truncate", className)} {...props} ref={ref}>
    {children || placeholder}
  </span>
));
SelectValue.displayName = "SelectValue";

const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    >
      <div className="p-1">{children}</div>
    </div>
  );
});
SelectContent.displayName = "SelectContent";

const Select = React.forwardRef(({ children, value, onChange, placeholder = "Select an option...", className = "" }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const selectRef = useRef(null);
  const listboxRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value) => {
    setSelectedValue(value);
    onChange?.(value);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className="relative">
      <SelectTrigger
        ref={ref}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={className}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <SelectValue>{selectedValue || placeholder}</SelectValue>
      </SelectTrigger>

      {isOpen && createPortal(
        <SelectContent
          ref={listboxRef}
          style={{
            position: 'fixed',
            top: selectRef.current?.getBoundingClientRect().bottom + 'px',
            left: selectRef.current?.getBoundingClientRect().left + 'px',
            width: selectRef.current?.offsetWidth + 'px'
          }}
          role="listbox"
        >
          {React.Children.map(children, child =>
            React.cloneElement(child, {
              onSelect: handleSelect,
              isSelected: child.props.value === selectedValue
            })
          )}
        </SelectContent>,
        document.body
      )}
    </div>
  );
});

const SelectItem = React.forwardRef(({ children, value, onSelect, isSelected, className = "", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        isSelected ? 'bg-accent text-accent-foreground' : '',
        className
      )}
      onClick={() => onSelect?.(value)}
      role="option"
      aria-selected={isSelected}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4" />}
      </span>
      <span className="truncate">{children}</span>
    </div>
  );
});

Select.displayName = "Select";
SelectItem.displayName = "SelectItem";

export { Select, SelectItem, SelectTrigger, SelectValue, SelectContent };
