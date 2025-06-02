import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import RoleBasedDashboard from '../RoleBasedDashboard';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(() => 'mock-token'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

const mockUserData = {
  user: {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    department: 'Computer Science'
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

describe('Role Based Dashboard Page', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockLocalStorage.getItem.mockClear();
  });

  test('renders loading state initially', () => {
    renderWithProviders(<RoleBasedDashboard />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('redirects to user dashboard for regular users', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      })
    );

    renderWithProviders(<RoleBasedDashboard />);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/dashboard');
    });
  });

  test('redirects to HOD dashboard for HOD users', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          ...mockUserData,
          user: { ...mockUserData.user, role: 'hod' }
        })
      })
    );

    renderWithProviders(<RoleBasedDashboard />);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/hod-dashboard');
    });
  });

  test('redirects to venue incharge dashboard for venue incharges', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          ...mockUserData,
          user: { ...mockUserData.user, role: 'venue_incharge' }
        })
      })
    );

    renderWithProviders(<RoleBasedDashboard />);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/venue-dashboard');
    });
  });

  test('redirects to admin dashboard for admin users', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          ...mockUserData,
          user: { ...mockUserData.user, role: 'admin' }
        })
      })
    );

    renderWithProviders(<RoleBasedDashboard />);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/admin-dashboard');
    });
  });

  test('displays error message when fetch fails', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Failed to fetch'))
    );

    renderWithProviders(<RoleBasedDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/error loading user data/i)).toBeInTheDocument();
    });
  });

  test('handles unauthorized access', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' })
      })
    );

    renderWithProviders(<RoleBasedDashboard />);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
  });

  test('handles invalid role', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          ...mockUserData,
          user: { ...mockUserData.user, role: 'invalid_role' }
        })
      })
    );

    renderWithProviders(<RoleBasedDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/invalid user role/i)).toBeInTheDocument();
    });
  });
}); 