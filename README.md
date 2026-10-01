# Pollution Source Extractor

An academic AI/NLP text mining application that automatically parses unstructured environmental text (news articles, government reports, complaints) and extracts structured pollution information: **Pollution Source**, **Pollutant**, **Location**, **Pollution Category**, **Severity Level**, **Semantic Relationships**, and **Explainable AI (XAI) Context Evidence**.

---

## 1. Run the Project from GitHub

The following steps start the project locally on Windows. The same workflow works on macOS/Linux with the equivalent virtual-environment activation command.

### Prerequisites

- Git
- Python 3.11 or newer
- Node.js 20 or newer and npm
- MongoDB is optional. The application automatically uses `data/analyses_store.json` when MongoDB is unavailable.

### Clone the repository

```powershell
git clone <REPOSITORY_URL>
cd NLP-Project
```

Replace `<REPOSITORY_URL>` with the repository URL copied from GitHub.

### Install and prepare the backend

Open a terminal in the project root:

```powershell
py -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r backend\requirements.txt
python backend\scripts\train_classifier.py
```

If PowerShell blocks virtual-environment activation, run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
```

The classifier training command creates or refreshes the files in `models\` and the evaluation artifacts in `reports\`. Demo history records are optional:

```powershell
python backend\scripts\seed_demo_data.py
```

### Install and start the frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

### Start the backend

In the first terminal, from the repository root:

```powershell
.\venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --reload --port 8000
```

Open the application at **http://localhost:3000**. The backend API and Swagger documentation are available at:

- Health check: http://localhost:8000/api/health
- Swagger UI: http://localhost:8000/docs

### Run with Docker Compose

Docker is an alternative to the separate local processes:

```powershell
docker compose up --build
```

This starts MongoDB, the FastAPI backend, and the Next.js frontend. The application is available at **http://localhost:3000**.

To stop the containers:

```powershell
docker compose down
```

---

## 2. Functionalities Provided

### Pollution analysis

- Accepts pasted text such as news articles, government reports, and environmental complaints.
- Analyzes article URLs and extracts readable page text.
- Accepts `.txt` and `.pdf` document uploads.
- Extracts pollution sources, pollutants, locations, severity indicators, and pollution categories.
- Classifies text into Air, Water, Soil, or Noise Pollution categories.
- Generates semantic relationships such as source → pollutant → location.
- Provides confidence values and XAI context evidence for extracted entities.
- Displays processing time and structured result cards.
- Enforces input limits: 100,000 characters for text, 10 MB per uploaded file, and 12 MB per HTTP request.

### History and record management

- Saves analysis results to MongoDB when available.
- Falls back automatically to the local JSON store at `data/analyses_store.json`.
- Searches saved records by text, source, pollutant, or location.
- Filters records by category, severity, and date range.
- Sorts records by newest or oldest first.
- Opens a detailed view for each saved analysis.
- Supports **Analyze Again**, which sends the original text back to the analyzer.
- Supports deletion of saved records with confirmation.

### Dashboard and model pages

- Shows total analysis counts and category distribution.
- Visualizes top pollution sources, pollutants, and locations.
- Shows severity distribution.
- Shows analyses over time.
- Displays the classifier dataset split and evaluation metrics.
- Displays the confusion matrix and model pipeline overview.

### Supporting project features

- FastAPI REST API with Swagger documentation.
- Responsive Next.js interface with dedicated Analyzer, Dashboard, History, Model, and About pages.
- Local open-source NLP/ML processing without paid external AI APIs.
- Automated backend tests, frontend linting, and production frontend builds.

---

## 3. Project Purpose & Problem Statement
Pollution events are reported daily across scattered unstructured mediums such as news articles, press releases, public complaints, and environmental audits. Manually extracting structured entity data from raw text is labor-intensive and error-prone.

The **Pollution Source Extractor** automates this process by transforming raw text into structured JSON entities that can be stored, searched, filtered, analyzed, and visualized in real time.

---

## 4. High-Level Architecture

```
                    [ USER BROWSER ]
                           │
                           ▼
          [ NEXT.JS 16 FRONTEND (App Router) ]
         (Analyzer | Dashboard | History | Model | About)
                           │
                           ▼
              [ FASTAPI REST API (Port 8000) ]
                           │
        ┌──────────────────┴──────────────────┐
        ▼                                     ▼
 [ NLP ENGINE ]                       [ DATABASE SERVICE ]
 ├── Preprocessor                     ├── MongoDB (pollution_analyses)
 ├── spaCy Hybrid NER                 └── Local Resilient JSON Store
 ├── TF-IDF Logistic Regression            (Automatic Zero-Downtime Fallback)
 ├── Severity Detector
 ├── Triples Extractor
 └── XAI Evidence Generator
```

---

## 5. Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Recharts, Lucide Icons
- **Backend**: Python 3.11+, FastAPI, Pydantic v2, Uvicorn, BeautifulSoup4, PyPDF
- **NLP / ML**: spaCy, Scikit-Learn (TF-IDF + Logistic Regression), Pandas, NumPy, NLTK, Joblib
- **Database**: MongoDB (PyMongo / Motor) with Local Resilient JSON Store fallback
- **Containerization**: Docker, Docker Compose

---

## 6. NLP Pipeline & Model Performance

### Pipeline Steps:
1. **Preprocessing**: Normalizes whitespace, segments sentences, tokenizes while retaining domain terms (`PM2.5`, `SO2`, `chemical plant`).
2. **Named Entity Recognition (NER)**: Combines spaCy pretrained NER with custom `EntityRuler` patterns for `POLLUTION_SOURCE`, `POLLUTANT`, `LOCATION`, and `SEVERITY`.
3. **Category Classification**: TF-IDF n-gram vectorization + Logistic Regression classifier.
4. **Severity & Relationships**: Contextual linguistic indicators (`Low`, `Moderate`, `High`, `Critical`) and semantic triple generation (`Source` $\rightarrow$ `Pollutant` $\rightarrow$ `Location`).
5. **XAI Evidence Generator**: Preserves surrounding character context windows explaining *why* entities were detected.

### Trained Model Evaluation Metrics:
- **Accuracy**: 90.00%
- **Precision**: 93.33%
- **Recall**: 90.00%
- **F1-Score**: 89.33%

---

## 7. API Endpoints

- `GET /api/health` — API health & database readiness
- `POST /api/analyze` — Main text extraction pipeline
- `POST /api/analyze/url` — News URL scraper & analysis
- `POST /api/analyze/file` — Document upload (.txt, .pdf) & analysis
- `POST /api/analyze/save` — Save analysis record
- `GET /api/analyses` — Paginated history with search, category, severity, sorting, and date filtering
- `GET /api/analyses/{id}` — Fetch single analysis record
- `DELETE /api/analyses/{id}` — Delete analysis record
- `GET /api/dashboard/stats` — Category, source, pollutant, location, severity, and time-series analytics
- `GET /api/model/metrics` — Model evaluation report

---

## 8. Running Automated Tests

From the repository root:

```powershell
.\venv\Scripts\python.exe -m pytest backend\tests\ -q
```

Tests cover Preprocessor, NER EntityRuler extraction, Classifier predictions, Severity detection, Unified pipeline, and FastAPI API routes.

---

## 9. Evaluation Artifacts

The evaluation files are stored in `reports\`:

- `classification_report.json` — per-class precision, recall, F1-score, and support.
- `evaluation_summary.json` — overall accuracy, precision, recall, F1-score, labels, and dataset description.
- `confusion_matrix.png` — visual confusion matrix.
- `browser_acceptance.md` — browser-based acceptance test evidence.

To regenerate the classifier and evaluation artifacts:

```powershell
.\venv\Scripts\python.exe backend\scripts\evaluate.py
```

The current evaluation is based on the project's demo classification dataset. NER does not have a separate labeled benchmark dataset in this repository, so NER quality is validated through extraction/API tests rather than a standalone NER score.

---

## 10. Academic Viva Q&A Summary

- **Q: How does the system avoid reliance on paid APIs?**
  - **A**: Built entirely on local open-source NLP libraries (spaCy & Scikit-Learn).
- **Q: How does the database fallback work?**
  - **A**: If MongoDB server is offline, `DatabaseService` seamlessly redirects storage operations to `data/analyses_store.json`.
- **Q: How is Explainable AI achieved?**
  - **A**: Character offsets, extraction confidence, and context evidence strings are saved for every extracted entity.

---

## 11. Academic Project Documentation
Refer to the `docs/` folder for detailed academic specifications:
- `docs/architecture.md`
- `docs/nlp-pipeline.md`
- `docs/dataset.md`
- `docs/model-training.md`
- `docs/api.md`
- `docs/database.md`
- `docs/testing.md`
