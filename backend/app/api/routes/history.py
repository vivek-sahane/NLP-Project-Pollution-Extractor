from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.models.analysis import SaveAnalysisRequest
from app.services.database_service import db_service

router = APIRouter()

@router.post("/analyze/save")
def save_analysis(payload: SaveAnalysisRequest):
    """Save an analysis result to persistent database/store."""
    if not payload.result:
        raise HTTPException(status_code=400, detail="Result object cannot be empty.")
    
    saved_doc = db_service.save_analysis(payload.result)
    return {"success": True, "message": "Analysis saved successfully", "data": saved_doc}

@router.get("/analyses")
def get_analyses_history(
    search: Optional[str] = Query(None, description="Search query string"),
    category: Optional[str] = Query(None, description="Filter by pollution category"),
    source_category: Optional[str] = Query(None, description="Filter by source category"),
    severity: Optional[str] = Query(None, description="Filter by severity level"),
    sort_by: str = Query("newest", description="Sort order: newest or oldest"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    date_from: Optional[str] = Query(None, pattern=r"^\d{4}-\d{2}-\d{2}$"),
    date_to: Optional[str] = Query(None, pattern=r"^\d{4}-\d{2}-\d{2}$"),
):
    """Retrieve paginated analysis history with search and filtering."""
    result = db_service.get_analyses(
        search=search,
        category=category,
        source_category=source_category,
        severity=severity,
        sort_by=sort_by,
        page=page,
        limit=limit
        ,date_from=date_from
        ,date_to=date_to
    )
    return {"success": True, **result}

@router.get("/analyses/{id}")
def get_analysis_by_id(id: str):
    """Get detailed analysis record by ID."""
    item = db_service.get_analysis_by_id(id)
    if not item:
        raise HTTPException(status_code=404, detail=f"Analysis record with ID '{id}' not found.")
    return {"success": True, "data": item}

@router.delete("/analyses/{id}")
def delete_analysis(id: str):
    """Delete an analysis record by ID."""
    success = db_service.delete_analysis(id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Analysis record with ID '{id}' not found or could not be deleted.")
    return {"success": True, "message": f"Analysis '{id}' deleted successfully."}
