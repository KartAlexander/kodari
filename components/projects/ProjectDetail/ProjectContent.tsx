import React from 'react';
import { Project } from '../../../types';
import SkillTag from '../../shared/SkillTag';

interface ProjectContentProps {
  project: Project;
}

const ProjectContent: React.FC<ProjectContentProps> = ({ project }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">About the Project</h3>
          <p className="text-gray-700 mb-6 leading-relaxed">
            {project.description}
            {/* Extended description for demo purposes */}
            {` This innovative project aims to revolutionize the ${project.industry.toLowerCase()} sector by leveraging cutting-edge technology and user-centered design. We're looking for passionate team members who want to make a real impact and help bring this vision to life.`}
          </p>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Project Vision</h3>
          <p className="text-gray-700 mb-6 leading-relaxed">
            {`Our goal is to create a solution that addresses key challenges in the ${project.industry.toLowerCase()} space. We believe that with the right team, we can build something truly transformative that improves people's lives and creates sustainable value.`}
          </p>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Current Progress</h3>
          <p className="text-gray-700 mb-6 leading-relaxed">
            {project.stage === 'idea' && "We're in the ideation phase, refining our concept and market research. We're looking for team members who can help us validate our assumptions and begin prototyping."}
            {project.stage === 'prototype' && "We've developed initial prototypes and are validating our concept with potential users. We're looking for team members who can help us iterate and improve our solution."}
            {project.stage === 'mvp' && "We've built a minimum viable product and are gathering user feedback. We're looking for team members who can help us refine our product and prepare for growth."}
            {project.stage === 'growth' && "Our product is in the market and gaining traction. We're looking for team members who can help us scale and improve our offering."}
          </p>
        </div>
      </div>
      
      <div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {project.requiredSkills.map(skill => (
              <SkillTag key={skill.id} skill={skill} />
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Industry</p>
              <p className="text-base text-gray-900">{project.industry}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Team Size</p>
              <p className="text-base text-gray-900">{project.teamSize} members</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Stage</p>
              <p className="text-base text-gray-900 capitalize">{project.stage}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Started</p>
              <p className="text-base text-gray-900">
                {new Intl.DateTimeFormat('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                }).format(project.created)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectContent;