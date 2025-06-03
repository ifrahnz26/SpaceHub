import React, { useState, useEffect, useCallback } from "react";
import HodDashboard from "./HodDashboard";
import VenueDashboard from "./VenueDashboard";
import { useAuth } from "../context/AuthContext";
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { getApiUrl, API_ENDPOINTS } from '../utils/api';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Dashboard() {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const [facultyStats, setFacultyStats] = useState({
    totalBookingsMade: 0,
    approvedBookings: 0,
    rejectedBookings: 0,
    pendingBookings: 0, // Added pending bookings stat
    monthlyBookings: {},
    availableYears: [],
    selectedYear: new Date().getFullYear(),
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState(null);

  const fetchFacultyStats = useCallback(async (year) => {
    if (user?.role !== 'Faculty') return;

    setLoadingStats(true);
    try {
      const res = await fetch(getApiUrl(API_ENDPOINTS.BOOKINGS.MY), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const bookingsData = await res.json();

      if (res.ok) {
        const totalBookingsMade = bookingsData.length;
        const approvedBookings = bookingsData.filter(b => b.status === 'Approved').length;
        const rejectedBookings = bookingsData.filter(b => b.status === 'Rejected').length;
        const pendingBookings = bookingsData.filter(b => b.status === 'Pending').length; // Calculate pending bookings

        const monthlyBookings = {};
        for (let i = 0; i < 12; i++) {
            monthlyBookings[`${year}-${i + 1}`] = 0;
        }

        const yearlyBookings = bookingsData.filter(booking => {
           if (booking.date) {
             const bookingYear = new Date(booking.date).getFullYear();
             return bookingYear === year;
           }
           return false;
        });

        yearlyBookings.forEach(booking => {
           if (booking.date) {
              const date = new Date(booking.date);
              const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
              if (monthYear.startsWith(`${year}-`)) {
                 monthlyBookings[monthYear]++;
              }
           }
        });

        const availableYearsSet = new Set();
        bookingsData.forEach(booking => {
            if (booking.date) {
                availableYearsSet.add(new Date(booking.date).getFullYear());
            }
        });
        const availableYears = Array.from(availableYearsSet).sort((a, b) => b - a);

        setFacultyStats(prevState => ({
          ...prevState,
          totalBookingsMade,
          approvedBookings,
          rejectedBookings,
          pendingBookings, // Include pending bookings in state
          monthlyBookings,
          availableYears,
        }));
        setError(null);
      } else {
        console.error("Failed to fetch faculty bookings:", bookingsData.error);
        setError("Failed to load your booking statistics.");
      }
    } catch (err) {
      console.error("Error fetching faculty bookings:", err);
      setError("Failed to load your booking statistics.");
    } finally {
      setLoadingStats(false);
    }
  }, [user, token]);

  useEffect(() => {
    if (user?.role === 'Faculty') {
      fetchFacultyStats(facultyStats.selectedYear);
    }
  }, [user, fetchFacultyStats, facultyStats.selectedYear]);

   const handleYearChange = (event) => {
    setFacultyStats(prevState => ({
        ...prevState,
        selectedYear: parseInt(event.target.value),
    }));
  };


  if (!user) {
    return <div className="p-6 text-center text-gray-500">Loading your dashboard...</div>;
  }

  if (user.role === "HOD") return <HodDashboard />;
  if (user.role === "Venue Incharge") return <VenueDashboard />;

  // Prepare data for charts
  const bookingStatusData = {
    labels: ['Approved', 'Rejected', 'Pending'], // Added Pending label
    datasets: [
      {
        label: 'Number of Bookings',
        data: [facultyStats.approvedBookings, facultyStats.rejectedBookings, facultyStats.pendingBookings], // Added pending data
        backgroundColor: ['#4CAF50', '#F44336', '#FFC107'], // Added color for Pending
        hoverBackgroundColor: ['#66BB6A', '#E57373', '#FFD54F'], // Added hover color for Pending
      },
    ],
  };

  const monthlyBookingData = {
    labels: Object.keys(facultyStats.monthlyBookings).sort((a,b) => new Date(a) - new Date(b)).map(monthYear => {
        const [year, month] = monthYear.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleString('default', { month: 'short' });
    }),
    datasets: [
      {
        label: 'Number of Bookings',
        data: Object.values(facultyStats.monthlyBookings),
        backgroundColor: '#2196F3',
      }
    ],
  };

   // Chart options for Pie chart
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

   // Options for Bar chart specifically
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
                    const [year, month] = monthYearLabel.split('-');
                     const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
                    return `${monthName} ${year}`;
                },
                 label: function(tooltipItem) {
                    return `Bookings: ${tooltipItem.raw}`;
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
        },
    },
   };

  // ✅ Default for Faculty/Student
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Welcome, {user.name}!</h1>
      
      {user.role === 'Faculty' && (
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold text-gray-700 border-b pb-2">Your Booking Statistics</h2>

          {loadingStats ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 text-lg">Loading statistics...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-red-600 bg-red-50 rounded-lg">{error}</div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total Bookings Made */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 font-semibold">Total Bookings Made</p>
                    <p className="text-3xl font-bold text-blue-800 mt-1">{facultyStats.totalBookingsMade}</p>
                  </div>
                  <div className="bg-blue-100 p-4 rounded-full flex-shrink-0">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                </div>

                {/* Approved Bookings */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 font-semibold">Approved Bookings</p>
                    <p className="text-3xl font-bold text-green-800 mt-1">{facultyStats.approvedBookings}</p>
                  </div>
                  <div className="bg-green-100 p-4 rounded-full flex-shrink-0">
                     <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                </div>

                 {/* Rejected Bookings */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-700 font-semibold">Rejected Bookings</p>
                    <p className="text-3xl font-bold text-red-800 mt-1">{facultyStats.rejectedBookings}</p>
                  </div>
                  <div className="bg-red-100 p-4 rounded-full flex-shrink-0">
                     <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                </div>

                {/* Pending Bookings */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex items-center justify-between"> {/* Added card for Pending Bookings */}
                  <div>
                    <p className="text-sm text-yellow-700 font-semibold">Pending Bookings</p> {/* Adjusted text color and weight */}
                    <p className="text-3xl font-bold text-yellow-800 mt-1">{facultyStats.pendingBookings}</p> {/* Increased text size and weight, added margin */}
                  </div>
                  <div className="bg-yellow-100 p-4 rounded-full flex-shrink-0"> {/* Increased padding and flex-shrink */}
                     <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> {/* Example icon for pending */}
                  </div>
                </div>

              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Accepted vs Rejected vs Pending Chart - Pie Chart */}
                 <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-[480px] flex flex-col items-center justify-center">
                   <h3 className="text-xl font-semibold text-gray-700 mb-4">Booking Status Breakdown</h3>
                   <div className="relative h-64 w-full"> 
                   {
                     facultyStats.totalBookingsMade > 0 ? (
                      <Pie data={bookingStatusData} options={pieChartOptions} />
                     ) : (
                      <div className="text-gray-500 text-center">No booking data available for charts.</div>
                     )
                   }
                   </div>
                 </div>

                 {/* Monthly Bookings Chart - Bar Chart */}
                  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-[480px] flex flex-col">
                   <h3 className="text-xl font-semibold text-gray-700 mb-4">Monthly Booking Trend</h3>
                   {/* Year Selection */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Year</label>
                        <select
                            value={facultyStats.selectedYear}
                            onChange={handleYearChange}
                            className="w-full max-w-xs border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            {facultyStats.availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    {
                       Object.keys(facultyStats.monthlyBookings).length > 0 ? (
                         <div className="flex-grow-0 flex-shrink-0 h-3/4 w-full"> 
                           <Bar data={monthlyBookingData} options={barChartOptions} /> 
                         </div>
                       ) : (
                         <div className="text-gray-500 text-center flex-grow-0 flex-shrink-0 h-3/4 w-full flex items-center justify-center"> 
                           No monthly booking data available for charts for {facultyStats.selectedYear}.
                         </div>
                       )
                    }
                 </div>
              </div>
            </>
          )}
        </div>
      )}

      {user.role === 'Student' && (
         <div className="space-y-6 p-6 bg-white rounded-lg shadow-md border border-gray-200">
           <h2 className="text-2xl font-semibold text-gray-700 border-b pb-2">Your Dashboard</h2>
           <p className="text-gray-600 text-lg">This is your dashboard as a {user.role}.</p>
           {/* Add student-specific content here if needed */}
         </div>
      )}

    </div>
  );
}
