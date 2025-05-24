import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Register from './Register'; // Adjust import path as necessary
import { useAuth } from '../contexts/AuthContext'; // Adjust import path

// --- Mock useAuth ---
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));
const mockRegister = jest.fn();
const mockUseAuth = useAuth as jest.Mock;
// --- End Mock useAuth ---

// --- Mock useNavigate ---
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
// --- End Mock useNavigate ---

const renderRegister = () => {
  return render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );
};

describe('Register Page', () => {
  beforeEach(() => {
    mockRegister.mockClear();
    mockNavigate.mockClear();
    mockUseAuth.mockReturnValue({
      register: mockRegister,
      user: null,
      loading: false,
      // Add other properties from AuthContextType if Register uses them
    });
  });

  describe('Render Form', () => {
    it('should render name, email, and password input fields and a submit button', () => {
      renderRegister();
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    });
  });

  describe('Successful Registration', () => {
    it('should call register function and navigate on successful submission', async () => {
      mockRegister.mockResolvedValueOnce(undefined); // Simulate successful registration
      renderRegister();

      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'password123', 'Test User');
      });
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/'); // Or '/dashboard', etc.
      });
      expect(screen.queryByText(/registration failed/i)).not.toBeInTheDocument(); // No error message
    });
  });

  describe('Failed Registration', () => {
    it('should display error message and not navigate on failed registration', async () => {
      const errorMessage = 'Email already exists';
      mockRegister.mockRejectedValueOnce(new Error(errorMessage));
      renderRegister();

      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'existing@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith('existing@example.com', 'password123', 'Test User');
      });
      
      await waitFor(() => {
        // Assuming the Register page displays the error message from the caught error
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Input Validation (Client-Side)', () => {
    // Similar to Login, these depend on actual client-side validation implementation.
    // If using HTML 'required' or a library like Formik/Yup.

    it('should not call register if name is empty and form is submitted', async () => {
      renderRegister();
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /register/i }));
      
      await waitFor(() => {
        // Example: expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });
      expect(mockRegister).not.toHaveBeenCalled();
    });
    
    it('should not call register if email is empty and form is submitted', async () => {
        renderRegister();
        fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /register/i }));
        
        await waitFor(() => {
          // Example: expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        });
        expect(mockRegister).not.toHaveBeenCalled();
      });

    it('should not call register if password is empty and form is submitted', async () => {
      renderRegister();
      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
      fireEvent.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        // Example: expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
      expect(mockRegister).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should disable submit button or show loading indicator when AuthContext.loading is true', () => {
      mockUseAuth.mockReturnValue({
        register: mockRegister,
        user: null,
        loading: true, // AuthContext is loading
      });
      renderRegister();

      const submitButton = screen.getByRole('button', { name: /register/i });
      expect(submitButton).toBeDisabled();
      // Or check for a loading indicator within the button if that's the behavior
    });

    it('should disable submit button when form submission is in progress (internal loading state)', async () => {
        mockRegister.mockImplementation(() => {
          return new Promise(resolve => setTimeout(() => resolve(undefined), 100));
        });
    
        renderRegister();
    
        fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
        await waitFor(() => {
            const button = screen.getByRole('button', { name: /register/i }); // Or loading text
            expect(button).toBeDisabled(); 
        });
    
        await waitFor(() => expect(mockRegister).toHaveBeenCalled()); // Ensure promise resolves
      });
  });
});
