"""Trend analysis endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Product
from ..schemas import TrendSeriesOut
from ..services.data_processing import to_values
from ..services.trend_analysis import analyze_series

router = APIRouter(prefix="/trends", tags=["trends"])


def _series(product: Product) -> dict:
    points = sorted(product.trend_points, key=lambda point: point.period)
    return {
        "product": product,
        "points": [
            {
                "period": point.period,
                "interest": point.interest,
                "sales": point.sales,
                "source": point.source,
            }
            for point in points
        ],
        "analysis": analyze_series(to_values(points)),
    }


@router.get("", response_model=list[TrendSeriesOut])
def list_trends(
    category: str | None = None,
    market: str | None = None,
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return trend series, optionally filtered by category and market."""

    stmt = select(Product)
    if category:
        stmt = stmt.where(Product.category.ilike(f"%{category}%"))
    if market:
        stmt = stmt.where(Product.market.ilike(f"%{market}%"))
    products = list(db.scalars(stmt.order_by(Product.id)).unique())
    return [_series(product) for product in products]


@router.get("/{product_id}", response_model=TrendSeriesOut)
def get_trend(product_id: int, db: Session = Depends(get_db)) -> dict:
    """Return the trend series for a single product."""

    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return _series(product)
