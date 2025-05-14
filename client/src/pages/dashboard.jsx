import React from 'react';
import { useQuery } from '@tanstack/react-query';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { useAuth } from '@/hooks/use-auth.jsx';
import { Card } from '@/components/ui/card.jsx';
import StatCard from '@/components/StatCard';
import { Skeleton } from '@/components/ui/skeleton.jsx';

const Dashboard = () => {
  const { user } = useAuth();
  
  // Fetch bookings
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['/api/bookings'],
    retry: false,
  });
  
  // Calculate stats
  const calculateStats = () => {
    if (!bookings) return { total: 0, pending: 0, approved: 0, rejected: 0 };
    
    return {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'Pending').length,
      approved: bookings.filter(b => b.status === 'Approved').length,
      rejected: bookings.filter(b => b.status === 'Rejected').length,
    };
  };
  
  const stats = calculateStats();
  
  return (
    <AuthenticatedLayout pageTitle="Dashboard">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Bookings" 
          value={stats.total}
          icon="event"
          iconClass="text-blue-600"
          iconBgClass="bg-blue-100"
          isLoading={isLoading}
        />
        
        <StatCard 
          title="Pending" 
          value={stats.pending}
          icon="hourglass_empty"
          iconClass="text-yellow-600"
          iconBgClass="bg-yellow-100"
          isLoading={isLoading}
        />
        
        <StatCard 
          title="Approved" 
          value={stats.approved}
          icon="check_circle"
          iconClass="text-green-600"
          iconBgClass="bg-green-100"
          isLoading={isLoading}
        />
      </div>
      
      {/* Recent Bookings */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-medium font-montserrat text-primary">Recent Bookings</h3>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.slice(0, 5).map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.resource?.name || 'Unknown Resource'}</div>
                      <div className="text-sm text-gray-500">{booking.resource?.department || 'Department'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {`${booking.startTime} - ${booking.endTime}`}
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
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-10 text-center text-gray-500">
              No bookings found. Create a new booking to get started!
            </div>
          )}
        </div>
      </Card>
    </AuthenticatedLayout>
  );
};

export default Dashboard;
