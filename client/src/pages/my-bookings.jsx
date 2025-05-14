import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth.jsx';
import { useToast } from '@/hooks/use-toast.jsx';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Card } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { apiRequest, queryClient } from '@/lib/queryClient.js';
import { format } from 'date-fns';

const MyBookings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Fetch bookings
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['/api/bookings'],
    retry: false,
  });
  
  // Handle booking cancellation (only for pending bookings)
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    try {
      // Send a PATCH request to update the booking status to 'Rejected'
      await apiRequest("PATCH", `/api/bookings/${bookingId}/status`, { status: 'Rejected' });
      
      // Invalidate the bookings query to refresh the data
      queryClient.invalidateQueries(['/api/bookings']);
      
      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to cancel booking",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  // Handle viewing booking details
  const handleViewBookingDetails = (booking) => {
    // For now just show a toast with booking details
    toast({
      title: "Booking Details",
      description: `${booking.resource?.name} on ${booking.date} from ${booking.startTime} to ${booking.endTime}`,
    });
  };

  return (
    <AuthenticatedLayout pageTitle="My Bookings">
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-medium font-montserrat text-primary">All Bookings</h3>
          
          <div className="flex space-x-2">
            <Button 
              className="bg-secondary hover:bg-opacity-90 text-white"
              onClick={() => navigate('/new-booking')}
            >
              <span className="material-icons text-sm mr-1">add</span>
              New Booking
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : bookings && bookings.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.resource?.name || 'Unknown Resource'}</div>
                      <div className="text-sm text-gray-500">{booking.resource?.department || 'Department'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.date}</div>
                      <div className="text-sm text-gray-500">{`${booking.startTime} - ${booking.endTime}`}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{booking.purpose}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === 'Approved' 
                          ? 'bg-green-100 text-green-800' 
                          : booking.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        className="text-accent hover:text-opacity-80 mr-3"
                        onClick={() => handleViewBookingDetails(booking)}
                      >
                        View
                      </button>
                      
                      {booking.status === 'Pending' && (
                        <button 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-10 text-center text-gray-500">
              You don't have any bookings yet. Create a new booking to get started!
            </div>
          )}
        </div>
      </Card>
    </AuthenticatedLayout>
  );
};

export default MyBookings;
