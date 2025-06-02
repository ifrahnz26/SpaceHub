import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import UpdateVenueSchedule from '../UpdateVenueSchedule';

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
  schedule: {
    monday: ['09:00 - 10:00', '14:00 - 15:00'],
    tuesday: ['10:00 - 11:00', '15:00 - 16:00'],
    wednesday: ['11:00 - 12:00', '16:00 - 17:00'],
    thursday: ['09:00 - 10:00', '14:00 - 15:00'],
    friday: ['10:00 - 11:00', '15:00 - 16:00']
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

describe('Update Venue Schedule Page', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockLocalStorage.getItem.mockClear();
  });

  test('renders schedule update form with loading state initially', () => {
    renderWithProviders(<UpdateVenueSchedule />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('displays venue information after successful fetch', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockVenueData)
      })
    );

    renderWithProviders(<UpdateVenueSchedule />);

    await waitFor(() => {
      expect(screen.getByText('Room 101')).toBeInTheDocument();
      expect(screen.getByText('classroom')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument(); // Capacity
      expect(screen.getByText('Computer Science')).toBeInTheDocument();
    });
  });

  test('displays current schedule for each day', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockVenueData)
      })
    );

    renderWithProviders(<UpdateVenueSchedule />);

    await waitFor(() => {
      expect(screen.getByText('Monday')).toBeInTheDocument();
      expect(screen.getByText('09:00 - 10:00')).toBeInTheDocument();
      expect(screen.getByText('14:00 - 15:00')).toBeInTheDocument();
    });
  });

  test('adds new time slot', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockVenueData)
      })
    );

    renderWithProviders(<UpdateVenueSchedule />);

    await waitFor(() => {
      const addSlotButton = screen.getByRole('button', { name: /add slot/i });
      fireEvent.click(addSlotButton);
    });

    expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end time/i)).toBeInTheDocument();
  });

  test('removes time slot', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockVenueData)
      })
    );

    renderWithProviders(<UpdateVenueSchedule />);

    await waitFor(() => {
      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      fireEvent.click(removeButtons[0]);
    });

    expect(screen.queryByText('09:00 - 10:00')).not.toBeInTheDocument();
  });

  test('submits schedule update successfully', async () => {
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
          json: () => Promise.resolve({ message: 'Schedule updated successfully' })
        })
      );

    renderWithProviders(<UpdateVenueSchedule />);

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /update schedule/i });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/schedule updated successfully/i)).toBeInTheDocument();
    });
  });

  test('validates time slot format', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockVenueData)
      })
    );

    renderWithProviders(<UpdateVenueSchedule />);

    await waitFor(() => {
      const addSlotButton = screen.getByRole('button', { name: /add slot/i });
      fireEvent.click(addSlotButton);

      const startTimeInput = screen.getByLabelText(/start time/i);
      const endTimeInput = screen.getByLabelText(/end time/i);

      fireEvent.change(startTimeInput, { target: { value: 'invalid-time' } });
      fireEvent.change(endTimeInput, { target: { value: 'invalid-time' } });

      const submitButton = screen.getByRole('button', { name: /update schedule/i });
      fireEvent.click(submitButton);
    });

    expect(screen.getByText(/invalid time format/i)).toBeInTheDocument();
  });

  test('validates time slot order', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockVenueData)
      })
    );

    renderWithProviders(<UpdateVenueSchedule />);

    await waitFor(() => {
      const addSlotButton = screen.getByRole('button', { name: /add slot/i });
      fireEvent.click(addSlotButton);

      const startTimeInput = screen.getByLabelText(/start time/i);
      const endTimeInput = screen.getByLabelText(/end time/i);

      fireEvent.change(startTimeInput, { target: { value: '15:00' } });
      fireEvent.change(endTimeInput, { target: { value: '14:00' } });

      const submitButton = screen.getByRole('button', { name: /update schedule/i });
      fireEvent.click(submitButton);
    });

    expect(screen.getByText(/end time must be after start time/i)).toBeInTheDocument();
  });

  test('displays error message when fetch fails', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Failed to fetch'))
    );

    renderWithProviders(<UpdateVenueSchedule />);

    await waitFor(() => {
      expect(screen.getByText(/error loading venue data/i)).toBeInTheDocument();
    });
  });

  test('handles overlapping time slots', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockVenueData)
      })
    );

    renderWithProviders(<UpdateVenueSchedule />);

    await waitFor(() => {
      const addSlotButton = screen.getByRole('button', { name: /add slot/i });
      fireEvent.click(addSlotButton);

      const startTimeInput = screen.getByLabelText(/start time/i);
      const endTimeInput = screen.getByLabelText(/end time/i);

      fireEvent.change(startTimeInput, { target: { value: '09:00' } });
      fireEvent.change(endTimeInput, { target: { value: '10:00' } });

      const submitButton = screen.getByRole('button', { name: /update schedule/i });
      fireEvent.click(submitButton);
    });

    expect(screen.getByText(/time slot overlaps with existing slot/i)).toBeInTheDocument();
  });
}); 