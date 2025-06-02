import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import BlockSlotsForm from "../components/BlockSlotsForm";

export default function UpdateVenueSchedule() {
  const [assignedResource, setAssignedResource] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  // ✅ Fetch the specific venue assigned to this incharge
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

  // ✅ Fetch bookings (including blocked) for the incharge's department
  const fetchBookings = useCallback(async () => {
    try {
      if (!user?.department) {
        setError("No department assigned to this incharge");
        return;
      }

      const res = await fetch(`http://localhost:5001/api/bookings/incharge`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        // Filter bookings to only show those for the assigned venue
        const venueBookings = data.filter(booking => booking.resourceId?._id === user.assignedVenueId);
        setBookings(venueBookings);
      } else {
        setError(data.error || "Failed to load bookings");
      }
    } catch (err) {
      console.error("Failed to load bookings", err);
      setError("Failed to load bookings");
    }
  }, [user?.department, user?.assignedVenueId, token]);

  // ✅ Handle unblock slot
  const handleUnblock = async (bookingId) => {
    try {
      const res = await fetch(`http://localhost:5001/api/bookings/block/${bookingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        alert("Slot unblocked successfully");
        fetchBookings(); // Refresh the bookings list
      } else {
        alert(data.message || "Failed to unblock slot");
      }
    } catch (err) {
      console.error("Error unblocking slot:", err);
      alert("Failed to unblock slot");
    }
  };

  useEffect(() => {
    if (user?.assignedVenueId && user?.department) {
      fetchResources();
      fetchBookings();
    }
  }, [user?.assignedVenueId, user?.department, fetchResources, fetchBookings]);

  if (error) {
    return (
      <div className="p-6 text-red-600 bg-red-50 rounded-lg border border-red-200">
        <h2 className="text-xl font-semibold mb-2">Error Loading Venue Schedule</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!assignedResource) {
    return <div className="p-6 text-center text-gray-500">Loading venue details...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Update Venue Schedule</h1>

      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Manage Schedule for {assignedResource.name}
        </h2>

        {/* Block/Unblock Slots Form */}
        <div className="mb-8 pb-8 border-b border-gray-200">
           <h3 className="text-xl font-semibold text-gray-700 mb-4">Block New Slots</h3>
           <BlockSlotsForm 
             resources={[assignedResource]} 
             onBlock={fetchBookings} // Pass fetchBookings to refresh list after blocking
           />
        </div>

        {/* Current Blocked Slots */}
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Currently Blocked Slots</h3>
          {bookings.filter(b => b.blocked).length === 0 ? (
            <div className="p-4 bg-gray-100 rounded-md text-gray-600 text-center border border-gray-200">
              No slots are currently blocked for {assignedResource.name}.
            </div>
          ) : (
            <div className="grid gap-6">
              {bookings
                .filter(b => b.blocked)
                .map(booking => (
                  <div key={booking._id} className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">Blocked Date: <span className="font-normal text-gray-600">{booking.date}</span></p>
                      <p className="text-sm text-gray-700 mt-1">
                        Time Slots: <span className="font-normal text-gray-600">{booking.timeSlots.join(", ")}</span>
                      </p>
                      <p className="text-sm text-gray-700">
                        Reason: <span className="font-normal text-gray-600">{booking.purpose}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleUnblock(booking._id)}
                      className="text-red-600 hover:text-red-800 font-medium py-2 px-4 border border-red-600 hover:border-red-800 rounded-md transition duration-200"
                    >
                      Unblock
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 