import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const BookingCard = ({ booking, onView, onCancel, showActions = true }) => {
  // Determine status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Determine icon based on resource type
  const getResourceIcon = (type) => {
    return type === 'Lab' ? 'computer' : 'meeting_room';
  };
  
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div className="flex items-start">
              <div className={`p-2 rounded-lg mr-3 ${
                booking.resource?.type === 'Lab' ? 'bg-blue-100' : 'bg-purple-100'
              }`}>
                <span className="material-icons text-xl text-blue-600">
                  {getResourceIcon(booking.resource?.type)}
                </span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{booking.resource?.name}</h4>
                <p className="text-sm text-gray-500">{booking.resource?.department}</p>
              </div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
              {booking.status}
            </span>
          </div>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xs text-gray-500">Date</p>
              <p className="text-sm font-medium">{booking.date}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Time</p>
              <p className="text-sm font-medium">{`${booking.startTime} - ${booking.endTime}`}</p>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-xs text-gray-500">Purpose</p>
            <p className="text-sm">{booking.purpose}</p>
          </div>
          
          {showActions && (
            <div className="flex justify-end space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(booking)}
                className="text-accent hover:text-accent hover:bg-accent/10"
              >
                View
              </Button>
              
              {booking.status === 'Pending' && onCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCancel(booking.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-100"
                >
                  Cancel
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingCard;
