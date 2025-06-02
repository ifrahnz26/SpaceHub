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
    
    // Check for main headings
    expect(screen.getByText(/campus resource/i)).toBeInTheDocument();
    expect(screen.getByText(/booking made simple/i)).toBeInTheDocument();
    
    // Check for role selection buttons
    expect(screen.getByText(/login as faculty/i)).toBeInTheDocument();
    expect(screen.getByText(/login as venue incharge/i)).toBeInTheDocument();
  });

  test('shows login form when faculty role is selected', async () => {
    renderWithProviders(<Login />);
    
    // Click faculty login button
    const facultyButton = screen.getByText(/login as faculty/i);
    fireEvent.click(facultyButton);

    // Check for login form elements
    await waitFor(() => expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument());
    await waitFor(() => expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument());
    await waitFor(() => expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument());
  });

  test('handles successful login', async () => {
    // Mock successful login response
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
    
    // Select faculty role
    const facultyButton = screen.getByText(/login as faculty/i);
    fireEvent.click(facultyButton);

    // Fill in login form
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'faculty@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Check for successful login
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'mock-token');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('handles login error', async () => {
    // Mock failed login response
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({
          error: 'Invalid credentials'
        })
      })
    );

    renderWithProviders(<Login />);
    
    // Select faculty role
    const facultyButton = screen.getByText(/login as faculty/i);
    fireEvent.click(facultyButton);

    // Fill in login form with invalid credentials
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    // Check for error message
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Invalid credentials');
    });
  });

  test('shows test account information', async () => {
    renderWithProviders(<Login />);
    
    // Select faculty role
    const facultyButton = screen.getByText(/login as faculty/i);
    fireEvent.click(facultyButton);

    // Check for test account information
    await waitFor(() => {
      expect(screen.getByText(/test accounts/i)).toBeInTheDocument();
      expect(screen.getByText(/faculty@test.com/i)).toBeInTheDocument();
      expect(screen.getByText(/incharge@test.com/i)).toBeInTheDocument();
      expect(screen.getByText(/hod@test.com/i)).toBeInTheDocument();
    });
  });
}); 