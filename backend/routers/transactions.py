from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas import TransactionOut
from crud import get_transactions
from typing import List

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("/", response_model=List[TransactionOut])
def list_transactions(db: Session = Depends(get_db)):
    return get_transactions(db)
