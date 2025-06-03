// API URL configuration
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

// Helper function to construct API URLs
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
  },
  BOOKINGS: {
    BASE: '/api/bookings',
    MY: '/api/bookings/my',
    HOD: '/api/bookings/hod',
    INCHARGE: '/api/bookings/incharge',
    AVAILABLE_SLOTS: '/api/bookings/available-slots',
    VENUE_SCHEDULE: '/api/bookings/venue-schedule',
    BLOCK: '/api/bookings/block',
  },
  RESOURCES: {
    BASE: '/api/resources',
    ALL: '/api/resources/all',
    DEPARTMENT: '/api/resources/department',
  },
  EVENTS: {
    BASE: '/api/events',
  },
  USERS: {
    ALL: '/api/users/all',
  },
}; 