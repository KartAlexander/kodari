import dotenv from 'dotenv';

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined. Please set it in your .env file.");
  process.exit(1);
}

if (!JWT_EXPIRES_IN) {
  console.warn("WARNING: JWT_EXPIRES_IN is not defined. Using default value '1d'. Please set it in your .env file for production.");
}
