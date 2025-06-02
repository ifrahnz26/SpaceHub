import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import UpdateEventDetails from '../../pages/UpdateEventDetails';

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
      _id: '1',
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
  availableVenues: [
    {
      _id: '1',
      name: 'Room 101',
      capacity: 50,
      type: 'classroom'
    },
    {
      _id: '2',
      name: 'Room 102',
      capacity: 100,
      type: 'auditorium'
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

describe('UpdateEventDetails Page', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockLocalStorage.getItem.mockClear();
  });

  test('renders update form with loading state initially', () => {
    renderWithProviders(<UpdateEventDetails />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('displays event information after successful fetch', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEventData)
      })
    );

    renderWithProviders(<UpdateEventDetails />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Annual Conference')).toBeInTheDocument();
      expect(screen.getByDisplayValue('A conference about technology')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2024-03-20')).toBeInTheDocument();
      expect(screen.getByDisplayValue('09:00 - 10:00')).toBeInTheDocument();
      expect(screen.getByDisplayValue('10:00 - 11:00')).toBeInTheDocument();
    });
  });

  test('displays available venues', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEventData)
      })
    );

    renderWithProviders(<UpdateEventDetails />);

    await waitFor(() => {
      expect(screen.getByText('Room 101')).toBeInTheDocument();
      expect(screen.getByText('Room 102')).toBeInTheDocument();
    });
  });

  test('handles event update submission', async () => {
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

    renderWithProviders(<UpdateEventDetails />);

    await waitFor(() => {
      const titleInput = screen.getByLabelText(/title/i);
      fireEvent.change(titleInput, { target: { value: 'Updated Conference' } });
      
      const submitButton = screen.getByRole('button', { name: /update/i });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/event updated successfully/i)).toBeInTheDocument();
    });
  });

  test('validates required fields', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEventData)
      })
    );

    renderWithProviders(<UpdateEventDetails />);

    await waitFor(() => {
      const titleInput = screen.getByLabelText(/title/i);
      fireEvent.change(titleInput, { target: { value: '' } });
      
      const submitButton = screen.getByRole('button', { name: /update/i });
      fireEvent.click(submitButton);
    });

    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
  });

  test('validates date is not in the past', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEventData)
      })
    );

    renderWithProviders(<UpdateEventDetails />);

    await waitFor(() => {
      const dateInput = screen.getByLabelText(/date/i);
      fireEvent.change(dateInput, { target: { value: '2023-01-01' } });
      
      const submitButton = screen.getByRole('button', { name: /update/i });
      fireEvent.click(submitButton);
    });

    expect(screen.getByText(/date cannot be in the past/i)).toBeInTheDocument();
  });

  test('handles venue change', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEventData)
      })
    );

    renderWithProviders(<UpdateEventDetails />);

    await waitFor(() => {
      const venueSelect = screen.getByLabelText(/venue/i);
      fireEvent.change(venueSelect, { target: { value: '2' } });
    });

    expect(screen.getByText('Room 102')).toBeInTheDocument();
  });

  test('handles time slot addition', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEventData)
      })
    );

    renderWithProviders(<UpdateEventDetails />);

    await waitFor(() => {
      const startTimeInput = screen.getByLabelText(/start time/i);
      const endTimeInput = screen.getByLabelText(/end time/i);
      const addButton = screen.getByRole('button', { name: /add time slot/i });

      fireEvent.change(startTimeInput, { target: { value: '11:00' } });
      fireEvent.change(endTimeInput, { target: { value: '12:00' } });
      fireEvent.click(addButton);
    });

    expect(screen.getByText('11:00 - 12:00')).toBeInTheDocument();
  });

  test('handles time slot removal', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEventData)
      })
    );

    renderWithProviders(<UpdateEventDetails />);

    await waitFor(() => {
      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      fireEvent.click(removeButtons[0]);
    });

    expect(screen.queryByText('09:00 - 10:00')).not.toBeInTheDocument();
  });

  test('displays error message when fetch fails', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Failed to fetch'))
    );

    renderWithProviders(<UpdateEventDetails />);

    await waitFor(() => {
      expect(screen.getByText(/error loading event details/i)).toBeInTheDocument();
    });
  });

  test('validates time slot format', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEventData)
      })
    );

    renderWithProviders(<UpdateEventDetails />);

    await waitFor(() => {
      const startTimeInput = screen.getByLabelText(/start time/i);
      const endTimeInput = screen.getByLabelText(/end time/i);
      const addButton = screen.getByRole('button', { name: /add time slot/i });

      fireEvent.change(startTimeInput, { target: { value: 'invalid' } });
      fireEvent.change(endTimeInput, { target: { value: 'invalid' } });
      fireEvent.click(addButton);
    });

    expect(screen.getByText(/invalid time format/i)).toBeInTheDocument();
  });

  test('validates time slot order', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEventData)
      })
    );

    renderWithProviders(<UpdateEventDetails />);

    await waitFor(() => {
      const startTimeInput = screen.getByLabelText(/start time/i);
      const endTimeInput = screen.getByLabelText(/end time/i);
      const addButton = screen.getByRole('button', { name: /add time slot/i });

      fireEvent.change(startTimeInput, { target: { value: '14:00' } });
      fireEvent.change(endTimeInput, { target: { value: '13:00' } });
      fireEvent.click(addButton);
    });

    expect(screen.getByText(/end time must be after start time/i)).toBeInTheDocument();
  });
}); 