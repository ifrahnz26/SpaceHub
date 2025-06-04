import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API = process.env.REACT_APP_API_URL;

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/bookings/my`, {
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
      setError("Error loading bookings");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleDelete = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) {
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      
      if (res.ok) {
        // Refresh the bookings list
        fetchBookings();
      } else {
        setError(data.error || "Failed to delete booking");
      }
    } catch (err) {
      setError("Error deleting booking");
      console.error("Error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark"></div>
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
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-dark">My Bookings</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">All Bookings</h2>
          <button
            className="bg-accent text-white px-4 py-2 rounded hover:bg-pink-700"
            onClick={() => navigate("/new-booking")}
          >
            Add New Booking
          </button>
        </div>

        {bookings.length === 0 ? (
          <p className="text-gray-500">
            You don't have any bookings yet. Create a new booking to get started!
          </p>
        ) : (
          <table className="w-full text-sm border">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">Date</th>
                <th className="p-2">Time Slots</th>
                <th className="p-2">Resource</th>
                <th className="p-2">Purpose</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id} className="border-t">
                  <td className="p-2">{booking.date}</td>
                  <td className="p-2">
                    {booking.timeSlots?.join(", ")}
                  </td>
                  <td className="p-2">{booking.resource?.name || "—"}</td>
                  <td className="p-2">{booking.purpose}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        booking.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : booking.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => handleDelete(booking._id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
