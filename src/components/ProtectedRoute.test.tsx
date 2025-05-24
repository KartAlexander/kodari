import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute'; // Adjust import path
import { useAuth, AuthContextType } from '../contexts/AuthContext'; // Adjust import path

// Mock the useAuth hook
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the Navigate component from react-router-dom
// We need to capture its props
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // Import and retain default behavior
  Navigate: (props: any) => {
    mockNavigate(props); // Capture props passed to Navigate
    return <div data-testid="mock-navigate" />; // Render a placeholder
  },
}));

const TestChildComponent = () => <div data-testid="child-component">Protected Content</div>;
const LoadingComponent = () => <div>Loading...</div>; // Assuming your ProtectedRoute renders this text

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    // Clear mock usage before each test
    (useAuth as jest.Mock).mockClear();
    mockNavigate.mockClear();
  });

  it('should render loading indicator when auth state is loading', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
      // Mock other context values if your ProtectedRoute uses them
    } as AuthContextType);

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={<ProtectedRoute><TestChildComponent /></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    );

    // Check for loading indicator. This depends on how your ProtectedRoute shows loading.
    // If it's a specific component or text:
    expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument(); 
    expect(screen.queryByTestId('child-component')).not.toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should navigate to /login if user is not authenticated and not loading', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    } as AuthContextType);

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={<ProtectedRoute><TestChildComponent /></ProtectedRoute>} />
          <Route path="/login" element={<div>Login Page</div>} /> 
        </Routes>
      </MemoryRouter>
    );
    
    expect(screen.queryByTestId('child-component')).not.toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/login', replace: true });
    expect(screen.queryByText(/loading\.\.\./i)).not.toBeInTheDocument();
  });

  it('should render children if user is authenticated and not loading', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '1', name: 'Test User', email: 'test@example.com' }, // Example user object
      loading: false,
    } as AuthContextType);

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={<ProtectedRoute><TestChildComponent /></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('child-component')).toBeInTheDocument();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.queryByText(/loading\.\.\./i)).not.toBeInTheDocument();
  });

  it('should preserve location state when redirecting to login', () => {
    (useAuth as jest.Mock).mockReturnValue({
        user: null,
        loading: false,
      } as AuthContextType);
  
      const initialLocationState = { from: { pathname: '/protected-with-state' } };
  
      render(
        // Wrap with a component that can provide location state
        <MemoryRouter initialEntries={[{ pathname: '/protected-with-state', state: initialLocationState.from }]}>
          <Routes>
            <Route path="/protected-with-state" element={
              <ProtectedRoute>
                <TestChildComponent />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      );
      
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      // react-router-dom's Navigate component's 'state' prop is used for this
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/login',
          replace: true,
          state: expect.objectContaining({ from: expect.objectContaining({ pathname: '/protected-with-state' }) })
        })
      );
  });
});
