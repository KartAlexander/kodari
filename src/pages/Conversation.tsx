import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    messagingService, 
    Message as ServiceMessage, // Renamed to avoid conflict
    PaginatedMessageResponse,
    Conversation as ServiceConversation // To fetch conversation details if needed
} from '../../services/messagingService';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../services/projectService'; // For User type

const ConversationPage: React.FC = () => { // Renamed component
  const { conversationId } = useParams<{ conversationId: string }>(); // Use conversationId
  const navigate = useNavigate();
  const { user } = useAuth();

  // State for messages
  const [paginatedMessages, setPaginatedMessages] = useState<PaginatedMessageResponse | null>(null);
  const [messages, setMessages] = useState<ServiceMessage[]>([]); // Accumulate messages
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 20;

  // State for sending new message
  const [newMessageContent, setNewMessageContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // State for conversation details (e.g., participant names)
  const [currentConversation, setCurrentConversation] = useState<ServiceConversation | null>(null);
  const [loadingConversationDetails, setLoadingConversationDetails] = useState(true);


  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversationDetails = async () => {
      if (!conversationId) return;
      setLoadingConversationDetails(true);
      try {
          // This endpoint doesn't exist yet. We need an endpoint like GET /api/conversations/:id
          // For now, we'll try to get it from the list of conversations, or assume participants are known
          // Ideally, backend provides GET /api/conversations/:conversationId which returns Conversation details
          // As a fallback or if the main conversation list isn't readily available here,
          // we might not have full participant details easily without an extra call or state passing.
          // For this example, I'll fetch all conversations and find the current one.
          // This is NOT efficient and should be replaced by a specific backend endpoint.
          const allConversations = await messagingService.getConversations();
          const foundConv = allConversations.find(c => c.id === conversationId);
          if (foundConv) {
              setCurrentConversation(foundConv);
          } else {
              setMessagesError("Детали диалога не найдены.");
          }
      } catch (err) {
          console.error("Error fetching conversation details", err);
          // Handle error if needed
      } finally {
          setLoadingConversationDetails(false);
      }
  };
  
  const fetchMessages = async (page: number, initialLoad = false) => {
    if (!conversationId) return;
    setLoadingMessages(true);
    setMessagesError(null);
    try {
      const response = await messagingService.getMessages(conversationId, { page, limit: messagesPerPage });
      setPaginatedMessages(response);
      if (initialLoad) {
        setMessages(response.messages.reverse()); // Reverse for chronological display from bottom
      } else {
        // Prepend older messages when loading more (if messages are sorted newest first from API)
        // Assuming API returns messages sorted createdAt: DESC (newest first) for pagination
        // If API returns ASC (oldest first), then it's `setMessages(prev => [...prev, ...response.messages])`
        setMessages(prev => [...response.messages.reverse(), ...prev]);
      }
      setCurrentPage(page);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setMessagesError(err.message || 'Ошибка при загрузке сообщений');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (conversationId) {
      fetchConversationDetails(); // Fetch details about the conversation itself
      fetchMessages(1, true); // Fetch initial page of messages
    }
    // No polling for this version
  }, [conversationId]);

  useEffect(() => {
    // Scroll to bottom only when new messages are added by the current user or on initial load
    if (messages.length > 0) {
        // Check if the last message is from the current user or if it's an initial load scenario
        const lastMessage = messages[messages.length - 1];
        if ((lastMessage && lastMessage.senderId === user?.id) || currentPage === 1 && paginatedMessages?.currentPage === 1) {
             scrollToBottom();
        }
    }
  }, [messages, user?.id, currentPage, paginatedMessages?.currentPage]);


  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessageContent.trim() || !conversationId) return;
    setIsSending(true);
    try {
      const sentMessage = await messagingService.sendMessage(conversationId, newMessageContent);
      setMessages(prevMessages => [...prevMessages, sentMessage]); // Optimistic update
      setNewMessageContent('');
      // scrollToBottom(); // Already handled by useEffect on messages change
    } catch (err: any) {
      console.error('Error sending message:', err);
      setMessagesError(err.message || 'Ошибка при отправке сообщения');
      // Optionally, remove optimistic update on error
    } finally {
      setIsSending(false);
    }
  };
  
  const handleLoadMoreMessages = () => {
    if (paginatedMessages && currentPage < paginatedMessages.totalPages) {
      fetchMessages(currentPage + 1);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const getOtherParticipantsNames = (): string => {
    if (!currentConversation || !user) return "Диалог";
    return currentConversation.participants
        .filter(p => p.id !== user.id)
        .map(p => p.username)
        .join(', ') || "Неизвестный участник";
  };


  if (loadingConversationDetails || (loadingMessages && messages.length === 0)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600">{error || 'Разговор не найден'}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                {conversation.project.title}
              </h2>
              <p className="text-sm text-gray-500">
                Разговор с {conversation.participant.name}
              </p>
            </div>
            <button
              onClick={() => navigate('/messages')}
              className="text-gray-500 hover:text-gray-700"
            >
              Назад к сообщениям
            </button>
          </div>
        </div>

        <div className="h-[600px] overflow-y-auto p-4 space-y-4">
          {conversation.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === user?.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.senderId === user?.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p>{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.senderId === user?.id
                      ? 'text-primary-100'
                      : 'text-gray-500'
                  }`}
                >
                  {new Date(message.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
          <div className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Введите сообщение..."
              className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              Отправить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Conversation;