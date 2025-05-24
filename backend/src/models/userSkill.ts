import { DataTypes, Model, Sequelize, UUIDV4 } from 'sequelize';
import sequelizeInstance from '../config/database.js'; // Adjusted import path

export interface UserSkillAttributes {
  id?: string;
  // Foreign keys UserId and SkillId will be added by associations
}

class UserSkill extends Model<UserSkillAttributes> implements UserSkillAttributes {
  public id!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserSkill.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
  },
  {
    sequelize: sequelizeInstance,
    modelName: 'UserSkill',
    tableName: 'user_skills',
  }
);

export default UserSkill;
