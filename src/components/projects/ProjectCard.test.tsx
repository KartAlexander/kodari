import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom'; // To wrap Link components
import { ProjectCard, Project } from './ProjectCard'; // Adjust import path
// Assuming SkillTag and Badge are simple enough not to need deep mocking,
// or their tests cover their behavior. We'll check if they receive correct props.

// Mock intl.DateTimeFormat for consistent date formatting
// Store the original Intl.DateTimeFormat
const OriginalDateTimeFormat = Intl.DateTimeFormat;

beforeAll(() => {
  // @ts-ignore
  global.Intl.DateTimeFormat = jest.fn((locale, options) => {
    // Fallback to a simplified formatter for testing or use the original
    // For this test, we'll ensure it produces a predictable, simple format.
    // The key is that it's called with 'en-US' and specific options.
    expect(locale).toBe('en-US');
    expect(options).toEqual({ year: 'numeric', month: 'long', day: 'numeric' });
    return {
      format: (date: Date) => {
        // Example: "January 1, 2023"
        // A more robust mock might format based on MOCK_DATE or the input date
        // For simplicity, let's return a fixed string or a simple format
        const d = new Date(date);
        const year = d.getFullYear();
        const month = d.getMonth() + 1; // Month is 0-indexed
        const day = d.getDate();
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`; // YYYY-MM-DD
      },
    };
  });
});

afterAll(() => {
  // Restore the original Intl.DateTimeFormat
  global.Intl.DateTimeFormat = OriginalDateTimeFormat;
});


const mockProjectBase: Project = {
  id: '1',
  title: 'Awesome Project',
  description: 'This is a great project to work on.',
  founderName: 'John Doe',
  industry: 'Tech',
  imageUrl: 'https://via.placeholder.com/300x200',
  stage: 'idea', // 'idea', 'planning', 'development', 'launch', 'growth'
  teamSize: 5,
  requiredSkills: ['JavaScript', 'React', 'Node.js', 'CSS', 'HTML', 'Project Management'],
  createdAt: new Date('2023-01-15T10:00:00.000Z').toISOString(),
};

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe('ProjectCard Component', () => {
  it('should render project title, description, founder, and industry', () => {
    renderWithRouter(<ProjectCard project={mockProjectBase} />);
    expect(screen.getByText('Awesome Project')).toBeInTheDocument();
    expect(screen.getByText('This is a great project to work on.')).toBeInTheDocument();
    expect(screen.getByText(/Founder: John Doe/i)).toBeInTheDocument(); // Using regex for flexibility
    expect(screen.getByText(/Industry: Tech/i)).toBeInTheDocument();
  });

  it('should render project image if imageUrl is provided', () => {
    renderWithRouter(<ProjectCard project={mockProjectBase} />);
    const img = screen.getByRole('img', { name: /project image/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', mockProjectBase.imageUrl);
  });

  it('should render a placeholder if imageUrl is not provided', () => {
    const projectWithoutImage = { ...mockProjectBase, imageUrl: undefined };
    renderWithRouter(<ProjectCard project={projectWithoutImage} />);
    // Assuming a placeholder div with a specific class or data-testid is rendered
    // For example, if it's a div with class 'image-placeholder'
    // Or check for text like "No Image Available" if that's the placeholder
    const placeholder = screen.getByTestId('image-placeholder'); // Assuming you add data-testid="image-placeholder" to the placeholder
    expect(placeholder).toBeInTheDocument();
  });

  describe('Project Stage Badge', () => {
    const stageVariantMap: { [key: string]: string } = {
        idea: 'warning', // Or whatever variant 'idea' maps to in your component
        planning: 'default', // Example
        development: 'secondary', // Example
        launch: 'success', // Example (assuming you have a 'success' variant)
        growth: 'default', // Example
      };
      
    Object.entries(stageVariantMap).forEach(([stage, expectedVariant]) => {
        it(`should display stage "${stage}" with the correct badge variant "${expectedVariant}"`, () => {
          const projectWithStage = { ...mockProjectBase, stage: stage as Project['stage'] };
          renderWithRouter(<ProjectCard project={projectWithStage} />);
          const stageBadge = screen.getByText(stage.charAt(0).toUpperCase() + stage.slice(1));
          expect(stageBadge).toBeInTheDocument();
          // This assumes Badge component correctly applies classes for its variants
          // We are checking if ProjectCard passes the correct variant to Badge.
          // The exact class check might be brittle if Badge variant classes change.
          // A better way might be to check for a data-attribute on Badge if possible.
          // For now, checking a key class part of the variant.
          // Example: if variant="warning" applies "bg-warning text-warning-foreground"
          if (expectedVariant === 'warning') expect(stageBadge).toHaveClass('bg-yellow-500'); // Simplified, actual class from Badge variant
          else if (expectedVariant === 'success') expect(stageBadge).toHaveClass('bg-green-500'); // Simplified
          else if (expectedVariant === 'secondary') expect(stageBadge).toHaveClass('bg-secondary'); // From Badge.tsx
          else expect(stageBadge).toHaveClass('bg-primary'); // Default variant for Badge
        });
      });
  });
  

  it('should display team size and formatted creation date', () => {
    renderWithRouter(<ProjectCard project={mockProjectBase} />);
    expect(screen.getByText(`Team Size: ${mockProjectBase.teamSize}`)).toBeInTheDocument();
    // Date formatting is mocked to YYYY-MM-DD
    expect(screen.getByText(`Created: 2023-01-15`)).toBeInTheDocument();
  });

  describe('Required Skills Display', () => {
    it('should display all skills if 5 or less', () => {
      const skills = ['React', 'Node.js', 'CSS'];
      const projectWithFewSkills = { ...mockProjectBase, requiredSkills: skills };
      renderWithRouter(<ProjectCard project={projectWithFewSkills} />);
      skills.forEach(skill => {
        expect(screen.getByText(skill)).toBeInTheDocument();
      });
      expect(screen.queryByText(/\+\d+ more/i)).not.toBeInTheDocument();
    });

    it('should display first 5 skills and a "+X more" badge if more than 5 skills', () => {
      const skills = ['React', 'Node.js', 'CSS', 'HTML', 'JavaScript', 'Python', 'SQL']; // 7 skills
      const projectWithManySkills = { ...mockProjectBase, requiredSkills: skills };
      renderWithRouter(<ProjectCard project={projectWithManySkills} />);
      
      // Check for the first 5 skills
      skills.slice(0, 5).forEach(skill => {
        expect(screen.getByText(skill)).toBeInTheDocument();
      });
      // Check that skills after the 5th are not individually rendered
      expect(screen.queryByText('Python')).not.toBeInTheDocument();
      expect(screen.queryByText('SQL')).not.toBeInTheDocument();

      // Check for the "+X more" badge
      const moreBadge = screen.getByText('+2 more'); // 7 - 5 = 2
      expect(moreBadge).toBeInTheDocument();
    });
  });

  it('should be wrapped in a Link pointing to the project detail page', () => {
    renderWithRouter(<ProjectCard project={mockProjectBase} />);
    // The Card itself (or a wrapper around it) should be a link.
    // We can find the link by its href.
    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', `/projects/${mockProjectBase.id}`);
  });
});
