from pydantic_settings import BaseSettings, SettingsConfigDict
class Settings(BaseSettings):
    APP_NAME: str = "Sooqly API"
    SECRET_KEY: str = "change-me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60*24
    DATABASE_URL: str = "sqlite:///./sooqly.db"
    CORS_ORIGINS: str = "http://localhost:5173, http://127.0.0.1:5173"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
settings = Settings()
