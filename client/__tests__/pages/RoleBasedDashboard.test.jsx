import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import RoleBasedDashboard from '../../pages/RoleBasedDashboard';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(() => 'mock-token'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

const mockUserData = {
  user: {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    department: 'Computer Science'
  }
};

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
  ],
  upcomingEvents: [
    {
      _id: '1',
      title: 'Annual Conference',
      date: '2024-03-25',
      venue: 'Room 102',
      attendees: 50
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

describe('RoleBasedDashboard Page', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockLocalStorage.getItem.mockClear();
  });

  test('renders dashboard with loading state initially', () => {
    renderWithProviders(<RoleBasedDashboard />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('displays user information after successful fetch', async () => {
    fetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUserData)
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDashboardData)
        })
      );

    renderWithProviders(<RoleBasedDashboard />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getByText('Computer Science')).toBeInTheDocument();
    });
  });

  test('displays dashboard statistics', async () => {
    fetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUserData)
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDashboardData)
        })
      );

    renderWithProviders(<RoleBasedDashboard />);

    await waitFor(() => {
      expect(screen.getByText('50')).toBeInTheDocument(); // Total bookings
      expect(screen.getByText('10')).toBeInTheDocument(); // Pending bookings
      expect(screen.getByText('35')).toBeInTheDocument(); // Approved bookings
      expect(screen.getByText('5')).toBeInTheDocument(); // Rejected bookings
    });
  });

  test('displays recent bookings', async () => {
    fetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUserData)
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDashboardData)
        })
      );

    renderWithProviders(<RoleBasedDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Team Meeting')).toBeInTheDocument();
      expect(screen.getByText('Conference')).toBeInTheDocument();
      expect(screen.getByText('Room 101')).toBeInTheDocument();
      expect(screen.getByText('Room 102')).toBeInTheDocument();
    });
  });

  test('displays upcoming events', async () => {
    fetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUserData)
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDashboardData)
        })
      );

    renderWithProviders(<RoleBasedDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Annual Conference')).toBeInTheDocument();
      expect(screen.getByText('Room 102')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument(); // Attendees
    });
  });

  test('handles booking approval', async () => {
    fetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUserData)
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDashboardData)
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Booking approved successfully' })
        })
      );

    renderWithProviders(<RoleBasedDashboard />);

    await waitFor(() => {
      const approveButton = screen.getByRole('button', { name: /approve/i });
      fireEvent.click(approveButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/booking approved successfully/i)).toBeInTheDocument();
    });
  });

  test('handles booking rejection', async () => {
    fetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUserData)
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDashboardData)
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Booking rejected successfully' })
        })
      );

    renderWithProviders(<RoleBasedDashboard />);

    await waitFor(() => {
      const rejectButton = screen.getByRole('button', { name: /reject/i });
      fireEvent.click(rejectButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/booking rejected successfully/i)).toBeInTheDocument();
    });
  });

  test('displays error message when fetch fails', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Failed to fetch'))
    );

    renderWithProviders(<RoleBasedDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/error loading dashboard/i)).toBeInTheDocument();
    });
  });

  test('handles refresh functionality', async () => {
    fetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUserData)
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDashboardData)
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUserData)
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

    renderWithProviders(<RoleBasedDashboard />);

    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);
    });

    await waitFor(() => {
      expect(screen.getByText('51')).toBeInTheDocument(); // Updated total bookings
    });
  });

  test('displays role-specific actions', async () => {
    fetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUserData)
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDashboardData)
        })
      );

    renderWithProviders(<RoleBasedDashboard />);

    await waitFor(() => {
      // Admin specific actions
      expect(screen.getByRole('button', { name: /manage users/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /manage venues/i })).toBeInTheDocument();
    });
  });

  test('handles navigation to event details', async () => {
    fetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUserData)
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDashboardData)
        })
      );

    renderWithProviders(<RoleBasedDashboard />);

    await waitFor(() => {
      const eventLink = screen.getByText('Annual Conference');
      fireEvent.click(eventLink);
    });

    // Verify navigation (this would typically be handled by react-router-dom)
    expect(window.location.pathname).toBe('/events/1');
  });
}); 