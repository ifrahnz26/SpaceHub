import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:5001/api/bookings/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setBookings(data);
        } else {
          console.error("Failed to fetch bookings");
        }
      } catch (err) {
        console.error("Error:", err);
      }
    };

    fetchBookings();
  }, []);

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
            add New Booking
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
