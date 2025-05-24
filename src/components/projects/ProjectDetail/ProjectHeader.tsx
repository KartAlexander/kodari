import React from 'react';
import { ArrowLeft, Users, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Project } from '../../../types';
import Badge from '../../ui/Badge';
import Button from '../../ui/Button';

interface ProjectHeaderProps {
  project: Project;
  onApply: () => void;
}

const stageColors = {
  idea: 'warning',
  prototype: 'primary',
  mvp: 'secondary',
  growth: 'success'
} as const;

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project, onApply }) => {
  const stageColor = stageColors[project.stage] as 'warning' | 'primary' | 'secondary' | 'success';
  
  // Format date
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(project.created);
  
  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <Link to="/projects" className="text-gray-500 hover:text-primary-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 ml-2">Project Details</h1>
      </div>
      
      <div className="relative rounded-xl overflow-hidden h-64 md:h-96">
        <img 
          src={project.image || 'https://images.pexels.com/photos/7102/notes-macbook-study-conference.jpg?auto=compress&cs=tinysrgb&w=600'} 
          alt={project.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <div className="p-6 text-white">
            <Badge 
              variant={stageColor}
              size="lg"
              className="capitalize mb-2"
            >
              {project.stage}
            </Badge>
            <h2 className="text-3xl font-bold">{project.title}</h2>
            
            <div className="mt-2 flex items-center text-sm text-white/80">
              <Users size={16} className="mr-1" />
              <span>Team size: {project.teamSize}</span>
              <span className="mx-2">•</span>
              <Calendar size={16} className="mr-1" />
              <span>{formattedDate}</span>
              <span className="mx-2">•</span>
              <span>{project.industry}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 gap-4">
        <div className="flex items-center">
          <img 
            src={project.founder.avatar} 
            alt={project.founder.name} 
            className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">Founded by {project.founder.name}</p>
            <p className="text-xs text-gray-500">{project.founder.location}</p>
          </div>
        </div>
        
        <Button onClick={onApply}>Apply to Join</Button>
      </div>
    </div>
  );
};

export default ProjectHeader;