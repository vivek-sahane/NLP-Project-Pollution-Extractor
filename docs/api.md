# API Endpoints Specification

## Base URL
`http://localhost:8000` (Interactive OpenAPI Swagger documentation available at `/docs`).

## 1. System Health
- `GET /api/health`
  - Returns backend status, database status, and model readiness status.

## 2. NLP Analysis & Extraction
- `POST /api/analyze`
  - Body: `{"text": "A chemical factory near Pune released sulfur dioxide..."}`
  - Performs full NLP pipeline and returns structured extraction JSON.
- `POST /api/analyze/url`
  - Body: `{"url": "https://news.example.com/article"}`
  - Fetches article text and runs NLP extraction.
- `POST /api/analyze/file`
  - Form Data: `file` (.txt or .pdf)
  - Extracts text from document and runs NLP analysis.
- `POST /api/classify`
  - Body: `{"text": "..."}`
  - Runs classification module only.
- `POST /api/extract`
  - Body: `{"text": "..."}`
  - Runs NER extraction module only.

## 3. History & Persistence
- `POST /api/analyze/save`
  - Saves an analysis result into persistent database.
- `GET /api/analyses`
  - Query parameters: `search`, `category`, `source_category`, `severity`, `sort_by`, `page`, `limit`.
  - Returns paginated analysis history.
- `GET /api/analyses/{id}`
  - Fetches single analysis record by ID.
- `DELETE /api/analyses/{id}`
  - Deletes an analysis record.

## 4. Dashboard & Model
- `GET /api/dashboard/stats`
  - Returns aggregation metrics for dashboard charts.
- `GET /api/model/metrics`
  - Returns model accuracy, precision, recall, F1, and confusion matrix.
