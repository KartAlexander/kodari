import React from 'react';
import { Skill } from '../../types';
import Badge from '../ui/Badge';

interface SkillTagProps {
  skill: Skill;
  className?: string;
}

const SkillTag: React.FC<SkillTagProps> = ({ skill, className }) => {
  const getVariantByLevel = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'default';
      case 'intermediate':
        return 'primary';
      case 'expert':
        return 'secondary';
      default:
        return 'default';
    }
  };
  
  return (
    <Badge 
      variant={getVariantByLevel(skill.level)}
      size="sm"
      className={className}
    >
      {skill.name}
    </Badge>
  );
};

export default SkillTag;