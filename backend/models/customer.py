from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base


class Customer(Base):
    __tablename__ = "customers"

    customer_id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    phone = Column(String(20), unique=True, nullable=False)

    email = Column(String(100), unique=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )