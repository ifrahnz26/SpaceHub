import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Login from '../Login';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(() => 'mock-token'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock window.alert
window.alert = jest.fn();

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Page', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockLocalStorage.getItem.mockClear();
    mockNavigate.mockClear();
    window.alert.mockClear();
  });

  test('renders login page with role selection', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByText(/campus resource/i)).toBeInTheDocument();
    expect(screen.getByText(/booking made simple/i)).toBeInTheDocument();
    expect(screen.getByText(/login as faculty/i)).toBeInTheDocument();
    expect(screen.getByText(/login as venue incharge/i)).toBeInTheDocument();
  });

  test('shows login form when faculty role is selected', async () => {
    renderWithProviders(<Login />);
    
    fireEvent.click(screen.getByText(/login as faculty/i));

    expect(await screen.findByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(await screen.findByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('handles successful login', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          token: 'mock-token',
          user: {
            _id: '1',
            name: 'John Doe',
            email: 'john@test.com',
            role: 'Faculty'
          }
        })
      })
    );

    renderWithProviders(<Login />);
    
    fireEvent.click(screen.getByText(/login as faculty/i));

    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'faculty@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'mock-token'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'));
  });

  test('handles login error', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({
          error: 'Invalid credentials'
        })
      })
    );

    renderWithProviders(<Login />);
    
    fireEvent.click(screen.getByText(/login as faculty/i));

    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'wrong@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Invalid credentials'));
  });

  test('shows test account information', async () => {
    renderWithProviders(<Login />);
    
    fireEvent.click(screen.getByText(/login as faculty/i));

    expect(await screen.findByText(/test accounts/i)).toBeInTheDocument();
    expect(await screen.findByText(/faculty@test.com/i)).toBeInTheDocument();
    expect(await screen.findByText(/incharge@test.com/i)).toBeInTheDocument();
    expect(await screen.findByText(/hod@test.com/i)).toBeInTheDocument();
  });
});
