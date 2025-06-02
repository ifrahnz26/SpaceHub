import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

// Mock the auth context
const mockAuthContext = {
  user: null,
  loading: false,
  error: null,
  login: jest.fn(),
  logout: jest.fn(),
  isAuthenticated: false,
  userRole: null,
};

// Custom render function that includes providers
export function renderWithProviders(ui, { authState = mockAuthContext, ...renderOptions } = {}) {
  function Wrapper({ children }) {
    return (
      <BrowserRouter>
        <AuthProvider initialState={authState}>
          {children}
        </AuthProvider>
      </BrowserRouter>
    );
  }
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Helper to create mock auth states
export const createMockAuthState = (overrides = {}) => ({
  ...mockAuthContext,
  ...overrides,
});

// Common auth states
export const mockAuthStates = {
  authenticated: {
    user: { id: 1, name: 'Test User', email: 'test@example.com' },
    loading: false,
    error: null,
    isAuthenticated: true,
    userRole: 'user',
  },
  loading: {
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
    userRole: null,
  },
  error: {
    user: null,
    loading: false,
    error: 'Authentication failed',
    isAuthenticated: false,
    userRole: null,
  },
  hod: {
    user: { id: 1, name: 'HOD User', email: 'hod@example.com' },
    loading: false,
    error: null,
    isAuthenticated: true,
    userRole: 'hod',
  },
  venueIncharge: {
    user: { id: 1, name: 'Venue Incharge', email: 'venue@example.com' },
    loading: false,
    error: null,
    isAuthenticated: true,
    userRole: 'venue_incharge',
  },
  admin: {
    user: { id: 1, name: 'Admin User', email: 'admin@example.com' },
    loading: false,
    error: null,
    isAuthenticated: true,
    userRole: 'admin',
  },
}; 