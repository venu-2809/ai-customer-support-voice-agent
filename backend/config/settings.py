from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    GEMINI_API_KEY: str
    GROQ_API_KEY: str
    APP_NAME: str="AI Voice Service Agent"
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )
settings = Settings()