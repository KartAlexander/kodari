import React, { ReactNode } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { MessagesPage } from './Messages'; // Adjust import path
import { AuthProvider, User } from '../contexts/AuthContext'; // For providing auth context
import { MessageProps } from '../components/messages/MessageList'; // For message types

// --- Mock axios ---
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
// --- End Mock axios ---

// --- Mock Child Components (Lightly) ---
// We want to test Messages.tsx's logic, not re-test children in detail.
// We'll check if they receive correct props and if key interactions work.
jest.mock('../components/messages/MessageList', () => ({
  MessageList: jest.fn(({ messages }: { messages: MessageProps[] }) => (
    <div data-testid="message-list">
      {messages.map(msg => <div key={msg.id} data-testid={`message-${msg.id}`}>{msg.text}</div>)}
      {messages.length === 0 && <span>No messages yet.</span>}
    </div>
  )),
}));

jest.mock('../components/messages/ChatInterface', () => ({
  ChatInterface: jest.fn(({ onSendMessage, conversationId }: { onSendMessage: Function, conversationId: string }) => (
    <div data-testid="chat-interface">
      <input type="text" data-testid="chat-input" placeholder="Type a message..." />
      <button data-testid="send-button" onClick={() => onSendMessage('Test from mock chat', conversationId)}>
        Send
      </button>
    </div>
  )),
}));
// --- End Mock Child Components ---

// --- Mock useAuth from AuthContext ---
// Provide a mock user for contexts where it's needed
const mockUser: User = { id: 'currentUser123', name: 'Test User', email: 'user@test.com' };
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({ user: mockUser, loading: false })),
}));
// --- End Mock useAuth ---


// Helper to wrap component in Router and AuthProvider
const renderMessagesPage = (initialEntries = ['/messages/conv123']) => {
  // Mock useParams if your MessagesPage uses it to get conversationId
  // This depends on your Route setup for MessagesPage.
  // For this example, let's assume conversationId might come from URL params.
  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ conversationId: 'conv123' }), // Mocked conversationId
  }));

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider> {/* AuthProvider might be needed if MessagesPage or children useAuth */}
        <Routes>
            {/* Adjust path if your MessagesPage uses a different route structure */}
            <Route path="/messages/:conversationId" element={<MessagesPage />} />
            <Route path="/messages" element={<MessagesPage />} /> {/* For a default state */}
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
};


const mockConversationMessages: MessageProps[] = [
  { id: 'm1', text: 'Hello from conv123', sender: { id: 'userA', name: 'User A' }, timestamp: new Date(), conversationId: 'conv123' },
  { id: 'm2', text: 'Reply from conv123', sender: mockUser, timestamp: new Date(), conversationId: 'conv123' },
];

describe('Messages Page', () => {
  beforeEach(() => {
    mockedAxios.get.mockClear();
    mockedAxios.post.mockClear();
    // Reset mocks for child components if they are jest.fn()
    (require('../components/messages/MessageList').MessageList as jest.Mock).mockClear();
    (require('../components/messages/ChatInterface').ChatInterface as jest.Mock).mockClear();
  });

  describe('Initial Load and Message Fetching', () => {
    it('should show loading state initially, then fetch and display messages', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockConversationMessages }); // For fetching messages
      
      renderMessagesPage();

      // Check for loading state (depends on MessagesPage implementation)
      // Example: expect(screen.getByText(/loading messages/i)).toBeInTheDocument();
      // Or, if no specific loading text, wait for MessageList to be called.

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          `${process.env.REACT_APP_API_URL}/messages/conv123` // Or your actual API endpoint
        );
      });
      
      await waitFor(() => {
        // Check if MessageList is rendered and received the messages
        const messageListComponent = require('../components/messages/MessageList').MessageList;
        expect(messageListComponent).toHaveBeenCalled();
        expect(messageListComponent.mock.calls[0][0].messages).toEqual(mockConversationMessages);
        
        // Also check if messages are visible via their text (rendered by the mock MessageList)
        expect(screen.getByTestId('message-list')).toBeInTheDocument();
        expect(screen.getByText('Hello from conv123')).toBeInTheDocument();
        expect(screen.getByText('Reply from conv123')).toBeInTheDocument();
      });
      // Check that loading state is gone
      // Example: expect(screen.queryByText(/loading messages/i)).not.toBeInTheDocument();
    });

    it('should display an error message if fetching messages fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Failed to fetch messages'));
      renderMessagesPage();

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      });
      
      // Check for error message (depends on MessagesPage implementation)
      // Example: expect(screen.getByText(/error loading messages/i)).toBeInTheDocument();
      // Or, expect(screen.getByTestId('messages-error-state')).toBeInTheDocument();
      
      // MessageList might be rendered with empty messages or not at all depending on error handling
      // If it shows empty state:
      await waitFor(() => {
        expect(screen.getByText(/no messages yet/i)).toBeInTheDocument(); // From mocked MessageList
      });
    });

    it('should render ChatInterface for the current conversation', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: [] }); // No messages needed for this test
        renderMessagesPage();
        
        await waitFor(() => {
            const chatInterfaceComponent = require('../components/messages/ChatInterface').ChatInterface;
            expect(chatInterfaceComponent).toHaveBeenCalled();
            expect(chatInterfaceComponent.mock.calls[0][0].conversationId).toBe('conv123');
            expect(screen.getByTestId('chat-interface')).toBeInTheDocument();
        });
    });
  });

  describe('Sending a Message', () => {
    it('should call API to send message and update MessageList on successful send', async () => {
      // Initial load of messages
      mockedAxios.get.mockResolvedValueOnce({ data: [mockConversationMessages[0]] }); // Start with one message
      
      // Mock response for sending a new message
      const newMessageText = 'New test message';
      const sentMessageResponse: MessageProps = {
        id: 'm3',
        text: newMessageText,
        sender: mockUser, // Message sent by current user
        timestamp: new Date(),
        conversationId: 'conv123',
      };
      mockedAxios.post.mockResolvedValueOnce({ data: sentMessageResponse });

      renderMessagesPage();

      // Wait for initial messages to load
      await waitFor(() => {
        expect(screen.getByText(mockConversationMessages[0].text)).toBeInTheDocument();
      });

      // Simulate sending a message via the (mocked) ChatInterface
      // The mock ChatInterface calls its onSendMessage prop when its button is clicked
      const sendButton = screen.getByTestId('send-button');
      // We need to get the onSendMessage prop passed to the ChatInterface mock
      const chatInterfaceMock = require('../components/messages/ChatInterface').ChatInterface;
      const onSendMessageProp = chatInterfaceMock.mock.calls[0][0].onSendMessage;
      
      await act(async () => {
        // This simulates the ChatInterface calling onSendMessage
        // In a real component test, you'd interact with ChatInterface's input and button
        await onSendMessageProp(newMessageText, 'conv123');
      });

      // Verify API call to send message
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/messages`, // Or your actual send message endpoint
        { text: newMessageText, conversationId: 'conv123' }
      );

      // Verify MessageList is updated
      // This depends on MessagesPage refetching messages or optimistically updating
      // For optimistic update, MessageList would be re-rendered with the new message.
      // For refetch, another GET call would be made. Let's assume optimistic update or immediate refetch for simplicity.
      await waitFor(() => {
        // MessageList should now include the sent message
        // The mocked MessageList just renders text, so we check for it.
        expect(screen.getByText(newMessageText)).toBeInTheDocument();
        // If MessagesPage refetches, mock that GET call too and check MessageList props
      });
    });

    it('should display an error if sending message fails', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: [] }); // Initial load
        mockedAxios.post.mockRejectedValueOnce(new Error('Failed to send'));
        
        renderMessagesPage();
        await waitFor(() => expect(screen.getByTestId('chat-interface')).toBeInTheDocument());

        const chatInterfaceMock = require('../components/messages/ChatInterface').ChatInterface;
        const onSendMessageProp = chatInterfaceMock.mock.calls[0][0].onSendMessage;
        
        await act(async () => {
          try {
            await onSendMessageProp('Fail this message', 'conv123');
          } catch (e) {
            // Error expected
          }
        });
        
        // Check for error display on MessagesPage (depends on implementation)
        // Example: expect(screen.getByText(/error sending message/i)).toBeInTheDocument();
        // Or, ChatInterface itself might display the error, which we wouldn't see with this mock.
        // For this test, we ensure the call was made.
        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      });
  });

  // Add tests for switching conversations if MessagesPage supports it
  // This would involve:
  // - Simulating a click on a conversation list item (if MessagesPage renders one)
  // - Verifying that useParams().conversationId changes (or a state variable)
  // - Verifying that a new GET request is made for messages of the new conversation
  // - Verifying that MessageList is updated with messages for the new conversation
});
