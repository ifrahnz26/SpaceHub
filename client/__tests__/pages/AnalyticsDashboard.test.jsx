import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import AnalyticsDashboard from '../../pages/AnalyticsDashboard';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(() => 'mock-token'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

const mockAnalyticsData = {
  totalBookings: 100,
  approvedBookings: 80,
  pendingBookings: 15,
  rejectedBookings: 5,
  venueUtilization: [
    { venue: 'Room 101', utilization: 75 },
    { venue: 'Room 102', utilization: 60 }
  ],
  departmentStats: [
    { department: 'Computer Science', bookings: 40 },
    { department: 'Mathematics', bookings: 30 }
  ],
  timeSlotStats: [
    { timeSlot: '09:00 - 10:00', bookings: 25 },
    { timeSlot: '10:00 - 11:00', bookings: 35 }
  ],
  monthlyStats: [
    { month: 'January', bookings: 30 },
    { month: 'February', bookings: 40 }
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

describe('AnalyticsDashboard Page', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockLocalStorage.getItem.mockClear();
  });

  test('renders dashboard with loading state initially', () => {
    renderWithProviders(<AnalyticsDashboard />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('displays summary statistics after successful fetch', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAnalyticsData)
      })
    );

    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Total Bookings: 100')).toBeInTheDocument();
      expect(screen.getByText('Approved: 80')).toBeInTheDocument();
      expect(screen.getByText('Pending: 15')).toBeInTheDocument();
      expect(screen.getByText('Rejected: 5')).toBeInTheDocument();
    });
  });

  test('displays venue utilization chart', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAnalyticsData)
      })
    );

    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Venue Utilization')).toBeInTheDocument();
      expect(screen.getByText('Room 101')).toBeInTheDocument();
      expect(screen.getByText('Room 102')).toBeInTheDocument();
    });
  });

  test('displays department statistics', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAnalyticsData)
      })
    );

    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Department Statistics')).toBeInTheDocument();
      expect(screen.getByText('Computer Science')).toBeInTheDocument();
      expect(screen.getByText('Mathematics')).toBeInTheDocument();
    });
  });

  test('handles date range filtering', async () => {
    fetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAnalyticsData)
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            ...mockAnalyticsData,
            totalBookings: 50
          })
        })
      );

    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);

      fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
      fireEvent.change(endDateInput, { target: { value: '2024-02-01' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Total Bookings: 50')).toBeInTheDocument();
    });
  });

  test('handles export functionality', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAnalyticsData)
      })
    );

    const mockBlob = new Blob(['test'], { type: 'text/csv' });
    const mockUrl = 'mock-url';
    global.URL.createObjectURL = jest.fn(() => mockUrl);
    global.URL.revokeObjectURL = jest.fn();

    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      const exportButton = screen.getByRole('button', { name: /export/i });
      fireEvent.click(exportButton);
    });

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
  });

  test('displays error message when fetch fails', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Failed to fetch'))
    );

    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/error loading analytics data/i)).toBeInTheDocument();
    });
  });

  test('handles refresh functionality', async () => {
    fetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAnalyticsData)
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            ...mockAnalyticsData,
            totalBookings: 120
          })
        })
      );

    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Total Bookings: 120')).toBeInTheDocument();
    });
  });

  test('displays time slot statistics', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAnalyticsData)
      })
    );

    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Time Slot Statistics')).toBeInTheDocument();
      expect(screen.getByText('09:00 - 10:00')).toBeInTheDocument();
      expect(screen.getByText('10:00 - 11:00')).toBeInTheDocument();
    });
  });

  test('displays monthly statistics', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAnalyticsData)
      })
    );

    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Monthly Statistics')).toBeInTheDocument();
      expect(screen.getByText('January')).toBeInTheDocument();
      expect(screen.getByText('February')).toBeInTheDocument();
    });
  });
}); 