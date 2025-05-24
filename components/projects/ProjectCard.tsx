import React from 'react';
import Link from 'next/link'; // Replaced react-router-dom Link
import { Users, Calendar } from 'lucide-react';
import { Project } from '../../types'; // Assuming Project type is defined here
import { Card, CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import SkillTag from '../shared/SkillTag'; // Assuming SkillTag is also migrated or Next.js compatible

interface ProjectCardProps {
  project: Project; // Ensure this Project type is compatible or adjust as needed
}

// Define color mapping for project stages, ensure Badge component supports these variants
const stageColors: Record<Project['stage'], 'warning' | 'primary' | 'secondary' | 'success' | 'default'> = {
  idea: 'warning',
  prototype: 'primary',
  mvp: 'secondary',
  growth: 'success',
  // Add a default or handle other stages if necessary
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  // Use a default color if project.stage is not in stageColors
  const badgeVariant = stageColors[project.stage] || 'default';
  
  const formattedDate = new Intl.DateTimeFormat('ru-RU', { // Using ru-RU for Russian date format
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(project.created)); // Ensure project.created is a valid date string or Date object
  
  return (
    <Link href={`/projects/${project.id}`} legacyBehavior>
      <a className="block h-full">
        <Card 
          variant="bordered" // Ensure Card component supports this variant
          className="h-full hover:shadow-xl transition-all duration-300 ease-in-out group animate-fadeInUp rounded-lg overflow-hidden" // Enhanced styling
        >
          <div className="relative">
            <img 
              src={project.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c7da?auto=compress&cs=tinysrgb&w=600&q=80'} // More generic placeholder
              alt={`Image for ${project.title}`} 
              className="h-52 w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute top-4 right-4">
              <Badge 
                variant={badgeVariant} // Use determined variant
                className="capitalize shadow-md"
              >
                {project.stage}
              </Badge>
            </div>
             {/* Optional: Overlay for project title on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <h3 className="text-white text-lg font-semibold break-words">
                {project.title}
              </h3>
            </div>
          </div>
          
          <CardContent className="p-5 space-y-3">
            {/* Title can be removed from here if shown on hover overlay, or kept as fallback */}
             <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 group-hover:text-primary-600 transition-colors truncate">
              {project.title}
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
              {project.description}
            </p>
            
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t pt-3 mt-3">
              <span className="flex items-center">
                <Users size={14} className="mr-1.5 text-primary-500" />
                Команда: {project.teamSize}
              </span>
              <span className="flex items-center">
                <Calendar size={14} className="mr-1.5 text-primary-500" />
                {formattedDate}
              </span>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Ключевые навыки:</p>
              <div className="flex flex-wrap gap-1.5">
                {project.requiredSkills?.slice(0, 3).map(skill => (
                  // Assuming skill is an object with id and name properties
                  <SkillTag key={skill.id || skill.name} skill={skill.name || skill} /> // Adjust based on skill structure
                ))}
                {(project.requiredSkills?.length || 0) > 3 && (
                  <Badge variant="outline" size="sm">+{project.requiredSkills.length - 3} еще</Badge>
                )}
                 {(project.requiredSkills?.length || 0) === 0 && (
                    <p className="text-xs text-gray-400">Не указаны</p>
                )}
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center">
              <img 
                src={project.founder.avatar || `https://avatar.vercel.sh/${project.founder.name}.png?size=32`} 
                alt={project.founder.name} 
                className="h-9 w-9 rounded-full object-cover shadow-sm"
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{project.founder.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{project.industry || 'Индустрия не указана'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </a>
    </Link>
  );
};

export default ProjectCard;