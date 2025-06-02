import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import MyBookings from '../MyBookings';

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
      date: '2024-03-20',
      timeSlots: ['09:00 - 10:00'],
      purpose: 'Team Meeting',
      status: 'approved',
      venue: {
        _id: '1',
        name: 'Room 101',
        type: 'classroom'
      }
    },
    {
      _id: '2',
      date: '2024-03-21',
      timeSlots: ['14:00 - 15:00'],
      purpose: 'Conference',
      status: 'pending',
      venue: {
        _id: '2',
        name: 'Main Hall',
        type: 'auditorium'
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

describe('My Bookings Page', () => {
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
      expect(screen.getByText('Team Meeting')).toBeInTheDocument();
      expect(screen.getByText('Conference')).toBeInTheDocument();
      expect(screen.getByText('Room 101')).toBeInTheDocument();
      expect(screen.getByText('Main Hall')).toBeInTheDocument();
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

    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    expect(screen.queryByText('Conference')).not.toBeInTheDocument();
  });

  test('filters bookings by date', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockBookingsData)
      })
    );

    renderWithProviders(<MyBookings />);

    await waitFor(() => {
      const dateInput = screen.getByLabelText(/filter by date/i);
      fireEvent.change(dateInput, { target: { value: '2024-03-20' } });
    });

    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    expect(screen.queryByText('Conference')).not.toBeInTheDocument();
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
          json: () => Promise.resolve({ message: 'Booking cancelled successfully' })
        })
      );

    renderWithProviders(<MyBookings />);

    await waitFor(() => {
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
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
            bookings: [
              ...mockBookingsData.bookings,
              {
                _id: '3',
                date: '2024-03-22',
                timeSlots: ['16:00 - 17:00'],
                purpose: 'Workshop',
                status: 'approved',
                venue: {
                  _id: '3',
                  name: 'Lab 101',
                  type: 'laboratory'
                }
              }
            ]
          })
        })
      );

    renderWithProviders(<MyBookings />);

    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Workshop')).toBeInTheDocument();
      expect(screen.getByText('Lab 101')).toBeInTheDocument();
    });
  });

  test('displays empty state when no bookings', async () => {
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

  test('navigates to new booking page', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockBookingsData)
      })
    );

    renderWithProviders(<MyBookings />);

    await waitFor(() => {
      const newBookingButton = screen.getByRole('button', { name: /new booking/i });
      fireEvent.click(newBookingButton);
    });

    expect(window.location.pathname).toBe('/new-booking');
  });
}); 