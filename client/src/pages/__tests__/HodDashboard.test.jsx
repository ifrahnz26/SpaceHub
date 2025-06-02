import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import HodDashboard from '../../pages/HodDashboard';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(() => 'mock-token'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

const mockDepartmentData = {
  department: {
    name: 'Computer Science',
    totalStaff: 20,
    totalStudents: 200
  },
  bookings: [
    {
      _id: '1',
      resource: { name: 'Room 101' },
      date: '2024-03-20',
      timeSlots: ['09:00 - 10:00'],
      purpose: 'Class Lecture',
      status: 'approved',
      requestedBy: 'John Doe'
    },
    {
      _id: '2',
      resource: { name: 'Room 102' },
      date: '2024-03-21',
      timeSlots: ['10:00 - 11:00'],
      purpose: 'Group Discussion',
      status: 'pending',
      requestedBy: 'Jane Smith'
    }
  ],
  staffRequests: [
    {
      _id: '1',
      staffName: 'John Doe',
      date: '2024-03-20',
      purpose: 'Faculty Meeting'
    },
    {
      _id: '2',
      staffName: 'Jane Smith',
      date: '2024-03-21',
      purpose: 'Research Discussion'
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

describe('HodDashboard Page', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockLocalStorage.getItem.mockClear();
  });

  test('renders dashboard with loading state initially', () => {
    renderWithProviders(<HodDashboard />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('displays department information after successful fetch', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockDepartmentData)
      })
    );

    renderWithProviders(<HodDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Computer Science')).toBeInTheDocument();
      expect(screen.getByText('Total Staff: 20')).toBeInTheDocument();
      expect(screen.getByText('Total Students: 200')).toBeInTheDocument();
    });
  });

  test('displays department bookings', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockDepartmentData)
      })
    );

    renderWithProviders(<HodDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Class Lecture')).toBeInTheDocument();
      expect(screen.getByText('Group Discussion')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  test('handles booking approval', async () => {
    fetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDepartmentData)
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Booking approved' })
        })
      );

    renderWithProviders(<HodDashboard />);

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
          json: () => Promise.resolve(mockDepartmentData)
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Booking rejected' })
        })
      );

    renderWithProviders(<HodDashboard />);

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
        json: () => Promise.resolve(mockDepartmentData)
      })
    );

    renderWithProviders(<HodDashboard />);

    await waitFor(() => {
      const filterSelect = screen.getByLabelText(/filter by status/i);
      fireEvent.change(filterSelect, { target: { value: 'approved' } });
    });

    expect(screen.getByText('Class Lecture')).toBeInTheDocument();
    expect(screen.queryByText('Group Discussion')).not.toBeInTheDocument();
  });

  test('displays staff requests', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockDepartmentData)
      })
    );

    renderWithProviders(<HodDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Faculty Meeting')).toBeInTheDocument();
      expect(screen.getByText('Research Discussion')).toBeInTheDocument();
    });
  });

  test('handles staff request approval', async () => {
    fetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDepartmentData)
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Request approved' })
        })
      );

    renderWithProviders(<HodDashboard />);

    await waitFor(() => {
      const approveButton = screen.getAllByRole('button', { name: /approve request/i })[0];
      fireEvent.click(approveButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/request approved successfully/i)).toBeInTheDocument();
    });
  });

  test('displays error message when fetch fails', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Failed to fetch'))
    );

    renderWithProviders(<HodDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/error loading department data/i)).toBeInTheDocument();
    });
  });

  test('handles date range filtering', async () => {
    fetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDepartmentData)
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            ...mockDepartmentData,
            bookings: [mockDepartmentData.bookings[0]]
          })
        })
      );

    renderWithProviders(<HodDashboard />);

    await waitFor(() => {
      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);

      fireEvent.change(startDateInput, { target: { value: '2024-03-20' } });
      fireEvent.change(endDateInput, { target: { value: '2024-03-20' } });
    });

    expect(screen.getByText('Class Lecture')).toBeInTheDocument();
    expect(screen.queryByText('Group Discussion')).not.toBeInTheDocument();
  });
}); 