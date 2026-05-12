from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import ProductCreate, ProductOut
from crud import get_products, create_product, delete_product
from typing import List

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/", response_model=List[ProductOut])
def list_products(db: Session = Depends(get_db)):
    return get_products(db)


@router.post("/", response_model=ProductOut)
def add_product(product: ProductCreate, db: Session = Depends(get_db)):
    return create_product(db, product)


@router.delete("/{product_id}")
def remove_product(product_id: int, db: Session = Depends(get_db)):
    result = delete_product(db, product_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

@router.patch("/{product_id}/restock", response_model=ProductOut)
def restock(product_id: int, payload: __import__('schemas').ProductRestock, db: Session = Depends(get_db)):
    if payload.quantity_added <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be positive")
    
    # Needs to import restock_product from crud
    from crud import restock_product
    updated = restock_product(db, product_id, payload.quantity_added)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated
