import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const StatCard = ({ title, value, icon, iconClass, iconBgClass, isLoading }) => {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 mb-1">{title}</p>
          {isLoading ? (
            <Skeleton className="h-10 w-16" />
          ) : (
            <h3 className="text-3xl font-semibold text-primary">{value}</h3>
          )}
        </div>
        <div className={`${iconBgClass} p-2 rounded-lg`}>
          <span className={`material-icons ${iconClass}`}>{icon}</span>
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
