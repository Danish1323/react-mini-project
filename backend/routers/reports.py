from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from crud import get_category_stock_report, get_low_stock_report, get_profit_summary

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/category-stock")
def category_stock(db: Session = Depends(get_db)):
    return get_category_stock_report(db)


@router.get("/low-stock")
def low_stock(db: Session = Depends(get_db)):
    return get_low_stock_report(db)


@router.get("/profit-summary")
def profit_summary(db: Session = Depends(get_db)):
    return get_profit_summary(db)
