import os
import json
from fastapi import APIRouter
from app.config import settings
from app.nlp.classifier import classifier_engine

router = APIRouter()

@router.get("/model/metrics")
def get_model_metrics():
    """
    Returns actual evaluation metrics (Precision, Recall, F1, Accuracy, Dataset size)
    from saved evaluation reports.
    """
    report_file = settings.REPORT_PATH
    
    if os.path.exists(report_file):
        try:
            with open(report_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            return {
                "success": True,
                "evaluated": True,
                "model_status": "Trained ML Model (TF-IDF + Logistic Regression)",
                "metrics": data
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to read evaluation report: {e}"
            }

    return {
        "success": True,
        "evaluated": False,
        "model_status": "Baseline Model / Rule-Assisted Engine",
        "message": "Model has not yet been evaluated. Run `python backend/scripts/train_classifier.py` to train and evaluate.",
        "metrics": None
    }
