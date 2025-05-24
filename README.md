# Kodari

Проект Kodari - это веб-приложение для управления проектами и коммуникации между разработчиками.

## Технологии

- Frontend: React, TypeScript, Vite
- Backend: Node.js, Express, TypeScript
- База данных: PostgreSQL

## Установка и запуск

1. Клонируйте репозиторий:
```bash
git clone https://github.com/KartAlexander/kodari.git
cd kodari
```

2. Установите зависимости и запустите проект:
```bash
./start.sh
```

Приложение будет доступно по следующим адресам:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Структура проекта

```
kodari/
├── src/              # Frontend код
├── backend/          # Backend код
├── start.sh         # Скрипт запуска
└── package.json     # Зависимости проекта
```

## Разработка

- `npm run dev` - запуск в режиме разработки
- `npm run build` - сборка проекта
- `npm run lint` - проверка кода линтером
- `npm run test` - запуск тестов
