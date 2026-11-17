"""Dashboard overview endpoint."""

from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Product
from ..schemas import OverviewOut
from ..services.data_processing import to_values
from ..services.trend_analysis import analyze_series

router = APIRouter(prefix="/overview", tags=["overview"])


@router.get("", response_model=OverviewOut)
def get_overview(db: Session = Depends(get_db)) -> dict:
    """Return headline metrics and recent product movement."""

    products = list(db.scalars(select(Product)).unique())
    analyses: dict[int, dict] = {}
    last_updated = ""
    activity: list[dict] = []

    for product in products:
        points = sorted(product.trend_points, key=lambda point: point.period)
        analysis = analyze_series(to_values(points))
        analyses[product.id] = analysis
        if points:
            last_updated = max(last_updated, points[-1].period)
            activity.append(
                {
                    "product_id": product.id,
                    "name": product.name,
                    "category": product.category,
                    "market": product.market,
                    "direction": analysis["direction"],
                    "change_pct": analysis["change_pct"],
                    "period": points[-1].period,
                }
            )

    growths = [item["change_pct"] for item in analyses.values()]
    categories = Counter(product.category for product in products)
    activity.sort(key=lambda item: abs(item["change_pct"]), reverse=True)

    return {
        "total_products": len(products),
        "total_markets": len({product.market for product in products}),
        "total_categories": len(categories),
        "average_growth": round(sum(growths) / len(growths), 2) if growths else 0.0,
        "top_category": categories.most_common(1)[0][0] if categories else "-",
        "last_updated": last_updated,
        "recent_activity": activity[:5],
    }
