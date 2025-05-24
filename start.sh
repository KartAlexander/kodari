#!/bin/bash

# Установка переменных окружения для Node.js
export NODE_ENV=development
export NODE_OPTIONS="--experimental-specifier-resolution=node"

# Функция для логирования
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Функция для проверки статуса команды
check_status() {
    if [ $? -eq 0 ]; then
        log "✅ $1"
    else
        log "❌ $1"
        exit 1
    fi
}

# Функция для проверки доступности порта
wait_for_port() {
    local port=$1
    local max_attempts=30
    local attempt=1
    
    log "⏳ Ожидание доступности порта $port..."
    while [ $attempt -le $max_attempts ]; do
        if curl -s "http://localhost:$port" > /dev/null; then
            log "✅ Порт $port доступен"
            return 0
        fi
        sleep 1
        attempt=$((attempt + 1))
    done
    
    log "❌ Порт $port недоступен после $max_attempts попыток"
    return 1
}

# Функция для проверки занятости порта
is_port_in_use() {
    local port=$1
    if lsof -i :$port > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Проверка наличия Node.js и npm
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    log "❌ Node.js и npm не установлены"
    exit 1
fi

log "✅ Node.js и npm установлены"

# Проверка структуры проекта
if [ ! -d "src" ] || [ ! -d "backend" ]; then
    log "❌ Неверная структура проекта"
    exit 1
fi
log "✅ Структура проекта проверена"

# Очистка старых зависимостей
log "🧹 Очистка старых зависимостей..."
rm -rf node_modules package-lock.json
check_status "Очистка старых зависимостей"

# Установка зависимостей фронтенда
log "📦 Установка зависимостей фронтенда..."
npm install --legacy-peer-deps
check_status "Установка зависимостей фронтенда"

# Установка зависимостей бэкенда
log "📦 Установка зависимостей бэкенда..."
cd backend
npm install --legacy-peer-deps
check_status "Установка зависимостей бэкенда"

# Создание директории для логов, если она не существует
mkdir -p logs

# Запуск линтера
log "🔍 Запуск линтера..."
npx eslint "src/**/*.{ts,tsx}" "backend/src/**/*.ts"
check_status "Проверка линтером"

# Запуск TypeScript
log "📝 Проверка типов TypeScript..."
npx tsc --noEmit
check_status "Проверка типов"

# Функция для освобождения порта
free_port() {
    local port=$1
    if is_port_in_use $port; then
        log "🔄 Освобождаю порт $port..."
        lsof -ti :$port | xargs kill -9
        sleep 2
    fi
}

# Проверка и освобождение портов
free_port 3000
free_port 5000

# Проверка, что порты свободны
if is_port_in_use 3000 || is_port_in_use 5000; then
    log "❌ Не удалось освободить порты"
    exit 1
fi

# Запуск бэкенда
log "🚀 Запуск бэкенда..."
cd backend
npm run build
npm run dev &
BACKEND_PID=$!
cd ..
check_status "Запуск бэкенда"

# Ожидание запуска бэкенда
wait_for_port 5000
if [ $? -ne 0 ]; then
    log "❌ Бэкенд не запустился"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Запуск фронтенда
log "🎨 Запуск фронтенда..."
cd ..
npm run dev &
FRONTEND_PID=$!
check_status "Запуск фронтенда"

# Ожидание запуска фронтенда
wait_for_port 3000
if [ $? -ne 0 ]; then
    log "❌ Фронтенд не запустился"
    kill $FRONTEND_PID 2>/dev/null || true
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

log "✅ Приложение успешно запущено!"
log "🌐 Фронтенд доступен по адресу: http://localhost:3000"
log "🌐 Бэкенд доступен по адресу: http://localhost:5000"

# Обработка сигналов завершения
trap 'kill $FRONTEND_PID $BACKEND_PID 2>/dev/null || true; exit' INT TERM

# Ожидание завершения
wait 