import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import VenueDashboard from '../VenueDashboard';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(() => 'mock-token'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

const mockVenueData = {
  venue: {
    _id: '1',
    name: 'Room 101',
    type: 'classroom',
    capacity: 50,
    department: 'Computer Science'
  },
  stats: {
    totalBookings: 30,
    todayBookings: 5,
    upcomingBookings: 10,
    cancelledBookings: 2
  },
  currentBookings: [
    {
      _id: '1',
      date: '2024-03-20',
      timeSlots: ['09:00 - 10:00'],
      purpose: 'Team Meeting',
      status: 'approved',
      user: {
        name: 'John Doe',
        email: 'john@example.com'
      }
    },
    {
      _id: '2',
      date: '2024-03-20',
      timeSlots: ['14:00 - 15:00'],
      purpose: 'Conference',
      status: 'pending',
      user: {
        name: 'Jane Smith',
        email: 'jane@example.com'
      }
    }
  ]
};

const renderWithProviders = (component) => {
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
    fetch.mockClear();
    mockLocalStorage.getItem.mockClear();
  });

  test('renders dashboard with loading state initially', () => {
    renderWithProviders(<VenueDashboard />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('displays venue information after successful fetch', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockVenueData)
      })
    );

    renderWithProviders(<VenueDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Room 101')).toBeInTheDocument();
      expect(screen.getByText('classroom')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument(); // Capacity
      expect(screen.getByText('Computer Science')).toBeInTheDocument();
    });
  });

  test('displays venue statistics', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockVenueData)
      })
    );

    renderWithProviders(<VenueDashboard />);

    await waitFor(() => {
      expect(screen.getByText('30')).toBeInTheDocument(); // Total bookings
      expect(screen.getByText('5')).toBeInTheDocument(); // Today's bookings
      expect(screen.getByText('10')).toBeInTheDocument(); // Upcoming bookings
      expect(screen.getByText('2')).toBeInTheDocument(); // Cancelled bookings
    });
  });

  test('displays current bookings', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockVenueData)
      })
    );

    renderWithProviders(<VenueDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Team Meeting')).toBeInTheDocument();
      expect(screen.getByText('Conference')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  test('handles booking cancellation', async () => {
    fetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockVenueData)
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Booking cancelled successfully' })
        })
      );

    renderWithProviders(<VenueDashboard />);

    await waitFor(() => {
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/booking cancelled successfully/i)).toBeInTheDocument();
    });
  });

  test('handles refresh functionality', async () => {
    fetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockVenueData)
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            ...mockVenueData,
            stats: { ...mockVenueData.stats, totalBookings: 31 }
          })
        })
      );

    renderWithProviders(<VenueDashboard />);

    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);
    });

    await waitFor(() => {
      expect(screen.getByText('31')).toBeInTheDocument(); // Updated total bookings
    });
  });

  test('displays error message when fetch fails', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Failed to fetch'))
    );

    renderWithProviders(<VenueDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/error loading venue data/i)).toBeInTheDocument();
    });
  });

  test('filters bookings by date', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockVenueData)
      })
    );

    renderWithProviders(<VenueDashboard />);

    await waitFor(() => {
      const dateInput = screen.getByLabelText(/filter by date/i);
      fireEvent.change(dateInput, { target: { value: '2024-03-20' } });
    });

    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    expect(screen.getByText('Conference')).toBeInTheDocument();
  });

  test('navigates to schedule update page', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockVenueData)
      })
    );

    renderWithProviders(<VenueDashboard />);

    await waitFor(() => {
      const updateScheduleButton = screen.getByRole('button', { name: /update schedule/i });
      fireEvent.click(updateScheduleButton);
    });

    // Verify navigation
    expect(window.location.pathname).toBe('/venue/1/schedule/update');
  });
}); 