export interface User {
  id: string;
  name: string;
  role: 'specialist' | 'founder';
  avatar: string;
  bio: string;
  skills: Skill[];
  experience: number; // years
  location: string;
  email: string;
}

export interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'expert';
}

export interface Project {
  id: string;
  title: string;
  description: string;
  founder: User;
  stage: 'idea' | 'prototype' | 'mvp' | 'growth';
  requiredSkills: Skill[];
  teamSize: number;
  industry: string;
  image?: string;
  created: Date;
}

export interface Match {
  id: string;
  userId: string;
  projectId: string;
  status: 'pending' | 'matched' | 'rejected';
  timestamp: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}