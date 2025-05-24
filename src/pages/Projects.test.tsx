import React, { ReactNode } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom'; // If Projects.tsx uses Link or other router features
import axios from 'axios';
import { ProjectsPage } from './Projects'; // Adjust import path as necessary
import { AuthProvider } from '../contexts/AuthContext'; // If needed by ProjectsPage or children
import { Project } from '../components/projects/ProjectCard'; // For type
import { Filters } from '../components/projects/ProjectFilters'; // For type

// --- Mock axios ---
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
// --- End Mock axios ---

// --- Mock Child Components (Lightly) ---
const mockProjectFilters = jest.fn(({ onFilterChange, currentFilters }: { onFilterChange: (filters: Filters) => void, currentFilters: Filters }) => (
  <div data-testid="project-filters">
    <input 
      type="text" 
      data-testid="search-input-mock" 
      placeholder="Search projects" 
      defaultValue={currentFilters.search}
      onChange={(e) => onFilterChange({ ...currentFilters, search: e.target.value })}
    />
    {/* Add other mocked filter inputs if needed for specific tests */}
  </div>
));
jest.mock('../components/projects/ProjectFilters', () => ({
  ProjectFilters: mockProjectFilters,
}));

const mockProjectGrid = jest.fn(({ projects, isLoading }: { projects: Project[], isLoading?: boolean }) => {
  if (isLoading) return <div data-testid="project-grid-loading">Loading projects...</div>;
  if (projects.length === 0) return <div data-testid="project-grid-empty">No projects found.</div>;
  return (
    <div data-testid="project-grid">
      {projects.map(p => <div key={p.id} data-testid={`project-${p.id}`}>{p.title}</div>)}
    </div>
  );
});
jest.mock('../components/projects/ProjectGrid', () => ({
  ProjectGrid: mockProjectGrid,
}));

// ProjectCard is a sub-component of ProjectGrid, already mocked if ProjectGrid is mocked.
// If ProjectGrid was NOT mocked, then ProjectCard would need to be mocked.
// --- End Mock Child Components ---

// --- Mock useAuth (if ProjectsPage directly uses it, e.g., for user-specific initial filters) ---
// For now, assuming it's not directly used by ProjectsPage itself for fetching.
// jest.mock('../contexts/AuthContext', () => ({
//   useAuth: jest.fn(() => ({ user: { id: 'testUser' }, loading: false })),
// }));
// --- End Mock useAuth ---


const renderProjectsPage = () => {
  // AuthProvider might be needed if any part of the tree uses useAuth
  return render(
    <MemoryRouter> 
      <AuthProvider> 
        <ProjectsPage />
      </AuthProvider>
    </MemoryRouter>
  );
};

const mockInitialProjects: Project[] = [
  { id: '1', title: 'Initial Project A', description: 'Desc A', /* ...other fields */ } as Project,
  { id: '2', title: 'Initial Project B', description: 'Desc B', /* ...other fields */ } as Project,
];

const mockFilteredProjects: Project[] = [
  { id: '3', title: 'Filtered Project C', description: 'Desc C', /* ...other fields */ } as Project,
];

describe('Projects Page', () => {
  beforeEach(() => {
    mockedAxios.get.mockClear();
    mockProjectFilters.mockClear();
    mockProjectGrid.mockClear();
    // Reset query params in URL if ProjectsPage uses them (not explicitly tested here yet)
  });

  describe('Initial Load', () => {
    it('should show loading state, fetch initial projects, and pass them to ProjectGrid', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockInitialProjects });
      renderProjectsPage();

      // 1. Check for loading state (passed to ProjectGrid mock)
      expect(screen.getByTestId('project-grid-loading')).toBeInTheDocument();
      expect(mockProjectGrid).toHaveBeenCalledWith(expect.objectContaining({ isLoading: true, projects: [] }), {});


      // 2. Wait for API call and check its parameters (default filters)
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          `${process.env.REACT_APP_API_URL}/projects`, // Base URL
          { params: { search: '', industry: '', skills: '', page: 1, limit: 10 } } // Assuming default filters
        );
      });

      // 3. Verify ProjectGrid receives projects and loading is false
      await waitFor(() => {
        // ProjectGrid should be called again with isLoading: false and projects
        const lastProjectGridCall = mockProjectGrid.mock.calls.find(call => call[0].isLoading === false);
        expect(lastProjectGridCall).toBeDefined();
        if (lastProjectGridCall) {
            expect(lastProjectGridCall[0].projects).toEqual(mockInitialProjects);
        }
        expect(screen.getByTestId('project-grid')).toBeInTheDocument();
        expect(screen.getByText('Initial Project A')).toBeInTheDocument(); // Rendered by mock ProjectGrid
      });
    });

    it('should display an error message if initial fetching fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Failed to fetch'));
      renderProjectsPage();

      expect(screen.getByTestId('project-grid-loading')).toBeInTheDocument(); // Initial loading

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
        // Assuming ProjectsPage has an error state and displays it
        expect(screen.getByText(/error loading projects/i)).toBeInTheDocument(); 
        // ProjectGrid might show empty state or not be updated
        expect(screen.getByTestId('project-grid-empty')).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      // Mock initial load for filtering tests to start from a stable state
      mockedAxios.get.mockResolvedValueOnce({ data: mockInitialProjects });
    });

    it('should re-fetch projects with new filter parameters when filters change', async () => {
      renderProjectsPage();
      // Wait for initial load to complete
      await waitFor(() => expect(screen.getByText('Initial Project A')).toBeInTheDocument());
      
      // Simulate filter change from ProjectFilters mock
      // This requires getting the onFilterChange prop from the mock ProjectFilters
      const projectFiltersInstance = mockProjectFilters.mock.calls[0][0];
      const onFilterChangeCallback = projectFiltersInstance.onFilterChange;

      // Mock the API response for the filtered request
      mockedAxios.get.mockResolvedValueOnce({ data: mockFilteredProjects });

      // Simulate changing the search filter
      const newFilters: Filters = { search: 'Filtered', industry: '', skills: [] };
      act(() => {
        onFilterChangeCallback(newFilters);
      });

      // 1. Check for loading state again (isLoading prop to ProjectGrid)
      // The second call to ProjectGrid (after initial load) should have isLoading: true
      await waitFor(() => {
        // Find the call where isLoading became true again after the initial load
        const loadingCall = mockProjectGrid.mock.calls.find(
            (call, index) => index > 0 && call[0].isLoading === true
        );
        expect(loadingCall).toBeDefined();
      });


      // 2. Verify new API call with filter parameters
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          `${process.env.REACT_APP_API_URL}/projects`,
          { params: { search: 'Filtered', industry: '', skills: '', page: 1, limit: 10 } } // Updated filters
        );
      });

      // 3. Verify ProjectGrid receives the new filtered projects
      await waitFor(() => {
        const lastProjectGridCall = mockProjectGrid.mock.calls[mockProjectGrid.mock.calls.length - 1];
        expect(lastProjectGridCall[0].isLoading).toBe(false);
        expect(lastProjectGridCall[0].projects).toEqual(mockFilteredProjects);
        expect(screen.getByText('Filtered Project C')).toBeInTheDocument(); // Rendered by mock
        expect(screen.queryByText('Initial Project A')).not.toBeInTheDocument();
      });
    });

    it('should handle no results from filtering by passing empty list to ProjectGrid', async () => {
        renderProjectsPage();
        await waitFor(() => expect(screen.getByText('Initial Project A')).toBeInTheDocument());
        
        const projectFiltersInstance = mockProjectFilters.mock.calls[0][0];
        const onFilterChangeCallback = projectFiltersInstance.onFilterChange;
  
        mockedAxios.get.mockResolvedValueOnce({ data: [] }); // API returns no projects
  
        const newFilters: Filters = { search: 'NonExistentProject', industry: '', skills: [] };
        act(() => {
          onFilterChangeCallback(newFilters);
        });

        await waitFor(() => {
            expect(mockedAxios.get).toHaveBeenCalledWith(
              `${process.env.REACT_APP_API_URL}/projects`,
              { params: { search: 'NonExistentProject', industry: '', skills: '', page: 1, limit: 10 } }
            );
          });
  
        await waitFor(() => {
          // ProjectGrid mock should render its empty state
          expect(screen.getByTestId('project-grid-empty')).toHaveTextContent(/no projects found/i);
        });
      });
  });

  // Add tests for pagination if ProjectsPage implements it
  // e.g., simulating clicks on pagination controls and verifying API calls with page/limit params.
});
