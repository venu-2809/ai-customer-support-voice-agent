from config.settings import settings
from groq import Groq

client = Groq(api_key=settings.GROQ_API_KEY)
class GroqService:
    def transcribe(self, audio_path: str):
        with open(audio_path, "rb") as audio:
            transcription = client.audio.transcriptions.create(
                file=audio,
                model="whisper-large-v3-turbo",
                response_format="verbose_json",
                language="en"
            )

        return transcription.text


groq_service = GroqService()