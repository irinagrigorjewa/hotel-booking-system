def escape_like(value: str) -> str:
    r"""Escape `\`, `%`, and `_` for SQL LIKE/ILIKE patterns."""
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
