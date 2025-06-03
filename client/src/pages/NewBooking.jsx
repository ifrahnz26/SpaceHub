import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getApiUrl, API_ENDPOINTS } from '../utils/api';

const departments = ["CSE", "ISE", "AIML"];

export default function NewBooking() {
  const [selectedDept, setSelectedDept] = useState("CSE");
  const [resources, setResources] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [form, setForm] = useState({
    date: "",
    purpose: "",
    attendees: 1,
    resourceId: "",
    timeSlots: [],
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // 🔄 Fetch resources when department changes (Memoized function)
  const fetchResources = useCallback(async () => {
    try {
      console.log("Fetching resources for department:", selectedDept);
      const res = await fetch(getApiUrl(`${API_ENDPOINTS.RESOURCES.DEPARTMENT}/${selectedDept}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("Resources data:", data);
      setResources(Array.isArray(data) ? data : data.resources || []);
      console.log("Resources state after setting:", Array.isArray(data) ? data : data.resources || []);
    } catch (err) {
      console.error("Failed to load resources", err);
      setResources([]);
    }
  }, [selectedDept, token]);

  // 🔄 Effect to fetch resources when department changes
  useEffect(() => {
    fetchResources();
  }, [selectedDept, fetchResources]);

  // 🔄 Fetch available time slots when resource or date changes
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!form.resourceId || !form.date) return;
      try {
        const res = await fetch(getApiUrl(`${API_ENDPOINTS.BOOKINGS.AVAILABLE_SLOTS}?resourceId=${form.resourceId}&date=${form.date}`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAvailableSlots(data.availableSlots || []);
      } catch (err) {
        console.error("Failed to fetch available slots:", err);
        setAvailableSlots([]);
      }
    };
    fetchAvailableSlots();
  }, [form.resourceId, form.date, token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSlotToggle = (slot) => {
    const updated = form.timeSlots.includes(slot)
      ? form.timeSlots.filter((s) => s !== slot)
      : [...form.timeSlots, slot];
    setForm({ ...form, timeSlots: updated });
  };

  const handleSubmit = async () => {
    const { resourceId, date, timeSlots, purpose, attendees } = form;

    if (!resourceId || !date || !purpose || !attendees || timeSlots.length === 0) {
      alert("Missing required fields");
      return;
    }

    const bookingData = {
      ...form,
      department: selectedDept,
    };

    try {
      const res = await fetch(getApiUrl(API_ENDPOINTS.BOOKINGS.BASE), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Booking request submitted successfully");
        navigate("/my-bookings");
      } else {
        alert(data.error || "Booking failed");
      }
    } catch (err) {
      alert("Server error");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-dark">New Booking Request</h1>

      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-lg font-medium mb-4 text-dark">Select Department & Resource</h2>

        <div className="flex gap-6 text-primary border-b mb-6">
          {departments.map((dept) => (
            <button
              key={dept}
              className={`pb-2 font-medium ${
                selectedDept === dept ? "border-b-2 border-primary text-primary" : "text-gray-400"
              }`}
              onClick={() => setSelectedDept(dept)}
            >
              {dept}
            </button>
          ))}
        </div>

        {resources.length > 0 ? (
          <select
            name="resourceId"
            value={form.resourceId}
            onChange={handleChange}
            className="mb-6 border px-3 py-2 rounded w-full"
            required
          >
            <option value="">Select a Resource</option>
            {resources.map((res) => (
              <option key={res._id} value={res._id}>
                {res.name}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-gray-500 mb-6">No resources found for this department.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="date" className="block text-sm text-gray-600 mb-1">Date</label>
            <input
              id="date"
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-full"
              required
            />
          </div>

          <div>
            <label htmlFor="attendees" className="block text-sm text-gray-600 mb-1">Number of Attendees</label>
            <input
              id="attendees"
              type="number"
              name="attendees"
              min="1"
              value={form.attendees}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-full"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="purpose" className="block text-sm text-gray-600 mb-1">Purpose</label>
            <textarea
              id="purpose"
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              rows={2}
              className="border rounded px-3 py-2 w-full"
              placeholder="Describe the purpose of booking"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-2">Available Time Slots</label>
            {availableSlots.length === 0 ? (
              <p className="text-gray-500">Select resource and date to see available slots.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableSlots.map((slot) => (
                  <label key={slot} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={slot}
                      checked={form.timeSlots.includes(slot)}
                      onChange={() => handleSlotToggle(slot)}
                      className="accent-primary"
                    />
                    <span>{slot}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            className="bg-gray-200 text-dark px-4 py-2 rounded hover:bg-gray-300"
            type="button"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-dark text-white px-4 py-2 rounded hover:bg-gray-800"
            type="button"
          >
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
}
