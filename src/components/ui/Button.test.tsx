import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button, buttonVariants } from './Button'; // Adjust import path as necessary
import { ReloadIcon } from '@radix-ui/react-icons'; // Assuming this is used for loading

// Mock Lucide React icons if they are used directly and not part of buttonVariants
// For example, if <Mail className="mr-2 h-4 w-4" /> is used directly:
// jest.mock('lucide-react', () => ({
//   Mail: () => <svg data-testid="mail-icon" />,
//   // Add other icons used by Button here
// }));

describe('Button Component', () => {
  it('should render with children', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  // Test different variants
  describe('Variants', () => {
    it('should apply primary variant classes by default', () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole('button', { name: /primary/i });
      // This test relies on knowing the exact classes from buttonVariants.
      // It's better to test for functional behavior or snapshot test if classes are complex and stable.
      // For now, let's check for a key class part.
      expect(button).toHaveClass('bg-primary text-primary-foreground'); 
    });

    it('should apply secondary variant classes', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button', { name: /secondary/i });
      expect(button).toHaveClass('bg-secondary text-secondary-foreground');
    });

    it('should apply outline variant classes', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button', { name: /outline/i });
      expect(button).toHaveClass('border border-input bg-background hover:bg-accent hover:text-accent-foreground');
    });

    it('should apply ghost variant classes', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button', { name: /ghost/i });
      expect(button).toHaveClass('hover:bg-accent hover:text-accent-foreground');
    });

    it('should apply danger variant classes', () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByRole('button', { name: /danger/i });
      // Assuming danger variant uses specific classes like bg-danger or text-danger-foreground
      // Adjust based on actual implementation in buttonVariants
      expect(button).toHaveClass('bg-destructive text-destructive-foreground');
    });

    it('should apply link variant classes', () => {
        render(<Button variant="link">Link Button</Button>);
        const button = screen.getByRole('button', { name: /link button/i });
        expect(button).toHaveClass('text-primary underline-offset-4 hover:underline');
    });
  });

  // Test different sizes
  describe('Sizes', () => {
    it('should apply default (md) size classes', () => {
      render(<Button>Default Size</Button>);
      const button = screen.getByRole('button', { name: /default size/i });
      expect(button).toHaveClass('h-10 px-4 py-2'); // Default according to buttonVariants
    });

    it('should apply sm size classes', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button', { name: /small/i });
      expect(button).toHaveClass('h-9 rounded-md px-3'); // sm according to buttonVariants
    });

    it('should apply lg size classes', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button', { name: /large/i });
      expect(button).toHaveClass('h-11 rounded-md px-8'); // lg according to buttonVariants
    });

    it('should apply icon size classes', () => {
        render(<Button size="icon">I</Button>); // Content doesn't matter much for size=icon
        const button = screen.getByRole('button', { name: /i/i });
        expect(button).toHaveClass('h-10 w-10'); // icon size according to buttonVariants
      });
  });

  // Test isLoading prop
  describe('isLoading prop', () => {
    it('should show loading spinner and be disabled when isLoading is true', () => {
      render(<Button isLoading>Loading</Button>);
      const button = screen.getByRole('button', { name: /loading/i });
      // Check for ReloadIcon via its class or a data-testid if possible
      // The ReloadIcon is inside the button, so we query within the button
      const spinner = button.querySelector('.animate-spin'); // ReloadIcon has 'animate-spin'
      expect(spinner).toBeInTheDocument();
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50 disabled:pointer-events-none'); // Assuming these are standard disabled classes
    });

    it('should hide leftIcon and rightIcon when isLoading is true', () => {
      const LeftIcon = () => <span data-testid="left-icon">L</span>;
      const RightIcon = () => <span data-testid="right-icon">R</span>;
      render(
        <Button isLoading leftIcon={<LeftIcon />} rightIcon={<RightIcon />}>
          Loading
        </Button>
      );
      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
    });

    it('should show children or loading text when isLoading is true', () => {
        render(<Button isLoading>Submit</Button>);
        // Default behavior might be to keep children visible alongside spinner,
        // or replace with "Please wait..." or similar.
        // Test current actual behavior. If children are present:
        expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument(); 
        // If children are replaced by specific loading text:
        // expect(screen.getByText(/please wait/i)).toBeInTheDocument();
        // expect(screen.queryByText(/submit/i)).not.toBeInTheDocument();
      });
  });

  // Test disabled prop
  describe('disabled prop', () => {
    it('should disable the button and apply disabled classes', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button', { name: /disabled/i });
      expect(button).toBeDisabled();
      // Check for standard disabled utility classes from buttonVariants or globals
      expect(button).toHaveClass('disabled:opacity-50 disabled:pointer-events-none');
    });
  });

  // Test icons
  describe('Icons', () => {
    const LeftIcon = () => <span data-testid="left-icon">L</span>;
    const RightIcon = () => <span data-testid="right-icon">R</span>;

    it('should render leftIcon when provided and not loading', () => {
      render(<Button leftIcon={<LeftIcon />}>With Left Icon</Button>);
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('should render rightIcon when provided and not loading', () => {
      render(<Button rightIcon={<RightIcon />}>With Right Icon</Button>);
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('should not render icons if not provided', () => {
      render(<Button>No Icons</Button>);
      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
    });
  });

  // Test onClick handler
  describe('onClick handler', () => {
    it('should call onClick when button is clicked', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Clickable</Button>);
      fireEvent.click(screen.getByRole('button', { name: /clickable/i }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when button is disabled', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} disabled>NonClickable</Button>);
      fireEvent.click(screen.getByRole('button', { name: /nonclickable/i }));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not call onClick when button is loading', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} isLoading>NonClickable Loading</Button>);
      fireEvent.click(screen.getByRole('button', { name: /nonclickable loading/i }));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  // Test className prop
  it('should apply custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole('button', { name: /custom/i })).toHaveClass('custom-class');
  });

  // Test 'asChild' prop
  describe('asChild prop', () => {
    it('should render as a child component when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test-link">Link as Button</a>
        </Button>
      );
      const linkElement = screen.getByRole('link', { name: /link as button/i });
      expect(linkElement).toBeInTheDocument();
      expect(linkElement).toHaveAttribute('href', '/test-link');
      // Check if button variant classes are applied to the child
      expect(linkElement).toHaveClass('bg-primary text-primary-foreground'); // Default variant
    });

    it('should correctly apply variant and size classes when asChild is true', () => {
        render(
          <Button asChild variant="secondary" size="sm">
            <a href="/another-link">Another Link</a>
          </Button>
        );
        const linkElement = screen.getByRole('link', { name: /another link/i });
        expect(linkElement).toHaveClass('bg-secondary text-secondary-foreground');
        expect(linkElement).toHaveClass('h-9 rounded-md px-3');
      });
  });
});
