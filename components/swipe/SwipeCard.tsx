import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Project, User } from '../../types';
import Badge from '../ui/Badge';
import SkillTag from '../shared/SkillTag';
import { Card } from '../ui/Card';
import { Users } from 'lucide-react';

interface SwipeCardProps {
  item: Project | User;
  onSwipe: (direction: 'left' | 'right') => void;
  type: 'project' | 'user';
}

const SwipeCard: React.FC<SwipeCardProps> = ({ item, onSwipe, type }) => {
  const [exitX, setExitX] = useState<number | null>(null);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const opacity = useTransform(x, [-100, 0, 100], [0.8, 1, 0.8]);
  
  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 100) {
      setExitX(1000);
      onSwipe('right');
    } else if (info.offset.x < -100) {
      setExitX(-1000);
      onSwipe('left');
    }
  };
  
  const renderProjectCard = (project: Project) => {
    return (
      <>
        <div className="relative h-64 rounded-t-xl overflow-hidden">
          <img 
            src={project.image || 'https://images.pexels.com/photos/7102/notes-macbook-study-conference.jpg?auto=compress&cs=tinysrgb&w=600'} 
            alt={project.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute top-4 right-4">
            <Badge 
              variant={project.stage === 'idea' ? 'warning' : project.stage === 'prototype' ? 'primary' : 'secondary'}
              className="capitalize"
            >
              {project.stage}
            </Badge>
          </div>
        </div>
        
        <div className="p-5">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{project.title}</h2>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
          
          <div className="flex items-center mb-4">
            <Users size={16} className="text-gray-500 mr-1" />
            <span className="text-sm text-gray-600">Team size: {project.teamSize}</span>
            <span className="mx-2 text-gray-400">•</span>
            <span className="text-sm text-gray-600">{project.industry}</span>
          </div>
          
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">Required skills:</p>
            <div className="flex flex-wrap gap-2">
              {project.requiredSkills.map(skill => (
                <SkillTag key={skill.id} skill={skill} />
              ))}
            </div>
          </div>
          
          <div className="flex items-center pt-3 border-t border-gray-100">
            <img 
              src={project.founder.avatar} 
              alt={project.founder.name} 
              className="h-8 w-8 rounded-full object-cover"
            />
            <div className="ml-2">
              <p className="text-sm font-medium text-gray-900">{project.founder.name}</p>
              <p className="text-xs text-gray-500">Founder</p>
            </div>
          </div>
        </div>
      </>
    );
  };
  
  const renderUserCard = (user: User) => {
    return (
      <>
        <div className="relative h-64 rounded-t-xl overflow-hidden">
          <img 
            src={user.avatar || 'https://images.pexels.com/photos/7102/notes-macbook-study-conference.jpg?auto=compress&cs=tinysrgb&w=600'} 
            alt={user.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute top-4 right-4">
            <Badge 
              variant={user.role === 'specialist' ? 'secondary' : 'primary'}
              className="capitalize"
            >
              {user.role}
            </Badge>
          </div>
        </div>
        
        <div className="p-5">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h2>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{user.bio}</p>
          
          <div className="flex items-center mb-4">
            <span className="text-sm text-gray-600">{user.experience} years experience</span>
            <span className="mx-2 text-gray-400">•</span>
            <span className="text-sm text-gray-600">{user.location}</span>
          </div>
          
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">Skills:</p>
            <div className="flex flex-wrap gap-2">
              {user.skills.map(skill => (
                <SkillTag key={skill.id} skill={skill} />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  };
  
  return (
    <motion.div
      style={{ 
        x, 
        rotate, 
        opacity,
        position: 'absolute',
        width: '100%',
        height: '100%'
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={{ x: exitX !== null ? exitX : 0 }}
      transition={{ duration: 0.5 }}
      className="touch-none"
    >
      <div className="w-full h-full">
        <Card variant="elevated" className="h-full overflow-hidden">
          {type === 'project' ? renderProjectCard(item as Project) : renderUserCard(item as User)}
        </Card>
        
        {/* Action indicators */}
        <div className="absolute inset-0 pointer-events-none flex justify-between items-center px-6">
          <motion.div 
            style={{ opacity: useTransform(x, [-100, 0], [1, 0]) }}
            className="bg-error-500/80 text-white font-bold py-2 px-4 rounded-lg"
          >
            SKIP
          </motion.div>
          
          <motion.div 
            style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
            className="bg-success-500/80 text-white font-bold py-2 px-4 rounded-lg"
          >
            MATCH
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default SwipeCard;