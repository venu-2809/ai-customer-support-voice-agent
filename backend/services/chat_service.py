from sqlalchemy.orm import Session
from services.conversation_service import conversation_service
from services.llm_service import llm_service

class ChatService:
    def chat(self,db: Session,message:str,session_id: str | None=None):
        if session_id is None:
            conversation = conversation_service.create_conversation(db)
        else:
            conversation = conversation_service.get_conversation(db,session_id)
            if conversation is None:
                conversation = conversation_service.create_conversation(db)
        conversation_service.save_message(db=db,conversation_id=conversation.id,role="user",content=message)
        history = conversation_service.get_messages(db,conversation.id)
        response = llm_service.generate_reply(history,db)
        conversation_service.save_message(db=db,conversation_id=conversation.id,role="assistant",content=response["reply"])
        return {
            "session_id": conversation.session_id,
            "reply": response["reply"]
        }
chat_service = ChatService()