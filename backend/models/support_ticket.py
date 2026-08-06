from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from database import Base


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    ticket_id = Column(Integer, primary_key=True, index=True)

    complaint_id = Column(
        Integer,
        ForeignKey("complaints.complaint_id"),
        nullable=False,
    )

    priority = Column(String(30))

    status = Column(String(30))

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )