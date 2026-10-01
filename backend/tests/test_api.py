import pytest
from fastapi.testclient import TestClient
import os
import sys

# Ensure backend root is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"

def test_analyze_endpoint():
    payload = {
        "text": "A chemical factory near Pune released sulfur dioxide into the atmosphere, causing severe air pollution."
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    res = json_data["result"]
    assert res["pollution_category"] == "Air Pollution"
    assert res["source"]["name"].lower() == "chemical factory"

def test_dashboard_stats_endpoint():
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    assert "totalAnalyses" in json_data["data"]

def test_model_metrics_endpoint():
    response = client.get("/api/model/metrics")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
