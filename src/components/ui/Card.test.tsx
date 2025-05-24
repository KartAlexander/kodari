import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './Card'; // Adjust import path as necessary

describe('Card Components', () => {
  describe('Card', () => {
    it('should render children', () => {
      render(<Card>Card Content</Card>);
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('should apply default classes', () => {
      render(<Card>Default Card</Card>);
      const card = screen.getByText('Default Card').parentElement; // Card is the parent of its children
      // Default classes from Card.tsx: "rounded-lg border bg-card text-card-foreground shadow-sm"
      // The component itself is a div.
      expect(card).toHaveClass('rounded-lg border bg-card text-card-foreground shadow-sm');
    });

    it('should apply custom className', () => {
      render(<Card className="custom-card-class">Custom Card</Card>);
      const card = screen.getByText('Custom Card').parentElement;
      expect(card).toHaveClass('custom-card-class');
    });

    it('should merge default classes with custom className', () => {
      render(<Card className="custom-card-class">Merge Test Card</Card>);
      const card = screen.getByText('Merge Test Card').parentElement;
      expect(card).toHaveClass('rounded-lg border bg-card text-card-foreground shadow-sm');
      expect(card).toHaveClass('custom-card-class');
    });
  });

  describe('CardHeader', () => {
    it('should render children', () => {
      render(<CardHeader>Header Content</CardHeader>);
      expect(screen.getByText('Header Content')).toBeInTheDocument();
    });

    it('should apply default classes', () => {
      render(<CardHeader>Default Header</CardHeader>);
      const header = screen.getByText('Default Header').parentElement;
      // Default classes: "flex flex-col space-y-1.5 p-6"
      expect(header).toHaveClass('flex flex-col space-y-1.5 p-6');
    });

    it('should apply custom className', () => {
      render(<CardHeader className="custom-header-class">Custom Header</CardHeader>);
      const header = screen.getByText('Custom Header').parentElement;
      expect(header).toHaveClass('custom-header-class');
    });
  });

  describe('CardTitle', () => {
    it('should render children', () => {
      render(<CardTitle>Title Content</CardTitle>);
      // CardTitle renders a <h3> by default
      expect(screen.getByRole('heading', { level: 3, name: 'Title Content' })).toBeInTheDocument();
    });

    it('should apply default classes', () => {
      render(<CardTitle>Default Title</CardTitle>);
      const title = screen.getByRole('heading', { level: 3, name: 'Default Title' });
      // Default classes: "text-2xl font-semibold leading-none tracking-tight"
      expect(title).toHaveClass('text-2xl font-semibold leading-none tracking-tight');
    });

    it('should apply custom className', () => {
      render(<CardTitle className="custom-title-class">Custom Title</CardTitle>);
      const title = screen.getByRole('heading', { level: 3, name: 'Custom Title' });
      expect(title).toHaveClass('custom-title-class');
    });
  });

  describe('CardDescription', () => {
    it('should render children', () => {
      render(<CardDescription>Description Content</CardDescription>);
      // CardDescription renders a <p> by default
      expect(screen.getByText('Description Content')).toBeInTheDocument();
      expect(screen.getByText('Description Content').tagName).toBe('P');
    });

    it('should apply default classes', () => {
      render(<CardDescription>Default Description</CardDescription>);
      const description = screen.getByText('Default Description');
      // Default classes: "text-sm text-muted-foreground"
      expect(description).toHaveClass('text-sm text-muted-foreground');
    });

    it('should apply custom className', () => {
      render(<CardDescription className="custom-description-class">Custom Description</CardDescription>);
      const description = screen.getByText('Custom Description');
      expect(description).toHaveClass('custom-description-class');
    });
  });

  describe('CardContent', () => {
    it('should render children', () => {
      render(<CardContent>Main Content</CardContent>);
      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });

    it('should apply default classes', () => {
      render(<CardContent>Default Content</CardContent>);
      const content = screen.getByText('Default Content').parentElement;
      // Default classes: "p-6 pt-0"
      expect(content).toHaveClass('p-6 pt-0');
    });

    it('should apply custom className', () => {
      render(<CardContent className="custom-content-class">Custom Content</CardContent>);
      const content = screen.getByText('Custom Content').parentElement;
      expect(content).toHaveClass('custom-content-class');
    });
  });

  describe('CardFooter', () => {
    it('should render children', () => {
      render(<CardFooter>Footer Content</CardFooter>);
      expect(screen.getByText('Footer Content')).toBeInTheDocument();
    });

    it('should apply default classes', () => {
      render(<CardFooter>Default Footer</CardFooter>);
      const footer = screen.getByText('Default Footer').parentElement;
      // Default classes: "flex items-center p-6 pt-0"
      expect(footer).toHaveClass('flex items-center p-6 pt-0');
    });

    it('should apply custom className', () => {
      render(<CardFooter className="custom-footer-class">Custom Footer</CardFooter>);
      const footer = screen.getByText('Custom Footer').parentElement;
      expect(footer).toHaveClass('custom-footer-class');
    });
  });

  // Test composition
  describe('Card Composition', () => {
    it('should render a complete card structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Composite Card Title</CardTitle>
            <CardDescription>Composite Card Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is the main content of the card.</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByRole('heading', { name: 'Composite Card Title' })).toBeInTheDocument();
      expect(screen.getByText('Composite Card Description')).toBeInTheDocument();
      expect(screen.getByText('This is the main content of the card.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });
  });
});
