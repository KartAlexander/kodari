#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Функция для форматирования вывода
format_log() {
    while IFS= read -r line; do
        # Выделяем разные части лога разными цветами
        timestamp=$(echo "$line" | grep -o '\[[0-9T:.-]*\]')
        user_info=$(echo "$line" | grep -o '\[User: [0-9]*\]')
        role_info=$(echo "$line" | grep -o '\[Role: [a-z]*\]')
        request_info=$(echo "$line" | grep -o '\[[A-Z]* /api/[^]]*\]')
        ip_info=$(echo "$line" | grep -o '\[IP: [0-9.:]*\]')
        message=$(echo "$line" | sed -E 's/^\[[0-9T:.-]*\] \[User: [0-9]*\] \[Role: [a-z]*\] \[[A-Z]* \/api\/[^]]*\] \[IP: [0-9.:]*\] //')
        status_info=$(echo "$message" | grep -o '\[Status: [0-9]*\]')
        time_info=$(echo "$message" | grep -o '\[Response Time: [0-9]*ms\]')
        message=$(echo "$message" | sed -E 's/ \[Status: [0-9]*\] \[Response Time: [0-9]*ms\]$//')

        # Выводим отформатированный лог
        echo -e "${BLUE}$timestamp${NC} ${GREEN}$user_info${NC} ${YELLOW}$role_info${NC} ${RED}$request_info${NC} ${YELLOW}$ip_info${NC}"
        echo -e "Message: $message"
        echo -e "${GREEN}$status_info${NC} ${BLUE}$time_info${NC}"
        echo "----------------------------------------"
    done
}

# Проверяем наличие директории с логами
if [ ! -d "backend/logs" ]; then
    echo -e "${RED}Директория с логами не найдена${NC}"
    exit 1
fi

# Получаем текущую дату
today=$(date +%Y-%m-%d)
log_file="backend/logs/${today}.log"

# Проверяем существование файла логов
if [ ! -f "$log_file" ]; then
    echo -e "${YELLOW}Файл логов за сегодня еще не создан${NC}"
    echo -e "${BLUE}Ожидание новых логов...${NC}"
fi

# Следим за файлом логов в реальном времени
echo -e "${GREEN}Начинаем отслеживание логов...${NC}"
echo -e "${YELLOW}Нажмите Ctrl+C для выхода${NC}"
echo "----------------------------------------"

tail -f "$log_file" 2>/dev/null | format_log 