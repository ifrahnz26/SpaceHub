import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { getApiUrl, API_ENDPOINTS } from '../utils/api';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement);

export default function AnalyticsDashboard() {
  // State for college-wide statistics
  const [collegeStats, setCollegeStats] = useState({
    totalEvents: 0,
    totalBookings: 0,
    approvedBookings: 0,
    rejectedBookings: 0,
    pendingBookings: 0,
    totalUsers: 0,
    totalResources: 0,
    monthlyEvents: {},
    departmentStats: {},
    resourceUtilization: {},
    userRoleDistribution: {},
    bookingTrends: {},
    availableYears: [],
    selectedYear: new Date().getFullYear(),
    resourceNames: {},
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('year'); // 'year', 'month', 'week'

  const token = localStorage.getItem("token");
  const { user } = useAuth();

  // ✅ Fetch college-wide statistics
  const fetchCollegeStats = useCallback(async (year) => {
    if (user?.role !== 'HOD') return;

    setLoadingStats(true);
    try {
      // Fetch all events
      const eventsRes = await fetch(getApiUrl(API_ENDPOINTS.EVENTS.BASE), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const eventsData = await eventsRes.json();

      // Fetch all users
      const usersRes = await fetch(getApiUrl(API_ENDPOINTS.USERS.ALL), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usersData = await usersRes.json();

      // Fetch all bookings for analytics
      const bookingsRes = await fetch(getApiUrl(API_ENDPOINTS.BOOKINGS.ANALYTICS_ALL), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allBookingsData = await bookingsRes.json();

      // Fetch all resources
      const resourcesRes = await fetch(getApiUrl(API_ENDPOINTS.RESOURCES.ALL), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resourcesData = await resourcesRes.json();

      if (eventsRes.ok && bookingsRes.ok && usersRes.ok && resourcesRes.ok) {
        // Basic stats
        const totalEvents = eventsData.length;
        const totalBookings = allBookingsData.length;
        const approvedBookings = allBookingsData.filter(b => b.status === 'Approved').length;
        const rejectedBookings = allBookingsData.filter(b => b.status === 'Rejected').length;
        const pendingBookings = allBookingsData.filter(b => b.status === 'Pending').length;
        const totalUsers = usersData.length;
        const totalResources = resourcesData.length;

        // Department-wise statistics
        const departmentStats = {};
        eventsData.forEach(event => {
          if (event.department) {
            departmentStats[event.department] = (departmentStats[event.department] || 0) + 1;
          }
        });

        // Resource utilization with proper names and counts
        const resourceUtilization = {};
        const resourceNames = {};
        
        // Initialize all resources with 0 bookings
        resourcesData.forEach(resource => {
          resourceNames[resource._id] = `${resource.name} (${resource.type})`;
          resourceUtilization[resource._id] = 0;
        });

        // Count bookings for each resource
        allBookingsData.forEach(booking => {
          if (booking.resourceId) { // Changed from booking.resource to booking.resourceId
            resourceUtilization[booking.resourceId] = (resourceUtilization[booking.resourceId] || 0) + 1;
          }
        });

        // User role distribution
        const userRoleDistribution = {};
        usersData.forEach(user => {
          userRoleDistribution[user.role] = (userRoleDistribution[user.role] || 0) + 1;
        });

        // Booking trends with proper date handling
        const bookingTrends = {};
        const now = new Date();
        let startDate, endDate;

        switch (selectedTimeRange) {
          case 'week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            endDate = new Date(now);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;
          case 'year':
          default:
            startDate = new Date(year, 0, 1);
            endDate = new Date(year, 11, 31);
            break;
        }

        // Initialize all dates in the range
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const dateKey = currentDate.toISOString().split('T')[0];
          bookingTrends[dateKey] = 0;
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Fill in booking counts
        allBookingsData.forEach(booking => {
          if (booking.date) { // Changed from booking.createdAt to booking.date
            const bookingDate = new Date(booking.date).toISOString().split('T')[0];
            if (bookingDate in bookingTrends) {
              bookingTrends[bookingDate]++;
            }
          }
        });

        // Monthly events calculation
        const monthlyEvents = {};
        for (let i = 0; i < 12; i++) {
          monthlyEvents[`${year}-${i + 1}`] = 0;
        }

        const yearlyEvents = eventsData.filter(event => {
          if (event.date) {
            const eventYear = new Date(event.date).getFullYear();
            return eventYear === year;
          }
          return false;
        });

        yearlyEvents.forEach(event => {
          if (event.date) {
            const date = new Date(event.date);
            const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
            if (monthYear.startsWith(`${year}-`)) {
              monthlyEvents[monthYear]++;
            }
          }
        });

        // Extract available years
        const availableYearsSet = new Set();
        eventsData.forEach(event => {
          if (event.date) {
            availableYearsSet.add(new Date(event.date).getFullYear());
          }
        });
        const availableYears = Array.from(availableYearsSet).sort((a, b) => b - a);

        setCollegeStats(prevState => ({
          ...prevState,
          totalEvents,
          totalBookings,
          approvedBookings,
          rejectedBookings,
          pendingBookings,
          totalUsers,
          totalResources,
          departmentStats,
          resourceUtilization,
          resourceNames,
          userRoleDistribution,
          bookingTrends,
          monthlyEvents,
          availableYears,
          selectedYear: year,
        }));
        setStatsError(null);
      } else {
        console.error("Failed to fetch college stats:", eventsData.error || allBookingsData.error || usersRes.error || resourcesRes.error);
        setStatsError("Failed to load college statistics.");
      }
    } catch (err) {
      console.error("Error fetching college stats:", err);
      setStatsError("Failed to load college statistics.");
    } finally {
      setLoadingStats(false);
    }
  }, [user, token, selectedTimeRange]);

  useEffect(() => {
    if (user?.role === 'HOD') {
      fetchCollegeStats(collegeStats.selectedYear);
    }
  }, [user, fetchCollegeStats, collegeStats.selectedYear]);

  const handleYearChange = (event) => {
    setCollegeStats(prevState => ({
      ...prevState,
      selectedYear: parseInt(event.target.value),
    }));
  };

  const handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range);
  };

  if (!user || user?.role !== 'HOD') {
    return <div className="p-6 text-center text-red-500">Access Denied: Not authorized to view this page.</div>;
  }

  // Chart data configurations
  const bookingStatusData = {
    labels: ['Approved', 'Rejected', 'Pending'],
    datasets: [{
      label: 'Number of Bookings',
      data: [collegeStats.approvedBookings, collegeStats.rejectedBookings, collegeStats.pendingBookings],
      backgroundColor: ['#4CAF50', '#F44336', '#FFC107'],
      hoverBackgroundColor: ['#66BB6A', '#E57373', '#FFD54F'],
    }],
  };

  const monthlyEventData = {
    labels: Object.keys(collegeStats.monthlyEvents)
      .sort((a,b) => new Date(a) - new Date(b))
      .map(monthYear => {
        const [year, month] = monthYear.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleString('default', { month: 'short' });
      }),
    datasets: [{
      label: 'Number of Events',
      data: Object.values(collegeStats.monthlyEvents),
      backgroundColor: '#03A9F4',
    }],
  };

  const departmentStatsData = {
    labels: Object.keys(collegeStats.departmentStats),
    datasets: [{
      label: 'Events by Department',
      data: Object.values(collegeStats.departmentStats),
      backgroundColor: '#9C27B0',
    }],
  };

  const resourceUtilizationData = {
    labels: Object.keys(collegeStats.resourceUtilization)
      .filter(id => collegeStats.resourceUtilization[id] > 0) // Only show resources with bookings
      .map(id => collegeStats.resourceNames[id] || 'Unknown Resource'),
    datasets: [{
      label: 'Number of Bookings',
      data: Object.keys(collegeStats.resourceUtilization)
        .filter(id => collegeStats.resourceUtilization[id] > 0)
        .map(id => collegeStats.resourceUtilization[id]),
      backgroundColor: '#FF9800',
      borderColor: '#F57C00',
      borderWidth: 1,
    }],
  };

  const userRoleData = {
    labels: Object.keys(collegeStats.userRoleDistribution),
    datasets: [{
      label: 'Users by Role',
      data: Object.values(collegeStats.userRoleDistribution),
      backgroundColor: ['#2196F3', '#4CAF50', '#FFC107', '#F44336'],
    }],
  };

  const bookingTrendsData = {
    labels: Object.keys(collegeStats.bookingTrends)
      .filter(date => collegeStats.bookingTrends[date] > 0) // Only show dates with bookings
      .map(date => {
        const d = new Date(date);
        return selectedTimeRange === 'week' 
          ? d.toLocaleDateString('default', { weekday: 'short' })
          : d.toLocaleDateString('default', { month: 'short', day: 'numeric' });
      }),
    datasets: [{
      label: 'Number of Bookings',
      data: Object.keys(collegeStats.bookingTrends)
        .filter(date => collegeStats.bookingTrends[date] > 0)
        .map(date => collegeStats.bookingTrends[date]),
      borderColor: '#2196F3',
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
      tension: 0.4,
      fill: true,
    }],
  };

  // Chart options
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw;
            const total = context.dataset.data.reduce((sum, current) => sum + current, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          title: function(tooltipItems) {
            const monthYearLabel = tooltipItems[0].label;
            return `${monthYearLabel} ${collegeStats.selectedYear}`;
          },
          label: function(tooltipItem) {
            return `Events: ${tooltipItem.raw}`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        stepSize: 1,
        grid: {
          borderDash: [2],
          drawBorder: false,
        }
      }
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          title: function(tooltipItems) {
            const date = new Date(Object.keys(collegeStats.bookingTrends)[tooltipItems[0].dataIndex]);
            return date.toLocaleDateString('default', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
          },
          label: function(tooltipItem) {
            return `Bookings: ${tooltipItem.raw}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        },
        grid: {
          borderDash: [2],
        }
      }
    },
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">College Analytics Dashboard</h1>
        <div className="flex space-x-4">
          <select
            value={collegeStats.selectedYear}
            onChange={handleYearChange}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {collegeStats.availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <div className="flex space-x-2">
            <button
              onClick={() => handleTimeRangeChange('week')}
              className={`px-4 py-2 rounded-lg ${
                selectedTimeRange === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => handleTimeRangeChange('month')}
              className={`px-4 py-2 rounded-lg ${
                selectedTimeRange === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => handleTimeRangeChange('year')}
              className={`px-4 py-2 rounded-lg ${
                selectedTimeRange === 'year' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              Year
            </button>
          </div>
        </div>
      </div>

      {loadingStats ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      ) : statsError ? (
        <div className="text-center py-8 text-red-500">{statsError}</div>
      ) : (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Total Events</h3>
              <p className="text-3xl font-bold text-blue-600">{collegeStats.totalEvents}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Total Bookings</h3>
              <p className="text-3xl font-bold text-green-600">{collegeStats.totalBookings}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
              <p className="text-3xl font-bold text-purple-600">{collegeStats.totalUsers}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Total Resources</h3>
              <p className="text-3xl font-bold text-orange-600">{collegeStats.totalResources}</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Booking Status Distribution */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Booking Status Distribution</h3>
              <div className="h-80">
                <Pie data={bookingStatusData} options={pieChartOptions} />
              </div>
            </div>

            {/* Monthly Events */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Events</h3>
              <div className="h-80">
                <Bar data={monthlyEventData} options={barChartOptions} />
              </div>
            </div>

            {/* Department-wise Events */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Events by Department</h3>
              <div className="h-80">
                <Bar data={departmentStatsData} options={barChartOptions} />
              </div>
            </div>

            {/* Resource Utilization */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Resource Utilization</h3>
              <div className="h-80">
                <Bar data={resourceUtilizationData} options={barChartOptions} />
              </div>
            </div>

            {/* User Role Distribution */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">User Role Distribution</h3>
              <div className="h-80">
                <Pie data={userRoleData} options={pieChartOptions} />
              </div>
            </div>

            {/* Booking Trends */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Booking Trends (Last 6 Months)</h3>
              <div className="h-80">
                <Line data={bookingTrendsData} options={lineChartOptions} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}