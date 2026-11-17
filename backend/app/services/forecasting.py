"""Lightweight deterministic forecasting (ordinary least squares)."""

from collections.abc import Sequence
from typing import Any

from ..utils.helpers import period_add, round_value


def linear_regression(values: Sequence[float]) -> tuple[float, float]:
    """Return ``(slope, intercept)`` for ``y = slope * x + intercept``."""

    if not values:
        return 0.0, 0.0
    n = len(values)
    x_mean = (n - 1) / 2
    y_mean = sum(values) / n
    denominator = sum((index - x_mean) ** 2 for index in range(n))
    if denominator == 0:
        return 0.0, y_mean
    numerator = sum((index - x_mean) * (value - y_mean) for index, value in enumerate(values))
    slope = numerator / denominator
    return slope, y_mean - slope * x_mean


def forecast(
    values: Sequence[float],
    months: int = 3,
    last_period: str | None = None,
) -> list[dict[str, Any]]:
    """Forecast the next ``months`` values with an approximate 95% band."""

    if months < 1:
        raise ValueError("months must be at least 1")

    slope, intercept = linear_regression(values)
    fitted = [slope * index + intercept for index in range(len(values))]
    residuals = [
        actual - predicted for actual, predicted in zip(values, fitted, strict=False)
    ]
    variance = sum(residual**2 for residual in residuals) / len(values) if values else 0.0
    margin = 1.96 * (variance**0.5)

    start = len(values)
    periods = [
        period_add(last_period, offset) if last_period else f"M{start + offset:02d}"
        for offset in range(1, months + 1)
    ]

    result: list[dict[str, Any]] = []
    for offset, period in enumerate(periods, start=1):
        x = start + offset - 1
        predicted = slope * x + intercept
        result.append(
            {
                "period": period,
                "predicted": round_value(predicted),
                "lower": round_value(max(0.0, predicted - margin)),
                "upper": round_value(predicted + margin),
            }
        )
    return result
