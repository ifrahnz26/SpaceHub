import React from 'react';

const ResourceCard = ({ resource, isSelected, onClick }) => {
  // Get icon based on resource type
  const getResourceIcon = () => {
    return resource.type === 'Lab' ? 'computer' : 'meeting_room';
  };
  
  // Get icon background color based on resource type
  const getIconBgColor = () => {
    return resource.type === 'Lab' ? 'bg-blue-100' : 'bg-purple-100';
  };
  
  // Get icon text color based on resource type
  const getIconTextColor = () => {
    return resource.type === 'Lab' ? 'text-blue-600' : 'text-purple-600';
  };
  
  return (
    <div 
      className={`border rounded-lg p-4 cursor-pointer hover:border-secondary transition-colors ${
        isSelected ? 'border-secondary border-2' : 'border-gray-200'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start">
        <div className={`${getIconBgColor()} p-2 rounded-lg mr-4`}>
          <span className={`material-icons ${getIconTextColor()}`}>{getResourceIcon()}</span>
        </div>
        <div>
          <h4 className="font-medium text-gray-900">{resource.name}</h4>
          <p className="text-sm text-gray-500">Capacity: {resource.capacity} {resource.type === 'Lab' ? 'students' : 'attendees'}</p>
          <p className="text-sm text-gray-500">Equipped with: {resource.features}</p>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
