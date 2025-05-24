import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router'; // Replaced react-router-dom
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext'; // Adjusted path
import Spinner from '../../components/ui/Spinner'; // Assuming Spinner component
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/Alert'; // Assuming Alert component
import Button from '../../components/ui/Button'; // Assuming Button component
import { ArrowLeft, Send, MessageCircle, UserCircle, Briefcase } from 'lucide-react'; // Icons

interface Message {
  id: number;
  content: string;
  createdAt: string; // Keep as string, format on client
  senderId: number; // ID of the user who sent this message
}

interface ConversationData { // Renamed to avoid conflict with component name
  id: number;
  project: {
    id: number;
    title: string;
  };
  participant: { // The other person in the conversation
    id: number;
    name: string;
    role: 'specialist' | 'founder';
  };
  messages: Message[];
}

const ConversationPage: React.FC = () => {
  const router = useRouter();
  const { id: conversationId } = router.query; // Conversation ID from URL
  const { user } = useAuth(); // Current logged-in user
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null); // For auto-scrolling

  const fetchConversation = async (currentConversationId: string) => {
    // setLoading(true); // Only set loading true on initial load, not for polling
    setError('');
    try {
      const response = await axios.get(`/api/conversations/${currentConversationId}`);
      setConversation(response.data);
    } catch (err: any) {
      console.error('Error fetching conversation:', err);
      setError(err.response?.data?.message || 'Ошибка при загрузке диалога.');
      // Keep existing conversation data if polling fails, to avoid UI flicker
    } finally {
      setLoading(false); // Ensure loading is false after first fetch
    }
  };

  useEffect(() => {
    if (conversationId && typeof conversationId === 'string') {
      fetchConversation(conversationId); // Initial fetch

      const interval = setInterval(() => {
        if (document.visibilityState === 'visible') { // Only poll if tab is active
            fetchConversation(conversationId as string);
        }
      }, 5000); // Poll for new messages every 5 seconds

      return () => clearInterval(interval); // Cleanup interval on unmount
    } else {
      setLoading(false);
      setError("ID диалога не найден.");
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]); // Scroll when messages update

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !conversationId) return;

    setSending(true);
    try {
      // API endpoint for sending a message in a conversation
      await axios.post(`/api/conversations/${conversationId}/messages`, {
        content: newMessage,
        senderId: user.id, // Make sure senderId is included
      });
      setNewMessage('');
      fetchConversation(conversationId as string); // Refresh messages after sending
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.message || 'Ошибка при отправке сообщения.');
    } finally {
      setSending(false);
    }
  };

  if (loading && !conversation) { // Show full page spinner only on initial load
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error && !conversation) { // Show error only if no conversation data is available
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Alert variant="destructive">
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/messages')} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> К диалогам
        </Button>
      </div>
    );
  }
  
  if (!conversation) { // Should be covered by loading/error, but as a fallback
     return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p>Диалог не найден.</p>
         <Button onClick={() => router.push('/messages')} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> К диалогам
        </Button>
      </div>
    );
  }


  const otherParticipant = conversation.participant;

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button onClick={() => router.push('/messages')} variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold mr-3">
              {otherParticipant.name[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{otherParticipant.name}</h2>
              <p className="text-xs text-gray-500">Проект: {conversation.project.title}</p>
            </div>
          </div>
          {/* Potentially add a link to the project if relevant */}
          <Link href={`/projects/${conversation.project.id}`} legacyBehavior>
            <a className="text-sm text-primary-600 hover:underline flex items-center">
                <Briefcase className="h-4 w-4 mr-1.5" />
                К проекту
            </a>
          </Link>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50">
        {conversation.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-end max-w-[75%] sm:max-w-[65%]`}>
              {message.senderId !== user?.id && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-white mr-2">
                  {otherParticipant.name[0]?.toUpperCase()}
                </div>
              )}
              <div
                className={`rounded-xl px-4 py-2.5 shadow-md ${
                  message.senderId === user?.id
                    ? 'bg-primary-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1.5 text-right ${
                    message.senderId === user?.id ? 'text-primary-100/80' : 'text-gray-400'
                  }`}
                >
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
               {message.senderId === user?.id && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-white ml-2">
                  Вы
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Anchor for scrolling to bottom */}
        {loading && conversation && <Spinner className="mx-auto my-4"/>} {/* Show spinner when polling for new messages */}
      </div>
      
      {/* Error display within chat input area */}
       {error && !conversation && ( /* Only if critical error and no conversation loaded */
            <Alert variant="destructive" className="m-4">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}


      {/* Message Input Form */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Напишите сообщение..."
            className="flex-1 border border-gray-300 rounded-full py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
            disabled={sending || (loading && !conversation) /* Disable if initial load ongoing */}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || sending || (loading && !conversation)}
            className="rounded-full"
            size="icon"
          >
            {sending ? <Spinner size="sm" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ConversationPage;
