import React, { useState } from "react";

export default function BlockSlotsForm({ resources, onBlock }) {
  const [date, setDate] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [purpose, setPurpose] = useState("");
  const token = localStorage.getItem("token");

  const allTimeSlots = [
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 13:00",
    "13:00 - 14:00",
    "14:00 - 15:00",
    "15:00 - 16:00"
  ];

  const handleTimeSlotToggle = (slot) => {
    setTimeSlots(prev =>
      prev.includes(slot)
        ? prev.filter(s => s !== slot)
        : [...prev, slot]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!date || timeSlots.length === 0 || !purpose) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/api/bookings/block", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resourceId: resources[0]._id,
          date,
          timeSlots,
          reason: purpose,
          blocked: true,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert("Slots blocked successfully");
        setDate("");
        setTimeSlots([]);
        setPurpose("");
        if (onBlock) onBlock();
      } else {
        alert(data.error || "Failed to block slots");
      }
    } catch (error) {
      console.error("Error blocking slots:", error);
      alert("Failed to block slots");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          min={new Date().toISOString().split("T")[0]}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Time Slots</label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {allTimeSlots.map((slot) => (
            <label
              key={slot}
              className="inline-flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={timeSlots.includes(slot)}
                onChange={() => handleTimeSlotToggle(slot)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">{slot}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Purpose</label>
        <textarea
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="Enter reason for blocking these slots"
        />
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Block Selected Slots
      </button>
    </form>
  );
}
