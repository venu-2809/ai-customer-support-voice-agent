from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.complaint import Complaint
from schemas.complaint import ComplaintCreate

router = APIRouter( prefix="/complaints", tags=["Complaints"])

@router.get("/")
def get_complaints(db: Session = Depends(get_db)):
    return db.query(Complaint).all()
@router.post("/")
def create_complaint(complaint: ComplaintCreate,db: Session = Depends(get_db)):
    new_complaint = Complaint(
        customer_id=complaint.customer_id,
        order_id=complaint.order_id,
        complaint_type=complaint.complaint_type,
        description=complaint.description,
        status=complaint.status,
    )
    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)
    return new_complaint