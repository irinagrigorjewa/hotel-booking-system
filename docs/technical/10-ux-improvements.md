# 10. UX-улучшения (журнал)

Зафиксированные улучшения продукта поверх MVP.

---

## 1. Отображение фото отелей и номеров (2026-07-20)

**Проблема:** API возвращает относительные URL `/media/...`, браузер запрашивал их с origin frontend (`5173`), файлы лежат на backend (`8000`).

**Решение:**

| Слой | Изменение |
|------|-----------|
| Vite dev | Proxy `/media` → backend |
| nginx (Compose) | `location /media/` → `http://backend:8000` |
| Frontend | `frontend/src/utils/mediaUrl.ts` — same-origin path или absolute origin из `VITE_API_BASE_URL` |
| UI | `HotelCard`, `HotelGallery` используют `mediaUrl()` |

**Проверка:**

```bash
cd frontend && npx vitest run src/utils/mediaUrl.test.ts
curl -I http://localhost:8000/media/hotels/...
curl -I http://localhost:5173/media/hotels/...   # Compose/nginx или Vite proxy
```

На `/hotels` видны обложки seed-отелей; галерея на `/hotels/:id`.

---

## 4. MUI theme + public polish (2026-07-20)

**Цель:** брендированная MUI-тема на публичных экранах без редизайна admin tables/drawer.

**Тема** (`frontend/src/theme/theme.ts` + `ThemeProvider`/`CssBaseline` в `main.tsx`):

| Токен | Значение |
|-------|----------|
| `palette.primary` | indigo `#3949ab` |
| `palette.secondary` | teal `#00897b` |
| `shape.borderRadius` | `12` |
| `MuiButton.textTransform` | `none` |

**Публичный UI:**

| Экран / компонент | Изменение |
|-------------------|-----------|
| `PublicLayout` | sticky `AppBar` `color="primary"` |
| `HomePage` | hero-блок (primary фон, поиск city + CTA secondary) |
| `HotelCard` | hover elevation; placeholder «Нет фото» / `No photo` если `mediaUrl(cover)` пуст |
| `AuthLayout` | бренд-ссылка `primary.main` (навигация r07.2 сохранена) |

Admin CRUD / tables / drawer **не** переделывались — наследуют палитру темы без отдельного layout redesign.

**Проверка:**

```bash
cd frontend && npx vitest run src/App.test.tsx src/pages/HomePage.test.tsx src/components/hotels/HotelCard.test.tsx
cd frontend && npx tsc --noEmit
# ручной обход: /, /hotels, /hotels/map, /login — AppBar primary; карточки с hover/placeholder
```

---

## Связанные тесты

```bash
cd frontend && npx vitest run src/utils/mediaUrl.test.ts
cd frontend && npx vitest run src/App.test.tsx src/pages/HomePage.test.tsx src/components/hotels/HotelCard.test.tsx
```

---

## Что остаётся в backlog

- Отдельный `AdminLayout` с drawer
- Полный редизайн admin-таблиц
