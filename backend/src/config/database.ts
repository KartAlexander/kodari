import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

let sequelize: Sequelize;

if (process.env.NODE_ENV === 'test') {
  sequelize = new Sequelize('sqlite::memory:', {
    logging: false, // Disable logging for tests or set to console.log for debugging
    // dialectOptions: { mode: Sequelize. 메모리 }, // This is not standard, SQLite in-memory is default with 'sqlite::memory:'
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'kodari',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'password',
    {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      dialect: 'postgres',
      logging: false, // Set to true to see SQL queries in dev/prod
    }
  );
}

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    if (process.env.NODE_ENV === 'test') {
      console.log('SQLite (in-memory) connection has been established successfully for tests.');
    } else {
      console.log('PostgreSQL connection has been established successfully.');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); // Exit process with failure
  }
};

export default sequelize;
