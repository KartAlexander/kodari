import express from 'express';
import cors from 'cors';
import { logger } from './middleware/logger.js';
// ... остальные импорты

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger); // Добавляем middleware для логирования

// ... остальной код 

export default app; 