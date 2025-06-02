import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import NewBooking from '../NewBooking';

// Mocks
global.fetch = jest.fn();

const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user'
};
const mockToken = 'mock-token';

// Set up localStorage
beforeAll(() => {
  Storage.prototype.getItem = jest.fn((key) => {
    if (key === 'user') return JSON.stringify(mockUser);
    if (key === 'token') return mockToken;
    return null;
  });
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
    jest.clearAllMocks();
  });

  it('renders initial state with department selection', () => {
    renderWithProviders(<NewBooking />);

    expect(screen.getByText('CSE')).toBeInTheDocument();
    expect(screen.getByText('ISE')).toBeInTheDocument();
    expect(screen.getByText('AIML')).toBeInTheDocument();
    expect(screen.getByText('No resources found for this department.')).toBeInTheDocument();

    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Number of Attendees')).toBeInTheDocument();
    expect(screen.getByLabelText('Purpose')).toBeInTheDocument();

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

    fireEvent.click(screen.getByText('CSE'));

    const resourceSelect = await screen.findByRole('combobox');
    expect(resourceSelect).toBeInTheDocument();

    expect(await screen.findByText('Resource 1')).toBeInTheDocument();
    expect(await screen.findByText('Resource 2')).toBeInTheDocument();
  });

  it('shows available time slots when resource and date are selected', async () => {
    const mockResources = [{ _id: 'res1', name: 'Resource 1' }];
    const mockSlots = ['09:00 - 10:00', '10:00 - 11:00'];

    fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ resources: mockResources }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ availableSlots: mockSlots }) });

    renderWithProviders(<NewBooking />);
    fireEvent.click(screen.getByText('CSE'));

    const resourceSelect = await screen.findByRole('combobox');

    fireEvent.change(resourceSelect, { target: { value: 'res1' } });

    const dateInput = screen.getByLabelText('Date');
    fireEvent.change(dateInput, { target: { value: '2024-03-20' } });

    expect(await screen.findByText('09:00 - 10:00')).toBeInTheDocument();
    expect(await screen.findByText('10:00 - 11:00')).toBeInTheDocument();
  });

  it('handles error when loading resources fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    renderWithProviders(<NewBooking />);
    fireEvent.click(screen.getByText('CSE'));

    await waitFor(() => {
      expect(screen.getByText('No resources found for this department.')).toBeInTheDocument();
    });
  });

  it('validates required fields before submission', async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    renderWithProviders(<NewBooking />);
    fireEvent.click(screen.getByText('CSE'));

    const submitBtn = screen.getByRole('button', { name: /submit request/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Missing required fields');
    });

    alertMock.mockRestore();
  });
});
