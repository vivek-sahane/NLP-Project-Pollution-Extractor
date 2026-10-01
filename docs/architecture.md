# System Architecture - Pollution Source Extractor

## 1. Overview
The **Pollution Source Extractor** is an academic AI/NLP web application designed to parse unstructured environmental news, government reports, and complaints to extract structured information about pollution sources, pollutants, locations, categories, and severity levels.

## 2. High-Level Architecture Diagram

```
                             [ USER BROWSER ]
                                    |
                                    | HTTP / JSON API
                                    v
                     [ NEXT.JS 15 FRONTEND (App Router) ]
                +-------------------+-------------------+
                | Landing / Analyzer| Visual Dashboard  |
                | History Search    | Model Performance |
                +-------------------+-------------------+
                                    |
                                    v
                     [ FASTAPI BACKEND ENGINE ]
                   (Python 3.11+ / Port 8000)
                                    |
            +-----------------------+-----------------------+
            |                                               |
            v                                               v
    [ NLP PIPELINE ]                              [ DATABASE SERVICE ]
 +---------------------+                       +--------------------------+
 | Preprocessor        |                       | MongoDB Database         |
 | spaCy NER           |                       | (Collection:             |
 | TF-IDF Classifier   |                       |  pollution_analyses)     |
 | Severity Detector   |                       |                          |
 | Triples Extractor   |                       | Resilient Local Fallback |
 | Explainable AI (XAI)|                       | (data/analyses_store.json|
 +---------------------+                       +--------------------------+
```

## 3. Data Flow Sequence
1. **User Input**: User inputs text manually, submits a news article URL, or uploads a document (.txt, .pdf).
2. **Preprocessing**: Raw text is normalized, split into sentences, and tokenized while retaining domain entities (PM2.5, SO2, chemical plant).
3. **Named Entity Recognition**: spaCy pretrained NER + custom EntityRuler extracts `POLLUTION_SOURCE`, `POLLUTANT`, `LOCATION`, and `SEVERITY`.
4. **Classification**: TF-IDF + Logistic Regression assigns the text to `Air Pollution`, `Water Pollution`, `Soil Pollution`, `Noise Pollution`, or `Other`.
5. **Severity & Relationships**: Detects explicit severity indicators (Low, Moderate, High, Critical) and connects semantic triples `(Source) -> (Pollutant) -> (Location)`.
6. **XAI Evidence Extraction**: Captures surrounding text snippet evidence explaining *why* entities and categories were detected.
7. **Storage & Visualization**: Result stored in MongoDB or Local Resilient Store and rendered on the Next.js UI dashboard with Recharts visualizations.
