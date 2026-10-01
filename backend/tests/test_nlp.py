import pytest
import os
import sys

# Ensure backend root is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.nlp.preprocessor import preprocessor
from app.nlp.ner import ner_engine
from app.nlp.classifier import classifier_engine
from app.nlp.severity import severity_detector
from app.nlp.relationship_extractor import relationship_extractor
from app.services.pollution_extractor import pollution_extractor

def test_preprocessor():
    text = "A chemical  factory near Pune   released sulfur dioxide."
    cleaned = preprocessor.clean_text(text)
    assert cleaned == "A chemical factory near Pune released sulfur dioxide."
    
    tokens = preprocessor.tokenize("PM2.5 levels increased in Pune.")
    assert "pm2.5" in [t.lower() for t in tokens]

def test_ner_extraction_test1():
    # TEST 1: Smoke from a factory in Pune caused severe air pollution.
    text = "Smoke from a factory in Pune caused severe air pollution."
    res = ner_engine.extract_entities(text)
    
    source_texts = [s["text"].lower() for s in res["sources"]]
    location_texts = [l["text"] for l in res["locations"]]
    pollutant_texts = [p["text"].lower() for p in res["pollutants"]]
    
    assert "factory" in source_texts
    assert "Pune" in location_texts
    assert "smoke" in pollutant_texts

def test_ner_extraction_test2():
    # TEST 2: Untreated sewage was discharged into the river near Nashik.
    text = "Untreated sewage was discharged into the river near Nashik."
    res = ner_engine.extract_entities(text)
    
    source_texts = [s["text"].lower() for s in res["sources"]]
    location_texts = [l["text"] for l in res["locations"]]
    pollutant_texts = [p["text"].lower() for p in res["pollutants"]]
    
    assert "sewage discharge" in source_texts or "sewage" in pollutant_texts
    assert "Nashik" in location_texts

def test_ner_extraction_test3():
    # TEST 3: Construction activities generated excessive noise near residential areas.
    text = "Construction activities generated excessive noise near residential areas."
    res = ner_engine.extract_entities(text)
    
    source_texts = [s["text"].lower() for s in res["sources"]]
    assert any("construction" in s for s in source_texts)

def test_classifier_prediction():
    text = "Smoke from crop stubble burning degraded air quality and increased PM2.5 levels."
    pred = classifier_engine.predict(text)
    assert pred["label"] in ["Air Pollution", "Water Pollution", "Soil Pollution", "Noise Pollution", "Other"]
    assert "confidence" in pred
    assert "method" in pred

def test_severity_detection():
    high_text = "Emissions caused severe health warnings in the area."
    res = severity_detector.detect(high_text)
    assert res["label"] == "High"
    
    crit_text = "An explosion caused hazardous toxic gas release."
    res_crit = severity_detector.detect(crit_text)
    assert res_crit["label"] == "Critical"
    
    none_text = "A factory operates near the road."
    res_none = severity_detector.detect(none_text)
    assert res_none["label"] == "Unknown"

def test_unified_extractor():
    text = "A chemical factory near Pune released sulfur dioxide into the atmosphere, causing severe air pollution."
    result = pollution_extractor.analyze_text(text)
    
    assert result["pollution_category"] == "Air Pollution"
    assert result["source"]["name"].lower() == "chemical factory"
    assert result["locations"][0]["name"] == "Pune"
    assert result["severity"]["label"] == "High"
    assert len(result["relationships"]) > 0
    assert result["processing_time_ms"] >= 0
