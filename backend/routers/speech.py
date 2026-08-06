from fastapi import APIRouter, UploadFile, File, HTTPException
from services.groq_service import groq_service
import tempfile
import shutil
import os

router = APIRouter(
    prefix="/speech",
    tags=["Speech"]
)


@router.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):

    suffix = os.path.splitext(audio.filename)[1] or ".webm"

    temp = tempfile.NamedTemporaryFile(delete=False,suffix=suffix)

    try:
        shutil.copyfileobj(audio.file, temp)
        temp.close()
        text = groq_service.transcribe(temp.name)
        return {
            "text": text
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if os.path.exists(temp.name):

            os.remove(temp.name)