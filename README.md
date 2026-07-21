# Hotel Booking System

Веб-приложение для поиска отелей и бронирования номеров (MVP): каталог, карта, отзывы, избранное, бронирования, админ-панель, локализация RU/EN.

## Стек

- Frontend: React 19, TypeScript, Vite, MUI, TanStack Query, i18next, react-leaflet
- Backend: FastAPI, SQLAlchemy 2, Alembic, PostgreSQL
- Инфраструктура: Docker Compose, GitHub Actions

## Структура репозитория

```text
frontend/                # SPA на React + Vite
backend/                 # FastAPI-приложение, Alembic, seed и тесты
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

При старте backend выполняет миграции Alembic и **идемпотентный seed** (пропускается, если уже есть `admin@example.com`). Остановить стек можно сочетанием `Ctrl+C`.

## Seed-учётки и демо-данные

| Роль | Email | Пароль |
| --- | --- | --- |
| ADMIN | `admin@example.com` | `Admin123!` |
| CLIENT | `client@example.com` | `Client123!` |

Seed также создаёт ≥ 2 отеля с координатами, типы номеров, ≥ 3 номера, cover-фото и ≥ 1 отзыв.

Повторный запуск seed безопасен: данные не дублируются.

Если БД уже засеяна старыми email (`@hotel.local`), обновить учётки или пересоздать volume:

```bash
# Вариант A — обновить email на месте (данные сохраняются)
docker compose exec db psql -U "${POSTGRES_USER:-hotel}" -d "${POSTGRES_DB:-hotel}" -c \
  "UPDATE users SET email = 'admin@example.com' WHERE email = 'admin@hotel.local';
   UPDATE users SET email = 'client@example.com' WHERE email = 'client@hotel.local';"

# Вариант B — полный reseed (сброс volume + seed при старте backend)
docker compose down -v && docker compose up --build
```

## Доступные сервисы

| Сервис | URL |
| --- | --- |
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000/api/v1 |
| Swagger UI | http://localhost:8000/docs |
| Healthcheck backend | http://localhost:8000/api/v1/health |

Порты в URL меняются вместе со значениями `FRONTEND_PORT` и `BACKEND_PORT` в `.env`.

## Основные маршруты UI

| Path | Назначение |
| --- | --- |
| `/`, `/hotels`, `/hotels/map`, `/hotels/:id` | Каталог и карта |
| `/bookings/new`, `/favorites`, `/profile` | Клиентская зона (после входа) |
| `/admin`, `/admin/users`, `/admin/hotels`, `/admin/room-types`, `/admin/rooms`, `/admin/bookings`, `/admin/reviews` | Админ-панель (роль ADMIN) |
| `/login`, `/register` | Вход и регистрация |

Переключатель языка **RU | EN** находится в шапке; выбор сохраняется в `localStorage` (`i18n_lang`).

## Загрузка фото

Админ загружает JPEG/PNG/WebP на экранах `/admin/hotels` и `/admin/rooms` (лимит размера — `MAX_UPLOAD_SIZE_MB`, не более 10 фото на сущность). Файлы сохраняются в volume `uploads` и отдаются по URL `/media/...`.

## Переменные окружения

| Переменная | Значение по умолчанию | Назначение |
| --- | --- | --- |
| `POSTGRES_USER` | `hotel_booking` | Пользователь PostgreSQL |
| `POSTGRES_PASSWORD` | `change-me` | Пароль PostgreSQL; замените для локального окружения |
| `POSTGRES_DB` | `hotel_booking` | Имя базы данных |
| `DATABASE_URL` | `postgresql+psycopg://hotel_booking:change-me@postgres:5432/hotel_booking` | URL подключения к PostgreSQL; в Compose backend использует имя сервиса `db` |
| `SECRET_KEY` | `change-me-in-production` | Секрет JWT; не используйте демонстрационное значение |
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
pytest -q --cov=app --cov-fail-under=80
```

GitHub Actions запускается для push и pull request в `develop` и `master`. Он проверяет TypeScript, backend lint, frontend- и backend-тесты (coverage ≥ 80%), затем production build и сборку Docker-образов.

Текущий backend test-suite использует изолированную SQLite fixture из `backend/tests/conftest.py`, поэтому для этих quality gates отдельный PostgreSQL service в CI не требуется. Runtime и Compose-окружение проекта по-прежнему используют PostgreSQL.

## Документация

- Техническая спецификация: `docs/technical/`
- UX-улучшения и журнал фиксов: `docs/technical/10-ux-improvements.md`
- Пользовательские гайды: `docs/user/`
- Исходная спека: `DESC.md`

## Troubleshooting

### Фото отелей не отображаются

1. Backend отдаёт файлы: `http://localhost:8000/media/...` (путь из ответа API).
2. В Docker frontend проксирует `/media` на backend (`frontend/nginx.conf`).
3. В dev (`npm run dev`) Vite проксирует `/media` на `localhost:8000` — backend должен быть запущен.
4. UI собирает URL через `mediaUrl()` (`frontend/src/utils/mediaUrl.ts`) из `VITE_API_BASE_URL`.
5. Проверьте volume `uploads_data` и seed (cover-фото создаются при первом старте).
