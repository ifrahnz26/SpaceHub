import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import EventDetails from '../EventDetails';

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
    description: 'A conference for all departments',
    startDate: '2024-03-20',
    endDate: '2024-03-22',
    venue: {
      _id: '1',
      name: 'Main Hall',
      type: 'auditorium',
      capacity: 200
    },
    organizer: {
      _id: '1',
      name: 'John Doe',
      email: 'john@example.com'
    },
    status: 'approved',
    attendees: [
      {
        _id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com'
      }
    ]
  }
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

describe('Event Details Page', () => {
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
      expect(screen.getByText('A conference for all departments')).toBeInTheDocument();
      expect(screen.getByText('2024-03-20')).toBeInTheDocument();
      expect(screen.getByText('2024-03-22')).toBeInTheDocument();
    });
  });

  test('displays venue information', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEventData)
      })
    );

    renderWithProviders(<EventDetails />);

    await waitFor(() => {
      expect(screen.getByText('Main Hall')).toBeInTheDocument();
      expect(screen.getByText('auditorium')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument(); // Capacity
    });
  });

  test('displays organizer information', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEventData)
      })
    );

    renderWithProviders(<EventDetails />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  test('displays attendees list', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEventData)
      })
    );

    renderWithProviders(<EventDetails />);

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
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
          json: () => Promise.resolve({ message: 'Successfully registered for event' })
        })
      );

    renderWithProviders(<EventDetails />);

    await waitFor(() => {
      const registerButton = screen.getByRole('button', { name: /register/i });
      fireEvent.click(registerButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/successfully registered for event/i)).toBeInTheDocument();
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
          json: () => Promise.resolve({ message: 'Event cancelled successfully' })
        })
      );

    renderWithProviders(<EventDetails />);

    await waitFor(() => {
      const cancelButton = screen.getByRole('button', { name: /cancel event/i });
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

  test('handles event update', async () => {
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
          json: () => Promise.resolve({ message: 'Event updated successfully' })
        })
      );

    renderWithProviders(<EventDetails />);

    await waitFor(() => {
      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);
    });

    await waitFor(() => {
      const titleInput = screen.getByLabelText(/title/i);
      fireEvent.change(titleInput, { target: { value: 'Updated Conference' } });

      const submitButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/event updated successfully/i)).toBeInTheDocument();
    });
  });

  test('handles attendee removal', async () => {
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
          json: () => Promise.resolve({ message: 'Attendee removed successfully' })
        })
      );

    renderWithProviders(<EventDetails />);

    await waitFor(() => {
      const removeButton = screen.getByRole('button', { name: /remove attendee/i });
      fireEvent.click(removeButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/attendee removed successfully/i)).toBeInTheDocument();
    });
  });
}); 