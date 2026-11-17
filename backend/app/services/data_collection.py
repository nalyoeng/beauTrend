"""Data ingestion and database seeding.

Replace :func:`seed_database` with a real scraper/ETL job when live sources
(e.g. Google Trends, marketplaces, the provided Excel workbook) are wired in.
Raw files belong in ``data/raw`` and cleaned files in ``data/processed``.
"""

import csv
from datetime import date
from pathlib import Path
from typing import Any

from sqlalchemy.orm import Session

from ..models import Product, TrendPoint
from ..utils.helpers import clamp, period_range, round_value

DATA_DIR = Path(__file__).resolve().parents[2] / "data"

# Demo catalogue. Each spec describes a product and its synthetic trend shape.
SAMPLE_PRODUCTS: list[dict[str, Any]] = [
    {
        "name": "Radiance Glow Serum",
        "brand": "Lumière",
        "category": "Skincare",
        "market": "Cambodia",
        "price": 24.5,
        "base_interest": 58,
        "slope": 2.4,
        "image_url": None,
    },
    {
        "name": "Velvet Matte Lipstick",
        "brand": "Rosewood",
        "category": "Makeup",
        "market": "Cambodia",
        "price": 18.0,
        "base_interest": 72,
        "slope": 1.1,
        "image_url": None,
    },
    {
        "name": "Barrier Repair Cream",
        "brand": "Lumière",
        "category": "Skincare",
        "market": "Vietnam",
        "price": 29.9,
        "base_interest": 46,
        "slope": 3.1,
        "image_url": None,
    },
    {
        "name": "Cica Cooling Sunscreen",
        "brand": "Soléa",
        "category": "Sun Care",
        "market": "Thailand",
        "price": 21.0,
        "base_interest": 64,
        "slope": -0.8,
        "image_url": None,
    },
    {
        "name": "Jasmine Hair Oil",
        "brand": "Botanique",
        "category": "Hair Care",
        "market": "Cambodia",
        "price": 13.5,
        "base_interest": 39,
        "slope": 1.9,
        "image_url": None,
    },
    {
        "name": "Glass Skin Essence",
        "brand": "Aurelle",
        "category": "Skincare",
        "market": "Vietnam",
        "price": 32.0,
        "base_interest": 81,
        "slope": 0.6,
        "image_url": None,
    },
]


def build_sample_points(
    spec: dict[str, Any], periods: list[str], product_index: int
) -> list[dict[str, Any]]:
    """Create deterministic monthly observations for one product spec."""

    points: list[dict[str, Any]] = []
    for month_index, period in enumerate(periods):
        wave = 4 * ((month_index + product_index) % 3 - 1)
        interest = int(
            clamp(
                round_value(
                    spec["base_interest"] + spec["slope"] * month_index + wave, 0
                ),
                1,
                100,
            )
        )
        sales = int(interest * (11 + product_index * 2) + 120 + month_index * 7)
        points.append(
            {
                "period": period,
                "interest": interest,
                "sales": sales,
                "source": "sample",
            }
        )
    return points


def seed_database(db: Session, months: int = 12) -> int:
    """Seed the database with demo products when it is empty.

    Returns the number of products inserted.
    """

    if db.query(Product).count():
        return 0

    today = date.today()
    start_period = f"{today.year - 1:04d}-{today.month:02d}"
    periods = period_range(start_period, months)

    for index, spec in enumerate(SAMPLE_PRODUCTS):
        product = Product(
            name=spec["name"],
            brand=spec["brand"],
            category=spec["category"],
            market=spec["market"],
            price=spec["price"],
            image_url=spec.get("image_url"),
        )
        db.add(product)
        db.flush()
        db.add_all(
            TrendPoint(product_id=product.id, **point)
            for point in build_sample_points(spec, periods, index)
        )

    db.commit()
    return len(SAMPLE_PRODUCTS)


def load_raw_csv(filename: str) -> list[dict[str, str]]:
    """Read a CSV file from ``data/raw`` into a list of dictionaries."""

    path = DATA_DIR / "raw" / filename
    with path.open(newline="", encoding="utf-8-sig") as handle:
        return list(csv.DictReader(handle))
