# NLP Pipeline & Methodology

## 1. Overview
The NLP pipeline transforms raw unstructured text into structured pollution entities and categories without relying on paid third-party APIs.

## 2. Pipeline Stages

```
Raw Text
   │
   ▼
1. Text Preprocessing (Whitespace normalization, sentence splitting, domain token preservation)
   │
   ▼
2. Hybrid Named Entity Recognition (spaCy + EntityRuler + Regex Pattern Matcher)
   │ ├── POLLUTION_SOURCE (factory, chemical plant, truck, stubble burning, landfill, etc.)
   │ ├── POLLUTANT (PM2.5, SO2, NO2, sewage, heavy metals, acid runoff, noise, etc.)
   │ ├── LOCATION (Pune, Nashik, Delhi, Yamuna River, etc.)
   │ └── SEVERITY (Low, Moderate, High, Critical)
   │
   ▼
3. Machine Learning Classification (TF-IDF Vectorization + Logistic Regression / Baseline Fallback)
   │ └── Category: Air Pollution | Water Pollution | Soil Pollution | Noise Pollution | Other
   │
   ▼
4. Linguistic Severity Detection (Contextual keyword & adjective indicators)
   │
   ▼
5. Semantic Relationship Extraction (Triple Builder: Source -> Emits -> Pollutant -> Affects -> Location)
   │
   ▼
6. Explainable AI (XAI) Snippet Generator (Extracts surrounding evidence windows for transparency)
   │
   ▼
Structured JSON Output
```

## 3. Entity Classification Rules vs Model Predictions
- **Model Predictions**: Categorizes overall pollution type using TF-IDF features.
- **Rule Matches**: Uses deterministic pattern dictionaries for high-precision entity identification.
- **Explainability**: Preserves exact character offsets and surrounding evidence snippet strings.
