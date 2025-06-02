import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import VenueSchedule from '../VenueSchedule';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(() => 'mock-token'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

const mockScheduleData = {
  venue: {
    _id: '1',
    name: 'Room 101',
    type: 'classroom',
    capacity: 50,
    department: 'Computer Science'
  },
  weeklySchedule: {
    monday: ['09:00 - 10:00', '14:00 - 15:00'],
    tuesday: ['10:00 - 11:00', '15:00 - 16:00'],
    wednesday: ['11:00 - 12:00', '16:00 - 17:00'],
    thursday: ['09:00 - 10:00', '14:00 - 15:00'],
    friday: ['10:00 - 11:00', '15:00 - 16:00']
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

describe('Venue Schedule Page', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockLocalStorage.getItem.mockClear();
  });

  test('renders schedule with loading state initially', () => {
    renderWithProviders(<VenueSchedule />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('displays venue information after successful fetch', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockScheduleData)
      })
    );

    renderWithProviders(<VenueSchedule />);

    await waitFor(() => {
      expect(screen.getByText('Room 101')).toBeInTheDocument();
      expect(screen.getByText('classroom')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument(); // Capacity
      expect(screen.getByText('Computer Science')).toBeInTheDocument();
    });
  });

  test('displays weekly schedule', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockScheduleData)
      })
    );

    renderWithProviders(<VenueSchedule />);

    await waitFor(() => {
      expect(screen.getByText('Monday')).toBeInTheDocument();
      expect(screen.getByText('Tuesday')).toBeInTheDocument();
      expect(screen.getByText('Wednesday')).toBeInTheDocument();
      expect(screen.getByText('Thursday')).toBeInTheDocument();
      expect(screen.getByText('Friday')).toBeInTheDocument();
    });
  });

  test('displays current bookings', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockScheduleData)
      })
    );

    renderWithProviders(<VenueSchedule />);

    await waitFor(() => {
      expect(screen.getByText('Team Meeting')).toBeInTheDocument();
      expect(screen.getByText('Conference')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  test('handles date navigation', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockScheduleData)
      })
    );

    renderWithProviders(<VenueSchedule />);

    await waitFor(() => {
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);
    });

    expect(screen.getByText('2024-03-21')).toBeInTheDocument();
  });

  test('filters bookings by status', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockScheduleData)
      })
    );

    renderWithProviders(<VenueSchedule />);

    await waitFor(() => {
      const filterSelect = screen.getByLabelText(/filter by status/i);
      fireEvent.change(filterSelect, { target: { value: 'approved' } });
    });

    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    expect(screen.queryByText('Conference')).not.toBeInTheDocument();
  });

  test('displays error message when fetch fails', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Failed to fetch'))
    );

    renderWithProviders(<VenueSchedule />);

    await waitFor(() => {
      expect(screen.getByText(/error loading schedule/i)).toBeInTheDocument();
    });
  });

  test('handles refresh functionality', async () => {
    fetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockScheduleData)
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            ...mockScheduleData,
            currentBookings: [
              ...mockScheduleData.currentBookings,
              {
                _id: '3',
                date: '2024-03-20',
                timeSlots: ['16:00 - 17:00'],
                purpose: 'Workshop',
                status: 'approved',
                user: {
                  name: 'Bob Wilson',
                  email: 'bob@example.com'
                }
              }
            ]
          })
        })
      );

    renderWithProviders(<VenueSchedule />);

    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Workshop')).toBeInTheDocument();
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    });
  });

  test('displays empty state for days with no slots', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          ...mockScheduleData,
          weeklySchedule: {
            ...mockScheduleData.weeklySchedule,
            saturday: [],
            sunday: []
          }
        })
      })
    );

    renderWithProviders(<VenueSchedule />);

    await waitFor(() => {
      expect(screen.getByText('Saturday')).toBeInTheDocument();
      expect(screen.getByText('Sunday')).toBeInTheDocument();
      expect(screen.getByText(/no slots available/i)).toBeInTheDocument();
    });
  });

  test('handles booking cancellation', async () => {
    fetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockScheduleData)
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Booking cancelled successfully' })
        })
      );

    renderWithProviders(<VenueSchedule />);

    await waitFor(() => {
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/booking cancelled successfully/i)).toBeInTheDocument();
    });
  });
}); 