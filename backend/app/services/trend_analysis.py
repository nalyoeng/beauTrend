"""Trend metrics used by the overview, trends and report endpoints."""

from collections.abc import Sequence
from typing import Any

from ..utils.helpers import round_value


def growth_rate(values: Sequence[float]) -> float:
    """Percentage change between the first and last value."""

    if len(values) < 2 or values[0] == 0:
        return 0.0
    return round_value((values[-1] - values[0]) / abs(values[0]) * 100)


def moving_average(values: Sequence[float], window: int = 3) -> list[float]:
    """Simple trailing moving average (shorter window at the start)."""

    if window < 1:
        raise ValueError("window must be at least 1")
    result: list[float] = []
    for index in range(len(values)):
        chunk = values[max(0, index - window + 1) : index + 1]
        result.append(round_value(sum(chunk) / len(chunk)))
    return result


def analyze_series(values: Sequence[float]) -> dict[str, Any]:
    """Summarise direction, momentum and volatility of a numeric series."""

    if not values:
        return {
            "direction": "stable",
            "change_pct": 0.0,
            "average": 0.0,
            "peak": 0.0,
            "latest": 0.0,
            "volatility": 0.0,
        }

    change = growth_rate(values)
    average = sum(values) / len(values)
    mean_diffs = (
        [abs(values[i] - values[i - 1]) for i in range(1, len(values))]
        if len(values) > 1
        else [0.0]
    )

    if change > 2:
        direction = "rising"
    elif change < -2:
        direction = "cooling"
    else:
        direction = "stable"

    return {
        "direction": direction,
        "change_pct": change,
        "average": round_value(average),
        "peak": round_value(max(values)),
        "latest": round_value(values[-1]),
        "volatility": round_value(sum(mean_diffs) / len(mean_diffs)),
    }


def rank_series(
    series_map: dict[int, dict[str, Any]], limit: int | None = None
) -> list[dict[str, Any]]:
    """Rank products by their trend change percentage (descending)."""

    ranked = sorted(
        (
            {"product_id": product_id, **analysis}
            for product_id, analysis in series_map.items()
        ),
        key=lambda item: item["change_pct"],
        reverse=True,
    )
    return ranked[:limit] if limit else ranked
