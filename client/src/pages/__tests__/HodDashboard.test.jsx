import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import HodDashboard from '../HodDashboard';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock window.alert
window.alert = jest.fn();

// Mock user data
const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'HOD',
  department: 'Computer Science'
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

describe('HOD Dashboard Page', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    renderWithProviders(<HodDashboard />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders dashboard with bookings', async () => {
    const mockBookings = [
      {
        _id: 1,
        resourceId: { name: 'Room 101' },
        purpose: 'Faculty Meeting',
        userId: { name: 'Jane Smith', role: 'Faculty' },
        date: '2024-03-15',
        timeSlots: ['10:00', '11:00'],
        status: 'Pending',
        attendees: 10,
        department: 'Computer Science'
      },
      {
        _id: 2,
        resourceId: { name: 'Room 102' },
        purpose: 'Team Meeting',
        userId: { name: 'John Doe', role: 'Faculty' },
        date: '2024-03-16',
        timeSlots: ['14:00', '15:00'],
        status: 'Approved',
        attendees: 5,
        department: 'Computer Science'
      }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBookings
    });

    renderWithProviders(<HodDashboard />);

    // Check for header content
    await screen.findByText('HOD Dashboard');
    await screen.findByText('Department: Computer Science');
    await screen.findByText('Total Bookings:');
    await screen.findByText('2', { selector: 'span.text-xl' });

    // Check for filter buttons
    expect(screen.getByRole('button', { name: /All 2/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pending 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Approved 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Rejected 0/i })).toBeInTheDocument();

    // Check for booking details
    expect(screen.getByText('Room 101')).toBeInTheDocument();
    expect(screen.getByText('Faculty Meeting')).toBeInTheDocument();
    expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
    expect(screen.getByText('3/15/2024')).toBeInTheDocument();
    expect(screen.getByText(/10:00/)).toBeInTheDocument();
  });

  it('handles error state', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    renderWithProviders(<HodDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Failed to connect to server')).toBeInTheDocument();
    });
  });

  it('updates booking status', async () => {
    const mockBookings = [
      {
        _id: 1,
        resourceId: { name: 'Room 101' },
        purpose: 'Faculty Meeting',
        userId: { name: 'Jane Smith', role: 'Faculty' },
        date: '2024-03-15',
        timeSlots: ['10:00', '11:00'],
        status: 'Pending',
        attendees: 10,
        department: 'Computer Science'
      }
    ];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockBookings
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Booking status updated' })
      });

    renderWithProviders(<HodDashboard />);

    // Wait for bookings to load
    await waitFor(() => {
      expect(screen.getByText('Room 101')).toBeInTheDocument();
    });

    // Click approve button
    const approveButton = screen.getByRole('button', { name: 'Approve' });
    fireEvent.click(approveButton);

    // Check if status was updated
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'https://timoraworld.netlify.app/api/bookings/1/status',
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ status: 'Approved' })
        })
      );
    });
  });

  it('filters bookings by status', async () => {
    const mockBookings = [
      {
        _id: 1,
        resourceId: { name: 'Room 101' },
        purpose: 'Faculty Meeting',
        userId: { name: 'Jane Smith', role: 'Faculty' },
        date: '2024-03-15',
        timeSlots: ['10:00', '11:00'],
        status: 'Pending',
        attendees: 10,
        department: 'Computer Science'
      },
      {
        _id: 2,
        resourceId: { name: 'Room 102' },
        purpose: 'Team Meeting',
        userId: { name: 'John Doe', role: 'Faculty' },
        date: '2024-03-16',
        timeSlots: ['14:00', '15:00'],
        status: 'Approved',
        attendees: 5,
        department: 'Computer Science'
      }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBookings
    });

    renderWithProviders(<HodDashboard />);

    // Wait for bookings to load
    await waitFor(() => {
      expect(screen.getByText('Room 101')).toBeInTheDocument();
      expect(screen.getByText('Room 102')).toBeInTheDocument();
    });

    // Click Pending filter
    const pendingButton = screen.getByRole('button', { name: /Pending 1/i });
    fireEvent.click(pendingButton);

    // Check if only pending bookings are shown
    await screen.findByText('Room 101');
    expect(screen.queryByText('Room 102')).not.toBeInTheDocument();

    // Click Approved filter
    const approvedButton = screen.getByRole('button', { name: /Approved 1/i });
    fireEvent.click(approvedButton);

    // Check if only approved bookings are shown
    expect(screen.queryByText('Room 101')).not.toBeInTheDocument();
    await screen.findByText('Room 102');
  });
}); 