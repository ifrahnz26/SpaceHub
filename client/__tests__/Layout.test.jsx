import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Layout Component', () => {
  test('renders layout with children', () => {
    renderWithRouter(
      <Layout>
        <div data-testid="test-child">Test Content</div>
      </Layout>
    );
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('renders sidebar and main content', () => {
    renderWithRouter(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    
    expect(screen.getByRole('complementary')).toBeInTheDocument(); // Sidebar
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
}); 