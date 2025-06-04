import React, { useState } from "react";

export default function BlockSlotsForm({ resources, onBlock }) {
  const [date, setDate] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [purpose, setPurpose] = useState("");
  const token = localStorage.getItem("token");
  const API = process.env.REACT_APP_API_URL;

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
      const response = await fetch(`${API}/bookings/block`, {
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

      if (response.ok) {
        alert("Blocked successfully");
        onBlock();
      } else {
        alert("Failed to block");
      }
    } catch (error) {
      console.error("Error blocking slots:", error);
      alert("An error occurred");
    }
  };

  return (
    <div>
      {/* Render your form components here */}
    </div>
  );
}
