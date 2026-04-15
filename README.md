# Aydin — Discover Events Clearly

Веб-приложение для поиска и сохранения мероприятий. React + NestJS + Prisma + SQLite.


## Запуск локально

### Предварительные требования

Нужен Node.js (v18 или выше) и npm.

- macOS: brew install node
- Windows: скачать и установить с https://nodejs.org/ (LTS-версия), установщик добавит node и npm в PATH автоматически

Проверить установку:

    node --version
    npm --version


### 1. Установка и запуск бэкенда

Открыть терминал (на Windows — PowerShell или cmd).

macOS:

    cd ~/Documents/GitHub/aydin/aydin/backend
    npm install

Windows:

    cd C:\путь\до\проекта\aydin\aydin\backend
    npm install

Создание базы данных и таблиц:

    npx prisma migrate dev --name init

Загрузка тестовых данных:

    npx ts-node prisma/seed.ts

Запуск бэкенда:

    npm run start:dev

Бэкенд запустится на http://localhost:3000. Не закрывайте этот терминал.


### 2. Установка и запуск фронтенда

Открыть второй терминал.

macOS:

    cd ~/Documents/GitHub/aydin/aydin/frontend
    npm install
    npm run dev

Windows:

    cd C:\путь\до\проекта\aydin\aydin\frontend
    npm install
    npm run dev

Фронтенд запустится на http://localhost:5173. Откройте эту ссылку в браузере.


### 3. Изменение тестовых данных

Тестовые события хранятся в файле aydin/backend/mock_data.json. Каждое событие — это объект с тремя полями:
- text — текст поста с информацией о событии
- channel — название Telegram-канала (источник)
- url — прямая ссылка на пост в Telegram

Пример:

    {
      "text": "Konsert: Sevara Nazarxon. 01/07/2026, 20:00. Location: Berdax nomidagi teatr, Nukus.",
      "channel": "eventscommunity_uz",
      "url": "https://t.me/eventscommunity_uz/343"
    }

Формат поля text:
- Дата — в формате DD/MM/YYYY (например, 25/04/2026)
- Время — в формате HH:MM (например, 19:00)
- Место — после слова Location: (например, Location: IT Park, Nukus)

После редактирования файла перезагрузите данные в базу:

macOS:

    cd ~/Documents/GitHub/aydin/aydin/backend
    npx ts-node prisma/seed.ts

Windows:

    cd C:\путь\до\проекта\aydin\aydin\backend
    npx ts-node prisma/seed.ts

Скрипт автоматически удалит старые события и загрузит новые. Если бэкенд уже запущен — просто обновите страницу в браузере.


### Примечание для Windows

- Вместо ~/Documents/... используйте полный путь, например C:\Users\ИмяПользователя\Documents\GitHub\aydin\aydin\backend
- Если npx ts-node выдаёт ошибку, попробуйте: npx ts-node --esm prisma/seed.ts
- Если bcrypt не устанавливается, может потребоваться установить Build Tools: npm install -g windows-build-tools (из PowerShell с правами администратора)
