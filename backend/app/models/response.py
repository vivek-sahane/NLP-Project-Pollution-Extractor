from pydantic import BaseModel
from typing import Any, Optional, List

class StandardResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    data: Optional[Any] = None
    error: Optional[str] = None

class PaginatedAnalysisResponse(BaseModel):
    success: bool
    total: int
    page: int
    limit: int
    items: List[Any]
