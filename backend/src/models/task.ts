import { DataTypes, Model, Sequelize, UUIDV4 } from 'sequelize';
import sequelizeInstance from '../config/database.js'; // Adjusted import path

export interface TaskAttributes {
  id?: string;
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done' | 'blocked';
  dueDate?: Date;
  projectId?: string; // Foreign key for Project
  assigneeId?: string; // Foreign key for User
  createdAt?: Date;
  updatedAt?: Date;
}

class Task extends Model<TaskAttributes> implements TaskAttributes {
  public id!: string;
  public title!: string;
  public description!: string;
  public status!: 'todo' | 'in_progress' | 'done' | 'blocked';
  public dueDate!: Date;
  public projectId!: string;
  public assigneeId!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Task.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM('todo', 'in_progress', 'done', 'blocked'),
      defaultValue: 'todo',
    },
    dueDate: {
      type: DataTypes.DATE,
    },
    // projectId will be defined by association
    // assigneeId will be defined by association
  },
  {
    sequelize: sequelizeInstance,
    modelName: 'Task',
    tableName: 'tasks',
  }
);

export default Task;
