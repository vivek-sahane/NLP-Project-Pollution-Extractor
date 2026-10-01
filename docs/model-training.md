# Model Training & Evaluation Guide

## 1. Overview
The classification pipeline uses term frequency-inverse document frequency (TF-IDF) feature engineering combined with a scikit-learn Logistic Regression classifier.

## 2. Running Training
To train the model and save serialization artifacts:

```bash
.\venv\Scripts\python backend/scripts/train_classifier.py
```

## 3. Training Process Steps
1. Loads `data/train.csv`, `data/validation.csv`, `data/test.csv`.
2. Applies `TextPreprocessor` for token normalization.
3. Computes TF-IDF n-gram vectors (unigrams and bigrams).
4. Trains Logistic Regression with class weight balancing.
5. Evaluates accuracy, precision, recall, weighted F1-score, and confusion matrix.
6. Serializes model to `models/pollution_classifier.joblib` and vectorizer to `models/tfidf_vectorizer.joblib`.
7. Exports metrics summary to `reports/classification_report.json`.
