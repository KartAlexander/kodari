import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatInterface, ChatInterfaceProps } from './ChatInterface'; // Adjust import path
import axios from 'axios'; // For mocking if ChatInterface itself makes API calls

// Mock axios if ChatInterface directly uses it (e.g., for optimistic updates or direct send)
// If it only relies on onSendMessage, this might not be needed here.
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock any icons or sub-components used by ChatInterface if necessary
// e.g., jest.mock('../ui/Button', () => (props: any) => <button {...props} />);
// jest.mock('@radix-ui/react-icons', () => ({ SendIcon: () => <span data-testid="send-icon" /> }));

const defaultProps: ChatInterfaceProps = {
  conversationId: 'conv123',
  onSendMessage: jest.fn().mockResolvedValue(undefined), // Default successful send
};

describe('ChatInterface Component', () => {
  beforeEach(() => {
    // Clear mocks before each test
    (defaultProps.onSendMessage as jest.Mock).mockClear();
    mockedAxios.post.mockClear(); // If axios is used directly
  });

  it('should render message input field and send button', () => {
    render(<ChatInterface {...defaultProps} />);
    expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument(); 
    // Or if using an icon button without accessible name, query by testid or title
    // expect(screen.getByTestId('send-button')).toBeInTheDocument();
  });

  describe('Message Input and Sending', () => {
    it('should allow user to type into the message input', () => {
      render(<ChatInterface {...defaultProps} />);
      const input = screen.getByPlaceholderText(/type a message/i) as HTMLInputElement; // Or HTMLTextAreaElement
      fireEvent.change(input, { target: { value: 'Hello World' } });
      expect(input.value).toBe('Hello World');
    });

    it('should call onSendMessage and clear input when send button is clicked with non-empty message', async () => {
      render(<ChatInterface {...defaultProps} />);
      const input = screen.getByPlaceholderText(/type a message/i);
      const sendButton = screen.getByRole('button', { name: /send message/i });
      const testMessage = 'Test message';

      fireEvent.change(input, { target: { value: testMessage } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(defaultProps.onSendMessage).toHaveBeenCalledWith(testMessage, defaultProps.conversationId);
      });
      // Input should be cleared after successful send
      expect((input as HTMLInputElement | HTMLTextAreaElement).value).toBe(''); 
    });

    it('should call onSendMessage and clear input when Enter key is pressed in input with non-empty message', async () => {
      render(<ChatInterface {...defaultProps} />);
      const input = screen.getByPlaceholderText(/type a message/i);
      const testMessage = 'Another test message';

      fireEvent.change(input, { target: { value: testMessage } });
      // Simulate pressing Enter. For textarea, just Enter might not submit by default.
      // Assuming the component handles Enter key press for submission.
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });
      // If Enter + Shift = newline, then just Enter = send
      // fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 }); // Alternative for some setups


      await waitFor(() => {
        expect(defaultProps.onSendMessage).toHaveBeenCalledWith(testMessage, defaultProps.conversationId);
      });
      expect((input as HTMLInputElement | HTMLTextAreaElement).value).toBe('');
    });

    it('should not call onSendMessage if message is empty or only whitespace', () => {
      render(<ChatInterface {...defaultProps} />);
      const input = screen.getByPlaceholderText(/type a message/i);
      const sendButton = screen.getByRole('button', { name: /send message/i });

      // Test with empty message
      fireEvent.click(sendButton);
      expect(defaultProps.onSendMessage).not.toHaveBeenCalled();

      // Test with whitespace message
      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.click(sendButton);
      expect(defaultProps.onSendMessage).not.toHaveBeenCalled();
    });
  });

  describe('Loading State during Submission', () => {
    it('should disable input and button when onSendMessage is processing', async () => {
      // Simulate onSendMessage being a promise that takes time
      const onSendMessagePromise = new Promise<void>(resolve => setTimeout(() => resolve(), 100));
      const onSendMessageMock = jest.fn(() => onSendMessagePromise);
      
      render(<ChatInterface {...defaultProps} onSendMessage={onSendMessageMock} />);
      
      const input = screen.getByPlaceholderText(/type a message/i);
      const sendButton = screen.getByRole('button', { name: /send message/i });
      const testMessage = 'Loading state test';

      fireEvent.change(input, { target: { value: testMessage } });
      fireEvent.click(sendButton);

      // Immediately after click, input and button should be disabled (or show loading state)
      await waitFor(() => {
        expect(input).toBeDisabled();
        expect(sendButton).toBeDisabled();
        // If there's a visual loading indicator (e.g., spinner in button), test for it:
        // expect(sendButton.querySelector('.animate-spin')).toBeInTheDocument();
      });

      // Wait for the promise to resolve
      await act(async () => {
        await onSendMessagePromise;
      });

      // After promise resolves, input and button should be enabled again
      expect(input).toBeEnabled();
      expect(sendButton).toBeEnabled();
      expect((input as HTMLInputElement | HTMLTextAreaElement).value).toBe(''); // Input cleared
    });
  });

  describe('Error Handling', () => {
    it('should display an error message if onSendMessage throws an error', async () => {
      const errorMessage = 'Failed to send message';
      const onSendMessageMock = jest.fn().mockRejectedValueOnce(new Error(errorMessage));
      render(<ChatInterface {...defaultProps} onSendMessage={onSendMessageMock} />);

      const input = screen.getByPlaceholderText(/type a message/i);
      const sendButton = screen.getByRole('button', { name: /send message/i });
      const testMessage = 'Error test message';

      fireEvent.change(input, { target: { value: testMessage } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(onSendMessageMock).toHaveBeenCalledWith(testMessage, defaultProps.conversationId);
      });
      
      // Wait for the error message to appear.
      // This depends on ChatInterface having a state to hold and display the error.
      // Example: expect(screen.getByText(errorMessage)).toBeInTheDocument();
      // Or, if error is displayed in a specific element:
      // const errorDisplay = screen.getByTestId('send-error-message');
      // expect(errorDisplay).toHaveTextContent(errorMessage);
      
      // Input should not be cleared on error, allowing user to retry
      expect((input as HTMLInputElement | HTMLTextAreaElement).value).toBe(testMessage);
      expect(input).toBeEnabled(); // Input should be re-enabled
      expect(sendButton).toBeEnabled(); // Button should be re-enabled
    });
  });
});
