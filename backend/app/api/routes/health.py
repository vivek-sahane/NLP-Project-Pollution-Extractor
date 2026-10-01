from fastapi import APIRouter
from app.services.database_service import db_service
from app.nlp.classifier import classifier_engine

router = APIRouter()

@router.get("/health")
def health_check():
    """Health check endpoint returning system status and model readiness."""
    return {
        "status": "ok",
        "database": "connected" if db_service.is_mongodb_connected else "local_store_fallback",
        "model_status": "trained_joblib" if classifier_engine.is_trained_model_loaded else "rule_baseline"
    }
