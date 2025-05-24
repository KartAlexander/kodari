import { Sequelize } from 'sequelize';
import User, { UserAttributes, UserCreationAttributes } from '../user.js'; // Adjust path as necessary
import bcrypt from 'bcryptjs';

// In-memory SQLite database for testing
let sequelize: Sequelize;

beforeAll(async () => {
  sequelize = new Sequelize('sqlite::memory:', {
    logging: false, // Disable logging for tests
  });
  // Initialize the User model with this Sequelize instance
  User.init(User.getAttributes(), { sequelize, modelName: 'User' }); 
  // Important: Re-apply hooks if they are not part of getAttributes or static properties
  // For the User model, hooks are defined within User.init, so this should be fine.
  // If hooks were added via User.addHook, they might need re-adding here for the test sequelize instance.

  await sequelize.sync({ force: true }); // Sync all models, { force: true } will drop tables first
});

afterAll(async () => {
  await sequelize.close();
});

describe('User Model', () => {
  beforeEach(async () => {
    // Clear all data before each test
    await User.destroy({ where: {}, truncate: true });
  });

  describe('Password Hashing', () => {
    it('should hash the password before saving a new user', async () => {
      const userData: UserCreationAttributes = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'specialist',
      };
      const user = await User.create(userData);
      expect(user.password).toBeDefined();
      expect(user.password).not.toBe('password123');
      const isMatch = await bcrypt.compare('password123', user.password);
      expect(isMatch).toBe(true);
    });

    it('should hash the password on update if password is changed', async () => {
        const user = await User.create({
            username: 'updateuser',
            email: 'update@example.com',
            password: 'oldPassword',
            role: 'startup_representative',
        });
        
        const oldHashedPassword = user.password;
        user.password = 'newPassword';
        await user.save();
        
        expect(user.password).not.toBe(oldHashedPassword);
        expect(user.password).not.toBe('newPassword');
        const isMatchNew = await bcrypt.compare('newPassword', user.password);
        expect(isMatchNew).toBe(true);
        const isMatchOld = await bcrypt.compare('oldPassword', user.password);
        expect(isMatchOld).toBe(false);
    });
  });

  describe('comparePassword Method', () => {
    it('should return true for a correct password', async () => {
      const user = await User.create({
        username: 'compareuser',
        email: 'compare@example.com',
        password: 'password123',
        role: 'admin',
      });
      const isMatch = await user.comparePassword('password123');
      expect(isMatch).toBe(true);
    });

    it('should return false for an incorrect password', async () => {
      const user = await User.create({
        username: 'comparefalseuser',
        email: 'comparefalse@example.com',
        password: 'password123',
        role: 'specialist',
      });
      const isMatch = await user.comparePassword('wrongpassword');
      expect(isMatch).toBe(false);
    });
  });

  describe('Model Validations', () => {
    it('should require username, email, password, and role', async () => {
      expect.assertions(1); // Expect one assertion (the catch block)
      try {
        await User.create({} as UserCreationAttributes); // Cast to avoid TS error, Sequelize will validate
      } catch (error: any) {
        // Check for Sequelize validation error messages
        // The exact error messages/type might vary based on Sequelize version
        const errorMessages = error.errors.map((e: any) => e.path);
        expect(errorMessages).toEqual(expect.arrayContaining(['username', 'email', 'password', 'role']));
      }
    });

    it('should require a valid email format', async () => {
      expect.assertions(1);
      try {
        await User.create({
          username: 'emailtest',
          email: 'invalidemail',
          password: 'password123',
          role: 'specialist',
        });
      } catch (error: any) {
        expect(error.errors[0].message).toContain('Validation isEmail on email failed');
      }
    });

    it('should enforce unique email', async () => {
      expect.assertions(1);
      await User.create({
        username: 'uniqueemail1',
        email: 'unique@example.com',
        password: 'password123',
        role: 'specialist',
      });
      try {
        await User.create({
          username: 'uniqueemail2',
          email: 'unique@example.com', // Same email
          password: 'password123',
          role: 'startup_representative',
        });
      } catch (error: any) {
        expect(error.errors[0].message).toContain('email must be unique');
      }
    });
    
    it('should enforce unique username', async () => {
      expect.assertions(1);
      await User.create({
        username: 'unique_username',
        email: 'user1@example.com',
        password: 'password123',
        role: 'specialist',
      });
      try {
        await User.create({
          username: 'unique_username', // Same username
          email: 'user2@example.com',
          password: 'password123',
          role: 'startup_representative',
        });
      } catch (error: any) {
        expect(error.errors[0].message).toContain('username must be unique');
      }
    });

    it('should enforce role to be one of the allowed values', async () => {
        expect.assertions(1);
        try {
            await User.create({
                username: 'roletest',
                email: 'role@example.com',
                password: 'password123',
                role: 'invalid_role' as any, // Force invalid role
            });
        } catch (error: any) {
            // The error message might be generic like "Validation ENUM on role failed"
            // or more specific depending on Sequelize and DB driver version.
            // For SQLite, it's often "Validation isIn on role failed" or similar.
            expect(error.errors[0].message).toMatch(/invalid input for enum|Validation (isIn|ENUM) on role failed/i);
        }
    });
  });
});
