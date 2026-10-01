# Testing Suite Documentation

## 1. Overview
The backend includes automated tests verifying Preprocessor, Named Entity Recognition, Classifier prediction, Severity detection, and FastAPI endpoints.

## 2. Running Automated Tests

```bash
.\venv\Scripts\pytest backend/tests/
```

## 3. Test Cases Covered
- `test_preprocessor`: Ensures whitespace cleaning, tokenization, and domain term preservation (`PM2.5`, `SO2`).
- `test_ner_extraction_test1`: Acceptance test case 1 (chemical factory, sulfur dioxide, Pune).
- `test_ner_extraction_test2`: Acceptance test case 2 (untreated sewage, Godavari river, Nashik).
- `test_ner_extraction_test3`: Acceptance test case 3 (construction activities, noise).
- `test_classifier_prediction`: Verifies classification structure and confidence output.
- `test_severity_detection`: Verifies Critical, High, Moderate, and Unknown severity labels.
- `test_unified_extractor`: Tests full end-to-end NLP pipeline execution.
- `test_health_endpoint`: API health router check.
- `test_analyze_endpoint`: API text analysis POST router check.
- `test_dashboard_stats_endpoint`: Dashboard analytics GET endpoint check.
