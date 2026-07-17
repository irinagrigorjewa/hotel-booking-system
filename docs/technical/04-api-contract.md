# 4. API-контракт

REST API Hotel Booking System (MVP). Источник требований: `DESC.md` §3–4.

Базовый префикс всех маршрутов: **`/api/v1`**.

Пример полного URL (локально): `http://localhost:8000/api/v1/hotels`.

---

## 4.1. Общие соглашения

### 4.1.1. Base URL и версионирование

| Параметр | Значение |
|----------|----------|
| Префикс | `/api/v1` |
| Протокол | HTTP/HTTPS |
| Стиль | REST, JSON |
| Версия | `v1` в path; breaking changes → новый префикс (`/api/v2`) |

Все пути ниже указаны **относительно** `/api/v1` (например, `POST /auth/login` → `POST /api/v1/auth/login`).

### 4.1.2. Content-Type

| Контекст | `Content-Type` | Примечание |
|----------|----------------|------------|
| JSON body (create/update/auth) | `application/json` | По умолчанию |
| Загрузка изображений | `multipart/form-data` | Поле `file` (+ optional `sort_order`) |
| Успешные ответы | `application/json` | Везде, кроме отдачи статики медиа |
| Статика файлов | `image/jpeg` / `image/png` / `image/webp` | Mount `/media/...` (вне `/api/v1`) |

Клиент **должен** отправлять `Accept: application/json` для API-запросов.

Неверный `Content-Type` для JSON-эндпоинтов → **415 Unsupported Media Type** (или **422**, если FastAPI не принял тело).

### 4.1.3. Аутентификация и авторизация

#### Access token

| Параметр | Значение |
|----------|----------|
| Передача | Заголовок `Authorization: Bearer <access_token>` |
| Формат | JWT |
| Алгоритм | **HS256** |
| Секрет | `SECRET_KEY` (env) |
| TTL | `ACCESS_TOKEN_EXPIRE_MINUTES` (default **15**) |
| Claims (минимум) | `sub` (user id), `role`, `exp`, `iat`, `type: "access"` |

#### Refresh token

| Параметр | Значение |
|----------|----------|
| Формат | Opaque random string (или JWT); клиенту отдаётся plaintext **один раз** |
| Хранение в БД | Только **hash** (`token_hash`), не plaintext |
| TTL | `REFRESH_TOKEN_EXPIRE_DAYS` (default **7**) |
| Передача | JSON body `{ "refresh_token": "..." }` на `/auth/refresh` и `/auth/logout` |
| Rotation | При refresh старый токен **revoked**, выдаётся новая пара |

#### Уровни Auth в таблицах

| Метка | Значение |
|-------|----------|
| `public` | Токен не требуется |
| `auth` / `any` | Любой валидный access (`CLIENT` или `ADMIN`) |
| `owner` | Владелец ресурса (совпадение `user_id`) |
| `ADMIN` | Роль `ADMIN` |
| `CLIENT` / `ADMIN` | Указанные роли |

Публичные эндпоинты (без токена):  
`POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`,  
`GET /hotels`, `GET /hotels/{id}`, `GET /hotels/map`,  
`GET /rooms`, `GET /rooms/{id}`,  
`GET /room-types`,  
`GET /hotels/{id}/reviews`.

Опциональный Bearer на публичных списках отелей: если токен валиден, в ответе заполняется `is_favorite`; если токена нет — поле `null` или отсутствует (рекомендация: `null` для стабильной схемы).

### 4.1.4. Идентификаторы и типы

- PK сущностей: целочисленный `id` (или UUID — единый выбор на уровне реализации; в примерах ниже — **integer**).
- Даты бронирования: ISO date `YYYY-MM-DD` (UTC calendar day).
- DateTime: ISO 8601 UTC, например `2026-07-16T12:00:00Z`.
- Деньги (`price`, `total_price`, `min_price`): decimal как **string** в JSON (`"4500.00"`) — рекомендуется для Pydantic/`Decimal`; допускается number при явном согласовании в OpenAPI.
- Координаты: `latitude` −90…90, `longitude` −180…180.
- Enums — строки UPPER_SNAKE / как в домене: `CLIENT`, `ADMIN`, `AVAILABLE`, `MAINTENANCE`, `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `HOTEL`, `ROOM`.

### 4.1.5. Формат ошибок

Единый envelope ошибок FastAPI:

**Бизнес / auth / not found / conflict:**

```json
{
  "detail": "Hotel not found"
}
```

**Schema validation (Pydantic / FastAPI):**

```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

| HTTP | Когда |
|------|-------|
| **400** | Бизнес-валидация (даты брони, nights out of range, недопустимый статус и т.п.) |
| **401** | Нет токена / невалидный / истёкший access; использованный / revoked / истёкший refresh |
| **403** | Недостаточная роль; действие запрещено политикой (не owner) |
| **404** | Ресурс не найден |
| **409** | Конфликт уникальности / пересечение броней / активные брони при удалении / повтор избранного / повтор отзыва |
| **413** | Файл больше лимита (`MAX_UPLOAD_SIZE_MB`, default 5) |
| **415** | Неподдерживаемый MIME изображения |
| **422** | Ошибка схемы запроса (типы, required fields, constraints Pydantic) |

`detail` (string) — стабильные машинно-читаемые сообщения; frontend маппит известные строки на i18n-ключи.

### 4.1.6. Пагинация

Query-параметры:

| Параметр | Тип | Default | Ограничения |
|----------|-----|---------|-------------|
| `page` | int | `1` | ≥ 1 |
| `size` | int | `20` | 1…**100** |

Ответ-обёртка:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "size": 20
}
```

Применяется к: `GET /users`, `GET /hotels`, `GET /rooms`, `GET /room-types`, `GET /hotels/{id}/reviews`, `GET /favorites`, `GET /bookings` (и аналогичным list-эндпоинтам).

Пустой результат: `items: []`, `total: 0`, HTTP **200** (не 404).

### 4.1.7. Сортировка

Общий query-параметр (где применимо):

| Параметр | Тип | Описание |
|----------|-----|----------|
| `sort` | string | Имя поля сортировки |
| `order` | string | `asc` \| `desc` (default зависит от ресурса) |

**Hotels (`GET /hotels`):**  
`sort` ∈ `created_at` | `stars` | `avg_rating`; default `created_at` + `desc`.

**Reviews (`GET /hotels/{id}/reviews`):**  
`sort` = `created_at`; default `desc`.

Неизвестный `sort` → **400** или **422**.

### 4.1.8. Идемпотентность и побочные эффекты (кратко)

| Операция | Поведение |
|----------|-----------|
| `POST /favorites/{hotel_id}` | Не идемпотентен: повтор → **409** |
| `DELETE /favorites/{hotel_id}` | Идемпотентен: отсутствие связи → **204** или **404** (рекомендация MVP: **404**) |
| `POST /auth/refresh` | Rotation: одноразовый refresh |
| `POST /bookings` | Не идемпотентен без `Idempotency-Key` (в MVP ключ не требуется) |
| `DELETE /bookings/{id}` | **Не используется** в MVP |

---

## 4.2. Общие схемы (переиспользуемые)

### Role

```text
"CLIENT" | "ADMIN"
```

### TokenPairResponse

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "a1b2c3d4e5f6...opaque...",
  "token_type": "bearer"
}
```

### UserPublic

```json
{
  "id": 1,
  "name": "Иван Иванов",
  "email": "ivan@example.com",
  "phone": "+79001234567",
  "role": "CLIENT",
  "created_at": "2026-07-01T10:00:00Z"
}
```

`password` / `password_hash` **никогда** не возвращаются.

### ImageOut

```json
{
  "id": 10,
  "url": "/media/hotels/10/abc.webp",
  "sort_order": 0
}
```

### Paginated\<T\>

```json
{
  "items": [ /* T */ ],
  "total": 42,
  "page": 1,
  "size": 20
}
```

### ErrorDetailString

```json
{ "detail": "..." }
```

### ErrorDetailValidation

```json
{
  "detail": [
    { "loc": ["body", "field"], "msg": "...", "type": "..." }
  ]
}
```

---

## 4.3. Auth

Базовый path: `/auth`.

### 4.3.1. `POST /auth/register`

| | |
|--|--|
| **Auth** | public |
| **Описание** | Регистрация пользователя с ролью `CLIENT`; сразу выдаёт пару токенов |
| **Content-Type** | `application/json` |

**Request body:**

```json
{
  "name": "Иван Иванов",
  "email": "ivan@example.com",
  "password": "Secret123!",
  "phone": "+79001234567"
}
```

| Поле | Тип | Required | Ограничения |
|------|-----|----------|-------------|
| `name` | string | да | 1–100 |
| `email` | string | да | email format, уникален |
| `password` | string | да | min length по политике (рекомендация ≥ 8) |
| `phone` | string \| null | нет | optional |

**Response `201 Created`:** `TokenPairResponse`

```json
{
  "access_token": "eyJ...",
  "refresh_token": "opaque...",
  "token_type": "bearer"
}
```

**Ошибки:**

| Код | Сценарий |
|-----|----------|
| 409 | Email уже занят (`detail`: e.g. `"Email already registered"`) |
| 422 | Невалидная схема |

---

### 4.3.2. `POST /auth/login`

| | |
|--|--|
| **Auth** | public |
| **Описание** | Вход по email/password; пара токенов |

**Request body:**

```json
{
  "email": "ivan@example.com",
  "password": "Secret123!"
}
```

**Response `200 OK`:** `TokenPairResponse`

**Ошибки:**

| Код | Сценарий |
|-----|----------|
| 401 | Неверный email или пароль (единое сообщение, без enumeration) |
| 422 | Невалидная схема |

---

### 4.3.3. `POST /auth/refresh`

| | |
|--|--|
| **Auth** | public (нужен refresh в body, не access) |
| **Описание** | Ротация: новая пара токенов; старый refresh → `revoked_at` |

**Request body:**

```json
{
  "refresh_token": "opaque..."
}
```

**Response `200 OK`:** `TokenPairResponse`

**Ошибки:**

| Код | Сценарий |
|-----|----------|
| 401 | Токен неизвестен / hash не совпал / истёк / уже revoked / уже использован (rotation) |
| 422 | Нет поля / пустая строка |

**Инвариант:** повторный вызов с тем же refresh после успешной ротации → **401**.

---

### 4.3.4. `POST /auth/logout`

| | |
|--|--|
| **Auth** | auth (Bearer access) |
| **Описание** | Revoke указанного refresh-токена текущего пользователя |

**Request body:**

```json
{
  "refresh_token": "opaque..."
}
```

**Response `204 No Content`** (тело пустое)

Допустимо `200` с `{ "detail": "Logged out" }` — в OpenAPI зафиксировать один вариант; **рекомендация: 204**.

**Ошибки:**

| Код | Сценарий |
|-----|----------|
| 401 | Нет/битый access; refresh не принадлежит пользователю / уже revoked (можно 204 идемпотентно — рекомендация: **401** если refresh чужой) |
| 422 | Нет `refresh_token` |

---

### 4.3.5. `GET /auth/me`

| | |
|--|--|
| **Auth** | any |
| **Описание** | Текущий пользователь по access token |

**Request:** без body; только `Authorization`.

**Response `200 OK`:** `UserPublic`

```json
{
  "id": 1,
  "name": "Иван Иванов",
  "email": "ivan@example.com",
  "phone": "+79001234567",
  "role": "CLIENT",
  "created_at": "2026-07-01T10:00:00Z"
}
```

**Ошибки:**

| Код | Сценарий |
|-----|----------|
| 401 | Нет / невалидный / истёкший access |

---

## 4.4. Users

Базовый path: `/users`.

### 4.4.1. `GET /users`

| | |
|--|--|
| **Auth** | ADMIN |
| **Описание** | Список пользователей; поиск по email/name |

**Query:**

| Параметр | Тип | Default | Описание |
|----------|-----|---------|----------|
| `page` | int | 1 | |
| `size` | int | 20 | max 100 |
| `search` | string | — | Подстрока по `email` и/или `name` (case-insensitive) |

**Response `200 OK`:**

```json
{
  "items": [
    {
      "id": 1,
      "name": "Иван Иванов",
      "email": "ivan@example.com",
      "phone": "+79001234567",
      "role": "CLIENT",
      "created_at": "2026-07-01T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "size": 20
}
```

**Ошибки:** `401`, `403`, `422` (невалидные page/size).

---

### 4.4.2. `GET /users/{id}`

| | |
|--|--|
| **Auth** | ADMIN **или** owner (`id` = текущий user) |
| **Описание** | Профиль пользователя |

**Path:** `id` — int

**Response `200 OK`:** `UserPublic`

**Ошибки:**

| Код | Сценарий |
|-----|----------|
| 401 | Нет токена |
| 403 | CLIENT запрашивает чужой профиль |
| 404 | Пользователь не найден |

---

### 4.4.3. `PATCH /users/{id}`

| | |
|--|--|
| **Auth** | owner: `name`, `phone`; ADMIN: также `role` |
| **Описание** | Частичное обновление профиля / роли |

**Request body** (все поля optional, хотя бы одно обязательно):

```json
{
  "name": "Иван Петров",
  "phone": "+79007654321",
  "role": "ADMIN"
}
```

| Поле | Кто может | Ограничения |
|------|-----------|-------------|
| `name` | owner, ADMIN | 1–100 |
| `phone` | owner, ADMIN | string \| null |
| `role` | только ADMIN | `CLIENT` \| `ADMIN` |

**Response `200 OK`:** `UserPublic`

**Ошибки:**

| Код | Сценарий |
|-----|----------|
| 400 | ADMIN пытается снять себе роль / удалить единственного админа (если выражено через этот PATCH) |
| 401 | Нет токена |
| 403 | CLIENT меняет чужой профиль или поле `role` |
| 404 | Не найден |
| 422 | Невалидная схема |

**Инвариант:** админ не может снять себе роль, если он единственный `ADMIN` → **400** или **409**.

---

### 4.4.4. `PATCH /users/me`

| | |
|--|--|
| **Auth** | any |
| **Описание** | Обновление **своего** профиля (`name`, `phone`). Роль менять нельзя. |

**Request body:**

```json
{
  "name": "Иван Петров",
  "phone": "+79007654321"
}
```

**Response `200 OK`:** `UserPublic`

**Ошибки:** `401`, `422`. Передача `role` → **422** или игнор с запретом (рекомендация: **422** extra forbidden / поле отсутствует в схеме).

---

## 4.5. Hotels

Базовый path: `/hotels`.

### Схемы Hotel

**HotelListItem:**

```json
{
  "id": 1,
  "name": "Hotel Moscow",
  "city": "Moscow",
  "address": "Tverskaya 1",
  "description": "Уютный отель в центре",
  "stars": 4,
  "latitude": "55.7558",
  "longitude": "37.6173",
  "created_at": "2026-06-01T12:00:00Z",
  "avg_rating": 4.5,
  "reviews_count": 12,
  "min_price": "3500.00",
  "cover_image": {
    "id": 10,
    "url": "/media/hotels/1/cover.webp",
    "sort_order": 0
  },
  "is_favorite": false
}
```

| Поле | Примечание |
|------|------------|
| `avg_rating` | `AVG(rating)` или `null`, если отзывов нет |
| `reviews_count` | int ≥ 0 |
| `min_price` | мин. цена среди `AVAILABLE` номеров или `null` |
| `cover_image` | image с min `sort_order` или `null` |
| `is_favorite` | `true`/`false` при auth; `null` без токена |

**HotelDetail** — как list item + полный массив `images`:

```json
{
  "id": 1,
  "name": "Hotel Moscow",
  "city": "Moscow",
  "address": "Tverskaya 1",
  "description": "Уютный отель в центре",
  "stars": 4,
  "latitude": "55.7558",
  "longitude": "37.6173",
  "created_at": "2026-06-01T12:00:00Z",
  "avg_rating": 4.5,
  "reviews_count": 12,
  "min_price": "3500.00",
  "is_favorite": true,
  "images": [
    { "id": 10, "url": "/media/hotels/1/a.webp", "sort_order": 0 },
    { "id": 11, "url": "/media/hotels/1/b.webp", "sort_order": 1 }
  ]
}
```

**HotelMapItem:**

```json
{
  "id": 1,
  "name": "Hotel Moscow",
  "latitude": "55.7558",
  "longitude": "37.6173",
  "stars": 4,
  "min_price": "3500.00",
  "avg_rating": 4.5
}
```

**HotelCreate / HotelUpdate:**

```json
{
  "name": "Hotel Moscow",
  "city": "Moscow",
  "address": "Tverskaya 1",
  "description": "Уютный отель в центре",
  "stars": 4,
  "latitude": 55.7558,
  "longitude": 37.6173
}
```

| Поле | Ограничения |
|------|-------------|
| `name` | required |
| `city` | required |
| `address` | required |
| `description` | text, optional/empty ok |
| `stars` | 1–5 |
| `latitude` | −90…90, required |
| `longitude` | −180…180, required |

---

### 4.5.1. `GET /hotels`

| | |
|--|--|
| **Auth** | public (+ optional Bearer → `is_favorite`) |
| **Описание** | Список отелей с фильтрами и сортировкой |

**Query:**

| Параметр | Тип | Описание |
|----------|-----|----------|
| `city` | string | Точное или case-insensitive совпадение города |
| `stars` | int | Фильтр по звёздам (1–5) |
| `sort` | string | `created_at` \| `stars` \| `avg_rating` |
| `order` | string | `asc` \| `desc` |
| `page` | int | default 1 |
| `size` | int | default 20, max 100 |

**Response `200 OK`:** `Paginated<HotelListItem>`

**Ошибки:** `422` (невалидные query).

---

### 4.5.2. `GET /hotels/map`

| | |
|--|--|
| **Auth** | public |
| **Описание** | Упрощённый список для карты (без полной пагинации или с большим `size`; рекомендация: без page или page+size с большим default) |

**Query:**

| Параметр | Тип | Описание |
|----------|-----|----------|
| `city` | string | optional filter |

**Response `200 OK`:**

```json
{
  "items": [
    {
      "id": 1,
      "name": "Hotel Moscow",
      "latitude": "55.7558",
      "longitude": "37.6173",
      "stars": 4,
      "min_price": "3500.00",
      "avg_rating": 4.5
    }
  ]
}
```

Либо «голый» массив `HotelMapItem[]` — в OpenAPI выбрать один вариант; **рекомендация: `{ "items": [...] }`** для единообразия.

**Важно маршрутизации:** `/hotels/map` объявлять **до** `/hotels/{id}`, иначе `map` парсится как id.

---

### 4.5.3. `GET /hotels/{id}`

| | |
|--|--|
| **Auth** | public (+ optional Bearer) |
| **Описание** | Карточка отеля: описание, images, рейтинг |

**Response `200 OK`:** `HotelDetail`

**Ошибки:** `404` — отель не найден.

---

### 4.5.4. `POST /hotels`

| | |
|--|--|
| **Auth** | ADMIN |
| **Описание** | Создать отель (включая lat/lng) |

**Request body:** `HotelCreate`

**Response `201 Created`:** `HotelDetail` (images: `[]`)

**Ошибки:** `401`, `403`, `422`.

---

### 4.5.5. `PUT /hotels/{id}`

| | |
|--|--|
| **Auth** | ADMIN |
| **Описание** | Полное обновление отеля |

**Request body:** `HotelCreate` (все поля required как при create)

**Response `200 OK`:** `HotelDetail`

**Ошибки:** `401`, `403`, `404`, `422`.

---

### 4.5.6. `DELETE /hotels/{id}`

| | |
|--|--|
| **Auth** | ADMIN |
| **Описание** | Удалить отель; cascade images + файлы |

**Response `204 No Content`**

**Ошибки:**

| Код | Сценарий |
|-----|----------|
| 401 / 403 | Auth |
| 404 | Не найден |
| 409 | Есть брони номеров отеля со статусом `PENDING` или `CONFIRMED` |

---

## 4.6. Room types

Базовый path: `/room-types`.

### Схема RoomType

```json
{
  "id": 1,
  "name": "Deluxe"
}
```

**Create/Update body:**

```json
{
  "name": "Deluxe"
}
```

`name` — unique (Standard, Deluxe, Suite, Family, …).

---

### 4.6.1. `GET /room-types`

| | |
|--|--|
| **Auth** | public |
| **Описание** | Список типов номеров |

**Query:** `page`, `size` (опционально; при небольшом справочнике допустим полный список без пагинации — в OpenAPI зафиксировать; рекомендация: пагинация как у остальных).

**Response `200 OK`:**

```json
{
  "items": [
    { "id": 1, "name": "Standard" },
    { "id": 2, "name": "Deluxe" }
  ],
  "total": 2,
  "page": 1,
  "size": 20
}
```

---

### 4.6.2. `POST /room-types`

| | |
|--|--|
| **Auth** | ADMIN |

**Request:**

```json
{ "name": "Suite" }
```

**Response `201 Created`:**

```json
{ "id": 3, "name": "Suite" }
```

**Ошибки:** `401`, `403`, `409` (name не уникален), `422`.

---

### 4.6.3. `PUT /room-types/{id}`

| | |
|--|--|
| **Auth** | ADMIN |

**Request:** `{ "name": "Family" }`

**Response `200 OK`:** `{ "id": 3, "name": "Family" }`

**Ошибки:** `401`, `403`, `404`, `409`, `422`.

---

### 4.6.4. `DELETE /room-types/{id}`

| | |
|--|--|
| **Auth** | ADMIN |
| **Описание** | Удалить только если нет связанных комнат |

**Response `204 No Content`**

**Ошибки:**

| Код | Сценарий |
|-----|----------|
| 404 | Не найден |
| 409 | Есть связанные `Room` |

---

## 4.7. Rooms

Базовый path: `/rooms`.

### Схемы Room

**RoomOut:**

```json
{
  "id": 5,
  "hotel_id": 1,
  "room_type_id": 2,
  "number": "301",
  "price": "5500.00",
  "capacity": 2,
  "description": "Номер с видом на город",
  "status": "AVAILABLE",
  "room_type": { "id": 2, "name": "Deluxe" },
  "hotel": {
    "id": 1,
    "name": "Hotel Moscow",
    "city": "Moscow"
  },
  "images": [
    { "id": 20, "url": "/media/rooms/5/a.webp", "sort_order": 0 }
  ]
}
```

Вложенные `hotel` / `room_type` — рекомендованы для UI; минимальный контракт допускает только FK + `images`.

**RoomCreate / RoomUpdate:**

```json
{
  "hotel_id": 1,
  "room_type_id": 2,
  "number": "301",
  "price": "5500.00",
  "capacity": 2,
  "description": "Номер с видом на город",
  "status": "AVAILABLE"
}
```

| Поле | Ограничения |
|------|-------------|
| `hotel_id` | FK, exists |
| `room_type_id` | FK, exists |
| `number` | unique вместе с `hotel_id` |
| `price` | > 0 |
| `capacity` | ≥ 1 |
| `status` | `AVAILABLE` \| `MAINTENANCE` |

---

### 4.7.1. `GET /rooms`

| | |
|--|--|
| **Auth** | public |
| **Описание** | Список номеров с фильтрами доступности |

**Query:**

| Параметр | Тип | Описание |
|----------|-----|----------|
| `hotel_id` | int | Фильтр по отелю |
| `city` | string | Город отеля |
| `capacity` | int | `capacity >= value` |
| `price_from` | decimal | `price >=` |
| `price_to` | decimal | `price <=` |
| `date_from` | date | Вместе с `date_to`: свободные на интервал |
| `date_to` | date | Exclusive check-out семантика как у брони |
| `page` | int | |
| `size` | int | |

**Правила фильтра дат:**

- Оба `date_from` и `date_to` заданы вместе (иначе **400**/**422**).
- Номер `status = AVAILABLE`.
- Нет пересечения с бронями `PENDING`/`CONFIRMED` по правилу §3:

```text
existing.check_in < date_to AND date_from < existing.check_out
```

**Response `200 OK`:** `Paginated<RoomOut>`

**Ошибки:** `400`/`422` — несогласованные даты (`date_from >= date_to`).

---

### 4.7.2. `GET /rooms/{id}`

| | |
|--|--|
| **Auth** | public |

**Response `200 OK`:** `RoomOut`

**Ошибки:** `404`.

---

### 4.7.3. `POST /rooms`

| | |
|--|--|
| **Auth** | ADMIN |

**Request:** `RoomCreate`

**Response `201 Created`:** `RoomOut`

**Ошибки:** `401`, `403`, `404` (hotel/room_type), `409` (`hotel_id`+`number`), `422`.

---

### 4.7.4. `PUT /rooms/{id}`

| | |
|--|--|
| **Auth** | ADMIN |

**Request:** `RoomUpdate`

**Response `200 OK`:** `RoomOut`

**Ошибки:** `401`, `403`, `404`, `409`, `422`.

---

### 4.7.5. `DELETE /rooms/{id}`

| | |
|--|--|
| **Auth** | ADMIN |

**Response `204 No Content`**

**Ошибки:**

| Код | Сценарий |
|-----|----------|
| 404 | Не найден |
| 409 | Есть брони `PENDING`/`CONFIRMED` на этот номер |

Cascade: Image + файлы на диске.

---

## 4.8. Images

Базовый path: `/images` и вложенные upload-маршруты.

### Ограничения загрузки

| Параметр | Значение |
|----------|----------|
| MIME | `image/jpeg`, `image/png`, `image/webp` |
| Max size | `MAX_UPLOAD_SIZE_MB` (default **5** MB) |
| Max count | **10** фото на сущность (Hotel или Room) |
| Auth | только **ADMIN** |
| Хранение | `UPLOAD_DIR`: `uploads/hotels/`, `uploads/rooms/` |
| URL | `/media/...` (static mount) |

---

### 4.8.1. `POST /hotels/{id}/images`

| | |
|--|--|
| **Auth** | ADMIN |
| **Content-Type** | `multipart/form-data` |

**Form fields:**

| Поле | Тип | Required | Описание |
|------|-----|----------|----------|
| `file` | file | да | Изображение |
| `sort_order` | int | нет | default 0 |

**Response `201 Created`:**

```json
{
  "id": 10,
  "url": "/media/hotels/1/abc.webp",
  "sort_order": 0,
  "entity_type": "HOTEL",
  "entity_id": 1
}
```

**Ошибки:**

| Код | Сценарий |
|-----|----------|
| 401 / 403 | Auth |
| 404 | Отель не найден |
| 409 | Уже ≥ 10 изображений |
| 413 | Файл слишком большой |
| 415 | Неверный MIME |
| 422 | Нет `file` / битый multipart |

---

### 4.8.2. `POST /rooms/{id}/images`

| | |
|--|--|
| **Auth** | ADMIN |
| **Content-Type** | `multipart/form-data` |

Аналогично hotel upload; `entity_type = ROOM`.

**Response `201 Created`:** `ImageOut` (+ `entity_type`, `entity_id`)

**Ошибки:** те же (`404` — номер не найден).

---

### 4.8.3. `PATCH /images/{id}`

| | |
|--|--|
| **Auth** | ADMIN |
| **Описание** | Изменить `sort_order` (сортировка галереи) |

**Request body:**

```json
{
  "sort_order": 2
}
```

**Response `200 OK`:**

```json
{
  "id": 10,
  "url": "/media/hotels/1/abc.webp",
  "sort_order": 2,
  "entity_type": "HOTEL",
  "entity_id": 1
}
```

**Ошибки:** `401`, `403`, `404`, `422`.

---

### 4.8.4. `DELETE /images/{id}`

| | |
|--|--|
| **Auth** | ADMIN |
| **Описание** | Удалить запись БД + файл с диска |

**Response `204 No Content`**

**Ошибки:** `401`, `403`, `404`.

---

## 4.9. Reviews

### Схема Review

**ReviewOut:**

```json
{
  "id": 7,
  "hotel_id": 1,
  "user_id": 2,
  "user_name": "Иван Иванов",
  "rating": 5,
  "comment": "Отличный отель, чисто и тихо.",
  "created_at": "2026-07-10T18:00:00Z",
  "updated_at": "2026-07-10T18:00:00Z"
}
```

**ReviewCreate / ReviewUpdate:**

```json
{
  "rating": 5,
  "comment": "Отличный отель, чисто и тихо."
}
```

| Поле | Ограничения |
|------|-------------|
| `rating` | int 1–5 |
| `comment` | string, **10–2000** символов |

Уникальность: один отзыв на пару `(user_id, hotel_id)`.

---

### 4.9.1. `GET /hotels/{id}/reviews`

| | |
|--|--|
| **Auth** | public |
| **Описание** | Отзывы отеля; sort по `created_at` |

**Query:** `page`, `size`, `sort=created_at`, `order=asc|desc` (default `desc`)

**Response `200 OK`:** `Paginated<ReviewOut>`

**Ошибки:** `404` — отель не найден (рекомендация); либо пустой список без проверки отеля — зафиксировать в OpenAPI (**рекомендация: 404**).

---

### 4.9.2. `POST /hotels/{id}/reviews`

| | |
|--|--|
| **Auth** | auth |
| **Описание** | Создать отзыв (один на отель) |

**Request body:** `ReviewCreate`

**Response `201 Created`:** `ReviewOut`

После успеха пересчитываются `avg_rating` / `reviews_count` отеля (в следующих GET).

**Ошибки:**

| Код | Сценарий |
|-----|----------|
| 401 | Нет токена |
| 404 | Отель не найден |
| 409 | Отзыв этого пользователя на отель уже существует |
| 422 | rating/comment вне ограничений |

---

### 4.9.3. `PATCH /reviews/{id}`

| | |
|--|--|
| **Auth** | owner |
| **Описание** | Обновить свой отзыв |

**Request body** (частичное):

```json
{
  "rating": 4,
  "comment": "Хорошо, но шумно утром."
}
```

**Response `200 OK`:** `ReviewOut` (`updated_at` обновлён)

**Ошибки:** `401`, `403` (не автор), `404`, `422`.

ADMIN **не** обязан иметь PATCH чужих отзывов в MVP (только DELETE).

---

### 4.9.4. `DELETE /reviews/{id}`

| | |
|--|--|
| **Auth** | owner **или** ADMIN |
| **Описание** | Удалить отзыв (модерация для админа) |

**Response `204 No Content`**

**Ошибки:** `401`, `403`, `404`.

---

## 4.10. Favorites

Базовый path: `/favorites`.

### Схема

Элемент списка — по сути `HotelListItem` (или урезанный hotel + `favorited_at`):

```json
{
  "id": 1,
  "hotel": {
    "id": 1,
    "name": "Hotel Moscow",
    "city": "Moscow",
    "stars": 4,
    "avg_rating": 4.5,
    "reviews_count": 12,
    "min_price": "3500.00",
    "cover_image": {
      "id": 10,
      "url": "/media/hotels/1/cover.webp",
      "sort_order": 0
    },
    "is_favorite": true
  },
  "created_at": "2026-07-12T09:00:00Z"
}
```

Упрощённый вариант MVP: `Paginated<HotelListItem>` с `is_favorite: true`.

---

### 4.10.1. `GET /favorites`

| | |
|--|--|
| **Auth** | auth |
| **Описание** | Избранные отели текущего пользователя |

**Query:** `page`, `size`

**Response `200 OK`:** пагинированный список избранного

**Ошибки:** `401`, `422`.

---

### 4.10.2. `POST /favorites/{hotel_id}`

| | |
|--|--|
| **Auth** | auth |
| **Описание** | Добавить отель в избранное |

**Path:** `hotel_id` — int

**Response `201 Created`:**

```json
{
  "hotel_id": 1,
  "user_id": 2,
  "created_at": "2026-07-12T09:00:00Z"
}
```

**Ошибки:**

| Код | Сценарий |
|-----|----------|
| 401 | Нет токена |
| 404 | Отель не найден |
| 409 | Уже в избранном (**не** идемпотентный POST) |

---

### 4.10.3. `DELETE /favorites/{hotel_id}`

| | |
|--|--|
| **Auth** | auth |
| **Описание** | Убрать отель из избранного |

**Response `204 No Content`**

**Ошибки:**

| Код | Сценарий |
|-----|----------|
| 401 | Нет токена |
| 404 | Отель не найден **или** не был в избранном |

Toggle на клиенте: `POST` → при 409 вызвать `DELETE`, либо заранее смотреть `is_favorite`.

---

## 4.11. Bookings

Базовый path: `/bookings`.

### Схема Booking

**BookingOut:**

```json
{
  "id": 100,
  "user_id": 2,
  "room_id": 5,
  "check_in": "2026-08-10",
  "check_out": "2026-08-15",
  "nights": 5,
  "total_price": "27500.00",
  "status": "CONFIRMED",
  "created_at": "2026-07-16T14:00:00Z",
  "room": {
    "id": 5,
    "number": "301",
    "price": "5500.00",
    "hotel_id": 1,
    "hotel_name": "Hotel Moscow"
  },
  "user": {
    "id": 2,
    "name": "Иван Иванов",
    "email": "ivan@example.com"
  }
}
```

`user` — включать для ADMIN list/detail; для CLIENT можно опускать.

**BookingCreate:**

```json
{
  "room_id": 5,
  "check_in": "2026-08-10",
  "check_out": "2026-08-15"
}
```

**BookingStatusUpdate (ADMIN):**

```json
{
  "status": "COMPLETED"
}
```

`status` ∈ `PENDING` | `CONFIRMED` | `CANCELLED` | `COMPLETED`.

### Правила расчёта (сервер)

1. `check_out` **exclusive**: `nights = (check_out - check_in).days`.
2. `1 <= nights <= 30`.
3. `check_in >= today` (UTC date).
4. Room exists и `status = AVAILABLE`.
5. `total_price = nights * room.price`.
6. При создании `status = CONFIRMED`.
7. Пересечение с `PENDING`/`CONFIRMED` → **409**.
8. Создание в одной транзакции + `SELECT … FOR UPDATE` на room.

`DELETE /bookings/{id}` — **не использовать** в MVP.

---

### 4.11.1. `GET /bookings`

| | |
|--|--|
| **Auth** | CLIENT: только свои; ADMIN: все |
| **Описание** | Список бронирований |

**Query:**

| Параметр | Тип | Описание |
|----------|-----|----------|
| `status` | enum | optional filter |
| `page` | int | |
| `size` | int | |

**Response `200 OK`:** `Paginated<BookingOut>`

**Ошибки:** `401`, `422`.

---

### 4.11.2. `GET /bookings/{id}`

| | |
|--|--|
| **Auth** | owner или ADMIN |

**Response `200 OK`:** `BookingOut`

**Ошибки:** `401`, `403` (чужая бронь у CLIENT), `404`.

---

### 4.11.3. `POST /bookings`

| | |
|--|--|
| **Auth** | CLIENT или ADMIN |
| **Описание** | Создать бронирование |

**Request body:** `BookingCreate`

**Response `201 Created`:** `BookingOut` (`status: "CONFIRMED"`)

**Ошибки:**

| Код | Сценарий |
|-----|----------|
| 400 | `nights` вне 1…30; `check_in` в прошлом; `check_out <= check_in`; номер не `AVAILABLE` |
| 401 | Нет токена |
| 404 | Room не найден |
| 409 | Пересечение дат с активной бронью |
| 422 | Невалидная схема |

`user_id` берётся из access token (ADMIN бронирует «от своего имени», если отдельный `user_id` в body не предусмотрен MVP).

---

### 4.11.4. `PATCH /bookings/{id}/cancel`

| | |
|--|--|
| **Auth** | owner или ADMIN |
| **Описание** | Отмена: `CONFIRMED` / `PENDING` → `CANCELLED` |

**Request:** без body (или пустой `{}`)

**Response `200 OK`:** `BookingOut` со `status: "CANCELLED"`

**Ошибки:**

| Код | Сценарий |
|-----|----------|
| 400 | Статус уже `CANCELLED` / `COMPLETED` (отмена недопустима) |
| 401 | Нет токена |
| 403 | Не owner и не ADMIN |
| 404 | Не найдено |

---

### 4.11.5. `PATCH /bookings/{id}`

| | |
|--|--|
| **Auth** | ADMIN |
| **Описание** | Смена статуса бронирования |

**Request body:**

```json
{
  "status": "COMPLETED"
}
```

**Response `200 OK`:** `BookingOut`

**Ошибки:** `401`, `403`, `404`, `400` (недопустимый переход статуса — если введёте state machine), `422`.

Рекомендуемые переходы (MVP, мягкие):

| Из | В |
|----|---|
| PENDING | CONFIRMED, CANCELLED |
| CONFIRMED | CANCELLED, COMPLETED |
| CANCELLED | — (терминальный) |
| COMPLETED | — (терминальный) |

Нарушение → **400**.

---

## 4.12. Сводная таблица кодов ошибок по сценариям

| Сценарий | HTTP | Типичный `detail` |
|----------|------|-------------------|
| Невалидное тело / query (Pydantic) | 422 | validation array |
| Нет Bearer / просроченный access | 401 | `"Not authenticated"` / `"Invalid token"` |
| Refresh истёк / revoked / reused | 401 | `"Invalid refresh token"` |
| Неверный login | 401 | `"Invalid credentials"` |
| Роль недостаточна | 403 | `"Forbidden"` |
| CLIENT читает/меняет чужой ресурс | 403 | `"Forbidden"` |
| Ресурс не найден | 404 | `"… not found"` |
| Email уже зарегистрирован | 409 | `"Email already registered"` |
| Дубликат `(hotel_id, number)` | 409 | `"Room number already exists"` |
| Дубликат `RoomType.name` | 409 | `"Room type already exists"` |
| Повторный отзыв на отель | 409 | `"Review already exists"` |
| Повторное избранное | 409 | `"Already in favorites"` |
| Пересечение дат брони | 409 | `"Room is not available for selected dates"` |
| Удаление hotel/room с активными бронями | 409 | `"Cannot delete: active bookings exist"` |
| Удаление room-type со связанными rooms | 409 | `"Cannot delete: rooms exist"` |
| Лимит 10 фото | 409 | `"Image limit exceeded"` |
| Даты брони / nights / past check_in | 400 | бизнес-строка |
| Отмена терминальной брони | 400 | `"Cannot cancel booking in status …"` |
| Снятие роли единственного ADMIN | 400/409 | политика админов |
| Файл > max size | 413 | `"File too large"` |
| MIME не jpeg/png/webp | 415 | `"Unsupported media type"` |
| Неверный Content-Type у JSON | 415/422 | зависит от FastAPI |

---

## 4.13. Контрактные инварианты

### Auth / tokens

1. Login, register, refresh всегда возвращают **оба** токена + `token_type: "bearer"`.
2. Access — JWT HS256; refresh — opaque (или JWT), в БД только **hash**.
3. Refresh **rotation**: успешный `/auth/refresh` инвалидирует предыдущий refresh.
4. Повторное использование старого refresh → **401** (detect reuse; опционально revoke всех токенов user — усиление, не обязательно в MVP).
5. Logout revokes конкретный refresh; access до истечения TTL может ещё работать (stateless JWT) — клиент обязан удалить access локально.
6. TTL: access default 15 min, refresh default 7 days.

### Users

7. Email уникален глобально.
8. Register всегда создаёт `CLIENT` (нельзя самоназначить `ADMIN`).
9. Нельзя оставить систему без единственного ADMIN через смену роли.

### Hotels / Rooms / Room types

10. `(hotel_id, number)` уникален.
11. `RoomType.name` уникален.
12. DELETE hotel/room при `PENDING`/`CONFIRMED` бронях → **409**.
13. DELETE room-type при наличии rooms → **409**.
14. Координаты обязательны для отеля (карта).

### Bookings

15. `check_out` exclusive; nights = delta days.
16. `1 ≤ nights ≤ 30`; `check_in ≥ today (UTC)`.
17. Создание → `CONFIRMED`; `total_price = nights * price`.
18. Пересечение только с `PENDING`/`CONFIRMED`.
19. `CANCELLED`/`COMPLETED` не блокируют слоты.
20. Создание в одной DB-транзакции с блокировкой номера.
21. `DELETE /bookings/{id}` отсутствует в MVP.

### Reviews

22. Один отзыв на `(user_id, hotel_id)`.
23. `avg_rating` / `reviews_count` согласованы с агрегатом Review.
24. PATCH — только author; DELETE — author или ADMIN.

### Favorites

25. Уникальность `(user_id, hotel_id)`.
26. `POST` повтор → **409** (явный add, не toggle).
27. `DELETE` убирает связь.
28. В `GET /hotels` для auth-пользователя — флаг `is_favorite`.

### Images

29. Upload только ADMIN, multipart.
30. MIME ∈ jpeg/png/webp; size ≤ `MAX_UPLOAD_SIZE_MB`; ≤ 10 на entity.
31. DELETE entity → cascade Image + файлы диска.
32. В ответах Hotel/Room — `images: [{ id, url, sort_order }]`.

### Пагинация / ошибки

33. List всегда 200 + пустой `items` при отсутствии данных (кроме явного 404 родителя, напр. reviews несуществующего hotel).
34. Ошибки — `{ "detail": string | validation[] }`.

---

## 4.14. Заметки для OpenAPI / Swagger

### Генерация

- Источник истины в runtime: **FastAPI** → `/openapi.json`, UI: `/docs` (Swagger), `/redoc`.
- Все router'ы монтировать с `prefix="/api/v1"`.
- Теги OpenAPI по ресурсам: `Auth`, `Users`, `Hotels`, `Room types`, `Rooms`, `Images`, `Reviews`, `Favorites`, `Bookings`.

### Security scheme

```yaml
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

На защищённых операциях: `security: [{ BearerAuth: [] }]`.  
На public — без security; для `GET /hotels` указать, что Bearer **optional** (`security` + пустой `{}` в OpenAPI 3).

### Схемы Pydantic (рекомендуемые имена)

| Schema | Использование |
|--------|----------------|
| `TokenPairResponse` | login/register/refresh |
| `LoginRequest`, `RegisterRequest`, `RefreshRequest` | auth bodies |
| `UserPublic`, `UserUpdate`, `AdminUserUpdate` | users |
| `HotelCreate`, `HotelUpdate`, `HotelListItem`, `HotelDetail`, `HotelMapItem` | hotels |
| `RoomTypeCreate`, `RoomTypeOut` | room types |
| `RoomCreate`, `RoomUpdate`, `RoomOut` | rooms |
| `ImageOut`, `ImageSortUpdate` | images |
| `ReviewCreate`, `ReviewUpdate`, `ReviewOut` | reviews |
| `FavoriteOut` | favorites |
| `BookingCreate`, `BookingOut`, `BookingStatusUpdate` | bookings |
| `PaginatedResponse[T]` | generics / отдельные Page* модели |
| `HTTPValidationError` | стандарт FastAPI 422 |

### Response codes в декораторах

Явно объявлять `responses={401: ..., 403: ..., 404: ..., 409: ..., 413: ..., 415: ...}` для критичных операций (upload, bookings, favorites).

Для `204` — `response_class=Response`, `status_code=204`.

### Multipart

```python
file: UploadFile = File(...)
sort_order: int = Form(0)
```

В OpenAPI: `multipart/form-data` с `binary` для `file`.

### Примеры (examples)

Добавить `json_schema_extra` / `openapi_examples` для:

- успешного login;
- 409 overlap booking;
- validation 422;
- hotel list item с `is_favorite`.

### Порядок path-параметров

Зарегистрировать статические path **раньше** динамических:

1. `/hotels/map`
2. `/hotels/{id}`
3. `/users/me` **до** `/users/{id}` (если оба в одном router)

### Версионирование документации

- `info.title`: `Hotel Booking System API`
- `info.version`: `1.0.0`
- `servers`: `[{ "url": "http://localhost:8000/api/v1" }]` — либо server root + paths уже с полным prefix (не дублировать).

### Согласованность decimal

В OpenAPI для денег: `type: string` + `format: decimal` **или** `type: number` + `format: double`. Выбрать один способ в Pydantic (`Decimal` → string через `ser_json`) и не смешивать.

### CORS

Не часть path-контракта, но для клиентов: `CORS_ORIGINS` (например `http://localhost:5173`); preflight OPTIONS не документировать как бизнес-API.

---

## 4.15. Матрица эндпоинтов (сводка)

| Method | Path | Auth |
|--------|------|------|
| POST | `/auth/register` | public |
| POST | `/auth/login` | public |
| POST | `/auth/refresh` | public |
| POST | `/auth/logout` | auth |
| GET | `/auth/me` | any |
| GET | `/users` | ADMIN |
| GET | `/users/{id}` | ADMIN \| owner |
| PATCH | `/users/{id}` | owner / ADMIN(+role) |
| PATCH | `/users/me` | any |
| GET | `/hotels` | public |
| GET | `/hotels/map` | public |
| GET | `/hotels/{id}` | public |
| POST | `/hotels` | ADMIN |
| PUT | `/hotels/{id}` | ADMIN |
| DELETE | `/hotels/{id}` | ADMIN |
| GET | `/room-types` | public |
| POST | `/room-types` | ADMIN |
| PUT | `/room-types/{id}` | ADMIN |
| DELETE | `/room-types/{id}` | ADMIN |
| GET | `/rooms` | public |
| GET | `/rooms/{id}` | public |
| POST | `/rooms` | ADMIN |
| PUT | `/rooms/{id}` | ADMIN |
| DELETE | `/rooms/{id}` | ADMIN |
| POST | `/hotels/{id}/images` | ADMIN |
| POST | `/rooms/{id}/images` | ADMIN |
| PATCH | `/images/{id}` | ADMIN |
| DELETE | `/images/{id}` | ADMIN |
| GET | `/hotels/{id}/reviews` | public |
| POST | `/hotels/{id}/reviews` | auth |
| PATCH | `/reviews/{id}` | owner |
| DELETE | `/reviews/{id}` | owner \| ADMIN |
| GET | `/favorites` | auth |
| POST | `/favorites/{hotel_id}` | auth |
| DELETE | `/favorites/{hotel_id}` | auth |
| GET | `/bookings` | CLIENT (own) / ADMIN (all) |
| GET | `/bookings/{id}` | owner \| ADMIN |
| POST | `/bookings` | CLIENT \| ADMIN |
| PATCH | `/bookings/{id}/cancel` | owner \| ADMIN |
| PATCH | `/bookings/{id}` | ADMIN |

Все пути относительно **`/api/v1`**.
