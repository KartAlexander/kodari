import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // Replaced react-router-dom Link
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext'; // Adjusted path
import Spinner from '../../components/ui/Spinner'; // Assuming Spinner component
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/Alert'; // Assuming Alert component
import { Card } from '../../components/ui/Card'; // Assuming Card component
import { Inbox, UserCircle, MessageSquare } from 'lucide-react'; // Icons

interface Conversation {
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
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: number; // ID of the user who sent the last message
  };
  unreadCount?: number; // Optional: if your API supports this
}

const MessagesPage: React.FC = () => {
  const { user } = useAuth(); // Get current user
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) { // Fetch conversations only if user is logged in
      fetchConversations();
    } else {
      setLoading(false); // Not loading if no user
      // Optionally, redirect to login or show a message
    }
  }, [user]); // Re-fetch if user changes

  const fetchConversations = async () => {
    setLoading(true);
    setError('');
    try {
      // Replace with your actual API endpoint for conversations
      // This API should return conversations relevant to the logged-in user
      const response = await axios.get('/api/conversations'); // Example: using a Next.js API route
      setConversations(response.data);
    } catch (err: any) {
      console.error('Error fetching conversations:', err);
      setError(err.response?.data?.message || 'Ошибка при загрузке сообщений');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <Alert variant="default" className="max-w-md mx-auto">
                <Inbox className="h-5 w-5"/>
                <AlertTitle>Доступ запрещен</AlertTitle>
                <AlertDescription>
                    Пожалуйста, <Link href="/login" className="text-primary-600 hover:underline">войдите</Link> или <Link href="/register" className="text-primary-600 hover:underline">зарегистрируйтесь</Link>, чтобы просмотреть ваши сообщения.
                </AlertDescription>
            </Alert>
        </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Alert variant="destructive">
          <AlertTitle>Ошибка загрузки</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <MessageSquare className="h-8 w-8 mr-3 text-primary-600" />
          Ваши диалоги
        </h1>
      </header>

      {conversations.length === 0 ? (
        <Card className="text-center py-12">
          <Inbox className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">У вас пока нет диалогов</h2>
          <p className="text-gray-500 mt-2">
            Когда вы начнете общение по проектам, ваши диалоги появятся здесь.
          </p>
          <Link href="/projects" legacyBehavior>
            <a className="mt-4 inline-block bg-primary-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-primary-700">
              Найти проекты
            </a>
          </Link>
        </Card>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <Link href={`/messages/${conversation.id}`} legacyBehavior>
                  <a className="block hover:bg-gray-50 transition duration-150 ease-in-out">
                    <div className="p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0">
                           <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xl font-medium">
                                {conversation.participant.name[0]?.toUpperCase()}
                            </div>
                          <div className="ml-4 min-w-0">
                            <p className="text-md font-semibold text-primary-700 truncate">
                              {conversation.participant.name}
                            </p>
                            <p className="text-sm text-gray-600 truncate">
                              Проект: {conversation.project.title}
                            </p>
                          </div>
                        </div>
                        <div className="ml-2 text-right">
                           <p className="text-xs text-gray-400">
                            {new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                           <p className="text-xs text-gray-400 mt-1">
                            {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                          </p>
                          {/* Optional: Unread message badge */}
                          {/* {conversation.unreadCount && conversation.unreadCount > 0 && (
                            <span className="mt-1 inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium leading-4 bg-red-500 text-white">
                              {conversation.unreadCount}
                            </span>
                          )} */}
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          <span className="font-medium">
                            {conversation.lastMessage.senderId === user?.id ? 'Вы: ' : `${conversation.participant.name.split(' ')[0]}: `}
                          </span>
                          {conversation.lastMessage.content}
                        </p>
                      </div>
                    </div>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
