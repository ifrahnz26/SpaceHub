import React, { useState } from 'react';

const Tabs = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <div
        role="tablist"
        className="flex border-b border-gray-200 dark:border-gray-700"
      >
        {tabs.map((tab, index) => (
          <button
            key={index}
            role="tab"
            aria-selected={activeTab === index}
            aria-controls={`panel-${index}`}
            id={`tab-${index}`}
            tabIndex={activeTab === index ? 0 : -1}
            onClick={() => setActiveTab(index)}
            onKeyDown={(e) => {
              const tabCount = tabs.length;
              if (e.key === 'ArrowLeft') {
                setActiveTab((activeTab - 1 + tabCount) % tabCount);
              } else if (e.key === 'ArrowRight') {
                setActiveTab((activeTab + 1) % tabCount);
              }
            }}
            className={`px-4 py-2 -mb-px text-sm font-medium ${
              activeTab === index
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab, index) => (
        <div
          key={index}
          role="tabpanel"
          id={`panel-${index}`}
          aria-labelledby={`tab-${index}`}
          hidden={activeTab !== index}
          className="p-4"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
};

export default Tabs; 