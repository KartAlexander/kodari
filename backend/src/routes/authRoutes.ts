import express, { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserCreationAttributes } from '../models/index.js'; // Assuming User model exports UserCreationAttributes
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt.js';
import { protect } from '../middleware/authMiddleware.js'; // Import the protect middleware

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const { username, email, password, role } = req.body as UserCreationAttributes;

  // Basic validation
  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: 'Username, email, password, and role are required.' });
  }

  // Validate email format (simple regex)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }
  
  // Validate role
  const allowedRoles = ['specialist', 'startup_representative', 'admin'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role. Must be one of: specialist, startup_representative, admin.' });
  }

  // Optional: Password strength (example: min 8 characters)
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(409).json({ message: 'User with this username already exists.' });
    }

    // Create new user (password will be hashed by the model's hook)
    const newUser = await User.create({ username, email, password, role });

    // Exclude password from the response
    const { password: _, ...userWithoutPassword } = newUser.toJSON();

    res.status(201).json({ message: 'User registered successfully.', user: userWithoutPassword });
  } catch (error) {
    console.error('Registration error:', error);
    // Check for Sequelize validation errors
    if (error instanceof Error && error.name === 'SequelizeValidationError') {
        const messages = (error as any).errors.map((e: any) => e.message);
        return res.status(400).json({ message: 'Validation error', errors: messages });
    }
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Password incorrect.' });
    }

    // Generate JWT token
    const payload = {
      id: user.id,
      role: user.role,
    };
    const token = jwt.sign(payload, JWT_SECRET!, { expiresIn: JWT_EXPIRES_IN || '1d' });

    // Exclude password from the response
    const { password: _, ...userWithoutPassword } = user.toJSON();

    res.json({
      message: 'Login successful.',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// GET /api/auth/me - Protected route to get current user details
router.get('/me', protect, (req: Request, res: Response) => {
  // req.user is populated by the 'protect' middleware
  if (req.user) {
    res.json({
      message: 'Current user data retrieved successfully.',
      user: req.user, // Send back the user data (password should already be excluded by 'protect' middleware)
    });
  } else {
    // This case should ideally be caught by 'protect' middleware,
    // but as a fallback:
    res.status(401).json({ message: 'Not authorized, user data not available.' });
  }
});

export default router;
