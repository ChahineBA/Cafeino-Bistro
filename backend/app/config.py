"""
Configuration settings for Cafeino Bistro POS Backend
Loads environment variables and provides application settings
"""
from pydantic_settings import BaseSettings
from typing import Optional
import os
from pathlib import Path


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # MongoDB Configuration
    MONGODB_URL: str
    DATABASE_NAME: str = "cafeino_pos"
    
    # JWT Configuration
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # CORS Configuration
    CORS_ORIGINS: list = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    class Config:
        env_file = str(Path(__file__).parent.parent / ".env")
        env_file_encoding = 'utf-8'
        case_sensitive = True


# Global settings instance
settings = Settings()
