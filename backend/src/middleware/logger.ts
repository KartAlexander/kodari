import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

// Создаем директорию для логов, если она не существует
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Функция для форматирования сообщения лога
const formatLogMessage = (req: Request, action: string): string => {
  const timestamp = new Date().toISOString();
  const userId = req.user?.id || 'неавторизованный';
  const userRole = req.user?.role || 'неавторизованный';
  const method = req.method;
  const url = req.url;
  const ip = req.ip;

  return `[${timestamp}] [User: ${userId}] [Role: ${userRole}] [${method}] ${url} [IP: ${ip}] - ${action}`;
};

// Функция для записи лога в файл
const writeLog = (message: string): void => {
  const date = new Date().toISOString().split('T')[0];
  const logFile = path.join(logsDir, `${date}.log`);
  fs.appendFileSync(logFile, message + '\n');
};

// Middleware для логирования
export const logger = (req: Request, res: Response, next: NextFunction): void => {
  // Логируем начало запроса
  const startTime = Date.now();
  const logMessage = formatLogMessage(req, 'Запрос начат');
  writeLog(logMessage);

  // Перехватываем ответ
  const originalSend = res.send;
  res.send = function (body: any): Response {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Определяем действие на основе пути и метода
    let action = 'Запрос выполнен';
    if (req.path === '/api/auth/login' && req.method === 'POST') {
      action = 'Попытка входа';
    } else if (req.path === '/api/auth/register' && req.method === 'POST') {
      action = 'Регистрация нового пользователя';
    } else if (req.path.startsWith('/api/projects') && req.method === 'POST') {
      action = 'Создание проекта';
    } else if (req.path.startsWith('/api/projects') && req.method === 'PUT') {
      action = 'Обновление проекта';
    } else if (req.path.startsWith('/api/projects') && req.method === 'DELETE') {
      action = 'Удаление проекта';
    }

    const responseLog = formatLogMessage(req, `${action} [Статус: ${res.statusCode}] [Время: ${duration}ms]`);
    writeLog(responseLog);

    return originalSend.call(this, body);
  };

  next();
}; 