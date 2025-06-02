import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import AnalyticsDashboard from '../AnalyticsDashboard';

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
  bookingStats: {
    total: 100,
    byStatus: {
      pending: 20,
      approved: 70,
      rejected: 10
    },
    byResource: [
      { name: 'Room 101', count: 30 },
      { name: 'Room 102', count: 40 },
      { name: 'Room 103', count: 30 }
    ],
    byDepartment: [
      { name: 'Computer Science', count: 40 },
      { name: 'Electrical', count: 35 },
      { name: 'Mechanical', count: 25 }
    ]
  },
  timeRangeStats: {
    daily: [
      { date: '2024-03-01', count: 10 },
      { date: '2024-03-02', count: 15 },
      { date: '2024-03-03', count: 12 }
    ],
    weekly: [
      { week: 'Week 1', count: 45 },
      { week: 'Week 2', count: 55 }
    ],
    monthly: [
      { month: 'January', count: 180 },
      { month: 'February', count: 220 }
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

describe('Analytics Dashboard Page', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockLocalStorage.getItem.mockClear();
  });

  test('renders dashboard with loading state initially', () => {
    renderWithProviders(<AnalyticsDashboard />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('displays booking statistics after successful fetch', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAnalyticsData)
      })
    );

    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument(); // Total bookings
      expect(screen.getByText('20')).toBeInTheDocument(); // Pending bookings
      expect(screen.getByText('70')).toBeInTheDocument(); // Approved bookings
      expect(screen.getByText('10')).toBeInTheDocument(); // Rejected bookings
    });
  });

  test('displays resource usage statistics', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAnalyticsData)
      })
    );

    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Room 101')).toBeInTheDocument();
      expect(screen.getByText('Room 102')).toBeInTheDocument();
      expect(screen.getByText('Room 103')).toBeInTheDocument();
    });
  });

  test('displays department-wise statistics', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAnalyticsData)
      })
    );

    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Computer Science')).toBeInTheDocument();
      expect(screen.getByText('Electrical')).toBeInTheDocument();
      expect(screen.getByText('Mechanical')).toBeInTheDocument();
    });
  });

  test('handles time range selection', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAnalyticsData)
      })
    );

    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      const timeRangeSelect = screen.getByLabelText(/time range/i);
      fireEvent.change(timeRangeSelect, { target: { value: 'weekly' } });
    });

    expect(screen.getByText('Week 1')).toBeInTheDocument();
    expect(screen.getByText('Week 2')).toBeInTheDocument();
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
            bookingStats: {
              ...mockAnalyticsData.bookingStats,
              total: 101
            }
          })
        })
      );

    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);
    });

    await waitFor(() => {
      expect(screen.getByText('101')).toBeInTheDocument(); // Updated total bookings
    });
  });

  test('displays error message when fetch fails', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Failed to fetch'))
    );

    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/error loading analytics/i)).toBeInTheDocument();
    });
  });

  test('exports analytics data', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAnalyticsData)
      })
    );

    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      const exportButton = screen.getByRole('button', { name: /export/i });
      fireEvent.click(exportButton);
    });

    // Verify that the download was triggered
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/analytics/export'));
  });
}); 