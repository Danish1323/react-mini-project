from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import SaleCreate, SaleOut
from crud import get_sales, create_sale
from typing import List

router = APIRouter(prefix="/sales", tags=["Sales"])


@router.get("/", response_model=List[SaleOut])
def list_sales(db: Session = Depends(get_db)):
    return get_sales(db)


@router.post("/")
def record_sale(sale: SaleCreate, db: Session = Depends(get_db)):
    result = create_sale(db, sale)
    # If crud returned an error dict
    if isinstance(result, dict) and "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result
