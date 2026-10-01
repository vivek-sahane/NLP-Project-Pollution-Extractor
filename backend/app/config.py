import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Pollution Source Extractor"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "pollution_extractor_db")
    
    # CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000"
    ]
    
    # Model Paths
    MODEL_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "models")
    CLASSIFIER_PATH: str = os.path.join(MODEL_DIR, "pollution_classifier.joblib")
    VECTORIZER_PATH: str = os.path.join(MODEL_DIR, "tfidf_vectorizer.joblib")
    REPORT_PATH: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "reports", "classification_report.json")
    
    class Config:
        case_sensitive = True

settings = Settings()
