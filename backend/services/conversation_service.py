import uuid
from sqlalchemy.orm import Session
from models.conversation import Conversation
from models.message import Message


class ConversationService:

    def create_conversation(self, db: Session):
        conversation = Conversation(session_id=str(uuid.uuid4()))
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        return conversation

    def get_conversation(self, db: Session, session_id: str):
        return (db.query(Conversation).filter(Conversation.session_id == session_id).first())

    def save_message(self,db: Session,conversation_id: int,role: str,content: str,):
        message = Message(conversation_id=conversation_id,role=role,content=content,)
        db.add(message)
        db.commit()
        return message

    def get_messages(self,db: Session,conversation_id: int,):
        return (
            db.query(Message).filter(Message.conversation_id == conversation_id) .order_by(Message.created_at.asc()).all()
        )


conversation_service = ConversationService()