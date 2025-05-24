import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { User, Message } from '../../types';
import Button from '../ui/Button';

interface ChatInterfaceProps {
  currentUser: User;
  otherUser: User;
  messages: Message[];
  onSendMessage: (content: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  currentUser,
  otherUser,
  messages,
  onSendMessage
}) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const formatMessageTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };
  
  // Group messages by date
  const groupedMessages: { [key: string]: Message[] } = {};
  
  messages.forEach(message => {
    const date = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(message.timestamp);
    
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    
    groupedMessages[date].push(message);
  });
  
  const dateKeys = Object.keys(groupedMessages);
  
  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 px-4 py-3 flex items-center">
        <img
          src={otherUser.avatar}
          alt={otherUser.name}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-gray-900">{otherUser.name}</h3>
          <p className="text-xs text-gray-500 capitalize">{otherUser.role}</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {dateKeys.map(date => (
          <div key={date}>
            <div className="flex justify-center mb-4">
              <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-500">
                {date}
              </span>
            </div>
            
            {groupedMessages[date].map(message => {
              const isCurrentUser = message.senderId === currentUser.id;
              
              return (
                <div 
                  key={message.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex flex-col max-w-[75%]">
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isCurrentUser 
                          ? 'bg-primary-500 text-white rounded-tr-none' 
                          : 'bg-gray-100 text-gray-800 rounded-tl-none'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <span className={`text-xs text-gray-500 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                      {formatMessageTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
        <div className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <Button
            type="submit"
            variant="primary"
            className="rounded-l-none"
            disabled={!newMessage.trim()}
          >
            <Send size={16} />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;