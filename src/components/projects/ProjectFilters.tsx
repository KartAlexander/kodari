import React, { useState } from 'react';
import Button from '../ui/Button';
import { Filter, X } from 'lucide-react';

interface ProjectFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

interface FilterState {
  stage: string[];
  skills: string[];
  teamSize: string;
  industry: string;
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({ onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    stage: [],
    skills: [],
    teamSize: '',
    industry: ''
  });
  
  const stages = ['idea', 'prototype', 'mvp', 'growth'];
  const skills = ['React', 'Node.js', 'TypeScript', 'UI Design', 'Python', 'React Native', 'Data Analysis', 'IoT', 'Embedded Systems'];
  const teamSizes = ['1-3', '4-10', '11-20', '20+'];
  const industries = ['Education', 'Health & Wellness', 'IoT & Smart Home', 'Fintech', 'E-commerce', 'SaaS'];

  const handleStageToggle = (stage: string) => {
    setFilters(prevFilters => {
      const newStages = prevFilters.stage.includes(stage)
        ? prevFilters.stage.filter(s => s !== stage)
        : [...prevFilters.stage, stage];
      
      const newFilters = { ...prevFilters, stage: newStages };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const handleSkillToggle = (skill: string) => {
    setFilters(prevFilters => {
      const newSkills = prevFilters.skills.includes(skill)
        ? prevFilters.skills.filter(s => s !== skill)
        : [...prevFilters.skills, skill];
      
      const newFilters = { ...prevFilters, skills: newSkills };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const handleTeamSizeChange = (size: string) => {
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters, teamSize: size };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const handleIndustryChange = (industry: string) => {
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters, industry: industry };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const clearFilters = () => {
    const resetFilters = {
      stage: [],
      skills: [],
      teamSize: '',
      industry: ''
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const hasActiveFilters = filters.stage.length > 0 || filters.skills.length > 0 || 
                           filters.teamSize !== '' || filters.industry !== '';

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <Button 
          variant="outline" 
          leftIcon={<Filter size={16} />}
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-700"
        >
          Filters {hasActiveFilters && `(${filters.stage.length + filters.skills.length + (filters.teamSize ? 1 : 0) + (filters.industry ? 1 : 0)})`}
        </Button>
        
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            leftIcon={<X size={14} />}
            onClick={clearFilters}
            className="text-gray-500"
          >
            Clear all
          </Button>
        )}
      </div>
      
      {isOpen && (
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-6 animate-slide-down">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stage Filter */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Project Stage</h3>
              <div className="space-y-2">
                {stages.map(stage => (
                  <label key={stage} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.stage.includes(stage)}
                      onChange={() => handleStageToggle(stage)}
                      className="rounded text-primary-500 focus:ring-primary-500 h-4 w-4"
                    />
                    <span className="ml-2 text-gray-700 capitalize">{stage}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Skills Filter */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Skills Required</h3>
              <div className="space-y-2">
                {skills.slice(0, 6).map(skill => (
                  <label key={skill} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.skills.includes(skill)}
                      onChange={() => handleSkillToggle(skill)}
                      className="rounded text-primary-500 focus:ring-primary-500 h-4 w-4"
                    />
                    <span className="ml-2 text-gray-700">{skill}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Team Size Filter */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Team Size</h3>
              <div className="space-y-2">
                {teamSizes.map(size => (
                  <label key={size} className="flex items-center">
                    <input
                      type="radio"
                      name="teamSize"
                      value={size}
                      checked={filters.teamSize === size}
                      onChange={() => handleTeamSizeChange(size)}
                      className="rounded-full text-primary-500 focus:ring-primary-500 h-4 w-4"
                    />
                    <span className="ml-2 text-gray-700">{size}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Industry Filter */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Industry</h3>
              <div className="space-y-2">
                {industries.map(industry => (
                  <label key={industry} className="flex items-center">
                    <input
                      type="radio"
                      name="industry"
                      value={industry}
                      checked={filters.industry === industry}
                      onChange={() => handleIndustryChange(industry)}
                      className="rounded-full text-primary-500 focus:ring-primary-500 h-4 w-4"
                    />
                    <span className="ml-2 text-gray-700">{industry}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectFilters;