import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Dashboard from '../Dashboard';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(() => 'mock-token'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

const mockDashboardData = {
  stats: {
    totalBookings: 50,
    pendingBookings: 10,
    approvedBookings: 35,
    rejectedBookings: 5
  },
  recentBookings: [
    {
      _id: '1',
      resource: {
        name: 'Room 101',
        type: 'classroom'
      },
      date: '2024-03-20',
      timeSlots: ['09:00 - 10:00'],
      purpose: 'Team Meeting',
      status: 'pending'
    },
    {
      _id: '2',
      resource: {
        name: 'Room 102',
        type: 'auditorium'
      },
      date: '2024-03-21',
      timeSlots: ['14:00 - 15:00'],
      purpose: 'Conference',
      status: 'approved'
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

describe('Dashboard Page', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockLocalStorage.getItem.mockClear();
  });

  test('renders dashboard with loading state initially', () => {
    renderWithProviders(<Dashboard />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('displays dashboard statistics after successful fetch', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockDashboardData)
      })
    );

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('50')).toBeInTheDocument(); // Total bookings
      expect(screen.getByText('10')).toBeInTheDocument(); // Pending bookings
      expect(screen.getByText('35')).toBeInTheDocument(); // Approved bookings
      expect(screen.getByText('5')).toBeInTheDocument(); // Rejected bookings
    });
  });

  test('displays recent bookings', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockDashboardData)
      })
    );

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Team Meeting')).toBeInTheDocument();
      expect(screen.getByText('Conference')).toBeInTheDocument();
      expect(screen.getByText('Room 101')).toBeInTheDocument();
      expect(screen.getByText('Room 102')).toBeInTheDocument();
    });
  });

  test('handles refresh functionality', async () => {
    fetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDashboardData)
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            ...mockDashboardData,
            stats: { ...mockDashboardData.stats, totalBookings: 51 }
          })
        })
      );

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);
    });

    await waitFor(() => {
      expect(screen.getByText('51')).toBeInTheDocument(); // Updated total bookings
    });
  });

  test('displays error message when fetch fails', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Failed to fetch'))
    );

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/error loading dashboard/i)).toBeInTheDocument();
    });
  });

  test('navigates to new booking page', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockDashboardData)
      })
    );

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      const newBookingButton = screen.getByRole('button', { name: /new booking/i });
      fireEvent.click(newBookingButton);
    });

    // Verify navigation (this would typically be handled by react-router-dom)
    expect(window.location.pathname).toBe('/new-booking');
  });
}); 