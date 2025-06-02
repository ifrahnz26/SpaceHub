import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Dashboard from '../Dashboard';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(() => 'mock-token'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Dashboard Page', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockLocalStorage.getItem.mockClear();
  });

  test('renders loading state when user is not loaded', () => {
    renderWithProviders(<Dashboard />);
    expect(screen.getByText(/loading your dashboard/i)).toBeInTheDocument();
  });

  test('renders faculty dashboard with statistics', async () => {
    // Mock user context
    const mockUser = {
      name: 'John Doe',
      role: 'Faculty',
      department: 'Computer Science'
    };

    // Mock bookings data
    const mockBookings = [
      { status: 'Approved', date: '2024-03-01' },
      { status: 'Rejected', date: '2024-03-02' },
      { status: 'Pending', date: '2024-03-03' }
    ];

    // Mock fetch response
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockBookings)
      })
    );

    // Mock AuthContext
    jest.spyOn(require('../../context/AuthContext'), 'useAuth').mockReturnValue({
      user: mockUser
    });

    renderWithProviders(<Dashboard />);

    // Check for welcome message
    await screen.findByText(/welcome, john doe!/i);

    // Wait for loading to complete and check for statistics cards
    await screen.findByText(/your booking statistics/i);
    await screen.findByText(/total bookings made/i);
    await screen.findByText(/approved bookings/i);
    await screen.findByText(/rejected bookings/i);
    await screen.findByText(/pending bookings/i);

    // Check for charts
    expect(screen.getByText(/booking status breakdown/i)).toBeInTheDocument();
    expect(screen.getByText(/monthly booking trend/i)).toBeInTheDocument();
  });

  test('renders student dashboard', () => {
    // Mock user context
    const mockUser = {
      name: 'Jane Smith',
      role: 'Student',
      department: 'Computer Science'
    };

    // Mock AuthContext
    jest.spyOn(require('../../context/AuthContext'), 'useAuth').mockReturnValue({
      user: mockUser
    });

    renderWithProviders(<Dashboard />);

    // Check for student dashboard content
    expect(screen.getByRole('heading', { name: /your dashboard/i })).toBeInTheDocument();
    expect(screen.getByText(/this is your dashboard as a student/i)).toBeInTheDocument();
  });

  test('handles error state when fetching statistics fails', async () => {
    // Mock user context
    const mockUser = {
      name: 'John Doe',
      role: 'Faculty',
      department: 'Computer Science'
    };

    // Mock fetch error
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed to fetch bookings' })
      })
    );

    // Mock AuthContext
    jest.spyOn(require('../../context/AuthContext'), 'useAuth').mockReturnValue({
      user: mockUser
    });

    renderWithProviders(<Dashboard />);

    // Check for error message
    await screen.findByText(/failed to load your booking statistics/i);
  });
}); 