import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: number;
  content: string;
  createdAt: string;
  senderId: number;
}

interface Conversation {
  id: number;
  project: {
    id: number;
    title: string;
  };
  participant: {
    id: number;
    name: string;
    role: 'specialist' | 'founder';
  };
  messages: Message[];
}

const Conversation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversation();
    const interval = setInterval(fetchConversation, 5000); // Poll for new messages
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const fetchConversation = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/conversations/${id}`);
      setConversation(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      setError('Ошибка при загрузке разговора');
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await axios.post(`http://localhost:3000/api/conversations/${id}/messages`, {
        content: newMessage,
      });
      setNewMessage('');
      fetchConversation();
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Ошибка при отправке сообщения');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
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