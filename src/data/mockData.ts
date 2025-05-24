import { Project, User, Match, Message } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    role: 'specialist',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300',
    bio: 'Full-stack developer with 5 years of experience in React and Node.js',
    skills: [
      { id: '1', name: 'React', level: 'expert' },
      { id: '2', name: 'Node.js', level: 'expert' },
      { id: '3', name: 'TypeScript', level: 'intermediate' }
    ],
    experience: 5,
    location: 'San Francisco, CA',
    email: 'alex@example.com'
  },
  {
    id: '2',
    name: 'Sara Miller',
    role: 'founder',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300',
    bio: 'Entrepreneur with a passion for solving problems in the education sector',
    skills: [
      { id: '4', name: 'Business Development', level: 'expert' },
      { id: '5', name: 'Marketing', level: 'intermediate' },
      { id: '6', name: 'Product Management', level: 'expert' }
    ],
    experience: 7,
    location: 'New York, NY',
    email: 'sara@example.com'
  },
  {
    id: '3',
    name: 'David Kim',
    role: 'specialist',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=300',
    bio: 'UI/UX designer focusing on creating beautiful and functional user experiences',
    skills: [
      { id: '7', name: 'UI Design', level: 'expert' },
      { id: '8', name: 'Figma', level: 'expert' },
      { id: '9', name: 'User Research', level: 'intermediate' }
    ],
    experience: 4,
    location: 'Seattle, WA',
    email: 'david@example.com'
  }
];

export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'EduTech Platform',
    description: 'A platform connecting students with tutors for personalized learning experiences',
    founder: mockUsers[1],
    stage: 'idea',
    requiredSkills: [
      { id: '1', name: 'React', level: 'expert' },
      { id: '7', name: 'UI Design', level: 'intermediate' },
      { id: '10', name: 'Python', level: 'intermediate' }
    ],
    teamSize: 3,
    industry: 'Education',
    image: 'https://images.pexels.com/photos/301926/pexels-photo-301926.jpeg?auto=compress&cs=tinysrgb&w=600',
    created: new Date('2023-01-15')
  },
  {
    id: '2',
    title: 'Health Tracker App',
    description: 'An app that helps users track their health metrics and provides personalized recommendations',
    founder: mockUsers[1],
    stage: 'prototype',
    requiredSkills: [
      { id: '1', name: 'React', level: 'expert' },
      { id: '11', name: 'React Native', level: 'intermediate' },
      { id: '12', name: 'Data Analysis', level: 'beginner' }
    ],
    teamSize: 4,
    industry: 'Health & Wellness',
    image: 'https://images.pexels.com/photos/40751/running-runner-long-distance-fitness-40751.jpeg?auto=compress&cs=tinysrgb&w=600',
    created: new Date('2023-02-10')
  },
  {
    id: '3',
    title: 'Smart Home IoT System',
    description: 'A system connecting various smart home devices for seamless automation and control',
    founder: mockUsers[1],
    stage: 'mvp',
    requiredSkills: [
      { id: '13', name: 'IoT', level: 'expert' },
      { id: '14', name: 'Embedded Systems', level: 'expert' },
      { id: '2', name: 'Node.js', level: 'intermediate' }
    ],
    teamSize: 5,
    industry: 'IoT & Smart Home',
    image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=600',
    created: new Date('2023-03-05')
  }
];

export const mockMatches: Match[] = [
  {
    id: '1',
    userId: '1',
    projectId: '1',
    status: 'matched',
    timestamp: new Date('2023-03-15')
  },
  {
    id: '2',
    userId: '3',
    projectId: '2',
    status: 'pending',
    timestamp: new Date('2023-03-20')
  }
];

export const mockMessages: Message[] = [
  {
    id: '1',
    senderId: '1',
    receiverId: '2',
    content: 'Hi Sara, I\'m interested in your EduTech Platform project!',
    timestamp: new Date('2023-03-16T09:30:00'),
    read: true
  },
  {
    id: '2',
    senderId: '2',
    receiverId: '1',
    content: 'Hi Alex! Thanks for reaching out. I\'d love to tell you more about it.',
    timestamp: new Date('2023-03-16T10:15:00'),
    read: true
  },
  {
    id: '3',
    senderId: '1',
    receiverId: '2',
    content: 'Great! When would be a good time to discuss the technical requirements?',
    timestamp: new Date('2023-03-16T10:45:00'),
    read: false
  }
];

// Current logged in user for demo purposes
export const currentUser: User = mockUsers[0];