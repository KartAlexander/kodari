import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { logger } from './middleware/logger.js';
import { connectDB } from './config/database.js';
import db from './models/index.js'; // Import the db object from models
import authRoutes from './routes/authRoutes.js'; // Import auth routes
import projectRoutes from './routes/projectRoutes.js'; // Import project routes
import messagingRoutes from './routes/messagingRoutes.js'; // Import messaging routes

// Расширяем тип Request для поддержки user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

const app = express();
const port = Number(process.env.PORT) || 5000;
const host = '0.0.0.0'; // Слушаем все интерфейсы

// Настройки CORS
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(logger);

// Тестовый маршрут
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to Kodari API' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes); // Mount project routes
app.use('/api', messagingRoutes); // Mount messaging routes (e.g. /api/conversations)

// Обработка ошибок
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// Запуск сервера
const startServer = async () => {
  await connectDB(); // Initialize database connection

  // Sync Sequelize models
  try {
    // In development, you might use { alter: true } or { force: true }
    // await db.sequelizeInstance.sync({ alter: true });
    await db.sequelizeInstance.sync(); // Using sync() without options for now
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Unable to synchronize the database:', error);
    process.exit(1);
  }

  const server = app.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
    console.log(`Local: http://localhost:${port}`);
  });

  // Обработка ошибок сервера
  server.on('error', (error: Error & { code?: string }) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use`);
      process.exit(1);
    } else {
      console.error('Server error:', error);
      process.exit(1);
    }
  });
};

startServer();
