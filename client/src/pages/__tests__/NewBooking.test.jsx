import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import NewBooking from '../NewBooking';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(() => 'mock-token'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

const mockResources = [
  {
    _id: '1',
    name: 'Room 101',
    type: 'classroom',
    capacity: 50
  },
  {
    _id: '2',
    name: 'Room 102',
    type: 'auditorium',
    capacity: 100
  }
];

const mockTimeSlots = [
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '14:00 - 15:00'
];

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('NewBooking Page', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockLocalStorage.getItem.mockClear();
  });

  test('renders booking form with all required fields', () => {
    renderWithProviders(<NewBooking />);
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/purpose/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/attendees/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/resource/i)).toBeInTheDocument();
  });

  test('loads and displays available resources', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResources)
      })
    );

    renderWithProviders(<NewBooking />);

    await waitFor(() => {
      expect(screen.getByText('Room 101')).toBeInTheDocument();
      expect(screen.getByText('Room 102')).toBeInTheDocument();
    });
  });

  test('shows validation errors for empty form submission', async () => {
    renderWithProviders(<NewBooking />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/date is required/i)).toBeInTheDocument();
    expect(screen.getByText(/purpose is required/i)).toBeInTheDocument();
    expect(screen.getByText(/resource is required/i)).toBeInTheDocument();
  });

  test('handles successful booking creation', async () => {
    fetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResources)
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Booking created successfully' })
        })
      );

    renderWithProviders(<NewBooking />);

    await waitFor(() => {
      const dateInput = screen.getByLabelText(/date/i);
      const purposeInput = screen.getByLabelText(/purpose/i);
      const attendeesInput = screen.getByLabelText(/attendees/i);
      const resourceSelect = screen.getByLabelText(/resource/i);

      fireEvent.change(dateInput, { target: { value: '2024-03-20' } });
      fireEvent.change(purposeInput, { target: { value: 'Team Meeting' } });
      fireEvent.change(attendeesInput, { target: { value: '10' } });
      fireEvent.change(resourceSelect, { target: { value: '1' } });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/booking created successfully/i)).toBeInTheDocument();
    });
  });

  test('handles API error during booking creation', async () => {
    fetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResources)
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Failed to create booking' })
        })
      );

    renderWithProviders(<NewBooking />);

    await waitFor(() => {
      const dateInput = screen.getByLabelText(/date/i);
      const purposeInput = screen.getByLabelText(/purpose/i);
      const attendeesInput = screen.getByLabelText(/attendees/i);
      const resourceSelect = screen.getByLabelText(/resource/i);

      fireEvent.change(dateInput, { target: { value: '2024-03-20' } });
      fireEvent.change(purposeInput, { target: { value: 'Team Meeting' } });
      fireEvent.change(attendeesInput, { target: { value: '10' } });
      fireEvent.change(resourceSelect, { target: { value: '1' } });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/failed to create booking/i)).toBeInTheDocument();
    });
  });

  test('validates date is not in the past', async () => {
    renderWithProviders(<NewBooking />);

    const dateInput = screen.getByLabelText(/date/i);
    fireEvent.change(dateInput, { target: { value: '2023-01-01' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/date cannot be in the past/i)).toBeInTheDocument();
  });

  test('shows loading state during form submission', async () => {
    fetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResources)
        })
      )
      .mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Booking created successfully' })
        }), 100))
      );

    renderWithProviders(<NewBooking />);

    await waitFor(() => {
      const dateInput = screen.getByLabelText(/date/i);
      const purposeInput = screen.getByLabelText(/purpose/i);
      const attendeesInput = screen.getByLabelText(/attendees/i);
      const resourceSelect = screen.getByLabelText(/resource/i);

      fireEvent.change(dateInput, { target: { value: '2024-03-20' } });
      fireEvent.change(purposeInput, { target: { value: 'Team Meeting' } });
      fireEvent.change(attendeesInput, { target: { value: '10' } });
      fireEvent.change(resourceSelect, { target: { value: '1' } });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);
    });

    expect(screen.getByText(/submitting/i)).toBeInTheDocument();
  });
}); 