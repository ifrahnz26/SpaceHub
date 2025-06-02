import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import VenueDashboard from '../../pages/VenueDashboard';

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
    capacity: 50,
    type: 'classroom',
    facilities: ['projector', 'whiteboard']
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
      timeSlots: ['10:00 - 11:00'],
      purpose: 'Group Discussion',
      status: 'pending'
    }
  ],
  blockedSlots: [
    {
      date: '2024-03-22',
      timeSlots: ['11:00 - 12:00'],
      reason: 'Maintenance'
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

describe('VenueDashboard Page', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockLocalStorage.getItem.mockClear();
  });

  test('renders dashboard with loading state initially', () => {
    renderWithProviders(<VenueDashboard />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('displays venue information after successful fetch', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockVenueData)
      })
    );

    renderWithProviders(<VenueDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Room 101')).toBeInTheDocument();
      expect(screen.getByText('Capacity: 50')).toBeInTheDocument();
      expect(screen.getByText('Type: classroom')).toBeInTheDocument();
    });
  });

  test('displays bookings and blocked slots', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockVenueData)
      })
    );

    renderWithProviders(<VenueDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Class Lecture')).toBeInTheDocument();
      expect(screen.getByText('Group Discussion')).toBeInTheDocument();
      expect(screen.getByText('Maintenance')).toBeInTheDocument();
    });
  });

  test('handles booking approval', async () => {
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
          json: () => Promise.resolve({ message: 'Booking approved' })
        })
      );

    renderWithProviders(<VenueDashboard />);

    await waitFor(() => {
      const approveButton = screen.getAllByRole('button', { name: /approve/i })[0];
      fireEvent.click(approveButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/booking approved successfully/i)).toBeInTheDocument();
    });
  });

  test('handles booking rejection', async () => {
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
          json: () => Promise.resolve({ message: 'Booking rejected' })
        })
      );

    renderWithProviders(<VenueDashboard />);

    await waitFor(() => {
      const rejectButton = screen.getAllByRole('button', { name: /reject/i })[0];
      fireEvent.click(rejectButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/booking rejected successfully/i)).toBeInTheDocument();
    });
  });

  test('filters bookings by status', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockVenueData)
      })
    );

    renderWithProviders(<VenueDashboard />);

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

    renderWithProviders(<VenueDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/error loading venue data/i)).toBeInTheDocument();
    });
  });

  test('handles date range filtering', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockVenueData)
      })
    );

    renderWithProviders(<VenueDashboard />);

    await waitFor(() => {
      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);

      fireEvent.change(startDateInput, { target: { value: '2024-03-20' } });
      fireEvent.change(endDateInput, { target: { value: '2024-03-21' } });
    });

    expect(screen.getByText('Class Lecture')).toBeInTheDocument();
    expect(screen.getByText('Group Discussion')).toBeInTheDocument();
    expect(screen.queryByText('Maintenance')).not.toBeInTheDocument();
  });
}); 