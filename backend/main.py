from fastapi import FastAPI
from database import Base
from database import engine
from models.conversation import Conversation
from models.message import Message
from fastapi.middleware.cors import CORSMiddleware
from routers.chat import router as chat_router
from routers.health import router as health_router
from routers.speech import router as speech_router

app = FastAPI(title="AI Voice Service Agent")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
Base.metadata.create_all(bind=engine)
app.include_router(chat_router)
app.include_router(health_router)
app.include_router(speech_router)