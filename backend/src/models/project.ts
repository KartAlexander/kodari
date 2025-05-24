import { DataTypes, Model, Sequelize, UUIDV4 } from 'sequelize';
import sequelizeInstance from '../config/database.js'; // Adjusted import path

export interface ProjectAttributes {
  id?: string;
  title: string;
  description: string;
  status?: 'planning' | 'active' | 'completed' | 'on_hold';
  ownerId?: string; // Foreign key for User
  createdAt?: Date;
  updatedAt?: Date;
}

class Project extends Model<ProjectAttributes> implements ProjectAttributes {
  public id!: string;
  public title!: string;
  public description!: string;
  public status!: 'planning' | 'active' | 'completed' | 'on_hold';
  public ownerId!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Project.init(
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
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('planning', 'active', 'completed', 'on_hold'),
      defaultValue: 'planning',
    },
    // ownerId will be defined by association in models/index.ts
  },
  {
    sequelize: sequelizeInstance,
    modelName: 'Project',
    tableName: 'projects',
  }
);

export default Project;
