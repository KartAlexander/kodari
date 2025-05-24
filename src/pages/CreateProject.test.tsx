import React, { ReactNode } from 'react';
import { render, screen, fireEvent, waitFor, act }
  from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { CreateProjectPage } from './CreateProject'; // Adjust import path as necessary
import { AuthProvider, useAuth, User } from '../contexts/AuthContext'; // Adjust import path

// --- Mock axios ---
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
// --- End Mock axios ---

// --- Mock useNavigate ---
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
// --- End Mock useNavigate ---

// --- Mock useAuth ---
const mockUser: User = { id: 'testUserId123', name: 'Test User', email: 'user@example.com' };
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: mockUser,
    loading: false,
  })),
}));
const mockedUseAuth = useAuth as jest.Mock; // For resetting if needed
// --- End Mock useAuth ---

// Helper to wrap component in Router and AuthProvider
const renderCreateProjectPage = () => {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <CreateProjectPage />
      </AuthProvider>
    </MemoryRouter>
  );
};

// Helper function to fill the form with standard valid data
const fillValidFormData = () => {
  fireEvent.change(screen.getByLabelText(/project title/i), { target: { value: 'Valid Project Title' } });
  fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'This is a valid project description.' } });
  fireEvent.change(screen.getByLabelText(/industry/i), { target: { value: 'Technology' } });
  fireEvent.change(screen.getByLabelText(/required skills/i), { target: { value: 'React,Node.js,TypeScript' } });
  fireEvent.change(screen.getByLabelText(/team size/i), { target: { value: '5' } });
  fireEvent.change(screen.getByLabelText(/image url/i), { target: { value: 'https://example.com/valid-image.png' } });
  fireEvent.change(screen.getByLabelText(/project stage/i), { target: { value: 'planning' } }); // Assuming 'planning' is a valid stage value
};


describe('CreateProject Page', () => {
  beforeEach(() => {
    mockedAxios.post.mockClear();
    mockNavigate.mockClear();
    mockedUseAuth.mockClear().mockReturnValue({ user: mockUser, loading: false });
  });

  describe('Render Form', () => {
    it('should render all expected form fields and a submit button', () => {
      renderCreateProjectPage();
      expect(screen.getByLabelText(/project title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/industry/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/required skills/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/team size/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/image url/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/project stage/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create project/i })).toBeInTheDocument();
    });
  });

  describe('Form Input', () => {
    it('should update internal state when user types into fields', () => {
      renderCreateProjectPage();
      const titleInput = screen.getByLabelText(/project title/i) as HTMLInputElement;
      fireEvent.change(titleInput, { target: { value: 'My New Venture' } });
      expect(titleInput.value).toBe('My New Venture');

      const skillsInput = screen.getByLabelText(/required skills/i) as HTMLInputElement;
      fireEvent.change(skillsInput, { target: { value: 'React, Node' } });
      expect(skillsInput.value).toBe('React, Node');
      
      const stageSelect = screen.getByLabelText(/project stage/i) as HTMLSelectElement;
      fireEvent.change(stageSelect, { target: { value: 'development' } });
      expect(stageSelect.value).toBe('development');
    });
  });

  describe('Successful Project Creation', () => {
    it('should call axios.post with correct data and navigate on successful submission', async () => {
      const newProjectId = 'new-proj-id-456';
      mockedAxios.post.mockResolvedValueOnce({ data: { id: newProjectId, title: 'Valid Project Title' } });
      
      renderCreateProjectPage();
      fillValidFormData();
      fireEvent.click(screen.getByRole('button', { name: /create project/i }));

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          `${process.env.REACT_APP_API_URL}/projects`,
          expect.objectContaining({
            title: 'Valid Project Title',
            description: 'This is a valid project description.',
            industry: 'Technology',
            requiredSkills: ['React', 'Node.js', 'TypeScript'], // Assuming splitting by comma and trimming
            teamSize: 5, // Assuming parsing to number
            imageUrl: 'https://example.com/valid-image.png',
            stage: 'planning',
            // founderId: mockUser.id, // If CreateProjectPage adds this from useAuth().user.id
          })
        );
      });
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(`/projects/${newProjectId}`);
      });
      // Assuming no persistent success message, just navigation.
      // Error message should not be present.
      // This requires the component to have a specific element for errors, e.g., data-testid="error-message"
      // For now, we'll assume errors are handled by displaying text.
      expect(screen.queryByRole('alert')).not.toBeInTheDocument(); // Example if errors use role="alert"
    });
  });

  describe('Failed Project Creation (API Error)', () => {
    it('should display a generic error message if API error message is not specific', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));
      
      renderCreateProjectPage();
      fillValidFormData();
      fireEvent.click(screen.getByRole('button', { name: /create project/i }));

      await waitFor(() => expect(mockedAxios.post).toHaveBeenCalledTimes(1));
      await waitFor(() => {
        // Assuming a generic error message is shown.
        // This depends on CreateProjectPage's error handling.
        expect(screen.getByText(/failed to create project\. please try again\./i)).toBeInTheDocument();
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should display specific API error message if provided in error response', async () => {
      const specificError = 'Project validation failed: Title too short.';
      mockedAxios.post.mockRejectedValueOnce({ response: { data: { message: specificError } } });
      
      renderCreateProjectPage();
      fillValidFormData();
      fireEvent.click(screen.getByRole('button', { name: /create project/i }));

      await waitFor(() => expect(mockedAxios.post).toHaveBeenCalledTimes(1));
      await waitFor(() => {
        expect(screen.getByText(specificError)).toBeInTheDocument();
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Client-Side Validation', () => {
    // These tests assume the form uses HTML5 `required` or has JS-based validation
    // that prevents submission and potentially displays errors.
    // For simplicity, we'll test that `axios.post` isn't called.
    // Displaying specific error messages would require knowing the component's implementation.

    it('should not submit if title is empty (assuming "required" validation)', async () => {
      renderCreateProjectPage();
      // Fill other fields but leave title empty
      fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Valid description' } });
      fireEvent.change(screen.getByLabelText(/industry/i), { target: { value: 'Tech' } });
      fireEvent.change(screen.getByLabelText(/required skills/i), { target: { value: 'React' } });
      fireEvent.change(screen.getByLabelText(/team size/i), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText(/project stage/i), { target: { value: 'idea' } });
      
      fireEvent.click(screen.getByRole('button', { name: /create project/i }));

      // Wait a brief moment to ensure no async submission happens
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      expect(mockedAxios.post).not.toHaveBeenCalled();
      // Optionally, check for a validation message if the form library displays one
      // e.g., const titleInput = screen.getByLabelText(/project title/i);
      // e.g., expect(titleInput.validationMessage).toContain('Please fill out this field.');
    });

    it('should not submit if required skills are empty (assuming "required" validation)', async () => {
        renderCreateProjectPage();
        // Fill other fields but leave skills empty
        fireEvent.change(screen.getByLabelText(/project title/i), { target: { value: 'Valid Title' } });
        fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Valid description' } });
        // ... other fields ...
        
        fireEvent.click(screen.getByRole('button', { name: /create project/i }));
  
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });
        expect(mockedAxios.post).not.toHaveBeenCalled();
      });
  });

  describe('Loading State During Submission', () => {
    it('should disable submit button or show loading indicator while submitting', async () => {
      mockedAxios.post.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: { id: 'proj-loading-123' } }), 50))
      );
      
      renderCreateProjectPage();
      fillValidFormData();
      fireEvent.click(screen.getByRole('button', { name: /create project/i }));

      let submitButton = screen.getByRole('button', { name: /create project/i });
      // Check for disabled state or loading indicator.
      // The Shadcn Button component might change its internal state or disable the HTML button.
      // If it uses an isLoading prop, it would typically disable the button.
      expect(submitButton).toBeDisabled(); 
      // Or, if the text changes to "Creating..." or similar:
      // submitButton = await screen.findByRole('button', { name: /creating.../i });
      // expect(submitButton).toBeInTheDocument();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/projects/proj-loading-123');
      });
      // After navigation, the button might not be in the document.
      // If it were to stay on the page and re-enable:
      // expect(screen.getByRole('button', { name: /create project/i })).toBeEnabled();
    });
  });
});
