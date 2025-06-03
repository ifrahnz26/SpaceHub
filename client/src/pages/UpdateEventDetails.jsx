import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import { getApiUrl, API_ENDPOINTS } from '../utils/api';

export default function UpdateEventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [details, setDetails] = useState({
    subjectOrType: '',
    description: '',
    duration: '',
    yearOfStudents: [],
    usagePurpose: '',
    department: '',
    date: '',
    time: '',
    posterImage: null,
    venue: user?.assignedVenueId || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [assignedVenueName, setAssignedVenueName] = useState('');

  useEffect(() => {
    const fetchVenueDetails = async () => {
      if (!user?.assignedVenueId) return;

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(getApiUrl(`${API_ENDPOINTS.RESOURCES.BASE}/${user.assignedVenueId}`), {
          hheaders: {
            'Authorization': `Bearer ${token}`,
          },
          
        });
        const data = await res.json();
        if (res.ok) {
          console.log('Fetched assigned venue details:', data);
          setAssignedVenueName(data.name);
        } else {
          console.error('Failed to fetch venue details:', data.error);
        }
      } catch (err) {
        console.error('Error fetching venue details:', err);
      }
    };

    fetchVenueDetails();

    if (eventId) {
      const fetchEventDetails = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(getApiUrl(`${API_ENDPOINTS.EVENTS.BASE}/${eventId}`), {
            headers: {
              'Authorization': `Bearer ${token}'`,
            },
          });
          const data = await res.json();
          if (res.ok) {
            console.log('Fetched event details for update:', data);
            const eventDate = new Date(data.date);
            const formattedDate = eventDate.toISOString().split('T')[0];

            setDetails({
              ...data,
              date: formattedDate,
              venue:  user?.assignedVenueId || '',
            });
            setImagePreview(data.posterImage || null);

          } else {
            console.error('Failed to fetch event details for update:', data);
            setError(data.message || 'Failed to fetch event details');
          }
        } catch (err) {
          console.error('Error fetching event details:', err);
          setError('Failed to fetch event details');
        }
      };
      fetchEventDetails();
    }
  }, [eventId, user?.assignedVenueId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetails(prevDetails => ({
      ...prevDetails,
      [name]: value
    }));
  };

  const handleYearChange = (e) => {
    const { value, checked } = e.target;
    setDetails(prevDetails => {
      if (checked) {
        return { ...prevDetails, yearOfStudents: [...prevDetails.yearOfStudents, value] };
      } else {
        return { ...prevDetails, yearOfStudents: prevDetails.yearOfStudents.filter(year => year !== value) };
      }
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDetails(prevDetails => ({ ...prevDetails, posterImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setDetails(prevDetails => ({ ...prevDetails, posterImage: null }));
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    for (const key in details) {
      if (key !== 'posterImage' && key !== 'yearOfStudents') {
         formData.append(key, details[key]);
      } else if (key === 'yearOfStudents') {
        details.yearOfStudents.forEach(year => formData.append('yearOfStudents[]', year));
      }
    }

    if (details.posterImage) {
      formData.append('posterImage', details.posterImage);
    }

    console.log('Venue ID being sent in formData:', formData.get('venue'));

    try {
      const token = localStorage.getItem('token');
      const url = eventId ? getApiUrl(`${API_ENDPOINTS.EVENTS.BASE}/${eventId}`) : getApiUrl(API_ENDPOINTS.EVENTS.BASE);
      const method = eventId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        console.log('Event saved successfully:', data);
        navigate('/venue/dashboard');
      } else {
        console.error('Error saving event:', data);
        setError(data.message || 'Failed to save event');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to save event. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6">{eventId ? 'Update Event Details' : 'Create New Event'}</h1>
      
      {error && <div className="text-red-600 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-700">Assigned Venue</label>
            {assignedVenueName ? (
              <p className="mt-1 text-lg font-medium text-gray-900">{assignedVenueName}</p>
            ) : (
              <p className="mt-1 text-gray-500">Loading venue...</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700">Subject / Type</label>
            <input 
              type="text" 
              name="subjectOrType"
              value={details.subjectOrType}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Duration</label>
            <input 
              type="text" 
              name="duration"
              value={details.duration}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
          
          <div>
            <label className="block text-gray-700">Date</label>
            <input 
              type="date" 
              name="date"
              value={details.date}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              required
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-gray-700">Year of Students</label>
            <div className="mt-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5].map(year => (
                <label key={year} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    value={year.toString()}
                    checked={details.yearOfStudents.includes(year.toString())}
                    onChange={handleYearChange}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-600">Year {year}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-700">Usage Purpose</label>
            <input 
              type="text" 
              name="usagePurpose"
              value={details.usagePurpose}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-gray-700">Department</label>
            <input 
              type="text" 
              name="department"
              value={details.department}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-gray-700">Time</label>
            <input 
              type="text" 
              name="time"
              value={details.time}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-gray-700">Poster Image</label>
            <input 
              type="file" 
              name="posterImage"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-500\n                 file:mr-4 file:py-2 file:px-4\n                 file:rounded-full file:border-0\n                 file:text-sm file:font-semibold\n                 file:bg-blue-50 file:text-blue-700\n                 hover:file:bg-blue-100"
            />
            {imagePreview && (
              <div className="mt-4 w-48 h-48 overflow-hidden rounded-md border">
                <img src={imagePreview} alt="Poster Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700">Description</label>
          <textarea
            name="description"
            value={details.description}
            onChange={handleChange}
            rows="4"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          ></textarea>
        </div>

        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Saving...' : (eventId ? 'Update Event Info' : 'Save Event Info')}
        </button>
      </form>
    </div>
  );
}
