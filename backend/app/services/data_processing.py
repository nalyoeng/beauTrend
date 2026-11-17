"""Cleaning and reshaping helpers for collected data."""

from collections import defaultdict
from collections.abc import Mapping
from typing import Any, Iterable

from ..utils.helpers import safe_float, safe_int

REQUIRED_FIELDS = ("product_id", "period", "interest")


def clean_records(records: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    """Drop incomplete rows and coerce numeric fields."""

    cleaned: list[dict[str, Any]] = []
    for record in records:
        if not all(record.get(field) not in (None, "") for field in REQUIRED_FIELDS):
            continue
        period = str(record["period"])[:7]
        if len(period) != 7 or period[4] != "-":
            continue
        cleaned.append(
            {
                "product_id": safe_int(record["product_id"]),
                "period": period,
                "interest": safe_int(record["interest"]),
                "sales": safe_int(record.get("sales", 0)),
                "source": str(record.get("source", "imported")),
            }
        )
    return cleaned


def group_by_product(
    points: Iterable[dict[str, Any]],
) -> dict[int, list[dict[str, Any]]]:
    """Group observations by product id, sorted chronologically."""

    grouped: dict[int, list[dict[str, Any]]] = defaultdict(list)
    for point in points:
        grouped[point["product_id"]].append(point)
    for series in grouped.values():
        series.sort(key=lambda item: item["period"])
    return dict(grouped)


def to_values(
    points: Iterable[dict[str, Any] | object], field: str = "interest"
) -> list[float]:
    """Extract one numeric field from dict records or ORM objects."""

    values: list[float] = []
    for point in points:
        raw = point.get(field) if isinstance(point, Mapping) else getattr(point, field, None)
        values.append(safe_float(raw))
    return values


def to_frame(points: Iterable[dict[str, Any]]):
    """Return a pandas DataFrame (imported lazily) for exploratory analysis."""

    import pandas as pd  # local import keeps API startup lightweight

    return pd.DataFrame(list(points))
