import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom'; // ProjectCard uses Link
import { ProjectGrid, ProjectGridProps } from './ProjectGrid'; // Adjust import path
import { Project } from './ProjectCard'; // Adjust import path for Project type

// Mock ProjectCard to simplify ProjectGrid tests
// We only want to check if ProjectGrid renders the correct number of cards
// and passes the correct props to them.
const mockProjectCard = jest.fn(({ project }: { project: Project }) => (
  <div data-testid={`project-card-${project.id}`}>
    <h3>{project.title}</h3>
    <p>{project.description}</p>
  </div>
));
jest.mock('./ProjectCard', () => ({
  // Important: Ensure the mock component has the same name as the original.
  // If ProjectCard is a default export, the mock structure might differ slightly.
  // Assuming ProjectCard is a named export:
  ProjectCard: mockProjectCard,
}));


const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Project Alpha',
    description: 'Description for Alpha',
    founderName: 'Founder A',
    industry: 'Tech',
    imageUrl: 'img-alpha.png',
    stage: 'idea',
    teamSize: 3,
    requiredSkills: ['React', 'Node'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Project Beta',
    description: 'Description for Beta',
    founderName: 'Founder B',
    industry: 'Healthcare',
    imageUrl: 'img-beta.png',
    stage: 'planning',
    teamSize: 5,
    requiredSkills: ['Python', 'AI'],
    createdAt: new Date().toISOString(),
  },
];

const renderWithRouter = (ui: React.ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

describe('ProjectGrid Component', () => {
  beforeEach(() => {
    mockProjectCard.mockClear();
  });

  it('should render multiple ProjectCard components based on the projects prop', () => {
    renderWithRouter(<ProjectGrid projects={mockProjects} />);
    
    expect(mockProjectCard).toHaveBeenCalledTimes(mockProjects.length);
    
    // Check if each project's data is passed to ProjectCard
    mockProjects.forEach((project, index) => {
      expect(mockProjectCard.mock.calls[index][0].project).toEqual(project);
      // Also check if the rendered output (from the mock) contains project titles
      expect(screen.getByText(project.title)).toBeInTheDocument();
    });
  });

  it('should render an empty state or "no projects found" message if the projects list is empty', () => {
    renderWithRouter(<ProjectGrid projects={[]} />);
    
    // Assuming ProjectGrid renders specific text for empty state
    expect(screen.getByText(/no projects found/i)).toBeInTheDocument();
    // Or, if it's a data-testid:
    // expect(screen.getByTestId('no-projects-message')).toBeInTheDocument();
    
    expect(mockProjectCard).not.toHaveBeenCalled();
  });

  it('should render the correct number of ProjectCards', () => {
    renderWithRouter(<ProjectGrid projects={mockProjects} />);
    const projectCards = screen.getAllByTestId(/project-card-/); // Using regex to match data-testid prefix
    expect(projectCards.length).toBe(mockProjects.length);
  });

  it('should handle null or undefined projects prop gracefully by showing empty state', () => {
    // @ts-ignore testing invalid prop for robustness
    renderWithRouter(<ProjectGrid projects={null} />);
    expect(screen.getByText(/no projects found/i)).toBeInTheDocument();
    expect(mockProjectCard).not.toHaveBeenCalled();

    // @ts-ignore
    const { rerender } = renderWithRouter(<ProjectGrid projects={undefined} />);
    expect(screen.getByText(/no projects found/i)).toBeInTheDocument();
    expect(mockProjectCard).not.toHaveBeenCalled();
  });

  // Optional: Test if a loading state is passed and handled (if ProjectGrid supports it)
  // it('should display a loading indicator if isLoading prop is true', () => {
  //   renderWithRouter(<ProjectGrid projects={[]} isLoading={true} />);
  //   expect(screen.getByTestId('loading-spinner')).toBeInTheDocument(); // Assuming a spinner
  //   expect(screen.queryByText(/no projects found/i)).not.toBeInTheDocument();
  // });
});
