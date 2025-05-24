import axios from 'axios';
import { User } from './projectService'; // Assuming User interface is suitable and can be reused

// --- Interfaces ---

// Based on backend Conversation model
export interface Conversation {
  id: string;
  participants: User[]; // Users participating in the conversation
  messages?: Message[]; // Last message or a few recent messages, if backend provides
  createdAt?: string;
  updatedAt?: string; // Useful for sorting conversations
}

// Based on backend Message model
export interface Message {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  timestamp?: string; // Or createdAt
  sender?: User; // Included if fetched with sender details
  createdAt?: string;
  updatedAt?: string;
}

export interface MessageCreationData {
  content: string;
}

// For paginated message responses (similar to Project's PaginatedResponse)
export interface PaginatedMessageResponse {
  totalPages: number;
  currentPage: number;
  totalMessages: number;
  messages: Message[];
}

const API_BASE_URL = '/api'; // Assuming your API is prefixed with /api

// --- Helper for Error Handling (can be shared if moved to a common util) ---
const handleError = (error: any, defaultMessage: string) => {
  if (axios.isAxiosError(error)) {
    const serverError = error.response?.data;
    if (serverError && serverError.message) {
      throw new Error(serverError.message);
    }
    throw new Error(error.message || defaultMessage);
  }
  throw new Error(defaultMessage);
};

// --- Messaging Service ---
export const messagingService = {
  // --- Conversation Endpoints ---
  createConversation: async (participantIds: string[]): Promise<Conversation> => {
    try {
      const response = await axios.post<Conversation>(`${API_BASE_URL}/conversations`, { participantIds });
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to create or find conversation.');
      return null as never; // Should not reach here
    }
  },

  getConversations: async (): Promise<Conversation[]> => {
    try {
      const response = await axios.get<Conversation[]>(`${API_BASE_URL}/conversations`);
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to fetch conversations.');
      return null as never;
    }
  },

  // --- Message Endpoints ---
  sendMessage: async (conversationId: string, content: string): Promise<Message> => {
    try {
      const response = await axios.post<Message>(
        `${API_BASE_URL}/conversations/${conversationId}/messages`,
        { content }
      );
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to send message.');
      return null as never;
    }
  },

  getMessages: async (
    conversationId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedMessageResponse> => {
    try {
      // Assuming backend returns PaginatedMessageResponse structure directly
      const response = await axios.get<PaginatedMessageResponse>(
        `${API_BASE_URL}/conversations/${conversationId}/messages`,
        { params }
      );
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to fetch messages.');
      return null as never;
    }
  },
};

export default messagingService;
