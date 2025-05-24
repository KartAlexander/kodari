import React, { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { messagingService, Conversation } from '../../services/messagingService'; // Updated import
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../services/projectService'; // For User type

// Basic Modal Component (can be extracted)
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
};


const Messages: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For "New Conversation" modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [participantIdsInput, setParticipantIdsInput] = useState('');
  const [newConversationError, setNewConversationError] = useState<string | null>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);


  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedConversations = await messagingService.getConversations();
      setConversations(fetchedConversations);
    } catch (err: any) {
      console.error('Error fetching conversations:', err);
      setError(err.message || 'Ошибка при загрузке диалогов');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) { // Only fetch if user is logged in
        fetchConversations();
    } else {
        setLoading(false); // Not loading if no user
    }
  }, [user]);


  const handleCreateConversation = async (e: FormEvent) => {
    e.preventDefault();
    if (!participantIdsInput.trim()) {
      setNewConversationError('Введите ID участников через запятую.');
      return;
    }
    const ids = participantIdsInput.split(',').map(id => id.trim()).filter(id => id);
    if (ids.length === 0) {
      setNewConversationError('Необходимо указать хотя бы одного участника.');
      return;
    }

    setIsCreatingConversation(true);
    setNewConversationError(null);
    try {
      const newConversation = await messagingService.createConversation(ids);
      setIsModalOpen(false);
      setParticipantIdsInput('');
      // navigate(`/messages/${newConversation.id}`); // Navigate to the new conversation
      // Or refresh the list and let user click
      fetchConversations(); 
      alert(`Диалог создан/найден с ID: ${newConversation.id}`);
    } catch (err: any) {
      setNewConversationError(err.message || 'Не удалось создать диалог.');
    } finally {
      setIsCreatingConversation(false);
    }
  };
  
  const getOtherParticipants = (conversation: Conversation): User[] => {
    return conversation.participants.filter(p => p.id !== user?.id);
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