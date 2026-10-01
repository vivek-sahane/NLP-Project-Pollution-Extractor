from fastapi import APIRouter
from app.services.database_service import db_service

router = APIRouter()

@router.get("/dashboard/stats")
def get_dashboard_statistics():
    """Returns analytics data for Recharts dashboard visualizations."""
    stats = db_service.get_dashboard_stats()
    return {"success": True, "data": stats}
