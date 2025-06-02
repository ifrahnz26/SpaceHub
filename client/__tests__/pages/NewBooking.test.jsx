import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import NewBooking from '../../pages/NewBooking';

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
  { _id: '1', name: 'Room 101', type: 'classroom' },
  { _id: '2', name: 'Room 102', type: 'laboratory' }
];

const mockTimeSlots = [
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00'
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

  test('renders booking form with all required fields', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResources)
      })
    );

    renderWithProviders(<NewBooking />);

    await waitFor(() => {
      expect(screen.getByLabelText(/select resource/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/time slots/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/purpose/i)).toBeInTheDocument();
    });
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
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResources)
      })
    );

    renderWithProviders(<NewBooking />);

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /create booking/i });
      fireEvent.click(submitButton);
    });

    expect(screen.getByText(/please select a resource/i)).toBeInTheDocument();
    expect(screen.getByText(/please select a date/i)).toBeInTheDocument();
    expect(screen.getByText(/please select at least one time slot/i)).toBeInTheDocument();
    expect(screen.getByText(/please provide a purpose/i)).toBeInTheDocument();
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
      // Fill in the form
      const resourceSelect = screen.getByLabelText(/select resource/i);
      fireEvent.change(resourceSelect, { target: { value: '1' } });

      const dateInput = screen.getByLabelText(/date/i);
      fireEvent.change(dateInput, { target: { value: '2024-03-20' } });

      const timeSlotCheckbox = screen.getByLabelText('09:00 - 10:00');
      fireEvent.click(timeSlotCheckbox);

      const purposeInput = screen.getByLabelText(/purpose/i);
      fireEvent.change(purposeInput, { target: { value: 'Test booking' } });

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /create booking/i });
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
      // Fill in the form
      const resourceSelect = screen.getByLabelText(/select resource/i);
      fireEvent.change(resourceSelect, { target: { value: '1' } });

      const dateInput = screen.getByLabelText(/date/i);
      fireEvent.change(dateInput, { target: { value: '2024-03-20' } });

      const timeSlotCheckbox = screen.getByLabelText('09:00 - 10:00');
      fireEvent.click(timeSlotCheckbox);

      const purposeInput = screen.getByLabelText(/purpose/i);
      fireEvent.change(purposeInput, { target: { value: 'Test booking' } });

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /create booking/i });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/failed to create booking/i)).toBeInTheDocument();
    });
  });

  test('validates date is not in the past', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResources)
      })
    );

    renderWithProviders(<NewBooking />);

    await waitFor(() => {
      const dateInput = screen.getByLabelText(/date/i);
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      fireEvent.change(dateInput, { target: { value: pastDate.toISOString().split('T')[0] } });

      const submitButton = screen.getByRole('button', { name: /create booking/i });
      fireEvent.click(submitButton);
    });

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
        new Promise(resolve => setTimeout(resolve, 100))
      );

    renderWithProviders(<NewBooking />);

    await waitFor(() => {
      // Fill in the form
      const resourceSelect = screen.getByLabelText(/select resource/i);
      fireEvent.change(resourceSelect, { target: { value: '1' } });

      const dateInput = screen.getByLabelText(/date/i);
      fireEvent.change(dateInput, { target: { value: '2024-03-20' } });

      const timeSlotCheckbox = screen.getByLabelText('09:00 - 10:00');
      fireEvent.click(timeSlotCheckbox);

      const purposeInput = screen.getByLabelText(/purpose/i);
      fireEvent.change(purposeInput, { target: { value: 'Test booking' } });

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /create booking/i });
      fireEvent.click(submitButton);
    });

    expect(screen.getByText(/creating booking/i)).toBeInTheDocument();
  });
}); 