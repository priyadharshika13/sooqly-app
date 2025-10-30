from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "Sooqly Grocery API"
    ENV: str = "dev"
    SECRET_KEY: str = "change-me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60*24
    DATABASE_URL: str = "sqlite:///./grocery.db"  # e.g., "postgresql+psycopg2://user:pass@db:5432/sooqly"
    CORS_ORIGINS: str = "http://localhost:5173, http://127.0.0.1:5173, http://localhost:8081, exp://127.0.0.1:19000"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
settings = Settings()
