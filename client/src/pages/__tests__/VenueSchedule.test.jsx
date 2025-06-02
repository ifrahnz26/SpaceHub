import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import VenueSchedule from '../../pages/VenueSchedule';

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
    capacity: 50
  },
  schedule: {
    monday: ['09:00 - 10:00', '10:00 - 11:00'],
    tuesday: ['11:00 - 12:00'],
    wednesday: ['14:00 - 15:00'],
    thursday: [],
    friday: ['16:00 - 17:00']
  },
  bookings: [
    {
      _id: '1',
      date: '2024-03-20',
      timeSlots: ['09:00 - 10:00'],
      purpose: 'Class Lecture',
      status: 'approved'
    },
    {
      _id: '2',
      date: '2024-03-21',
      timeSlots: ['11:00 - 12:00'],
      purpose: 'Group Discussion',
      status: 'pending'
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

describe('VenueSchedule Page', () => {
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
        json: () => Promise.resolve(mockVenueData)
      })
    );

    renderWithProviders(<VenueSchedule />);

    await waitFor(() => {
      expect(screen.getByText('Room 101')).toBeInTheDocument();
      expect(screen.getByText('classroom')).toBeInTheDocument();
      expect(screen.getByText('Capacity: 50')).toBeInTheDocument();
    });
  });

  test('displays weekly schedule', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockVenueData)
      })
    );

    renderWithProviders(<VenueSchedule />);

    await waitFor(() => {
      expect(screen.getByText('Monday')).toBeInTheDocument();
      expect(screen.getByText('09:00 - 10:00')).toBeInTheDocument();
      expect(screen.getByText('10:00 - 11:00')).toBeInTheDocument();
      expect(screen.getByText('Tuesday')).toBeInTheDocument();
      expect(screen.getByText('11:00 - 12:00')).toBeInTheDocument();
      expect(screen.getByText('Wednesday')).toBeInTheDocument();
      expect(screen.getByText('14:00 - 15:00')).toBeInTheDocument();
      expect(screen.getByText('Thursday')).toBeInTheDocument();
      expect(screen.getByText('Friday')).toBeInTheDocument();
      expect(screen.getByText('16:00 - 17:00')).toBeInTheDocument();
    });
  });

  test('displays current bookings', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockVenueData)
      })
    );

    renderWithProviders(<VenueSchedule />);

    await waitFor(() => {
      expect(screen.getByText('Class Lecture')).toBeInTheDocument();
      expect(screen.getByText('Group Discussion')).toBeInTheDocument();
      expect(screen.getByText('2024-03-20')).toBeInTheDocument();
      expect(screen.getByText('2024-03-21')).toBeInTheDocument();
    });
  });

  test('handles date navigation', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockVenueData)
      })
    );

    renderWithProviders(<VenueSchedule />);

    await waitFor(() => {
      const nextWeekButton = screen.getByRole('button', { name: /next week/i });
      fireEvent.click(nextWeekButton);
    });

    expect(screen.getByText(/next week's schedule/i)).toBeInTheDocument();
  });

  test('filters bookings by status', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockVenueData)
      })
    );

    renderWithProviders(<VenueSchedule />);

    await waitFor(() => {
      const filterSelect = screen.getByLabelText(/filter by status/i);
      fireEvent.change(filterSelect, { target: { value: 'approved' } });
    });

    expect(screen.getByText('Class Lecture')).toBeInTheDocument();
    expect(screen.queryByText('Group Discussion')).not.toBeInTheDocument();
  });

  test('displays error message when fetch fails', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Failed to fetch'))
    );

    renderWithProviders(<VenueSchedule />);

    await waitFor(() => {
      expect(screen.getByText(/error loading venue schedule/i)).toBeInTheDocument();
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
            bookings: [...mockVenueData.bookings, {
              _id: '3',
              date: '2024-03-22',
              timeSlots: ['14:00 - 15:00'],
              purpose: 'New Booking',
              status: 'approved'
            }]
          })
        })
      );

    renderWithProviders(<VenueSchedule />);

    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);
    });

    await waitFor(() => {
      expect(screen.getByText('New Booking')).toBeInTheDocument();
    });
  });

  test('displays empty state for days with no slots', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockVenueData)
      })
    );

    renderWithProviders(<VenueSchedule />);

    await waitFor(() => {
      expect(screen.getByText(/no time slots available/i)).toBeInTheDocument();
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
          json: () => Promise.resolve({ message: 'Booking cancelled' })
        })
      );

    renderWithProviders(<VenueSchedule />);

    await waitFor(() => {
      const cancelButton = screen.getAllByRole('button', { name: /cancel/i })[0];
      fireEvent.click(cancelButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/booking cancelled successfully/i)).toBeInTheDocument();
    });
  });
}); 