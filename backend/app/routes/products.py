"""Product catalogue endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Product
from ..schemas import ProductCreate, ProductOut

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=list[ProductOut])
def list_products(
    category: str | None = None,
    market: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
) -> list[Product]:
    """List products with optional filters."""

    stmt = select(Product)
    if category:
        stmt = stmt.where(Product.category.ilike(f"%{category}%"))
    if market:
        stmt = stmt.where(Product.market.ilike(f"%{market}%"))
    if search:
        stmt = stmt.where(Product.name.ilike(f"%{search}%"))
    return list(db.scalars(stmt.order_by(Product.id)).unique())


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)) -> Product:
    """Fetch a single product by id."""

    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post(
    "", response_model=ProductOut, status_code=status.HTTP_201_CREATED
)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)) -> Product:
    """Add a product to the catalogue."""

    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product
