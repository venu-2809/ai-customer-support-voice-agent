from sqlalchemy import Column, Integer, String, Float
from database import Base


class Product(Base):
    __tablename__ = "products"

    product_id = Column(Integer, primary_key=True, index=True)

    name = Column(String(150), nullable=False)

    category = Column(String(100))

    price = Column(Float)

    description = Column(String(500))

    warranty = Column(String(100))

    stock = Column(Integer)