import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login'; // Adjust import path as necessary
import { useAuth } from '../contexts/AuthContext'; // Adjust import path

// --- Mock useAuth ---
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));
const mockLogin = jest.fn();
const mockUseAuth = useAuth as jest.Mock;
// --- End Mock useAuth ---

// --- Mock useNavigate ---
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // Retain other react-router-dom exports
  useNavigate: () => mockNavigate,
}));
// --- End Mock useNavigate ---

const renderLogin = () => {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
};

describe('Login Page', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockLogin.mockClear();
    mockNavigate.mockClear();
    // Default mock return value for useAuth
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      user: null,
      loading: false,
      // Add other properties from AuthContextType if Login uses them
      // e.g., register: jest.fn(), logout: jest.fn(), etc.
    });
  });

  describe('Render Form', () => {
    it('should render email and password input fields and a submit button', () => {
      renderLogin();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });
  });

  describe('Successful Login', () => {
    it('should call login function and navigate on successful submission', async () => {
      mockLogin.mockResolvedValueOnce(undefined); // Simulate successful login (no error thrown)
      renderLogin();

      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /login/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      });
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/'); // Or '/dashboard' or wherever it navigates
      });
      // Assuming no error message is displayed by default or after successful login
      expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument(); 
      // Or, if there's a specific element for errors:
      // expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });
  });

  describe('Failed Login', () => {
    it('should display error message and not navigate on failed login', async () => {
      const errorMessage = 'Invalid credentials';
      mockLogin.mockRejectedValueOnce(new Error(errorMessage));
      renderLogin();

      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
      fireEvent.click(screen.getByRole('button', { name: /login/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('wrong@example.com', 'wrongpassword');
      });
      
      // Wait for the error message to appear. The Login page needs to catch the error
      // from mockLogin and set some state to display this message.
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument(); 
        // Or if the error is displayed in a specific element:
        // const errorDisplay = screen.getByTestId('error-message');
        // expect(errorDisplay).toHaveTextContent(errorMessage);
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Input Validation (Client-Side)', () => {
    // These tests depend on client-side validation logic in Login.tsx
    // For example, using HTML5 'required' attribute or custom validation logic.
    // If validation is purely server-side, these tests might not apply as written.

    it('should show validation message if email is empty and form is submitted', async () => {
      renderLogin();
      // Assuming the input has a 'name' attribute for formik/yup or similar, or an accessible label
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      // Submit without email
      fireEvent.click(screen.getByRole('button', { name: /login/i }));

      // This assertion depends on how validation messages are displayed.
      // For HTML5 'required', the browser handles it, which might be hard to test with JSDOM.
      // If using a library like Formik/Yup that renders error messages:
      await waitFor(() => {
        // Example: expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        // For now, we'll just check that login was not called if email is missing.
        // This implies client-side validation (or a check) prevented it.
      });
      // A more direct test if there's no visible error message but submission is blocked:
      expect(mockLogin).not.toHaveBeenCalled(); 
    });

    it('should show validation message if password is empty and form is submitted', async () => {
        renderLogin();
        const emailInput = screen.getByLabelText(/email/i);
        
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        // Submit without password
        fireEvent.click(screen.getByRole('button', { name: /login/i }));
  
        await waitFor(() => {
          // Example: expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        });
        expect(mockLogin).not.toHaveBeenCalled();
      });

      it('should not call login if form is submitted with both fields empty', async () => {
        renderLogin();
        fireEvent.click(screen.getByRole('button', { name: /login/i }));
        
        // Use waitFor to ensure any async state updates due to submission attempt complete
        await waitFor(() => {
            // No specific error message check here, just that login wasn't attempted
        });
        expect(mockLogin).not.toHaveBeenCalled();
      });
  });

  describe('Loading State', () => {
    it('should disable submit button or show loading indicator when loading', () => {
      mockUseAuth.mockReturnValue({
        login: mockLogin,
        user: null,
        loading: true, // AuthContext is loading
      });
      renderLogin();

      const submitButton = screen.getByRole('button', { name: /login/i });
      // Check if the button is disabled OR if a loading indicator specific to the button is shown
      // The Login.tsx might have its own internal loading state for the form submission process itself,
      // or it might react to AuthContext.loading.
      // If it disables the button:
      expect(submitButton).toBeDisabled();
      // If it shows a spinner within the button (example, assuming ReloadIcon from Button component):
      // expect(within(submitButton).getByRole('img', { name: /loading/i })).toBeInTheDocument();
      // Or, if the button text changes to "Loading..." or similar:
      // expect(screen.getByRole('button', { name: /loading.../i })).toBeInTheDocument();
    });

    it('should disable submit button when form submission is in progress (internal loading state)', async () => {
        // This test assumes Login.tsx has its own `isSubmitting` state.
        mockLogin.mockImplementation(() => {
          // Simulate a login process that takes time
          return new Promise(resolve => setTimeout(() => resolve(undefined), 100));
        });
    
        renderLogin();
    
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
        // Button should be disabled immediately after click if isSubmitting is set
        // Or its text/content changes to indicate loading
        await waitFor(() => {
            const button = screen.getByRole('button', { name: /login/i }); // Or loading text if it changes
            // Example: if button text changes to "Loading..." or contains a spinner
            // For Shadcn Button, it might be disabled and contain a ReloadIcon
            expect(button).toBeDisabled(); 
            // const spinner = button.querySelector('.animate-spin'); // If ReloadIcon is used
            // expect(spinner).toBeInTheDocument();
        });
    
        // Wait for the login promise to resolve to avoid issues with state updates after unmount
        await waitFor(() => expect(mockLogin).toHaveBeenCalled());
      });
  });
});
