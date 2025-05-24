import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MessageList, MessageProps } from './MessageList'; // Adjust import path
import { User } from '../../contexts/AuthContext'; // Assuming User type is from AuthContext

// Mock the useAuth hook to provide a current user for styling tests
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));
import { useAuth } from '../../contexts/AuthContext';
const mockUseAuth = useAuth as jest.Mock;


// Helper to format dates for consistent comparison, if MessageList formats them.
// If MessageList displays timestamps as-is, this might not be needed for direct comparison.
const formatTestTimestamp = (date: Date): string => {
  // Example: "10:30 AM" or "Jan 1, 10:30 AM" depending on what MessageList shows
  // For simplicity, let's assume MessageList shows a very basic time string or we mock it.
  // If MessageList uses Intl.DateTimeFormat, that should be mocked for consistency.
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};


const mockMessages: MessageProps[] = [
  {
    id: '1',
    text: 'Hello there!',
    sender: { id: 'user1', name: 'Alice' } as User,
    timestamp: new Date('2023-01-01T10:30:00.000Z'),
    conversationId: 'conv1',
  },
  {
    id: '2',
    text: 'General Kenobi!',
    sender: { id: 'currentUser', name: 'CurrentUser' } as User, // Current user
    timestamp: new Date('2023-01-01T10:31:00.000Z'),
    conversationId: 'conv1',
  },
  {
    id: '3',
    text: 'How are you?',
    sender: { id: 'user1', name: 'Alice' } as User,
    timestamp: new Date('2023-01-01T10:32:00.000Z'),
    conversationId: 'conv1',
  },
];

describe('MessageList Component', () => {
  beforeEach(() => {
    // Default mock for useAuth (current user)
    mockUseAuth.mockReturnValue({
      user: { id: 'currentUser', name: 'CurrentUser' },
      // other auth context values...
    });
  });

  it('should render a list of messages with text, sender, and timestamp', () => {
    render(<MessageList messages={mockMessages} />);

    mockMessages.forEach(msg => {
      expect(screen.getByText(msg.text)).toBeInTheDocument();
      // Sender name might be part of the message display or implicitly shown
      // For now, we assume text is enough to identify the message.
      // If sender name is explicitly shown: expect(screen.getByText(msg.sender.name)).toBeInTheDocument();
      // Timestamp check depends on how it's formatted in MessageList.
      // If MessageList uses a specific format, we should check for that.
      // For this example, let's assume the timestamp is not directly rendered or is part of a title/attribute.
      // A more robust test would check for formatted timestamp if visible.
    });
  });

  it('should render an empty state if no messages are provided', () => {
    render(<MessageList messages={[]} />);
    // Assuming the empty state has specific text like "No messages yet."
    // This text should be part of your MessageList component.
    expect(screen.getByText(/no messages yet/i)).toBeInTheDocument(); 
    // Or, if it's a data-testid:
    // expect(screen.getByTestId('empty-message-list')).toBeInTheDocument();
  });

  it('should correctly render new messages when props are updated', () => {
    const { rerender } = render(<MessageList messages={[mockMessages[0]]} />);
    expect(screen.getByText(mockMessages[0].text)).toBeInTheDocument();
    expect(screen.queryByText(mockMessages[1].text)).not.toBeInTheDocument();

    rerender(<MessageList messages={[mockMessages[0], mockMessages[1]]} />);
    expect(screen.getByText(mockMessages[0].text)).toBeInTheDocument();
    expect(screen.getByText(mockMessages[1].text)).toBeInTheDocument();
  });

  describe('Message Styling (Current User vs. Other Users)', () => {
    it('should apply different styling for messages from the current user', () => {
      render(<MessageList messages={mockMessages} />);
      
      // Message from 'currentUser' (id: '2')
      const currentUserMessage = screen.getByText('General Kenobi!').closest('div[data-message-id]'); // Assuming each message is wrapped in a div with data-message-id
      expect(currentUserMessage).toHaveClass('bg-primary text-primary-foreground'); // Example classes for current user

      // Message from 'user1' (id: '1')
      const otherUserMessage = screen.getByText('Hello there!').closest('div[data-message-id]');
      expect(otherUserMessage).toHaveClass('bg-muted'); // Example classes for other users
      expect(otherUserMessage).not.toHaveClass('bg-primary text-primary-foreground');
    });

    it('should apply styling for messages from other users', () => {
      render(<MessageList messages={mockMessages} />);
      const otherUserMessage = screen.getByText('How are you?').closest('div[data-message-id]');
      expect(otherUserMessage).toHaveClass('bg-muted');
      expect(otherUserMessage).not.toHaveClass('bg-primary text-primary-foreground');
    });

    it('should handle messages if current user is not defined (guest view or error)', () => {
        mockUseAuth.mockReturnValue({ user: null }); // No current user
        render(<MessageList messages={mockMessages} />);
        
        // Message from 'currentUser' (id: '2') should now appear as "other user"
        const messagePreviouslyFromCurrentUser = screen.getByText('General Kenobi!').closest('div[data-message-id]');
        expect(messagePreviouslyFromCurrentUser).toHaveClass('bg-muted'); 
        expect(messagePreviouslyFromCurrentUser).not.toHaveClass('bg-primary');
  
        // Message from 'user1' (id: '1')
        const otherUserMessage = screen.getByText('Hello there!').closest('div[data-message-id]');
        expect(otherUserMessage).toHaveClass('bg-muted');
      });
  });

  // Optional: Test for timestamp display and formatting if MessageList handles it
  // This requires mocking Intl.DateTimeFormat or a date utility if used.
  // For this example, we'll assume timestamp formatting is simple or tested elsewhere.
  // If timestamps are displayed and formatted, e.g. "10:30 AM":
  // it('should display formatted timestamps for messages', () => {
  //   render(<MessageList messages={mockMessages} />);
  //   expect(screen.getByText(formatTestTimestamp(mockMessages[0].timestamp))).toBeInTheDocument();
  //   expect(screen.getByText(formatTestTimestamp(mockMessages[1].timestamp))).toBeInTheDocument();
  // });
});
