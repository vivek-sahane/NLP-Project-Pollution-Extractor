from fastapi import APIRouter, HTTPException, UploadFile, File, Request
from app.models.analysis import AnalyzeRequest, AnalyzeUrlRequest
from app.services.pollution_extractor import pollution_extractor
from app.services.article_service import article_service
from app.nlp.classifier import classifier_engine
from app.nlp.ner import ner_engine

router = APIRouter()
MAX_TEXT_LENGTH = 100_000
MAX_FILE_SIZE = 10 * 1024 * 1024

@router.post("/analyze")
def analyze_text(payload: AnalyzeRequest):
    """
    Main Analysis Endpoint: Process unstructured text and extract structured pollution info.
    """
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="Input text cannot be empty.")
    
    if len(payload.text.strip()) < 5:
        raise HTTPException(status_code=400, detail="Input text is too short to analyze.")
    if len(payload.text) > MAX_TEXT_LENGTH:
        raise HTTPException(status_code=413, detail="Input text exceeds the 100,000 character limit.")

    try:
        result = pollution_extractor.analyze_text(payload.text)
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NLP extraction processing failure: {str(e)}")

@router.post("/analyze/url")
def analyze_url(payload: AnalyzeUrlRequest):
    """
    Fetch news article text from URL and run NLP extraction.
    """
    fetch_res = article_service.fetch_article_text(payload.url)
    if not fetch_res["success"]:
        raise HTTPException(status_code=400, detail=fetch_res["error"])

    text = fetch_res["extracted_text"]
    result = pollution_extractor.analyze_text(text)
    result["url"] = payload.url
    result["title"] = fetch_res.get("title", "News Article")
    
    return {"success": True, "result": result}

@router.post("/analyze/file")
async def analyze_file(file: UploadFile = File(...)):
    """
    Extract text from uploaded .txt or .pdf file and run NLP extraction.
    """
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File exceeds the 10 MB upload limit.")
    parse_res = article_service.extract_text_from_file(file.filename, contents)
    
    if not parse_res["success"]:
        raise HTTPException(status_code=400, detail=parse_res["error"])

    text = parse_res["extracted_text"]
    result = pollution_extractor.analyze_text(text)
    result["filename"] = file.filename
    result["char_count"] = parse_res["char_count"]

    return {"success": True, "result": result}

@router.post("/classify")
def classify_text_only(payload: AnalyzeRequest):
    """
    Runs only pollution category classification.
    """
    res = classifier_engine.predict(payload.text)
    return {"success": True, "classification": res}

@router.post("/extract")
def extract_entities_only(payload: AnalyzeRequest):
    """
    Runs only Named Entity Recognition.
    """
    res = ner_engine.extract_entities(payload.text)
    return {"success": True, "entities": res}
