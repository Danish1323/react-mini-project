from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import SupplierCreate, SupplierOut
from crud import get_suppliers, create_supplier, delete_supplier
from typing import List

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])


@router.get("/", response_model=List[SupplierOut])
def list_suppliers(db: Session = Depends(get_db)):
    return get_suppliers(db)


@router.post("/", response_model=SupplierOut)
def add_supplier(supplier: SupplierCreate, db: Session = Depends(get_db)):
    return create_supplier(db, supplier)


@router.delete("/{supplier_id}")
def remove_supplier(supplier_id: int, db: Session = Depends(get_db)):
    result = delete_supplier(db, supplier_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return {"message": "Supplier deleted successfully"}
