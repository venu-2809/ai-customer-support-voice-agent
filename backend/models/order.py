from sqlalchemy import Column, Integer, String, ForeignKey, Date
from database import Base


class Order(Base):
    __tablename__ = "orders"

    order_id = Column(Integer, primary_key=True, index=True)

    customer_id = Column(
        Integer,
        ForeignKey("customers.customer_id"),
        nullable=False,
    )

    product_id = Column(
        Integer,
        ForeignKey("products.product_id"),
        nullable=False,
    )

    quantity = Column(Integer)

    status = Column(String(50))

    order_date = Column(Date)

    delivery_date = Column(Date)