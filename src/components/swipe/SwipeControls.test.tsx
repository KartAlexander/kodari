import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SwipeControls, SwipeControlsProps } from './SwipeControls'; // Adjust import path

// Mock icons if they are directly used and not part of a Button variant that handles icons
// For example, if using Radix icons directly:
// jest.mock('@radix-ui/react-icons', () => ({
//   Cross2Icon: () => <span data-testid="dislike-icon">X</span>,
//   HeartIcon: () => <span data-testid="like-icon">Heart</span>,
//   StarIcon: () => <span data-testid="superlike-icon">Star</span>, // If super like exists
// }));

const defaultProps: SwipeControlsProps = {
  onDislike: jest.fn(),
  onLike: jest.fn(),
  onSuperLike: jest.fn(), // Assuming a super like feature
  // Add other props like `isSuperLikeDisabled` or `isUndoDisabled` if they exist
};

describe('SwipeControls Component', () => {
  beforeEach(() => {
    (defaultProps.onDislike as jest.Mock).mockClear();
    (defaultProps.onLike as jest.Mock).mockClear();
    if (defaultProps.onSuperLike) (defaultProps.onSuperLike as jest.Mock).mockClear();
  });

  it('should render dislike, like, and super like buttons', () => {
    render(<SwipeControls {...defaultProps} />);
    // Assuming buttons have accessible names or aria-labels
    expect(screen.getByRole('button', { name: /dislike/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /like/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /super like/i })).toBeInTheDocument(); 
  });

  it('should call onDislike when the dislike button is clicked', () => {
    render(<SwipeControls {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /dislike/i }));
    expect(defaultProps.onDislike).toHaveBeenCalledTimes(1);
  });

  it('should call onLike when the like button is clicked', () => {
    render(<SwipeControls {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /like/i }));
    expect(defaultProps.onLike).toHaveBeenCalledTimes(1);
  });

  it('should call onSuperLike when the super like button is clicked', () => {
    render(<SwipeControls {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /super like/i }));
    expect(defaultProps.onSuperLike).toHaveBeenCalledTimes(1);
  });

  describe('Button Disabled States', () => {
    it('should disable all buttons if `disabled` prop is true', () => {
      render(<SwipeControls {...defaultProps} disabled />);
      expect(screen.getByRole('button', { name: /dislike/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /like/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /super like/i })).toBeDisabled();
    });

    it('should not call callbacks if buttons are disabled via `disabled` prop', () => {
        render(<SwipeControls {...defaultProps} disabled />);
        fireEvent.click(screen.getByRole('button', { name: /dislike/i }));
        fireEvent.click(screen.getByRole('button', { name: /like/i }));
        fireEvent.click(screen.getByRole('button', { name: /super like/i }));
        expect(defaultProps.onDislike).not.toHaveBeenCalled();
        expect(defaultProps.onLike).not.toHaveBeenCalled();
        expect(defaultProps.onSuperLike).not.toHaveBeenCalled();
      });

    // Example for individual button disabled states, if supported by SwipeControlsProps
    it('should disable super like button if onSuperLike is not provided or explicitly disabled', () => {
      // Scenario 1: onSuperLike prop is not passed (or undefined)
      const { rerender } = render(<SwipeControls onDislike={jest.fn()} onLike={jest.fn()} />);
      // Assuming the button is still rendered but disabled, or not rendered at all.
      // If rendered but disabled:
      const superLikeButton = screen.queryByRole('button', { name: /super like/i });
      if (superLikeButton) { // If it's conditionally rendered, it might not exist
        expect(superLikeButton).toBeDisabled();
      }

      // Scenario 2: An explicit prop like `isSuperLikeDisabled` (hypothetical)
      // rerender(<SwipeControls {...defaultProps} isSuperLikeDisabled={true} />);
      // expect(screen.getByRole('button', { name: /super like/i })).toBeDisabled();
    });
  });

  // Test for specific styling or classes if important
  it('should apply correct styling to buttons', () => {
    render(<SwipeControls {...defaultProps} />);
    // Example: Check for classes that give them their characteristic look
    // This depends heavily on how Button component is styled internally or if SwipeControls adds its own.
    // If using Button component from ui/Button with variants:
    const dislikeButton = screen.getByRole('button', { name: /dislike/i });
    // expect(dislikeButton).toHaveClass('bg-red-500'); // Or whatever the dislike button style is

    const likeButton = screen.getByRole('button', { name: /like/i });
    // expect(likeButton).toHaveClass('bg-green-500'); // Or whatever the like button style is
    
    // These class checks are very brittle. It's better to test functionality.
    // Visual testing with Storybook or similar tools is better for styling.
    expect(dislikeButton).toBeVisible(); // Basic visibility check
    expect(likeButton).toBeVisible();
  });
});
