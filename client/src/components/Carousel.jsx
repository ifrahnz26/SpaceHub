import React, { useState } from 'react';

export default function Carousel({ events }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === events.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? events.length - 1 : prevIndex - 1
    );
  };

  if (!events || events.length === 0) {
    return <p className="text-gray-500">No events available</p>;
  }

  const currentEvent = events[currentIndex];

  return (
    <div className="relative">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-64">
          {currentEvent.posterImage ? (
            <img 
            src={currentEvent.posterImage}
            alt={currentEvent.subjectOrType}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-2">{currentEvent.subjectOrType}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p><span className="font-medium">Duration:</span> {currentEvent.duration}</p>
            <p><span className="font-medium">Year:</span> {currentEvent.yearOfStudents?.join(', ')}</p>
            <p><span className="font-medium">Department:</span> {currentEvent.department}</p>
            <p><span className="font-medium">Venue:</span> {currentEvent.venue?.name || 'Unknown Venue'}</p>
            <p><span className="font-medium">Date:</span> {new Date(currentEvent.date).toLocaleDateString()}</p>
            <p><span className="font-medium">Time:</span> {currentEvent.time}</p>
          </div>
          <p className="mt-2 text-sm text-gray-600">{currentEvent.description}</p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-r hover:bg-black/70"
      >
        ←
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-l hover:bg-black/70"
      >
        →
      </button>

      {/* Dots Indicator */}
      <div className="flex justify-center mt-4 space-x-2">
        {events.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full ${
              index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
} 