import { DataTypes, Model, Sequelize, UUIDV4 } from 'sequelize';
import sequelizeInstance from '../config/database.js'; // Adjusted import path

export interface ProjectMemberAttributes {
  id?: string;
  roleInProject: string; // e.g., 'Lead Developer', 'Designer', 'Client'
  // Foreign keys UserId and ProjectId will be added by associations
}

class ProjectMember extends Model<ProjectMemberAttributes> implements ProjectMemberAttributes {
  public id!: string;
  public roleInProject!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ProjectMember.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    roleInProject: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "e.g., 'Lead Developer', 'Designer', 'Client'",
    },
  },
  {
    sequelize: sequelizeInstance,
    modelName: 'ProjectMember',
    tableName: 'project_members',
  }
);

export default ProjectMember;
