import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function HodDashboard() {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const API = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API}/bookings/hod`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        
        if (res.ok) {
          setBookings(data);
        } else {
          setError(data.error || "Failed to fetch bookings");
        }
      } catch (err) {
        setError("Failed to connect to server");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "HOD") {
      fetchBookings();
    }
  }, [token, user]);

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API}/bookings/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b))
        );
      } else {
        alert(data.error || "Update failed");
      }
    } catch (err) {
      alert("Server error");
    }
  };

  const filtered = statusFilter === "All" 
    ? bookings 
    : bookings.filter((b) => b.status === statusFilter);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div data-testid="loading-spinner" className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">HOD Dashboard</h1>
            <p className="mt-2 text-base text-gray-500">
              Department: {user?.department}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base text-gray-500">Total Bookings:</span>
            <span className="text-xl font-semibold text-gray-900">{bookings.length}</span>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
        <div className="flex flex-wrap gap-3">
          {["All", "Pending", "Approved", "Rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-5 py-2.5 rounded-full text-base font-medium transition-all duration-200 ${
                statusFilter === status
                  ? "bg-dark text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status}
              <span className="ml-2 px-2.5 py-0.5 rounded-full text-sm bg-white/20">
                {bookings.filter(b => status === "All" ? true : b.status === status).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-lg text-gray-500">No {statusFilter.toLowerCase()} bookings found.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filtered.map((b) => (
            <div key={b._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  {/* Left Section - Booking Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {b.resourceId?.name || "Unknown Resource"}
                        </h3>
                        <p className="text-base text-gray-500">{b.purpose}</p>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-base font-medium border ${getStatusColor(b.status)}`}>
                        {b.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center text-base text-gray-600">
                          <svg className="h-6 w-6 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {b.userId?.name || "Unknown"} ({b.userId?.role})
                        </div>
                        <div className="flex items-center text-base text-gray-600">
                          <svg className="h-6 w-6 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {b.userId?.department}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center text-base text-gray-600">
                          <svg className="h-6 w-6 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(b.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-base text-gray-600">
                          <svg className="h-6 w-6 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {b.timeSlots?.join(", ")}
                        </div>
                      </div>
                    </div>

                    {b.attendees && (
                      <div className="flex items-center text-base text-gray-600">
                        <svg className="h-6 w-6 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Expected Attendees: {b.attendees}
                      </div>
                    )}
                  </div>

                  {/* Right Section - Action Buttons */}
                  {b.status === "Pending" && (
                    <div className="flex flex-col gap-3 md:items-end">
                      <button
                        onClick={() => updateStatus(b._id, "Approved")}
                        className="px-5 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center gap-2 text-base"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(b._id, "Rejected")}
                        className="px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center gap-2 text-base"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
