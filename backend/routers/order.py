from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.order import Order

router = APIRouter( prefix="/orders", tags=["Orders"])


@router.get("/")
def get_orders(db: Session = Depends(get_db)):
    return db.query(Order).all()