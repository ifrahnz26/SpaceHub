import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getApiUrl, API_ENDPOINTS } from '../utils/api';

export default function VenueSchedule() {
  const [schedule, setSchedule] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [weekDates, setWeekDates] = useState([]);
  const [venues, setVenues] = useState([]);
  const [selectedVenueId, setSelectedVenueId] = useState("");
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const timeSlots = [
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 13:00",
    "13:00 - 14:00",
    "14:00 - 15:00",
    "15:00 - 16:00"
  ];

  // Get week dates based on selected date
  const getWeekDates = (date) => {
    const startDate = new Date(date);
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(startDate.setDate(diff));
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + i);
      dates.push(currentDate.toISOString().split('T')[0]);
    }
    return dates;
  };

  // Fetch all venues for faculty and HOD
  useEffect(() => {
    const fetchVenues = async () => {
      if (user?.role === "Venue Incharge") {
        // For venue incharge, use their assigned venue
        setSelectedVenueId(user.assignedVenueId);
        return;
      }

      try {
        const res = await fetch(getApiUrl(API_ENDPOINTS.RESOURCES.BASE), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setVenues(Array.isArray(data) ? data : data.resources || []);
          if ((Array.isArray(data) ? data : data.resources || []).length > 0) {
            setSelectedVenueId((Array.isArray(data) ? data : data.resources || [])[0]._id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch venues:", err);
      }
    };

    fetchVenues();
  }, [user, token]);

  useEffect(() => {
    const dates = getWeekDates(selectedDate);
    setWeekDates(dates);
  }, [selectedDate]);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        if (!selectedVenueId) return;

        // Fetch schedule for the entire week
        const promises = weekDates.map(date => 
          fetch(
            getApiUrl(`${API_ENDPOINTS.BOOKINGS.VENUE_SCHEDULE}?venueId=${selectedVenueId}&date=${date}`),
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ).then(res => {
            if (!res.ok) {
              throw new Error(`Failed to fetch schedule: ${res.statusText}`);
            }
            return res.json();
          })
        );

        const results = await Promise.all(promises);
        const allBookings = results.flat();
        console.log('Fetched bookings:', allBookings); // Debug log
        setSchedule(allBookings);
      } catch (err) {
        console.error("Failed to load schedule:", err);
        setSchedule([]); // Reset schedule on error
      }
    };

    if (selectedVenueId && weekDates.length > 0) {
      fetchSchedule();
    }
  }, [selectedVenueId, weekDates, token]);

  const getBookingForSlot = (date, slot) => {
    return schedule.find(b => {
      if (b.date !== date) return false;
      
      // Convert the slot format to match database format
      const [startTime] = slot.split(' - ');
      const dbSlots = b.timeSlots.map(dbSlot => {
        const [dbStart] = dbSlot.split('-');
        return dbStart.trim();
      });
      
      return dbSlots.includes(startTime);
    });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Venue Schedule</h1>

      <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-200">
        <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="space-y-4 md:space-y-0 md:space-x-4 flex flex-col md:flex-row">
            {user?.role !== "Venue Incharge" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Venue
                </label>
                <select
                  value={selectedVenueId}
                  onChange={(e) => setSelectedVenueId(e.target.value)}
                  className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2 w-full md:w-auto"
                >
                  {venues.map(venue => (
                    <option key={venue._id} value={venue._id}>
                      {venue.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Week Starting Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2 w-full md:w-auto"
              />
            </div>
          </div>
          <div className="text-base text-gray-600 font-medium">
            Week of {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
          </div>
        </div>

        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Time
                </th>
                {weekDates.map(date => (
                  <th key={date} className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                    {formatDate(date)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timeSlots.map((slot) => (
                <tr key={slot} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {slot}
                  </td>
                  {weekDates.map(date => {
                    const booking = getBookingForSlot(date, slot);
                    return (
                      <td key={`${date}-${slot}`} className="px-6 py-4 text-center align-top">
                        {booking ? (
                          <div className={`p-2 rounded-md text-xs font-medium shadow-sm ${
                              booking.blockedByIncharge 
                                ? "bg-red-500 text-white"
                                : booking.status === "Approved"
                                ? "bg-green-500 text-white"
                                : "bg-yellow-500 text-white"
                            }`}>
                              {/* Check if purpose is defined before displaying */}
                              {booking.purpose ? booking.purpose : 'Blocked'}
                            </div>
                        ) : (
                          <span className="text-xs text-gray-500">Available</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 