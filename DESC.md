# Hotel Booking System — спецификация проекта

Веб-приложение для поиска отелей и бронирования номеров.

Стек: **React 19 + TypeScript + Vite** (frontend), **FastAPI + SQLAlchemy 2 + PostgreSQL** (backend), **Docker Compose**, **GitHub Actions**.

---

## 1. Scope

### In scope (MVP)

- Регистрация и JWT-аутентификация с **access + refresh tokens** (роли `CLIENT`, `ADMIN`)
- CRUD отелей, типов номеров, номеров (админ)
- Поиск отелей по городу, фильтры номеров (цена, вместимость, даты)
- Создание бронирования с проверкой пересечения дат и расчётом стоимости
- Просмотр и отмена своих бронирований (клиент)
- **Загрузка и отображение фото** отелей и номеров
- **Отзывы и рейтинг** отелей
- **Карта** с маркерами отелей (координаты + Map library)
- **Избранные отели**
- **i18n: русский и английский** (UI + переключение языка)
- Админ-панель: пользователи (просмотр + смена роли), отели, номера, все бронирования, модерация отзывов
- Docker Compose (frontend, backend, PostgreSQL)
- CI: линтеры, тесты, сборка, Docker images
- README + `.env.example`

### Out of scope

- Email / восстановление пароля
- Платежи
- Аналитика, экспорт Excel/PDF
- Push-уведомления
- Геокодинг адресов на бэкенде (координаты задаёт админ вручную)

---

## 2. Actors и use cases

### CLIENT

| ID | Сценарий |
|----|----------|
| UC-01 | Регистрация (name, email, password, phone optional) |
| UC-02 | Вход: получение access + refresh token; обновление access через refresh; logout (инвалидация refresh) |
| UC-03 | Просмотр списка отелей (поиск по city, пагинация) |
| UC-04 | Карточка отеля: описание, фото, номера, отзывы, рейтинг, карта |
| UC-05 | Фильтрация номеров: capacity, price_from/price_to, date_from/date_to |
| UC-06 | Создание бронирования (check_in, check_out) |
| UC-07 | Просмотр своих бронирований |
| UC-08 | Отмена своей активной брони |
| UC-09 | Просмотр и редактирование профиля (name, phone) |
| UC-16 | Добавить / убрать отель из избранного; просмотр списка избранного |
| UC-17 | Оставить отзыв об отеле (rating 1–5, текст); редактировать / удалить свой отзыв |
| UC-18 | Переключение языка UI: `ru` / `en` (сохранение в localStorage) |

### ADMIN (всё CLIENT +)

| ID | Сценарий |
|----|----------|
| UC-10 | CRUD отелей (в т.ч. latitude, longitude) |
| UC-11 | CRUD типов номеров |
| UC-12 | CRUD номеров |
| UC-13 | Список пользователей, смена роли |
| UC-14 | Список всех бронирований, смена статуса |
| UC-15 | Запрет удаления отеля/номера при активных бронях |
| UC-19 | Загрузка / удаление / сортировка фото отеля и номера |
| UC-20 | Удаление любого отзыва (модерация) |

Публично (без токена): `GET /hotels`, `GET /hotels/{id}`, `GET /rooms` (с фильтрами), `GET /rooms/{id}`, `GET /reviews`, `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`.

---

## 3. Доменная модель

### Сущности

**User**

| Поле | Тип | Ограничения |
|------|-----|-------------|
| id | UUID / int PK | |
| name | string | required, 1–100 |
| email | string | unique, email format |
| password_hash | string | bcrypt via Passlib |
| phone | string \| null | optional |
| role | enum | `ADMIN` \| `CLIENT` |
| created_at | datetime | |

**RefreshToken**

| Поле | Тип | Ограничения |
|------|-----|-------------|
| id | PK | |
| user_id | FK → User | |
| token_hash | string | unique; хранить hash, не plaintext |
| expires_at | datetime | |
| revoked_at | datetime \| null | |
| created_at | datetime | |

**Hotel**

| Поле | Тип | Ограничения |
|------|-----|-------------|
| id | PK | |
| name | string | required |
| city | string | required, indexed |
| address | string | required |
| description | text | |
| stars | int | 1–5 |
| latitude | Decimal | required для отображения на карте (−90…90) |
| longitude | Decimal | required (−180…180) |
| created_at | datetime | |

**RoomType**

| Поле | Тип | Ограничения |
|------|-----|-------------|
| id | PK | |
| name | string | unique (Standard, Deluxe, Suite, Family, …) |

**Room**

| Поле | Тип | Ограничения |
|------|-----|-------------|
| id | PK | |
| hotel_id | FK → Hotel | |
| room_type_id | FK → RoomType | |
| number | string | unique вместе с hotel_id |
| price | Decimal | > 0 (за ночь) |
| capacity | int | ≥ 1 |
| description | text | |
| status | enum | `AVAILABLE` \| `MAINTENANCE` |

**Image**

| Поле | Тип | Ограничения |
|------|-----|-------------|
| id | PK | |
| entity_type | enum | `HOTEL` \| `ROOM` |
| entity_id | int | id отеля или номера |
| url | string | путь/URL файла |
| sort_order | int | default 0 |
| created_at | datetime | |

Файлы хранятся на диске (volume Docker): `uploads/hotels/`, `uploads/rooms/`. Отдача через static mount backend (`/media/...`) или nginx в Compose. Форматы: JPEG, PNG, WebP; max размер 5 MB; max 10 фото на сущность.

**Review**

| Поле | Тип | Ограничения |
|------|-----|-------------|
| id | PK | |
| hotel_id | FK → Hotel | |
| user_id | FK → User | |
| rating | int | 1–5 |
| comment | text | required, 10–2000 символов |
| created_at | datetime | |
| updated_at | datetime | |

Уникальность: один отзыв на пару `(user_id, hotel_id)`.

**Favorite**

| Поле | Тип | Ограничения |
|------|-----|-------------|
| id | PK | |
| user_id | FK → User | |
| hotel_id | FK → Hotel | |
| created_at | datetime | |

Уникальность: `(user_id, hotel_id)`.

**Booking**

| Поле | Тип | Ограничения |
|------|-----|-------------|
| id | PK | |
| user_id | FK → User | |
| room_id | FK → Room | |
| check_in | date | |
| check_out | date | |
| total_price | Decimal | |
| status | enum | `PENDING` \| `CONFIRMED` \| `CANCELLED` \| `COMPLETED` |
| created_at | datetime | |

### Связи

```
Hotel 1──N Room
RoomType 1──N Room
User 1──N Booking
Room 1──N Booking
User 1──N RefreshToken
User 1──N Review
Hotel 1──N Review
User 1──N Favorite
Hotel 1──N Favorite
Hotel/Room 1──N Image (полиморфно через entity_type + entity_id)
```

### Правила бронирования

1. `check_out` **exclusive**: ночи = `(check_out - check_in).days`; день выезда не тарифицируется.
2. `nights >= 1` и `nights <= 30`.
3. `check_in >= today` (дата UTC).
4. Номер должен существовать и иметь `status = AVAILABLE`.
5. `total_price = nights * room.price`.
6. При создании статус = **`CONFIRMED`**.
7. Пересечение запрещено, если есть бронь того же `room_id` со статусом **`PENDING` или `CONFIRMED`**:

```
existing.check_in < new.check_out
AND new.check_in < existing.check_out
```

Примеры (существующая 10.07–15.07): запрещены 12–18, 09–11, 13–14; разрешены 01–09, 15–20.

8. `CANCELLED` и `COMPLETED` пересечение не блокируют.
9. Отмена клиентом: своя бронь в `CONFIRMED` / `PENDING` → `CANCELLED` (`PATCH …/cancel`).
10. Удаление Hotel/Room при наличии броней `PENDING`/`CONFIRMED` → **409 Conflict**.
11. Создание бронирования — в **одной транзакции**; `SELECT … FOR UPDATE` на номер (или эквивалент).

### Правила auth (refresh)

1. Login/register возвращают `access_token` + `refresh_token`.
2. Access TTL: `ACCESS_TOKEN_EXPIRE_MINUTES` (default **15**).
3. Refresh TTL: `REFRESH_TOKEN_EXPIRE_DAYS` (default **7**); хранится **hashed** в БД.
4. `POST /auth/refresh` выдаёт новую пару токенов; старый refresh **revoked** (rotation).
5. `POST /auth/logout` — revoke текущего refresh (тело/cookie с refresh).
6. Использованный или revoked refresh → `401`.
7. Frontend: access в memory или `localStorage`; refresh в `localStorage` (или httpOnly cookie — допустимо; default MVP: оба в `localStorage`). Axios: при 401 access — один retry через refresh, затем logout.

### Правила отзывов

1. Оставить отзыв может только аутентифицированный пользователь; **один отзыв на отель**.
2. Средний рейтинг отеля = `AVG(rating)` по Review (отдавать в `GET /hotels` и `GET /hotels/{id}` как `avg_rating`, `reviews_count`).
3. Автор может PATCH/DELETE свой отзыв; ADMIN может DELETE любой.

### Правила избранного

1. Только для аутентифицированных.
2. Toggle: повторный POST того же отеля → 409 или идемпотентный DELETE; API: `POST` добавить, `DELETE` убрать.
3. В списке отелей (для авторизованного) флаг `is_favorite`.

### Правила фото

1. Загрузка только ADMIN: `multipart/form-data`.
2. При удалении сущности — cascade удаление Image + файлов с диска.
3. В ответах Hotel/Room — массив `images: [{ id, url, sort_order }]`.

### Прочие инварианты

- Email уникален глобально.
- `(hotel_id, number)` уникален.
- Админ не может снять себе роль / удалить единственного админа.

### Seed при первом запуске

- `ADMIN`: `admin@example.com` / `Admin123!`
- `CLIENT`: `client@example.com` / `Client123!`
- ≥ 2 отеля с валидными lat/lng (например Москва / СПб), ≥ 1 RoomType, ≥ 3 номера
- ≥ 1 seed-фото на отель (файлы в `uploads/` или URL placeholder из static)
- ≥ 1 отзыв от CLIENT

---

## 4. API-контракт

Базовый префикс: **`/api/v1`**.

Заголовок: `Authorization: Bearer <access_token>`.  
JWT access: HS256. Refresh — opaque random string (или JWT), в БД только hash.

Ответ login / register / refresh:

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer"
}
```

### Ошибки

```json
{ "detail": "..." }
```

или validation:

```json
{ "detail": [{ "loc": [...], "msg": "...", "type": "..." }] }
```

Коды: `400` бизнес-валидация, `401` нет/битый/revoked токен, `403` роль, `404` не найдено, `409` конфликт, `413` файл слишком большой, `415` неверный MIME, `422` schema validation.

### Пагинация

Query: `page` (default 1), `size` (default 20, max 100).

```json
{ "items": [], "total": 0, "page": 1, "size": 20 }
```

### Endpoints

#### Auth

| Method | Path | Auth | Описание |
|--------|------|------|----------|
| POST | `/auth/register` | public | CLIENT + пара токенов |
| POST | `/auth/login` | public | пара токенов |
| POST | `/auth/refresh` | public | body: `{ "refresh_token" }`; ротация |
| POST | `/auth/logout` | auth | body: `{ "refresh_token" }`; revoke |
| GET | `/auth/me` | any | текущий пользователь |

#### Users

| Method | Path | Auth | Описание |
|--------|------|------|----------|
| GET | `/users` | ADMIN | список; search email/name |
| GET | `/users/{id}` | ADMIN или owner | профиль |
| PATCH | `/users/{id}` | owner: name/phone; ADMIN: + role | обновление |
| PATCH | `/users/me` | any | свой профиль |

#### Hotels

| Method | Path | Auth | Описание |
|--------|------|------|----------|
| GET | `/hotels` | public | `city`, `stars`; sort `created_at`/`stars`/`avg_rating`; в ответе `avg_rating`, `reviews_count`, cover image, `is_favorite` если auth |
| GET | `/hotels/{id}` | public | детали + images + avg_rating |
| GET | `/hotels/map` | public | упрощённый список для карты: `id`, `name`, `lat`, `lng`, `stars`, `min_price`, `avg_rating`; фильтр `city` |
| POST | `/hotels` | ADMIN | создать (вкл. lat/lng) |
| PUT | `/hotels/{id}` | ADMIN | обновить |
| DELETE | `/hotels/{id}` | ADMIN | удалить (правило 10) |

#### Room types

| Method | Path | Auth | Описание |
|--------|------|------|----------|
| GET | `/room-types` | public | список |
| POST | `/room-types` | ADMIN | создать |
| PUT | `/room-types/{id}` | ADMIN | обновить |
| DELETE | `/room-types/{id}` | ADMIN | если нет комнат |

#### Rooms

| Method | Path | Auth | Описание |
|--------|------|------|----------|
| GET | `/rooms` | public | фильтры ниже; + images |
| GET | `/rooms/{id}` | public | детали |
| POST | `/rooms` | ADMIN | создать |
| PUT | `/rooms/{id}` | ADMIN | обновить |
| DELETE | `/rooms/{id}` | ADMIN | правило 10 |

Фильтры `GET /rooms`: `hotel_id`, `capacity`, `price_from`, `price_to`, `date_from`/`date_to` (свободные + `AVAILABLE`), `city`.

#### Images

| Method | Path | Auth | Описание |
|--------|------|------|----------|
| POST | `/hotels/{id}/images` | ADMIN | multipart `file`; optional `sort_order` |
| POST | `/rooms/{id}/images` | ADMIN | multipart `file` |
| PATCH | `/images/{id}` | ADMIN | `sort_order` |
| DELETE | `/images/{id}` | ADMIN | файл + запись |

#### Reviews

| Method | Path | Auth | Описание |
|--------|------|------|----------|
| GET | `/hotels/{id}/reviews` | public | пагинация; sort `created_at` |
| POST | `/hotels/{id}/reviews` | auth | `{ rating, comment }` |
| PATCH | `/reviews/{id}` | owner | обновить |
| DELETE | `/reviews/{id}` | owner или ADMIN | удалить |

#### Favorites

| Method | Path | Auth | Описание |
|--------|------|------|----------|
| GET | `/favorites` | auth | список избранных отелей (пагинация) |
| POST | `/favorites/{hotel_id}` | auth | добавить; повтор → 409 |
| DELETE | `/favorites/{hotel_id}` | auth | убрать |

#### Bookings

| Method | Path | Auth | Описание |
|--------|------|------|----------|
| GET | `/bookings` | CLIENT: свои; ADMIN: все | фильтр `status` |
| GET | `/bookings/{id}` | owner или ADMIN | детали |
| POST | `/bookings` | CLIENT/ADMIN | `room_id`, `check_in`, `check_out` |
| PATCH | `/bookings/{id}/cancel` | owner или ADMIN | → `CANCELLED` |
| PATCH | `/bookings/{id}` | ADMIN | смена status |

`DELETE /bookings/{id}` — не использовать в MVP.

---

## 5. Архитектура и стек

```
React (TS) + i18next
    │  HTTP REST /api/v1
    ▼
FastAPI
    │  routers → services → repositories
    ▼
SQLAlchemy 2 + Alembic
    │
PostgreSQL + uploads volume
```

Фронтенд **не** обращается к БД. Бизнес-логика только в `services`. SQL только в `repositories`.

### Структура репозитория

```
hotel-booking-system/
  frontend/
  backend/
  uploads/                 # gitignore; volume в Compose
  docker-compose.yml
  .env.example
  README.md
  .github/workflows/ci.yml
```

### Frontend (`frontend/`)

Стек: React 19, TypeScript, Vite, React Router, Axios, Material UI, React Hook Form, TanStack Query, **i18next + react-i18next**, карта — **react-leaflet** (Leaflet, без API-ключа), Vitest, RTL, MSW.

```
src/
  api/           # auth, hotels, rooms, bookings, users, reviews, favorites, images
  components/
  pages/
  layouts/
  context/       # AuthContext
  hooks/
  routes/
  i18n/          # index.ts, locales/ru.json, locales/en.json
  utils/
  assets/
  App.tsx
  main.tsx
```

Auth: Axios interceptor — Bearer access; на 401 — refresh + retry; refresh/logout через auth API.

i18n: все пользовательские строки UI в словарях `ru` / `en`; переключатель в Navbar; язык по умолчанию — `ru`, иначе из `localStorage` (`i18n_lang`). Сообщения об ошибках API: маппинг известных `detail` на ключи i18n, иначе показывать `detail` как есть.

Карта: страница/блок с маркерами из `GET /hotels/map`; клик по маркеру → `/hotels/:id`. На карточке отеля — мини-карта точки.

### Backend (`backend/`)

Стек: Python 3.12+, FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2, PyJWT / python-jose, Passlib (bcrypt), pytest, httpx, pytest-asyncio. Загрузка файлов: `UploadFile` + запись в `UPLOAD_DIR`.

```
app/
  routers/       # auth, users, hotels, room_types, rooms, bookings, reviews, favorites, images
  models/
  schemas/
  services/
  repositories/
  core/          # config, security, deps
  database/
  main.py        # mount StaticFiles для /media
```

### Переменные окружения (`.env.example`)

```
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
DATABASE_URL=postgresql+psycopg://...
SECRET_KEY=
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://localhost:5173
UPLOAD_DIR=/app/uploads
MAX_UPLOAD_SIZE_MB=5
BACKEND_PORT=8000
FRONTEND_PORT=5173
```

---

## 6. UI: маршруты и экраны

| Path | Доступ | Экран |
|------|--------|-------|
| `/` | public | Home: поиск по городу, список отелей, превью карты / ссылка на карту |
| `/hotels` | public | Список: name, city, stars, min_price, cover, avg_rating, избранное (auth) |
| `/hotels/map` | public | Полноэкранная/крупная карта с маркерами |
| `/hotels/:id` | public | Галерея фото, описание, lat/lng мини-карта, номера, отзывы, избранное, «Забронировать» |
| `/bookings/new` | auth | check_in / check_out → nights + total |
| `/favorites` | auth | Избранные отели |
| `/profile` | auth | Профиль + мои бронирования |
| `/login`, `/register` | guest | Auth |
| `/admin` | ADMIN | Ссылки разделов |
| `/admin/users` | ADMIN | Пользователи |
| `/admin/hotels` | ADMIN | CRUD отелей + lat/lng + загрузка фото |
| `/admin/room-types` | ADMIN | CRUD типов |
| `/admin/rooms` | ADMIN | CRUD номеров + фото |
| `/admin/bookings` | ADMIN | Бронирования |
| `/admin/reviews` | ADMIN | Модерация отзывов (список/удаление) |
| `*` | — | 404 |

На всех layout-экранах: переключатель **RU | EN**.

Админ-таблицы: поиск, сортировка, пагинация, CRUD.

UX: SPA; валидация форм; toast/alert; Chrome / Firefox / Safari.

---

## 7. Качество, Docker, CI

### Тестирование (TDD)

Тест → падение → минимальный код → рефакторинг. Один тест — одно поведение.

**Backend (≥ 80% coverage):** auth (login/refresh rotation/logout/revoked), CRUD, overlap, права ролей, upload validation, reviews unique, favorites, map payload.

**Frontend:** ключевые страницы/формы, guards, refresh-retry interceptor (мок), i18n переключение, карта (мок leaflet при необходимости), избранное/отзывы.

### Docker

- `frontend/Dockerfile`, `backend/Dockerfile`, PostgreSQL
- Volume для `uploads`
- `docker compose up --build` поднимает всё; Alembic на старте backend
- Static/media доступен фронту через backend URL

### GitHub Actions (push/PR в main)

1. Lint / format
2. Frontend tests
3. Backend tests
4. Build frontend & backend
5. Build Docker images

### Документация

- README: Compose, структура, стек, seed, как заливать фото, i18n
- Swagger `/docs`
- `.env.example`

---

## 8. План поставки

1. Каркас репо, Compose, env, CI, Alembic, uploads volume
2. User + access/refresh/logout + AuthContext + Axios refresh
3. Hotels + RoomTypes + lat/lng + публичный список
4. Rooms + фильтры доступности
5. Images upload/static + админ UI галереи
6. Bookings: create / list / cancel + overlap + транзакция
7. Reviews + avg_rating; Favorites
8. Карта (`/hotels/map` + мини-карта на деталях) на Leaflet
9. i18n ru/en на всём UI
10. Profile + admin users/bookings/reviews; seed; coverage; зелёный CI

---

## 9. Acceptance criteria

- [ ] UC-01…UC-20 выполняются на стенде из Compose
- [ ] Access истекает; refresh выдаёт новую пару; отозванный refresh не работает; logout инвалидирует refresh
- [ ] Двойное бронирование пересекающихся дат невозможно (в т.ч. параллельно)
- [ ] Админ загружает фото отеля/номера; они видны в UI; невалидный файл → 4xx
- [ ] Клиент оставляет один отзыв на отель; avg_rating отображается в списках
- [ ] Избранное add/remove/list работает только для auth
- [ ] Карта показывает маркеры отелей; клик ведёт на карточку
- [ ] UI полностью переключается между `ru` и `en`
- [ ] Клиент видит только свои брони; админ — все
- [ ] Удаление отеля/номера с активными бронями → 409
- [ ] `docker compose up --build` поднимает frontend, backend, Postgres + uploads
- [ ] CI на PR зелёный
- [ ] Backend coverage ≥ 80%
- [ ] README достаточен для запуска с нуля
)
