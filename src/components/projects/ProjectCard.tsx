import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar } from 'lucide-react';
import { Project } from '../../types';
import { Card, CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import SkillTag from '../shared/SkillTag';

interface ProjectCardProps {
  project: Project;
}

const stageColors = {
  idea: 'warning',
  prototype: 'primary',
  mvp: 'secondary',
  growth: 'success'
} as const;

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const stageColor = stageColors[project.stage] as 'warning' | 'primary' | 'secondary' | 'success';
  
  // Format date
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(project.created);
  
  return (
    <Link to={`/projects/${project.id}`}>
      <Card 
        variant="bordered" 
        className="h-full hover:shadow-md transition-shadow duration-200 group animate-scale-in"
      >
        <div className="relative">
          <img 
            src={project.image || 'https://images.pexels.com/photos/7102/notes-macbook-study-conference.jpg?auto=compress&cs=tinysrgb&w=600'} 
            alt={project.title} 
            className="h-48 w-full object-cover rounded-t-xl group-hover:opacity-90 transition-opacity"
          />
          <div className="absolute top-3 right-3">
            <Badge 
              variant={stageColor}
              className="capitalize"
            >
              {project.stage}
            </Badge>
          </div>
        </div>
        
        <CardContent className="pt-4">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
            {project.title}
          </h3>
          
          <p className="mt-2 text-sm text-gray-500 line-clamp-2">
            {project.description}
          </p>
          
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <Users size={16} className="mr-1" />
            <span>Team size: {project.teamSize}</span>
            <span className="mx-2">•</span>
            <Calendar size={16} className="mr-1" />
            <span>{formattedDate}</span>
          </div>
          
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">Required skills:</p>
            <div className="flex flex-wrap gap-2">
              {project.requiredSkills.slice(0, 3).map(skill => (
                <SkillTag key={skill.id} skill={skill} />
              ))}
              {project.requiredSkills.length > 3 && (
                <Badge variant="default" size="sm">+{project.requiredSkills.length - 3} more</Badge>
              )}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center">
            <img 
              src={project.founder.avatar} 
              alt={project.founder.name} 
              className="h-8 w-8 rounded-full object-cover"
            />
            <div className="ml-2">
              <p className="text-sm font-medium text-gray-900">{project.founder.name}</p>
              <p className="text-xs text-gray-500">{project.industry}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProjectCard;