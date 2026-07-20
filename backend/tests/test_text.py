from app.core.text import escape_like


def test_escape_like_escapes_percent_underscore_and_backslash() -> None:
    assert escape_like("100%") == "100\\%"
    assert escape_like("a_b") == "a\\_b"
    assert escape_like("a\\b") == "a\\\\b"
    assert escape_like("100%_x\\") == "100\\%\\_x\\\\"
