import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import EventDetails from '../../pages/EventDetails';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(() => 'mock-token'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

const mockEventData = {
  event: {
    _id: '1',
    title: 'Annual Conference',
    description: 'A conference about technology',
    date: '2024-03-20',
    timeSlots: ['09:00 - 10:00', '10:00 - 11:00'],
    venue: {
      name: 'Room 101',
      capacity: 50
    },
    organizer: {
      name: 'John Doe',
      department: 'Computer Science'
    },
    status: 'approved',
    attendees: 30
  },
  relatedEvents: [
    {
      _id: '2',
      title: 'Workshop',
      date: '2024-03-21',
      venue: { name: 'Room 102' }
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

describe('EventDetails Page', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockLocalStorage.getItem.mockClear();
  });

  test('renders event details with loading state initially', () => {
    renderWithProviders(<EventDetails />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('displays event information after successful fetch', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEventData)
      })
    );

    renderWithProviders(<EventDetails />);

    await waitFor(() => {
      expect(screen.getByText('Annual Conference')).toBeInTheDocument();
      expect(screen.getByText('A conference about technology')).toBeInTheDocument();
      expect(screen.getByText('Room 101')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  test('displays event time slots', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEventData)
      })
    );

    renderWithProviders(<EventDetails />);

    await waitFor(() => {
      expect(screen.getByText('09:00 - 10:00')).toBeInTheDocument();
      expect(screen.getByText('10:00 - 11:00')).toBeInTheDocument();
    });
  });

  test('displays related events', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEventData)
      })
    );

    renderWithProviders(<EventDetails />);

    await waitFor(() => {
      expect(screen.getByText('Workshop')).toBeInTheDocument();
      expect(screen.getByText('Room 102')).toBeInTheDocument();
    });
  });

  test('handles event registration', async () => {
    fetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockEventData)
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Successfully registered' })
        })
      );

    renderWithProviders(<EventDetails />);

    await waitFor(() => {
      const registerButton = screen.getByRole('button', { name: /register/i });
      fireEvent.click(registerButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/successfully registered/i)).toBeInTheDocument();
    });
  });

  test('handles event cancellation', async () => {
    fetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockEventData)
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Event cancelled' })
        })
      );

    renderWithProviders(<EventDetails />);

    await waitFor(() => {
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/event cancelled successfully/i)).toBeInTheDocument();
    });
  });

  test('displays error message when fetch fails', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Failed to fetch'))
    );

    renderWithProviders(<EventDetails />);

    await waitFor(() => {
      expect(screen.getByText(/error loading event details/i)).toBeInTheDocument();
    });
  });

  test('handles navigation to related event', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEventData)
      })
    );

    renderWithProviders(<EventDetails />);

    await waitFor(() => {
      const relatedEventLink = screen.getByText('Workshop');
      fireEvent.click(relatedEventLink);
    });

    // Verify that the URL has changed
    expect(window.location.pathname).toBe('/events/2');
  });

  test('displays event status correctly', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEventData)
      })
    );

    renderWithProviders(<EventDetails />);

    await waitFor(() => {
      expect(screen.getByText(/status: approved/i)).toBeInTheDocument();
    });
  });

  test('displays attendee count', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEventData)
      })
    );

    renderWithProviders(<EventDetails />);

    await waitFor(() => {
      expect(screen.getByText(/attendees: 30/i)).toBeInTheDocument();
    });
  });
}); 