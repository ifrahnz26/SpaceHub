import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import NewBooking from '../NewBooking';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user'
};

const mockToken = 'mock-token';

Storage.prototype.getItem = jest.fn((key) => {
  if (key === 'user') return JSON.stringify(mockUser);
  if (key === 'token') return mockToken;
  return null;
});

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('New Booking Page', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders initial state with department selection', () => {
    renderWithProviders(<NewBooking />);
    
    // Check for department tabs
    expect(screen.getByText('CSE')).toBeInTheDocument();
    expect(screen.getByText('ISE')).toBeInTheDocument();
    expect(screen.getByText('AIML')).toBeInTheDocument();
    
    // Check for form elements
    expect(screen.getByText('No resources found for this department.')).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Number of Attendees')).toBeInTheDocument();
    expect(screen.getByLabelText('Purpose')).toBeInTheDocument();
    
    // Check for buttons
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit request/i })).toBeInTheDocument();
  });

  it('loads resources when department is selected', async () => {
    const mockResources = [
      { _id: 'res1', name: 'Resource 1' },
      { _id: 'res2', name: 'Resource 2' }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ resources: mockResources })
    });

    renderWithProviders(<NewBooking />);
    
    // Click on CSE department tab
    const cseTab = screen.getByText('CSE');
    await act(async () => {
      fireEvent.click(cseTab);
    });
    
    // Wait for resources to load
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('Resource 1')).toBeInTheDocument();
      expect(screen.getByText('Resource 2')).toBeInTheDocument();
    });
  });

  it('shows available time slots when resource and date are selected', async () => {
    const mockSlots = ['09:00 - 10:00', '10:00 - 11:00'];

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ resources: [{ _id: 'res1', name: 'Resource 1' }] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ availableSlots: mockSlots })
      });

    renderWithProviders(<NewBooking />);

    // Click on CSE department tab
    const cseTab = screen.getByText('CSE');
    await act(async () => {
      fireEvent.click(cseTab);
    });

    // Wait for resource select to appear
    const resourceSelect = await screen.findByRole('combobox');
    await act(async () => {
      fireEvent.change(resourceSelect, {
        target: { value: 'res1' }
      });
    });

    // Select date
    const dateInput = screen.getByLabelText('Date');
    await act(async () => {
      fireEvent.change(dateInput, {
        target: { value: '2024-03-20' }
      });
    });

    // Check for time slots
    await waitFor(() => {
      expect(screen.getByText('09:00 - 10:00')).toBeInTheDocument();
      expect(screen.getByText('10:00 - 11:00')).toBeInTheDocument();
    });
  });

  it('handles error when loading resources fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    renderWithProviders(<NewBooking />);

    // Click on CSE department tab
    const cseTab = screen.getByText('CSE');
    await act(async () => {
      fireEvent.click(cseTab);
    });

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('No resources found for this department.')).toBeInTheDocument();
    });
  });

  it('validates required fields before submission', async () => {
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    renderWithProviders(<NewBooking />);

    // Click on CSE department tab
    const cseTab = screen.getByText('CSE');
    await act(async () => {
      fireEvent.click(cseTab);
    });

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /submit request/i });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Check for alert
    expect(mockAlert).toHaveBeenCalledWith('Missing required fields');
    
    mockAlert.mockRestore();
  });
});