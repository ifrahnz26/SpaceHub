import React, { useState, useEffect } from "react";
import { getApiUrl, API_ENDPOINTS } from '../utils/api';

export default function EventDetails() {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // Fetch all venues
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await fetch(getApiUrl(API_ENDPOINTS.RESOURCES.BASE), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setVenues(Array.isArray(data) ? data : data.resources || []);
          if ((Array.isArray(data) ? data : data.resources || []).length > 0) {
            setSelectedVenue((Array.isArray(data) ? data : data.resources || [])[0]._id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch venues:", err);
      }
    };

    fetchVenues();
  }, [token]);

  // Fetch events and filter by selected venue
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await fetch(getApiUrl(API_ENDPOINTS.EVENTS.BASE), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          // Filter events by selected venue
          const filteredEvents = data.filter(event => event.venue === selectedVenue);
          setEvents(filteredEvents);
        } else {
          console.error("Failed to fetch events:", data.error);
        }
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };

    if (selectedVenue) {
      fetchEvents();
    }
  }, [selectedVenue, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Event Details</h1>
        <p className="text-gray-600">View events for selected venue</p>
      </div>

      {/* Venue Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Venue
        </label>
        <select
          value={selectedVenue}
          onChange={(e) => setSelectedVenue(e.target.value)}
          className="w-full max-w-md border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {venues.map((venue) => (
            <option key={venue._id} value={venue._id}>
              {venue.name} - {venue.type}
            </option>
          ))}
        </select>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Events Found</h3>
          <p className="text-gray-500">There are no events for the selected venue.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105"
            >
              {event.posterImage && (
                <div className="relative h-[400px] w-full">
                  <img
                    src={event.posterImage}
                    alt={event.subjectOrType}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    {event.subjectOrType || "Untitled Event"}
                  </h3>
                  <span className="px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full">
                    {event.duration || "N/A"}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{event.time || "Time not specified"}</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{event.date ? new Date(event.date).toLocaleDateString() : "Date not specified"}</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{event.yearOfStudents?.join(", ") || "Year not specified"}</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>{event.department || "Department not specified"}</span>
                  </div>
                </div>

                {event.description && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-gray-600 text-sm">{event.description}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 