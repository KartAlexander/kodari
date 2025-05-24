import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Badge, badgeVariants } from './Badge'; // Adjust import path as necessary

describe('Badge Component', () => {
  it('should render with children', () => {
    render(<Badge>New</Badge>);
    // Badges are often simple spans or divs with text. Roles might not be as specific as buttons.
    // We can find it by text content.
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  // Test different variants
  describe('Variants', () => {
    it('should apply default variant classes by default', () => {
      render(<Badge>Default Badge</Badge>);
      const badge = screen.getByText('Default Badge');
      // Based on typical badgeVariants:
      // default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
      expect(badge).toHaveClass('bg-primary text-primary-foreground');
    });

    it('should apply secondary variant classes', () => {
      render(<Badge variant="secondary">Secondary Badge</Badge>);
      const badge = screen.getByText('Secondary Badge');
      // secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
      expect(badge).toHaveClass('bg-secondary text-secondary-foreground');
    });

    it('should apply outline variant classes', () => {
      render(<Badge variant="outline">Outline Badge</Badge>);
      const badge = screen.getByText('Outline Badge');
      // outline: "text-foreground" (plus border, etc.)
      expect(badge).toHaveClass('text-foreground'); 
      // Also check for border if it's a key part of the outline variant's visual
      // expect(badge).toHaveClass('border'); // Assuming it has a general border class
    });

    it('should apply danger variant classes', () => {
      render(<Badge variant="danger">Danger Badge</Badge>);
      const badge = screen.getByText('Danger Badge');
      // Assuming danger variant has specific classes like 'bg-destructive' or 'text-destructive-foreground'
      // danger: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80"
      expect(badge).toHaveClass('bg-destructive text-destructive-foreground');
    });
    
    // Add tests for other variants like 'success', 'warning' if they exist in badgeVariants
    // Example for a hypothetical 'success' variant:
    // it('should apply success variant classes', () => {
    //   render(<Badge variant="success">Success Badge</Badge>);
    //   const badge = screen.getByText('Success Badge');
    //   expect(badge).toHaveClass('bg-success text-success-foreground'); // Adjust to actual classes
    // });
  });

  // Test different sizes (if applicable to your Badge component)
  // The provided Badge.tsx doesn't seem to have explicit 'size' prop like Button.
  // It relies on text size and padding from utility classes.
  // If sizes were added, tests would be similar to Button sizes:
  // describe('Sizes', () => {
  //   it('should apply default (md) size classes', () => {
  //     render(<Badge>Default Size</Badge>);
  //     const badge = screen.getByText('Default Size');
  //     expect(badge).toHaveClass('text-xs px-2.5 py-0.5'); // Example default size classes
  //   });
  //   it('should apply sm size classes', () => {
  //     render(<Badge size="sm">Small Badge</Badge>);
  //     const badge = screen.getByText('Small Badge');
  //     expect(badge).toHaveClass('text-xs px-2 py-0.5'); // Example small size classes
  //   });
  //   it('should apply lg size classes', () => {
  //     render(<Badge size="lg">Large Badge</Badge>);
  //     const badge = screen.getByText('Large Badge');
  //     expect(badge).toHaveClass('text-sm px-3 py-1'); // Example large size classes
  //   });
  // });

  // Test className prop
  it('should apply custom className', () => {
    render(<Badge className="custom-badge-class">Custom Styled Badge</Badge>);
    const badge = screen.getByText('Custom Styled Badge');
    expect(badge).toHaveClass('custom-badge-class');
  });

  // Test that it correctly merges default variant classes with custom classes
  it('should merge variant classes with custom className', () => {
    render(<Badge variant="secondary" className="custom-badge-class">Merge Test</Badge>);
    const badge = screen.getByText('Merge Test');
    expect(badge).toHaveClass('bg-secondary text-secondary-foreground'); // from variant
    expect(badge).toHaveClass('custom-badge-class'); // custom class
  });
});
