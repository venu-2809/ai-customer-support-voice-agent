from pydantic import BaseModel, EmailStr
class CustomerCreate(BaseModel):
    name: str
    phone: str
    email: EmailStr