import { DataTypes, Model, Sequelize, UUIDV4 } from 'sequelize';
import sequelizeInstance from '../config/database.js'; // Adjusted import path

export interface SkillAttributes {
  id?: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Skill extends Model<SkillAttributes> implements SkillAttributes {
  public id!: string;
  public name!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations will be defined in models/index.ts
  // For example:
  // public readonly users?: User[];
}

Skill.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeInstance,
    modelName: 'Skill',
    tableName: 'skills',
  }
);

export default Skill;
