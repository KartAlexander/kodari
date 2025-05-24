import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

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
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: number;
  };
}

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/conversations');
      setConversations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Ошибка при загрузке сообщений');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Сообщения</h1>

      {conversations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">У вас пока нет сообщений</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              to={`/messages/${conversation.id}`}
              className="block hover:bg-gray-50"
            >
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-medium">
                          {conversation.participant.name[0]}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {conversation.participant.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {conversation.project.title}
                      </div>
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <div className="text-sm text-gray-500">
                      {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-sm text-gray-500 line-clamp-1">
                    {conversation.lastMessage.senderId === user?.id ? 'Вы: ' : ''}
                    {conversation.lastMessage.content}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Messages;