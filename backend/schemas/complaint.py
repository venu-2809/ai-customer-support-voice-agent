from pydantic import BaseModel

class ComplaintCreate(BaseModel):
    customer_id: int
    order_id: int
    complaint_type: str
    description: str
    status: str