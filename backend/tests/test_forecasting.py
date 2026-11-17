"""Unit tests for the forecasting service."""

from app.services.forecasting import forecast, linear_regression
from app.utils.helpers import period_add


def test_linear_regression() -> None:
    slope, intercept = linear_regression([1, 2, 3, 4])
    assert slope == 1.0
    assert intercept == 1.0
    assert linear_regression([]) == (0.0, 0.0)


def test_forecast_shape_and_periods() -> None:
    values = [10, 12, 14, 16]
    result = forecast(values, months=3, last_period="2026-09")

    assert len(result) == 3
    assert [point["period"] for point in result] == [
        "2026-10",
        "2026-11",
        "2026-12",
    ]
    assert all(point["lower"] <= point["predicted"] <= point["upper"] for point in result)


def test_forecast_empty_series() -> None:
    result = forecast([], months=2)
    assert len(result) == 2
    assert all(point["predicted"] == 0 for point in result)


def test_period_add() -> None:
    assert period_add("2026-12", 1) == "2027-01"
    assert period_add("2026-01", -1) == "2025-12"
