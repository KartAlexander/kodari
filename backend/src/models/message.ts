import { DataTypes, Model, Sequelize, UUIDV4 } from 'sequelize';
import sequelizeInstance from '../config/database.js'; // Adjusted import path

export interface MessageAttributes {
  id?: string;
  content: string;
  timestamp?: Date;
  conversationId?: string; // Foreign key for Conversation
  senderId?: string; // Foreign key for User (sender)
  createdAt?: Date;
  updatedAt?: Date;
}

class Message extends Model<MessageAttributes> implements MessageAttributes {
  public id!: string;
  public content!: string;
  public timestamp!: Date;
  public conversationId!: string;
  public senderId!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Message.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
    // conversationId will be defined by association
    // senderId will be defined by association
  },
  {
    sequelize: sequelizeInstance,
    modelName: 'Message',
    tableName: 'messages',
  }
);

export default Message;
