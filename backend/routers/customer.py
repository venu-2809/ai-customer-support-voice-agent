from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.customer import Customer
from schemas.customer import CustomerCreate

router = APIRouter(
    prefix="/customers",
    tags=["Customers"]
)


@router.get("/")
def get_customers(db: Session = Depends(get_db)):
    return db.query(Customer).all()
@router.post("/")
def create_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db),
):
    new_customer = Customer(
        name=customer.name,
        phone=customer.phone,
        email=customer.email,
    )

    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    return new_customer