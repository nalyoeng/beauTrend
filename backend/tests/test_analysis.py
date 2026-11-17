"""Unit tests for trend analysis helpers."""

from app.services.trend_analysis import (
    analyze_series,
    growth_rate,
    moving_average,
    rank_series,
)


def test_growth_rate() -> None:
    assert growth_rate([100, 110]) == 10.0
    assert growth_rate([50, 40]) == -20.0
    assert growth_rate([]) == 0.0
    assert growth_rate([0, 10]) == 0.0


def test_moving_average() -> None:
    assert moving_average([1, 2, 3, 4], window=2) == [1.0, 1.5, 2.5, 3.5]
    assert moving_average([], window=3) == []


def test_analyze_series_directions() -> None:
    assert analyze_series([10, 20, 30])["direction"] == "rising"
    assert analyze_series([30, 20, 10])["direction"] == "cooling"
    assert analyze_series([10, 10, 10])["direction"] == "stable"
    assert analyze_series([])["latest"] == 0.0


def test_rank_series() -> None:
    series_map = {1: {"change_pct": 5.0}, 2: {"change_pct": -3.0}, 3: {"change_pct": 12.0}}
    ranked = rank_series(series_map, limit=2)
    assert [item["product_id"] for item in ranked] == [3, 1]
