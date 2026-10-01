from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=5, description="Pollution-related unstructured text to analyze")

class AnalyzeUrlRequest(BaseModel):
    url: str = Field(..., description="URL of news article or report to analyze")

class EntityDetail(BaseModel):
    text: str
    type: str
    start: int
    end: int
    confidence: float
    method: str
    evidence: Optional[str] = None

class SourceDetail(BaseModel):
    name: str
    category: str
    confidence: float

class PollutantDetail(BaseModel):
    name: str
    confidence: float

class LocationDetail(BaseModel):
    name: str
    confidence: float

class RelationshipDetail(BaseModel):
    source: str
    pollutant: str
    location: str
    relationship: str
    confidence: float

class AnalysisResult(BaseModel):
    id: Optional[str] = None
    input_text: str
    summary: str
    pollution_category: str
    category_confidence: float
    category_method: str
    source: Dict[str, Any]
    pollutants: List[Dict[str, Any]]
    locations: List[Dict[str, Any]]
    severity: Dict[str, Any]
    entities: List[EntityDetail]
    relationships: List[RelationshipDetail]
    confidence_summary: Dict[str, float]
    processing_time_ms: float
    created_at: Optional[str] = None
    is_demo: bool = False

class SaveAnalysisRequest(BaseModel):
    result: Dict[str, Any]
