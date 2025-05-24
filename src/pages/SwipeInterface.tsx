import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SwipeCard from '../components/swipe/SwipeCard';
import SwipeControls from '../components/swipe/SwipeControls';
import { Project, User } from '../types';
import { mockProjects, mockUsers, currentUser } from '../data/mockData';

const SwipeInterface: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<(Project | User)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedItem, setMatchedItem] = useState<Project | User | null>(null);
  const [mode, setMode] = useState<'projects' | 'specialists'>('projects');
  
  useEffect(() => {
    // Load appropriate items based on current user role
    if (currentUser.role === 'specialist') {
      setItems(mockProjects);
      setMode('projects');
    } else {
      // Filter out current user from specialists
      const specialists = mockUsers.filter(user => 
        user.role === 'specialist' && user.id !== currentUser.id
      );
      setItems(specialists);
      setMode('specialists');
    }
  }, []);
  
  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      // Simulate a match with 30% probability
      if (Math.random() < 0.3) {
        setMatchedItem(items[currentIndex]);
        setShowMatch(true);
        setTimeout(() => {
          setShowMatch(false);
          setCurrentIndex(prevIndex => prevIndex + 1);
        }, 3000);
        return;
      }
    }
    
    setCurrentIndex(prevIndex => prevIndex + 1);
  };
  
  const handleViewProfile = () => {
    if (matchedItem && 'title' in matchedItem) {
      // It's a project
      navigate(`/projects/${matchedItem.id}`);
    } else if (matchedItem) {
      // It's a user - in a real app, navigate to user profile
      setShowMatch(false);
      setCurrentIndex(prevIndex => prevIndex + 1);
    }
  };
  
  const handleMessageMatch = () => {
    if (matchedItem && 'title' in matchedItem) {
      // It's a project, message the founder
      navigate(`/messages/${matchedItem.founder.id}`);
    } else if (matchedItem) {
      // It's a user
      navigate(`/messages/${matchedItem.id}`);
    }
  };
  
  // If we've gone through all items
  if (currentIndex >= items.length) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No more items to show</h2>
        <p className="text-gray-500 mb-6">Check back later for new {mode === 'projects' ? 'projects' : 'specialists'}!</p>
        
        <button
          onClick={() => navigate('/')}
          className="text-primary-600 font-medium hover:text-primary-700"
        >
          Return to home
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === 'projects' ? 'Discover Projects' : 'Find Team Members'}
        </h1>
        <p className="text-gray-500 mt-1">
          Swipe right to like, left to skip
        </p>
      </div>
      
      {/* Match overlay */}
      {showMatch && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-8 max-w-md text-center animate-scale-in">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">It's a Match!</h2>
            <p className="text-gray-600 mb-6">
              {matchedItem && 'title' in matchedItem
                ? `${matchedItem.title} is interested in working with you!`
                : `${(matchedItem as User).name} wants to join your team!`}
            </p>
            
            <div className="flex justify-center space-x-4 mb-6">
              <div className="flex flex-col items-center">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-md"
                />
                <p className="mt-2 font-medium">{currentUser.name}</p>
              </div>
              
              <div className="flex items-center">
                <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💫</span>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <img
                  src={matchedItem && 'title' in matchedItem 
                    ? matchedItem.founder.avatar
                    : (matchedItem as User).avatar}
                  alt={matchedItem && 'title' in matchedItem 
                    ? matchedItem.founder.name
                    : (matchedItem as User).name}
                  className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-md"
                />
                <p className="mt-2 font-medium">
                  {matchedItem && 'title' in matchedItem 
                    ? matchedItem.founder.name
                    : (matchedItem as User).name}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleViewProfile}
                className="flex-1 bg-primary-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-600 transition-colors"
              >
                View Profile
              </button>
              <button
                onClick={handleMessageMatch}
                className="flex-1 bg-secondary-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-secondary-600 transition-colors"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="h-[500px] relative">
        <div className="w-full h-full max-w-md mx-auto">
          {items.slice(currentIndex, currentIndex + 3).map((item, index) => (
            <SwipeCard
              key={`${mode}-${item.id}`}
              item={item}
              onSwipe={handleSwipe}
              type={mode === 'projects' ? 'project' : 'user'}
            />
          ))}
        </div>
        
        <SwipeControls
          onSwipeLeft={() => handleSwipe('left')}
          onSwipeRight={() => handleSwipe('right')}
        />
      </div>
    </div>
  );
};

export default SwipeInterface;