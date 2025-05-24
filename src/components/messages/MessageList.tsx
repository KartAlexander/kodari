import React from 'react';
import { Link } from 'react-router-dom';
import { User, Message } from '../../types';

interface MessageListProps {
  messages: Message[];
  users: User[];
  currentUserId: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, users, currentUserId }) => {
  // Group messages by conversation partner
  const conversations = messages.reduce((acc, message) => {
    const partnerId = message.senderId === currentUserId
      ? message.receiverId
      : message.senderId;
    
    if (!acc[partnerId]) {
      acc[partnerId] = [];
    }
    
    acc[partnerId].push(message);
    return acc;
  }, {} as Record<string, Message[]>);
  
  // Sort conversations by latest message
  const sortedConversations = Object.entries(conversations)
    .map(([userId, messages]) => {
      const latestMessage = messages.sort((a, b) => 
        b.timestamp.getTime() - a.timestamp.getTime()
      )[0];
      
      return {
        userId,
        latestMessage,
        unreadCount: messages.filter(m => 
          m.senderId !== currentUserId && !m.read
        ).length
      };
    })
    .sort((a, b) => 
      b.latestMessage.timestamp.getTime() - a.latestMessage.timestamp.getTime()
    );
  
  if (sortedConversations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No messages yet. Start connecting with projects and specialists!</p>
      </div>
    );
  }
  
  return (
    <div className="divide-y divide-gray-200">
      {sortedConversations.map(({ userId, latestMessage, unreadCount }) => {
        const user = users.find(u => u.id === userId);
        if (!user) return null;
        
        const formattedTime = new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        }).format(latestMessage.timestamp);
        
        const formattedDate = new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric'
        }).format(latestMessage.timestamp);
        
        // Today's date for comparison
        const today = new Date();
        const isToday = latestMessage.timestamp.getDate() === today.getDate() &&
                        latestMessage.timestamp.getMonth() === today.getMonth() &&
                        latestMessage.timestamp.getFullYear() === today.getFullYear();
        
        const timeDisplay = isToday ? formattedTime : formattedDate;
        
        return (
          <Link 
            key={userId} 
            to={`/messages/${userId}`}
            className="block hover:bg-gray-50 transition-colors"
          >
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 relative">
                    <img
                      className="h-12 w-12 rounded-full object-cover"
                      src={user.avatar}
                      alt={user.name}
                    />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-primary-500 ring-2 ring-white" />
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <h3 className="text-base font-medium text-gray-900">{user.name}</h3>
                      <span className="ml-2 text-xs font-medium text-gray-500 capitalize">
                        {user.role}
                      </span>
                    </div>
                    <p className={`text-sm ${unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'} line-clamp-1`}>
                      {latestMessage.senderId === currentUserId ? 'You: ' : ''}
                      {latestMessage.content}
                    </p>
                  </div>
                </div>
                <div className="ml-2 flex flex-col items-end">
                  <span className="text-xs text-gray-500">{timeDisplay}</span>
                  {unreadCount > 0 && (
                    <span className="mt-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary-100 text-xs font-medium text-primary-800">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default MessageList;