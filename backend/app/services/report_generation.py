"""Assemble report payloads from trend analysis and forecasts."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import Product, Report
from .data_processing import to_values
from .forecasting import forecast
from .trend_analysis import analyze_series


def build_report(
    db: Session,
    *,
    title: str,
    author: str = "BeauTrend Analyst",
    product_ids: list[int] | None = None,
    include_forecast: bool = True,
    horizon: int = 3,
) -> Report:
    """Create and persist a report built from the selected products."""

    stmt = select(Product).order_by(Product.id)
    if product_ids:
        stmt = stmt.where(Product.id.in_(product_ids))
    products = list(db.scalars(stmt).unique())

    sections: list[dict] = []
    for product in products:
        points = sorted(product.trend_points, key=lambda point: point.period)
        values = to_values(points)
        last_period = points[-1].period if points else None
        section: dict = {
            "product_id": product.id,
            "name": product.name,
            "brand": product.brand,
            "category": product.category,
            "market": product.market,
            "analysis": analyze_series(values),
        }
        if include_forecast:
            section["forecast"] = forecast(values, horizon, last_period)
        sections.append(section)

    payload = {
        "title": title,
        "author": author,
        "product_count": len(products),
        "sections": sections,
        "takeaway": _takeaway(sections),
    }

    report = Report(title=title, author=author, payload=payload)
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


def _takeaway(sections: list[dict]) -> str:
    if not sections:
        return "No products selected; nothing to summarise."
    best = max(sections, key=lambda item: item["analysis"]["change_pct"])
    return (
        f"{best['name']} shows the strongest momentum "
        f"({best['analysis']['change_pct']:+}%)."
    )
