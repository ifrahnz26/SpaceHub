import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import VenueDashboard from '../VenueDashboard';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock user data
const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'Venue Incharge',
  assignedVenueId: 'venue123'
};

const renderWithProviders = (component) => {
  // Mock localStorage.getItem to return JSON stringified user data
  mockLocalStorage.getItem.mockImplementation((key) => {
    if (key === 'user') {
      return JSON.stringify(mockUser);
    }
    if (key === 'token') {
      return 'mock-token';
    }
    return null;
  });

  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Venue Dashboard Page', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    renderWithProviders(<VenueDashboard />);
    expect(screen.getByText('Loading venue details...')).toBeInTheDocument();
  });

  it('renders venue details and statistics', async () => {
    const mockVenue = {
      _id: 'venue123',
      name: 'Conference Room A',
      type: 'Conference Room',
      department: 'Computer Science',
      capacity: 50,
      features: 'Projector, Whiteboard',
      description: 'Main conference room for department meetings'
    };

    const mockEvents = [
      {
        _id: 'event1',
        venue: 'venue123',
        duration: 2
      },
      {
        _id: 'event2',
        venue: 'venue123',
        duration: 1
      }
    ];

    const mockBookings = [
      {
        _id: 'booking1',
        resourceId: { _id: 'venue123' },
        status: 'Approved'
      },
      {
        _id: 'booking2',
        resourceId: { _id: 'venue123' },
        status: 'Approved'
      }
    ];

    // Mock API responses
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockVenue
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockEvents
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockBookings
      });

    renderWithProviders(<VenueDashboard />);

    // Check for header content
    await waitFor(() => {
      expect(screen.getByText('Venue Dashboard')).toBeInTheDocument();
    });

    // Check for venue details
    expect(screen.getByText('Assigned Venue Details')).toBeInTheDocument();
    expect(screen.getByText('Conference Room A')).toBeInTheDocument();
    expect(screen.getByText('Conference Room')).toBeInTheDocument();
    expect(screen.getByText('Computer Science')).toBeInTheDocument();
    expect(screen.getByText('50 people')).toBeInTheDocument();
    expect(screen.getByText('Projector, Whiteboard')).toBeInTheDocument();
    expect(screen.getByText('Main conference room for department meetings')).toBeInTheDocument();

    // Check for venue statistics
    expect(screen.getByText('Venue Statistics')).toBeInTheDocument();
    expect(screen.getByText('Total Events')).toBeInTheDocument();
    expect(screen.getByText('Total Duration')).toBeInTheDocument();
    expect(screen.getByText('Total Bookings')).toBeInTheDocument();
    expect(screen.getByText('3 hrs')).toBeInTheDocument();

    // Check for quick action links
    expect(screen.getByText('View Schedule')).toBeInTheDocument();
    expect(screen.getByText('Update Schedule')).toBeInTheDocument();
    expect(screen.getByText('Update Event Info')).toBeInTheDocument();
  });

  it('handles error state when no venue is assigned', async () => {
    // Mock fetch to simulate no venue assigned
    global.fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Failed to fetch'))
    );

    renderWithProviders(<VenueDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load venue details')).toBeInTheDocument();
    });
  });

  it('handles error state when venue fetch fails', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    renderWithProviders(<VenueDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load venue details')).toBeInTheDocument();
    });
  });
}); 