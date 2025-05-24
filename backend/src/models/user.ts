import { DataTypes, Model, Sequelize, UUIDV4 } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelizeInstance from '../config/database.js'; // Adjusted import path

export interface UserAttributes {
  id?: string;
  username: string;
  email: string;
  password?: string; // Password is not sent back to client
  role: 'specialist' | 'startup_representative' | 'admin';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes extends UserAttributes {
  password?: string; // Make password optional for creation as it will be hashed
}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public username!: string;
  public email!: string;
  public password!: string;
  public role!: 'specialist' | 'startup_representative' | 'admin';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance method to compare password
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('specialist', 'startup_representative', 'admin'),
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeInstance,
    modelName: 'User',
    tableName: 'users',
    hooks: {
      async beforeCreate(user: User) {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      // Potentially add a beforeUpdate hook if password changes are allowed and need hashing
      async beforeUpdate(user: User) {
        if (user.changed('password') && user.password) {
             const salt = await bcrypt.genSalt(10);
             user.password = await bcrypt.hash(user.password, salt);
        }
      }
    },
  }
);

export default User;
