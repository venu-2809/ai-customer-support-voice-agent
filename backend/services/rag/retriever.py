from models.product import Product
from models.customer import Customer
from models.order import Order
from models.complaint import Complaint

class BusinessRetriever:
    @staticmethod
    def retrieve(message: str, db):
        message = message.lower()
        products = db.query(Product).all()
        for product in products:
            if product.name.lower() in message:
                return {
                    "type": "product",
                    "data": product
                }
        customers = db.query(Customer).all()
        for customer in customers:
            if customer.name.lower() in message:
                return {
                    "type": "customer",
                    "data": customer
                }
        if "order" in message:
            order = db.query(Order).first()
            if order:
                return {
                    "type": "order",
                    "data": order
                }
        if "complaint" in message:
            complaint = db.query(Complaint).first()
            if complaint:
                return {
                    "type": "complaint",
                    "data": complaint
                }
        return None