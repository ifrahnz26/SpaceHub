import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

export default function VenueDashboard() {
  const [assignedResource, setAssignedResource] = useState(null);
  const [venueStats, setVenueStats] = useState({
    totalEvents: 0,
    totalDuration: 0,
    totalBookings: 0
  });
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const fetchResources = useCallback(async () => {
    try {
      if (!user?.assignedVenueId) {
        setError("No venue assigned to this incharge");
        return;
      }

      const res = await fetch(`http://localhost:5001/api/resources/${user.assignedVenueId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (res.ok) {
        setAssignedResource(data);
        setError(null);
      } else {
        setError(data.error || "Failed to load venue details");
      }
    } catch (err) {
      console.error("Failed to load assigned resource", err);
      setError("Failed to load venue details");
    }
  }, [user?.assignedVenueId, token]);

  const fetchVenueStats = useCallback(async () => {
    try {
      if (!user?.assignedVenueId) return;

      console.log("Fetching stats for venue:", user.assignedVenueId);

      // Fetch events for the venue
      const eventsRes = await fetch(`http://localhost:5001/api/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const eventsData = await eventsRes.json();
      
      console.log("All events:", eventsData);
      
      if (eventsRes.ok) {
        // Filter events for this venue using the venue field
        const venueEvents = eventsData.filter(event => {
          console.log("Comparing event venue:", event.venue, "with assigned venue:", user.assignedVenueId);
          return String(event.venue) === String(user.assignedVenueId);
        });
        
        console.log("Filtered venue events:", venueEvents);
        
        // Calculate total duration from the duration field
        const totalDuration = venueEvents.reduce((sum, event) => {
          const duration = parseInt(event.duration) || 0;
          console.log("Event duration:", duration);
          return sum + duration;
        }, 0);

        console.log("Total duration:", totalDuration);

        // Fetch bookings for the venue
        const bookingsRes = await fetch(`http://localhost:5001/api/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const bookingsData = await bookingsRes.json();
        
        console.log("All bookings:", bookingsData);
        
        if (bookingsRes.ok) {
          // Filter bookings for this venue using resourceId._id and status
          const venueBookings = bookingsData.filter(booking => {
            console.log("Comparing booking resourceId._id:", booking.resourceId?._id, "with assigned venue:", user.assignedVenueId);
            console.log("Checking booking status:", booking.status);
            return String(booking.resourceId?._id) === String(user.assignedVenueId) && booking.status === "Approved";
          });

          console.log("Filtered venue bookings (Approved only):", venueBookings);

          setVenueStats({
            totalEvents: venueEvents.length,
            totalDuration: totalDuration,
            totalBookings: venueBookings.length
          });

          console.log("Updated venue stats:", {
            totalEvents: venueEvents.length,
            totalDuration: totalDuration,
            totalBookings: venueBookings.length
          });
        }
      }
    } catch (err) {
      console.error("Failed to load venue statistics:", err);
    }
  }, [user?.assignedVenueId, token]);

  useEffect(() => {
    if (user?.assignedVenueId) {
      console.log("User assigned venue ID:", user.assignedVenueId);
      fetchResources();
      fetchVenueStats();
    }
  }, [user, fetchResources, fetchVenueStats]);

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <h2 className="text-xl font-semibold mb-2">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!assignedResource) {
    return <div className="p-4">Loading venue details...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-dark">Venue Dashboard</h1>
      
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-medium mb-4 text-dark">Assigned Venue Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Basic Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {assignedResource.name}</p>
              <p><span className="font-medium">Type:</span> {assignedResource.type}</p>
              <p><span className="font-medium">Department:</span> {assignedResource.department}</p>
              <p><span className="font-medium">Capacity:</span> {assignedResource.capacity} people</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Features & Description</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Features:</span> {assignedResource.features}</p>
              <p><span className="font-medium">Description:</span> {assignedResource.description}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="/venue/schedule" 
              className="bg-blue-100 text-blue-700 p-3 rounded-lg text-center hover:bg-blue-200"
            >
              View Schedule
            </a>
            <a 
              href="/venue/update-schedule" 
              className="bg-green-100 text-green-700 p-3 rounded-lg text-center hover:bg-green-200"
            >
              Update Schedule
            </a>
            <a 
              href="/venue/update-event" 
              className="bg-purple-100 text-purple-700 p-3 rounded-lg text-center hover:bg-purple-200"
            >
              Update Event Info
            </a>
          </div>
        </div>
      </div>

      {/* Venue Statistics Section */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-medium mb-4 text-dark">Venue Statistics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Events Card */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Events</p>
                <p className="text-2xl font-bold text-blue-700">{venueStats.totalEvents}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Duration Card */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Total Duration</p>
                <p className="text-2xl font-bold text-purple-700">{venueStats.totalDuration} hrs</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Bookings Card */}
          <div className="bg-indigo-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-600 font-medium">Total Bookings</p>
                <p className="text-2xl font-bold text-indigo-700">{venueStats.totalBookings}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
