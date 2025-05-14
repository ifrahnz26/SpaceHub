import React, { useState } from 'react';

const AccordionItem = ({ 
  trigger, 
  children, 
  value, 
  isOpen, 
  onToggle,
  className = '' 
}) => {
  return (
    <div className={`border-b ${className}`}>
      <button
        type="button"
        onClick={() => onToggle(value)}
        className="flex w-full items-center justify-between py-4 px-2 text-sm font-medium hover:underline"
        aria-expanded={isOpen}
      >
        {trigger}
        <svg
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180 transform' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div className="pb-4 pt-0 px-2">{children}</div>
      </div>
    </div>
  );
};

const Accordion = ({ 
  type = 'single', 
  defaultValue = null,
  className = '',
  children 
}) => {
  const [openItems, setOpenItems] = useState(
    type === 'single' 
      ? defaultValue 
      : defaultValue || []
  );

  const handleToggle = (value) => {
    if (type === 'single') {
      setOpenItems(openItems === value ? null : value);
    } else {
      setOpenItems(
        openItems.includes(value)
          ? openItems.filter(item => item !== value)
          : [...openItems, value]
      );
    }
  };

  const isItemOpen = (value) => {
    if (type === 'single') {
      return openItems === value;
    }
    return openItems.includes(value);
  };

  return (
    <div className={`divide-y rounded-md border ${className}`}>
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return null;
        
        return React.cloneElement(child, {
          isOpen: isItemOpen(child.props.value),
          onToggle: handleToggle
        });
      })}
    </div>
  );
};

Accordion.Item = AccordionItem;

export default Accordion; 