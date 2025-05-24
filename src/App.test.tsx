import React, { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import App from './App'; // Assuming App.tsx is the default export
import { useAuth, AuthContextType, User } from './contexts/AuthContext';

// --- Mock Page Components ---
jest.mock('./pages/Home', () => () => <div data-testid="home-page">Home Page</div>);
jest.mock('./pages/Login', () => () => <div data-testid="login-page">Login Page</div>);
jest.mock('./pages/Register', () => () => <div data-testid="register-page">Register Page</div>);
jest.mock('./pages/Projects', () => () => <div data-testid="projects-page">Projects Page</div>);
jest.mock('./pages/ProjectDetail', () => () => <div data-testid="project-detail-page">Project Detail Page</div>);
jest.mock('./pages/Messages', () => () => <div data-testid="messages-page">Messages Page</div>);
jest.mock('./pages/SwipeInterface', () => () => <div data-testid="swipe-interface-page">Swipe Interface Page</div>);
jest.mock('./pages/CreateProject', () => () => <div data-testid="create-project-page">Create Project Page</div>);
jest.mock('./pages/Profile', () => () => <div data-testid="profile-page">Profile Page</div>);
jest.mock('./pages/NotFound', () => () => <div data-testid="not-found-page">Not Found Page</div>);
// --- End Mock Page Components ---

// --- Mock AuthContext ---
// AuthProvider is used in App.tsx, so we need a passthrough mock for it.
// useAuth will be controlled per test suite or per test.
jest.mock('./contexts/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: ReactNode }) => <div data-testid="auth-provider">{children}</div>,
}));
const mockUseAuth = useAuth as jest.Mock;
// --- End Mock AuthContext ---

// --- Render Helper ---
const renderApp = (initialRoute: string | string[] = ['/']) => {
  return render(
    <MemoryRouter initialEntries={typeof initialRoute === 'string' ? [initialRoute] : initialRoute}>
      <App />
    </MemoryRouter>
  );
};
// --- End Render Helper ---

describe('App Routing Configuration', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockUseAuth.mockClear();
  });

  describe('Public Routes', () => {
    beforeEach(() => {
        // For public routes, assume user is not logged in and auth is not loading
        mockUseAuth.mockReturnValue({ user: null, loading: false } as AuthContextType);
    });

    it('should render Home page for "/" route', () => {
      renderApp('/');
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    it('should render Login page for "/login" route', () => {
      renderApp('/login');
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('should render Register page for "/register" route', () => {
      renderApp('/register');
      expect(screen.getByTestId('register-page')).toBeInTheDocument();
    });

    it('should render Projects page for "/projects" route', () => {
      // Assuming /projects is a public route for viewing projects
      renderApp('/projects');
      expect(screen.getByTestId('projects-page')).toBeInTheDocument();
    });
  });

  describe('Protected Routes', () => {
    const mockAuthedUser: User = { id: 'user123', name: 'Test User', email: 'test@example.com', role: 'user' };

    describe('When Authenticated', () => {
      beforeEach(() => {
        mockUseAuth.mockReturnValue({ user: mockAuthedUser, loading: false } as AuthContextType);
      });

      it('should render Messages page for "/messages" route', () => {
        renderApp('/messages');
        expect(screen.getByTestId('messages-page')).toBeInTheDocument();
      });
      
      it('should render Messages page for "/messages/:conversationId" route', () => {
        renderApp('/messages/conv1');
        expect(screen.getByTestId('messages-page')).toBeInTheDocument();
      });

      it('should render Profile page for "/profile/:userId" route', () => {
        renderApp(`/profile/${mockAuthedUser.id}`);
        expect(screen.getByTestId('profile-page')).toBeInTheDocument();
      });

      it('should render Create Project page for "/create-project" route', () => {
        renderApp('/create-project');
        expect(screen.getByTestId('create-project-page')).toBeInTheDocument();
      });

      it('should render Swipe Interface page for "/swipe" route', () => {
        // Assuming /swipe is protected
        renderApp('/swipe');
        expect(screen.getByTestId('swipe-interface-page')).toBeInTheDocument();
      });
    });

    describe('When Unauthenticated', () => {
      beforeEach(() => {
        mockUseAuth.mockReturnValue({ user: null, loading: false } as AuthContextType);
      });

      const protectedRoutes = [
        { path: '/messages', name: 'Messages' },
        { path: '/messages/conv1', name: 'Messages with ID' },
        { path: '/profile/user123', name: 'Profile' }, 
        { path: '/create-project', name: 'Create Project' },
        { path: '/swipe', name: 'Swipe Interface' }, // Assuming /swipe is protected
      ];

      protectedRoutes.forEach(route => {
        it(`should redirect from "${route.path}" to Login page`, async () => {
          renderApp(route.path);
          // ProtectedRoute (used in App.tsx) should navigate to /login.
          // The Login page mock will then be rendered.
          await waitFor(() => {
            expect(screen.getByTestId('login-page')).toBeInTheDocument();
          });
        });
      });
    });
    
    describe('When Auth State is Loading', () => {
        beforeEach(() => {
          mockUseAuth.mockReturnValue({ user: null, loading: true } as AuthContextType);
        });
  
        // Test a mix of public and protected routes to see behavior
        // Public routes should still render. Protected routes should show their loading state.
        it('should render Home page correctly when auth is loading', () => {
            renderApp('/');
            expect(screen.getByTestId('home-page')).toBeInTheDocument();
        });

        it('should render Login page correctly when auth is loading', () => {
            renderApp('/login');
            expect(screen.getByTestId('login-page')).toBeInTheDocument();
        });
  
        it('should show loading indicator for protected route "/messages" when auth is loading', () => {
          renderApp('/messages');
          // This depends on ProtectedRoute rendering a loading indicator.
          // Assuming ProtectedRoute shows some text like "Loading..."
          expect(screen.getByText(/loading/i)).toBeInTheDocument(); 
          expect(screen.queryByTestId('messages-page')).not.toBeInTheDocument();
        });

        it('should show loading indicator for protected route "/create-project" when auth is loading', () => {
            renderApp('/create-project');
            expect(screen.getByText(/loading/i)).toBeInTheDocument();
            expect(screen.queryByTestId('create-project-page')).not.toBeInTheDocument();
          });
      });
  });

  describe('Dynamic Routes', () => {
    it('should render Project Detail page for "/projects/:id" route', () => {
      // Assuming this route can be accessed by unauthenticated users for viewing
      mockUseAuth.mockReturnValue({ user: null, loading: false } as AuthContextType);
      renderApp('/projects/project-xyz');
      expect(screen.getByTestId('project-detail-page')).toBeInTheDocument();
    });
  });

  describe('Not Found Route', () => {
    it('should render Not Found page for non-existent routes', () => {
      mockUseAuth.mockReturnValue({ user: null, loading: false } as AuthContextType);
      renderApp('/this-route-does-not-exist');
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });
  });
});
