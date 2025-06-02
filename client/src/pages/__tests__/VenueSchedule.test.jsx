import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import VenueSchedule from '../VenueSchedule';

// Mock fetch
beforeEach(() => {
  global.fetch = jest.fn();
});
afterEach(() => {
  jest.clearAllMocks();
});

const mockToken = 'mock-token';
Storage.prototype.getItem = jest.fn((key) => {
  if (key === 'token') return mockToken;
  return null;
});

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  );
};

describe('VenueSchedule Page', () => {
  it('renders and loads venues for non-incharge user', async () => {
    // Mock venues
    const mockVenues = [
      { _id: 'v1', name: 'Venue 1' },
      { _id: 'v2', name: 'Venue 2' }
    ];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockVenues
    });

    renderWithProviders(<VenueSchedule />);

    // Wait for venue select to appear
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('Venue 1')).toBeInTheDocument();
      expect(screen.getByText('Venue 2')).toBeInTheDocument();
    });
  });

  it('renders schedule table and displays available slots', async () => {
    // Mock venues
    const mockVenues = [
      { _id: 'v1', name: 'Venue 1' }
    ];
    // First fetch for venues
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockVenues
    });
    // Next 7 fetches for schedule (one per day)
    for (let i = 0; i < 7; i++) {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [] // No bookings, all slots available
      });
    }

    renderWithProviders(<VenueSchedule />);

    // Wait for table to appear
    await waitFor(() => {
      expect(screen.getByText('Venue Schedule')).toBeInTheDocument();
      expect(screen.getByText('09:00 - 10:00')).toBeInTheDocument();
      expect(screen.getAllByText('Available').length).toBeGreaterThan(0);
    });
  });

  it('shows booking info in the schedule table', async () => {
    // Mock venues
    const mockVenues = [
      { _id: 'v1', name: 'Venue 1' }
    ];
    // First fetch for venues
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockVenues
    });
    // Next 7 fetches for schedule (one per day)
    const booking = {
      _id: 'b1',
      date: new Date().toISOString().split('T')[0],
      timeSlots: ['09:00 - 10:00'],
      purpose: 'Test Event',
      status: 'Approved',
      blockedByIncharge: false
    };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [booking]
    });
    for (let i = 1; i < 7; i++) {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });
    }

    renderWithProviders(<VenueSchedule />);

    // Wait for booking to appear
    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.getByText('09:00 - 10:00')).toBeInTheDocument();
    });
  });
}); 