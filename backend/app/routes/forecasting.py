"""Forecasting endpoint."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Product
from ..schemas import ForecastOut
from ..services.data_processing import to_values
from ..services.forecasting import forecast

router = APIRouter(prefix="/forecasting", tags=["forecasting"])


@router.get("/{product_id}", response_model=ForecastOut)
def get_forecast(
    product_id: int,
    months: int = Query(default=3, ge=1, le=12),
    db: Session = Depends(get_db),
) -> dict:
    """Forecast interest for a product over the next ``months`` periods."""

    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    points = sorted(product.trend_points, key=lambda point: point.period)
    values = to_values(points)
    return {
        "product_id": product.id,
        "product_name": product.name,
        "method": "ordinary-least-squares",
        "horizon": months,
        "points": forecast(values, months, points[-1].period if points else None),
    }
