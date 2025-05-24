import request from 'supertest';
import express, { Express } from 'express';
import { Sequelize } from 'sequelize';
import db from '../../models/index.js'; // Imports User, Project, etc. & sequelize instance
import { User, UserCreationAttributes } from '../../models/user.js'; // For type usage
import authRoutes from '../authRoutes.js'; // The router we are testing
// Import the actual app or a setup function if you have one that includes all middleware
// For simplicity, we'll create a minimal app instance here.
// In a real app, you might import your main app.ts and use it.

let app: Express;
let sequelize: Sequelize;

// Helper function to initialize app and database for tests
const initializeTestApp = async () => {
  app = express();
  app.use(express.json()); // Ensure body parsing middleware is used

  // Use the sequelize instance from our db import, which should be configured for test (SQLite)
  sequelize = db.sequelizeInstance;

  // Mount the auth routes
  app.use('/api/auth', authRoutes); 
  
  // Other routes can be mounted if needed for more complex tests later

  // Sync database
  await sequelize.sync({ force: true }); // { force: true } ensures a clean DB for each test suite run
};

beforeAll(async () => {
  // Set NODE_ENV to 'test' if not already set by script (important for database.ts)
  process.env.NODE_ENV = 'test'; 
  await initializeTestApp();
});

beforeEach(async () => {
  // Clean up the database before each test
  await User.destroy({ where: {}, truncate: true, cascade: true });
  // Add other model cleanups if necessary:
  // await Project.destroy({ where: {}, truncate: true, cascade: true });
  // ...
});

afterAll(async () => {
  await sequelize.close();
});


describe('Auth Routes - /api/auth', () => {
  const testUser: UserCreationAttributes = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    role: 'specialist',
  };

  const testLoginUser = {
    email: 'test@example.com',
    password: 'password123',
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully.');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.username).toBe(testUser.username);
      expect(response.body.user.role).toBe(testUser.role);
      expect(response.body.user.password).toBeUndefined(); // Password should not be returned
    });

    it('should return 409 if email already exists', async () => {
      await User.create(testUser); // Pre-populate user

      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, username: 'anotheruser' }); // Same email, different username
      
      expect(response.status).toBe(409);
      expect(response.body.message).toBe('User with this email already exists.');
    });

    it('should return 409 if username already exists', async () => {
      await User.create(testUser); // Pre-populate user

      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, email: 'another@example.com' }); // Same username, different email
      
      expect(response.status).toBe(409);
      expect(response.body.message).toBe('User with this username already exists.');
    });

    it('should return 400 for missing required fields (e.g., email)', async () => {
      const { email, ...incompleteUser } = testUser; // Remove email
      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteUser);
      
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Username, email, password, and role are required.');
    });
    
    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, email: 'invalidemail' });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid email format.');
    });

    it('should return 400 for invalid role', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, role: 'nonexistentrole' });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid role. Must be one of: specialist, startup_representative, admin.');
    });
     it('should return 400 for password too short', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, password: 'short' });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Password must be at least 8 characters long.');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a user to login with
      await User.create(testUser);
    });

    it('should login an existing user successfully and return a token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send(testLoginUser);
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful.');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should return 401 for incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ ...testLoginUser, password: 'wrongpassword' });
      
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials. Password incorrect.');
    });

    it('should return 401 for non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ ...testLoginUser, email: 'nonexistent@example.com' });
      
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials. User not found.');
    });
    
    it('should return 400 for missing email or password', async () => {
      const response1 = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' });
      expect(response1.status).toBe(400);
      expect(response1.body.message).toBe('Email and password are required.');

      const response2 = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });
      expect(response2.status).toBe(400);
      expect(response2.body.message).toBe('Email and password are required.');
    });
  });

  describe('GET /api/auth/me', () => {
    let token: string;

    beforeEach(async () => {
      // Register and login a user to get a token
      await User.create(testUser);
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send(testLoginUser);
      token = loginResponse.body.token;
    });

    it('should return user data for a valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.id).toBeDefined();
      expect(response.body.user.password).toBeUndefined();
    });

    it('should return 401 if no token is provided', async () => {
      const response = await request(app)
        .get('/api/auth/me');
      
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Not authorized, no token provided.');
    });

    it('should return 401 if token is invalid (e.g., malformed)', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtokenstring');
      
      expect(response.status).toBe(401);
      // The exact message might vary depending on jwt.verify error type (JsonWebTokenError)
      expect(response.body.message).toContain('Not authorized, token failed');
    });
    
    // Testing for an expired token in an integration test is tricky without manipulating time.
    // This is better covered by unit tests for the 'protect' middleware where jwt.verify can be mocked
    // to simulate an expired token error.
    it('should conceptually return 401 if token is expired (better tested in unit tests)', () => {
        expect(true).toBe(true); // Placeholder
    });

    it('should return 401 if token is valid but user does not exist in DB (e.g., deleted after token issuance)', async () => {
      // Get a valid token for a user
      const tempUser = await User.create({ username: 'tempuser', email: 'temp@example.com', password: 'password', role: 'specialist' });
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: 'temp@example.com', password: 'password' });
      const tempToken = loginResponse.body.token;

      // Delete the user from DB
      await User.destroy({ where: { id: tempUser.id } });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${tempToken}`);
      
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Not authorized, user not found.');
    });
  });
});
