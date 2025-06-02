import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import MyBookings from '../../pages/MyBookings';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(() => 'mock-token'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

const mockBookingsData = {
  bookings: [
    {
      _id: '1',
      resource: { name: 'Room 101' },
      date: '2024-03-20',
      timeSlots: ['09:00 - 10:00'],
      purpose: 'Class Lecture',
      status: 'approved'
    },
    {
      _id: '2',
      resource: { name: 'Room 102' },
      date: '2024-03-21',
      timeSlots: ['10:00 - 11:00'],
      purpose: 'Group Discussion',
      status: 'pending'
    },
    {
      _id: '3',
      resource: { name: 'Room 103' },
      date: '2024-03-22',
      timeSlots: ['11:00 - 12:00'],
      purpose: 'Meeting',
      status: 'rejected'
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

describe('MyBookings Page', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockLocalStorage.getItem.mockClear();
  });

  test('renders bookings with loading state initially', () => {
    renderWithProviders(<MyBookings />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('displays bookings after successful fetch', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockBookingsData)
      })
    );

    renderWithProviders(<MyBookings />);

    await waitFor(() => {
      expect(screen.getByText('Class Lecture')).toBeInTheDocument();
      expect(screen.getByText('Group Discussion')).toBeInTheDocument();
      expect(screen.getByText('Meeting')).toBeInTheDocument();
    });
  });

  test('filters bookings by status', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockBookingsData)
      })
    );

    renderWithProviders(<MyBookings />);

    await waitFor(() => {
      const filterSelect = screen.getByLabelText(/filter by status/i);
      fireEvent.change(filterSelect, { target: { value: 'approved' } });
    });

    expect(screen.getByText('Class Lecture')).toBeInTheDocument();
    expect(screen.queryByText('Group Discussion')).not.toBeInTheDocument();
    expect(screen.queryByText('Meeting')).not.toBeInTheDocument();
  });

  test('handles booking cancellation', async () => {
    fetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockBookingsData)
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Booking cancelled' })
        })
      );

    renderWithProviders(<MyBookings />);

    await waitFor(() => {
      const cancelButton = screen.getAllByRole('button', { name: /cancel/i })[0];
      fireEvent.click(cancelButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/booking cancelled successfully/i)).toBeInTheDocument();
    });
  });

  test('displays error message when fetch fails', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Failed to fetch'))
    );

    renderWithProviders(<MyBookings />);

    await waitFor(() => {
      expect(screen.getByText(/error loading bookings/i)).toBeInTheDocument();
    });
  });

  test('handles date range filtering', async () => {
    fetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockBookingsData)
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            bookings: [mockBookingsData.bookings[0]]
          })
        })
      );

    renderWithProviders(<MyBookings />);

    await waitFor(() => {
      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);

      fireEvent.change(startDateInput, { target: { value: '2024-03-20' } });
      fireEvent.change(endDateInput, { target: { value: '2024-03-20' } });
    });

    expect(screen.getByText('Class Lecture')).toBeInTheDocument();
    expect(screen.queryByText('Group Discussion')).not.toBeInTheDocument();
    expect(screen.queryByText('Meeting')).not.toBeInTheDocument();
  });

  test('displays empty state when no bookings found', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ bookings: [] })
      })
    );

    renderWithProviders(<MyBookings />);

    await waitFor(() => {
      expect(screen.getByText(/no bookings found/i)).toBeInTheDocument();
    });
  });

  test('handles refresh functionality', async () => {
    fetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockBookingsData)
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            bookings: [...mockBookingsData.bookings, {
              _id: '4',
              resource: { name: 'Room 104' },
              date: '2024-03-23',
              timeSlots: ['13:00 - 14:00'],
              purpose: 'New Booking',
              status: 'approved'
            }]
          })
        })
      );

    renderWithProviders(<MyBookings />);

    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);
    });

    await waitFor(() => {
      expect(screen.getByText('New Booking')).toBeInTheDocument();
    });
  });

  test('displays booking details correctly', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockBookingsData)
      })
    );

    renderWithProviders(<MyBookings />);

    await waitFor(() => {
      expect(screen.getByText('Room 101')).toBeInTheDocument();
      expect(screen.getByText('2024-03-20')).toBeInTheDocument();
      expect(screen.getByText('09:00 - 10:00')).toBeInTheDocument();
      expect(screen.getByText(/approved/i)).toBeInTheDocument();
    });
  });
}); 