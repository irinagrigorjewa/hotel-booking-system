# Техническая документация

Подробная разборка спецификации [`DESC.md`](../../DESC.md) по разделам. Для разработчиков и аналитиков: API, домен, архитектура, CI, этапы поставки.

| # | Раздел | Документ |
|---|--------|----------|
| 1 | Scope | [01-scope.md](01-scope.md) |
| 2 | Actors и use cases | [02-actors-use-cases.md](02-actors-use-cases.md) |
| 3 | Доменная модель | [03-domain-model.md](03-domain-model.md) |
| 4 | API-контракт | [04-api-contract.md](04-api-contract.md) |
| 5 | Архитектура и стек | [05-architecture-stack.md](05-architecture-stack.md) |
| 6 | UI: маршруты и экраны | [06-ui-routes-screens.md](06-ui-routes-screens.md) |
| 7 | Качество, Docker, CI | [07-quality-docker-ci.md](07-quality-docker-ci.md) |
| 8 | План поставки | [08-delivery-plan.md](08-delivery-plan.md) |
| 9 | Acceptance criteria | [09-acceptance-criteria.md](09-acceptance-criteria.md) |

## Рекомендуемый порядок чтения

1. **Scope** → границы MVP  
2. **Actors / UC** → сценарии и роли  
3. **Domain** → сущности и инварианты  
4. **API** → контракт эндпоинтов  
5. **Architecture** → слои и структура репо  
6. **UI** → экраны и guards  
7. **Quality / CI** → тесты и пайплайн  
8. **Delivery** → этапы 1–10  
9. **Acceptance** → чеклист приёмки  

## Источник

Исходная спецификация: [`DESC.md`](../../DESC.md). При расхождении приоритет у `DESC.md`, пока расхождение не согласовано явно.

Пользовательские гайды: [`docs/user/`](../user/).
