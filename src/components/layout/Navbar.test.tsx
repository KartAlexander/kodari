import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar'; // Adjust import path as necessary
import { useAuth, AuthContextType, User } from '../../contexts/AuthContext'; // Adjust import path

// --- Mock useAuth ---
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));
const mockLogout = jest.fn();
const mockUseAuth = useAuth as jest.Mock;
// --- End Mock useAuth ---

// --- Mock useNavigate & Link (simplified Link) ---
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  // Simplifying Link for easier href assertion without full router context in some cases
  // However, MemoryRouter should handle proper Link behavior.
  // This mock is more of a fallback or if specific Link behavior needs to be controlled.
  Link: jest.fn(({ to, children, ...rest }: { to: string; children: React.ReactNode; [key: string]: any }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  )),
  useNavigate: () => mockNavigate,
}));
// --- End Mock useNavigate & Link ---

const renderNavbar = (authValue: Partial<AuthContextType>) => {
  mockUseAuth.mockReturnValue(authValue);
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );
};

describe('Navbar Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockLogout.mockClear();
    mockNavigate.mockClear();
    mockUseAuth.mockClear(); // Clear any previous mockReturnValue setups
  });

  describe('Navbar Rendering (Unauthenticated User)', () => {
    beforeEach(() => {
      renderNavbar({ user: null, loading: false, logout: mockLogout });
    });

    it('should render links for unauthenticated users', () => {
      expect(screen.getByRole('link', { name: /projects/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /swipe/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
    });

    it('should have correct href attributes for unauthenticated links', () => {
        expect(screen.getByRole('link', { name: /projects/i })).toHaveAttribute('href', '/projects');
        expect(screen.getByRole('link', { name: /swipe/i })).toHaveAttribute('href', '/swipe');
        expect(screen.getByRole('link', { name: /login/i })).toHaveAttribute('href', '/login');
        expect(screen.getByRole('link', { name: /register/i })).toHaveAttribute('href', '/register');
      });

    it('should NOT render links for authenticated users', () => {
      expect(screen.queryByRole('link', { name: /messages/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /profile/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
    });
  });

  describe('Navbar Rendering (Authenticated User)', () => {
    const mockAuthedUser: User = { id: '1', name: 'Test User', email: 'test@example.com' };
    beforeEach(() => {
      renderNavbar({ user: mockAuthedUser, loading: false, logout: mockLogout });
    });

    it('should render links for authenticated users', () => {
      expect(screen.getByRole('link', { name: /projects/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /swipe/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /messages/i })).toBeInTheDocument();
      // Profile link might contain the user's name or a generic "Profile"
      // Adjust selector if it's more specific, e.g., includes user's name.
      // For this example, assuming a generic "Profile" link text or an icon with aria-label.
      // If it's an avatar that's a link, query by role 'link' and check content.
      expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument(); 
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });

    it('should have correct href attributes for authenticated links', () => {
        expect(screen.getByRole('link', { name: /projects/i })).toHaveAttribute('href', '/projects');
        expect(screen.getByRole('link', { name: /swipe/i })).toHaveAttribute('href', '/swipe');
        expect(screen.getByRole('link', { name: /messages/i })).toHaveAttribute('href', '/messages');
        expect(screen.getByRole('link', { name: /profile/i })).toHaveAttribute('href', `/profile/${mockAuthedUser.id}`); // Assuming this path structure
      });
      
    it('should NOT render links for unauthenticated users', () => {
      expect(screen.queryByRole('link', { name: /login/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /register/i })).not.toBeInTheDocument();
    });

    // If Navbar displays user's name or avatar:
    // it('should display user-specific information (e.g., name)', () => {
    //   // This depends on how Navbar renders the user info.
    //   // Example: expect(screen.getByText(mockAuthedUser.name)).toBeInTheDocument();
    //   // Or, if it's part of the profile link:
    //   // const profileLink = screen.getByRole('link', { name: new RegExp(mockAuthedUser.name, 'i') });
    //   // expect(profileLink).toBeInTheDocument();
    // });
  });

  describe('Logout Button Functionality (Authenticated User)', () => {
    const mockAuthedUser: User = { id: '1', name: 'Test User', email: 'test@example.com' };
    beforeEach(() => {
      renderNavbar({ user: mockAuthedUser, loading: false, logout: mockLogout });
    });

    it('should call logout and navigate on logout button click', async () => {
      fireEvent.click(screen.getByRole('button', { name: /logout/i }));
      
      expect(mockLogout).toHaveBeenCalledTimes(1);
      
      // Check for navigation, assuming logout navigates to home or login page
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/'); // Or '/login'
      });
    });
  });

  describe('Navbar Rendering (Loading State)', () => {
    beforeEach(() => {
      renderNavbar({ user: null, loading: true, logout: mockLogout });
    });

    it('should render specific links or minimal state when loading', () => {
      // Define expected behavior during loading.
      // For example, public links might still be visible.
      expect(screen.getByRole('link', { name: /projects/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /swipe/i })).toBeInTheDocument();
      
      // Links that depend on auth state might be hidden or replaced by a loading indicator.
      expect(screen.queryByRole('link', { name: /login/i })).not.toBeInTheDocument(); // Or it might show a loading spinner instead
      expect(screen.queryByRole('link', { name: /register/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /messages/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /profile/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();

      // Optional: Check for a loading indicator if one is explicitly rendered in Navbar during loading
      // Example: expect(screen.getByTestId('navbar-loading-indicator')).toBeInTheDocument();
    });
  });

  describe('Brand/Logo Link', () => {
    it('should render the brand logo/name and link to home page', () => {
      renderNavbar({ user: null, loading: false, logout: mockLogout }); // Auth state doesn't matter for brand
      
      // Assuming the brand is a link with text "CoFounders" or similar, or an image with alt text.
      // If it's an SVG logo, it might need a title or aria-label for accessibility.
      const brandLink = screen.getByRole('link', { name: /cofounders/i }); // Adjust if brand name is different
      expect(brandLink).toBeInTheDocument();
      expect(brandLink).toHaveAttribute('href', '/');
    });
  });
});
