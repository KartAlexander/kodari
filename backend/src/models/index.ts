import sequelizeInstance from '../config/database.js';
import User from './user.js';
import Project from './project.js';
import ProjectMember from './projectMember.js';
import Task from './task.js';
import Conversation from './conversation.js';
import Message from './message.js';
import Skill from './skill.js';
import UserSkill from './userSkill.js';
import { DataTypes } from 'sequelize';

// Initialize models (though they are already initialized by their individual files)
// This step is more about ensuring they are loaded and recognized by Sequelize instance if not already.
// However, given the current setup where models import sequelizeInstance and init themselves,
// this explicit initialization here might be redundant but doesn't harm.

const db = {
  sequelizeInstance,
  User,
  Project,
  ProjectMember,
  Task,
  Conversation,
  Message,
  Skill,
  UserSkill,
};

// Define associations

// User - Project (Owner)
User.hasMany(Project, { foreignKey: 'ownerId', as: 'ownedProjects' });
Project.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// User - Project (Members through ProjectMember)
User.belongsToMany(Project, {
  through: ProjectMember,
  as: 'memberProjects',
  foreignKey: 'userId', // Explicitly define foreign key for clarity
});
Project.belongsToMany(User, {
  through: ProjectMember,
  as: 'members',
  foreignKey: 'projectId', // Explicitly define foreign key for clarity
});
// Add foreign keys to ProjectMember model if not automatically created by Sequelize through belongsToMany
// ProjectMember.belongsTo(User, { foreignKey: 'userId' });
// ProjectMember.belongsTo(Project, { foreignKey: 'projectId' });
// User.hasMany(ProjectMember, { foreignKey: 'userId' });
// Project.hasMany(ProjectMember, { foreignKey: 'projectId' });


// Project - Task
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// User - Task (Assignee)
User.hasMany(Task, { foreignKey: 'assigneeId', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });

// Conversation - Message
Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });

// User - Message (Sender)
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

// User - Conversation (Participants through ConversationParticipant)
// Define the through model explicitly for ConversationParticipant
const ConversationParticipant = sequelizeInstance.define('ConversationParticipant', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    }
    // Sequelize will add conversationId and userId
});

Conversation.belongsToMany(User, {
  through: ConversationParticipant,
  as: 'participants',
  foreignKey: 'conversationId',
});
User.belongsToMany(Conversation, {
  through: ConversationParticipant,
  as: 'conversations',
  foreignKey: 'userId',
});

// User - Skill (through UserSkill)
User.belongsToMany(Skill, {
  through: UserSkill,
  as: 'skills',
  foreignKey: 'userId',
});
Skill.belongsToMany(User, {
  through: UserSkill,
  as: 'users',
  foreignKey: 'skillId',
});
// Add foreign keys to UserSkill model if not automatically created
// UserSkill.belongsTo(User, { foreignKey: 'userId' });
// UserSkill.belongsTo(Skill, { foreignKey: 'skillId' });
// User.hasMany(UserSkill, { foreignKey: 'userId' });
// Skill.hasMany(UserSkill, { foreignKey: 'skillId' });


export default db;
export {
  User,
  Project,
  ProjectMember,
  Task,
  Conversation,
  Message,
  Skill,
  UserSkill,
  ConversationParticipant, // Export the through model as well
};
