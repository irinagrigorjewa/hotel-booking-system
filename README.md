# Hotel Booking System

Каркас веб-приложения для поиска отелей и бронирования номеров. На текущем этапе Compose поднимает frontend, backend и PostgreSQL; продуктовые сценарии ещё не реализованы.

## Стек

- Frontend: React 19, TypeScript, Vite, React Router
- Backend: FastAPI, SQLAlchemy 2, Alembic, PostgreSQL
- Инфраструктура: Docker Compose, GitHub Actions

## Структура репозитория

```text
frontend/                # SPA на React + Vite
backend/                 # FastAPI-приложение, Alembic и тесты
uploads/                 # runtime-данные загрузок (не коммитятся)
docker-compose.yml       # frontend, backend и PostgreSQL
.env.example             # шаблон переменных окружения
.github/workflows/ci.yml # quality gates GitHub Actions
docs/                    # техническая спецификация и пользовательские гайды
```

## Требования

- Docker Desktop с Docker Compose v2
- Свободные порты `5173` и `8000` либо изменённые `FRONTEND_PORT` и `BACKEND_PORT`

Для проверок вне Docker дополнительно потребуются Node.js 22+ и Python 3.12+.

## Быстрый старт

1. Создайте локальный файл окружения:

   ```bash
   cp .env.example .env
   ```

2. Замените демонстрационные значения `POSTGRES_PASSWORD` и `SECRET_KEY` в `.env`.
3. Соберите и запустите стек:

   ```bash
   docker compose up --build
   ```

Команда создаёт именованные volumes для PostgreSQL и runtime-файлов в `UPLOAD_DIR`. Остановить запущенный стек можно сочетанием `Ctrl+C`.

## Доступные сервисы

| Сервис | URL |
| --- | --- |
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000/api/v1 |
| Swagger UI | http://localhost:8000/docs |
| Healthcheck backend | http://localhost:8000/api/v1/health |

Порты в URL меняются вместе со значениями `FRONTEND_PORT` и `BACKEND_PORT` в `.env`.

## Переменные окружения

| Переменная | Значение по умолчанию | Назначение |
| --- | --- | --- |
| `POSTGRES_USER` | `hotel_booking` | Пользователь PostgreSQL |
| `POSTGRES_PASSWORD` | `change-me` | Пароль PostgreSQL; замените для локального окружения |
| `POSTGRES_DB` | `hotel_booking` | Имя базы данных |
| `DATABASE_URL` | `postgresql+psycopg://hotel_booking:change-me@postgres:5432/hotel_booking` | URL подключения к PostgreSQL; в Compose backend использует имя сервиса `db` |
| `SECRET_KEY` | `change-me-in-production` | Секрет для криптографических операций; не используйте демонстрационное значение |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `15` | Срок действия access token в минутах |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Срок действия refresh token в днях |
| `CORS_ORIGINS` | `http://localhost:5173` | Разрешённые origins frontend |
| `UPLOAD_DIR` | `/app/uploads` | Каталог runtime-файлов backend |
| `MAX_UPLOAD_SIZE_MB` | `5` | Максимальный размер загружаемого файла в МБ |
| `BACKEND_PORT` | `8000` | Порт backend на хосте |
| `FRONTEND_PORT` | `5173` | Порт frontend на хосте |

Не коммитьте `.env` и не используйте значения из `.env.example` в production.

## Проверки и CI

Локальные проверки без запуска Compose:

```bash
# frontend
cd frontend
npm ci
npx tsc --noEmit
npm run test:run

# backend
cd ../backend
python -m pip install -r requirements.txt
ruff check .
pytest -q
```

GitHub Actions запускается для push и pull request в `develop`, `master` и `main`. Он проверяет TypeScript, backend lint, frontend- и backend-тесты, затем production build и сборку Docker-образов.

## Текущие ограничения каркаса

Это документация этапа каркаса. В нём пока отсутствуют:

- seed-данные и тестовые учётные записи;
- аутентификация и пользовательские/административные сценарии;
- загрузка и управление фотографиями;
- локализация интерфейса (i18n).

Эти возможности будут добавляться на следующих этапах. Не используйте Swagger или запущенный каркас как подтверждение доступности будущих API-сценариев.
