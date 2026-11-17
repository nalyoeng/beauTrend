"""Pydantic request and response schemas."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ORMModel(BaseModel):
    """Base model that can be built from SQLAlchemy objects."""

    model_config = ConfigDict(from_attributes=True)


class ProductBase(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    brand: str = Field(min_length=1, max_length=120)
    category: str = Field(min_length=1, max_length=80)
    market: str = Field(min_length=1, max_length=80)
    price: float = Field(default=0.0, ge=0)
    image_url: str | None = None


class ProductCreate(ProductBase):
    pass


class ProductOut(ORMModel, ProductBase):
    id: int
    created_at: datetime | None = None


class TrendPointOut(ORMModel):
    period: str
    interest: int
    sales: int
    source: str


class TrendSeriesOut(BaseModel):
    product: ProductOut
    points: list[TrendPointOut]
    analysis: dict[str, Any]


class OverviewOut(BaseModel):
    total_products: int
    total_markets: int
    total_categories: int
    average_growth: float
    top_category: str
    last_updated: str
    recent_activity: list[dict[str, Any]]


class ForecastPoint(BaseModel):
    period: str
    predicted: float
    lower: float
    upper: float


class ForecastOut(BaseModel):
    product_id: int
    product_name: str
    method: str
    horizon: int
    points: list[ForecastPoint]


class ReportCreate(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    author: str = Field(default="BeauTrend Analyst", max_length=120)
    product_ids: list[int] = Field(default_factory=list)
    include_forecast: bool = True
    horizon: int = Field(default=3, ge=1, le=12)


class ReportOut(ORMModel):
    id: int
    title: str
    author: str
    payload: dict[str, Any]
    created_at: datetime
