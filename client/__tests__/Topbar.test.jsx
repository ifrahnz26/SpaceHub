import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Topbar from '../components/Topbar';

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Topbar Component', () => {
  test('renders topbar with logo', () => {
    renderWithRouter(<Topbar />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    renderWithRouter(<Topbar />);
    const navLinks = screen.getAllByRole('link');
    expect(navLinks.length).toBeGreaterThan(0);
  });
}); 