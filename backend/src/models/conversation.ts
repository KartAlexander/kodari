import { DataTypes, Model, Sequelize, UUIDV4 } from 'sequelize';
import sequelizeInstance from '../config/database.js'; // Adjusted import path

export interface ConversationAttributes {
  id?: string;
  // Potentially add a name for group conversations, etc.
  createdAt?: Date;
  updatedAt?: Date;
}

class Conversation extends Model<ConversationAttributes> implements ConversationAttributes {
  public id!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations will be defined in models/index.ts
  // For example:
  // public readonly messages?: Message[];
  // public readonly participants?: User[];
}

Conversation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
  },
  {
    sequelize: sequelizeInstance,
    modelName: 'Conversation',
    tableName: 'conversations',
  }
);

export default Conversation;
