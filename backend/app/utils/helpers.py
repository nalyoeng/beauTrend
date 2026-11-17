"""Small, dependency-free helpers shared across services and routes."""

import re
from typing import Any


def clamp(value: float, low: float, high: float) -> float:
    """Clamp ``value`` into the inclusive ``[low, high]`` range."""

    return max(low, min(high, value))


def safe_float(value: Any, default: float = 0.0) -> float:
    """Convert a value to float, falling back to ``default`` on failure."""

    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def safe_int(value: Any, default: int = 0) -> int:
    """Convert a value to int, falling back to ``default`` on failure."""

    try:
        return int(float(value))
    except (TypeError, ValueError):
        return default


def slugify(text: str) -> str:
    """Return a lowercase, dash-separated slug."""

    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def period_add(period: str, months: int) -> str:
    """Shift a ``YYYY-MM`` period by ``months`` and return a new period."""

    year, month = (int(part) for part in period.split("-")[:2])
    total = year * 12 + (month - 1) + months
    return f"{total // 12:04d}-{total % 12 + 1:02d}"


def period_range(start: str, months: int) -> list[str]:
    """Build a list of consecutive ``YYYY-MM`` periods."""

    return [period_add(start, offset) for offset in range(months)]


def round_value(value: float, digits: int = 2) -> float:
    """Round a value, returning ``0.0`` when it is not finite."""

    if value != value or value in (float("inf"), float("-inf")):
        return 0.0
    return round(value, digits)
