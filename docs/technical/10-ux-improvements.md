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

## Связанные тесты

```bash
cd frontend && npx vitest run src/utils/mediaUrl.test.ts
```

---

## Что остаётся в backlog

- Навигация на экранах login/register (бренд → `/`, LanguageSwitcher)
- Поиск по городу: partial match + debounce
- MUI theme / public polish (без admin redesign)
- Отдельный `AdminLayout` с drawer
- Полный редизайн admin-таблиц
