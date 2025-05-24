import React from 'react';
import { Link } from 'react-router-dom';
// import { Users, Calendar } from 'lucide-react'; // Icons can be added back if needed
import { Project } from '../../../services/projectService'; // Updated import
import { Card, CardContent } from '../ui/Card'; // Assuming these are ShadCN/UI components or similar
// import Badge from '../ui/Badge'; // Assuming this is a custom or ShadCN component
// import SkillTag from '../shared/SkillTag'; // Assuming this is a custom component

interface ProjectCardProps {
  project: Project; // Use the Project type from the service
}

// Example: Mapping project status to badge colors (if Badge component is used)
// const statusColors = {
//   planning: 'gray',
//   active: 'blue',
//   completed: 'green',
//   on_hold: 'yellow',
// } as const;

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  // const statusColor = statusColors[project.status] || 'gray';
  
  const formattedDate = project.createdAt 
    ? new Intl.DateTimeFormat('ru-RU').format(new Date(project.createdAt))
    : 'N/A';
  
  return (
    <Link to={`/projects/${project.id}`} className="block group">
      <Card 
        // variant="bordered" // Assuming Card component has variants
        className="h-full hover:shadow-lg transition-shadow duration-200 animate-scale-in"
      >
        {/* Placeholder for image if you add it to Project model later */}
        {/* <div className="relative">
          <img 
            src={'https://images.pexels.com/photos/7102/notes-macbook-study-conference.jpg?auto=compress&cs=tinysrgb&w=600'} 
            alt={project.title} 
            className="h-48 w-full object-cover rounded-t-xl group-hover:opacity-90 transition-opacity"
          />
        </div> */}
        
        <CardContent className="p-4"> {/* Adjusted padding */}
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
            {project.title}
          </h3>
          
          <p className="mt-1 text-sm text-gray-600 line-clamp-3"> {/* line-clamp for description */}
            {project.description}
          </p>
          
          <div className="mt-3 text-xs text-gray-500">
            {/* <Users size={14} className="mr-1 inline-block" /> */}
            {/* <span>Team size: N/A</span> */}
            {/* <span className="mx-2">•</span> */}
            {/* <Calendar size={14} className="mr-1 inline-block" /> */}
            <span>Создан: {formattedDate}</span>
          </div>

          <div className="mt-1 text-xs text-gray-500">
            Статус: <span className="font-medium text-gray-700">{project.status}</span>
            {/* Example for status badge:
            <Badge variant={statusColor} className="capitalize ml-2">{project.status}</Badge> 
            */}
          </div>
          
          {/* Skills section - currently commented out as skills are not in Project model from service */}
          {/* <div className="mt-3">
            <p className="text-xs text-gray-500 mb-1">Required skills:</p>
            <div className="flex flex-wrap gap-1">
              {project.requiredSkills?.slice(0, 3).map(skill => ( // Assuming requiredSkills might be fetched differently
                <SkillTag key={skill.id} skill={skill} />
              ))}
              {project.requiredSkills?.length > 3 && (
                <Badge variant="default" size="sm">+{project.requiredSkills.length - 3} more</Badge>
              )}
            </div>
          </div> */}
          
          {project.owner && (
            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center">
              {/* Placeholder for owner avatar if available */}
              {/* <img 
                src={project.owner.avatar || 'default-avatar.png'} 
                alt={project.owner.username} 
                className="h-8 w-8 rounded-full object-cover"
              /> */}
              <div className="ml-0"> {/* Removed ml-2 if no avatar */}
                <p className="text-sm font-medium text-gray-800">{project.owner.username}</p>
                {/* <p className="text-xs text-gray-500">{project.industry}</p> */}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProjectCard;