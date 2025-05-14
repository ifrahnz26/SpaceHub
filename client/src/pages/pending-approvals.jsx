import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth.jsx';
import { useToast } from '@/hooks/use-toast.jsx';
import { Redirect } from 'wouter';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Card } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { apiRequest, queryClient } from '@/lib/queryClient.js';

const PendingApprovals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Redirect if not HOD
  if (user && user.role !== 'HOD') {
    return <Redirect to="/" />;
  }
  
  // Fetch pending approvals
  const { data: pendingBookings, isLoading } = useQuery({
    queryKey: ['/api/bookings/pending'],
    retry: false,
  });
  
  // Approve booking mutation
  const approveMutation = useMutation({
    mutationFn: async (bookingId) => {
      const res = await apiRequest("PATCH", `/api/bookings/${bookingId}/status`, { status: 'Approved' });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking approved",
        description: "The booking has been approved successfully.",
      });
      queryClient.invalidateQueries(['/api/bookings/pending']);
      queryClient.invalidateQueries(['/api/bookings']);
    },
    onError: (error) => {
      toast({
        title: "Failed to approve booking",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Reject booking mutation
  const rejectMutation = useMutation({
    mutationFn: async (bookingId) => {
      const res = await apiRequest("PATCH", `/api/bookings/${bookingId}/status`, { status: 'Rejected' });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking rejected",
        description: "The booking has been rejected.",
      });
      queryClient.invalidateQueries(['/api/bookings/pending']);
      queryClient.invalidateQueries(['/api/bookings']);
    },
    onError: (error) => {
      toast({
        title: "Failed to reject booking",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle approve booking
  const handleApprove = (bookingId) => {
    if (window.confirm('Are you sure you want to approve this booking?')) {
      approveMutation.mutate(bookingId);
    }
  };
  
  // Handle reject booking
  const handleReject = (bookingId) => {
    if (window.confirm('Are you sure you want to reject this booking?')) {
      rejectMutation.mutate(bookingId);
    }
  };

  return (
    <AuthenticatedLayout pageTitle="Pending Approvals">
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-medium font-montserrat text-primary">Booking Requests</h3>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : pendingBookings && pendingBookings.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requester</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pendingBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.user?.name || 'Unknown User'}</div>
                      <div className="text-sm text-gray-500">{booking.user?.role || 'Role'}</div>
                    </td>
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
                      <div className="text-sm text-gray-500">Attendees: {booking.attendees}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        className="text-green-600 hover:text-green-800 mr-3 bg-green-100 hover:bg-green-200"
                        size="sm"
                        onClick={() => handleApprove(booking.id)}
                        disabled={approveMutation.isPending}
                      >
                        Approve
                      </Button>
                      <Button
                        className="text-red-500 hover:text-red-700 bg-red-100 hover:bg-red-200"
                        size="sm"
                        onClick={() => handleReject(booking.id)}
                        disabled={rejectMutation.isPending}
                      >
                        Reject
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-10 text-center text-gray-500">
              There are no pending approval requests at this time.
            </div>
          )}
        </div>
      </Card>
    </AuthenticatedLayout>
  );
};

export default PendingApprovals;
