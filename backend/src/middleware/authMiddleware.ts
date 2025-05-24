import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js'; // Adjust if your User model export is different
import { JWT_SECRET } from '../config/jwt.js';

// Extend Express Request type to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: InstanceType<typeof User>; // Or a more specific user type if you prefer
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      if (!JWT_SECRET) {
        console.error('JWT_SECRET is not defined. Cannot verify token.');
        return res.status(500).json({ message: 'Server configuration error: JWT secret missing.' });
      }
      
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string; iat: number; exp: number }; // Define type for decoded payload

      // Get user from the token
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }, // Exclude password from fetched user data
      });

      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found.' });
      }

      req.user = user; // Attach user to request object
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: 'Not authorized, token failed (JsonWebTokenError).' });
      } else if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: 'Not authorized, token expired (TokenExpiredError).' });
      }
      return res.status(401).json({ message: 'Not authorized, token failed.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Not authorized, user role not found.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role '${req.user.role}' is not authorized to access this route.` });
    }
    next();
  };
};
