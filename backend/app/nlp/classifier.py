import os
import joblib
from typing import Dict, Any, List, Tuple
from app.config import settings
from app.nlp.preprocessor import preprocessor

class PollutionClassifier:
    """
    Pollution Category Classifier supporting ML model execution (TF-IDF + Logistic Regression)
    with rule-assisted baseline fallback when un-trained.
    """

    def __init__(self):
        self.categories = [
            "Air Pollution",
            "Water Pollution",
            "Soil Pollution",
            "Noise Pollution",
            "Other"
        ]
        self.model = None
        self.vectorizer = None
        self.is_trained_model_loaded = False
        self.load_model()

        # Keyword dictionaries for rule-assisted fallback
        self.rule_keywords = {
            "Air Pollution": [
                "air", "smoke", "smog", "haze", "atmosphere", "so2", "no2", "pm2.5", "pm10",
                "sulfur dioxide", "nitrogen dioxide", "carbon monoxide", "ozone", "methane",
                "particulate matter", "dust", "emissions", "exhaust", "fumes", "flaring", "kiln"
            ],
            "Water Pollution": [
                "water", "river", "lake", "creek", "ocean", "sea", "coastal", "aquatic", "drainage",
                "sewage", "wastewater", "effluent", "discharge", "spill", "oil", "foam", "groundwater"
            ],
            "Soil Pollution": [
                "soil", "ground", "land", "farmland", "topsoil", "landfill", "sludge", "leachate",
                "pesticides", "fertilizers", "heavy metals", "chemical waste", "dumping", "acid runoff"
            ],
            "Noise Pollution": [
                "noise", "sound", "decibel", "loud", "loudspeakers", "machinery", "pile-driving",
                "traffic noise", "construction noise", "industrial noise", "generator"
            ]
        }

    def load_model(self):
        """Attempts to load trained classifier and vectorizer joblib files."""
        if os.path.exists(settings.CLASSIFIER_PATH) and os.path.exists(settings.VECTORIZER_PATH):
            try:
                self.model = joblib.load(settings.CLASSIFIER_PATH)
                self.vectorizer = joblib.load(settings.VECTORIZER_PATH)
                self.is_trained_model_loaded = True
                print(f"[Classifier] Successfully loaded ML model from {settings.CLASSIFIER_PATH}")
            except Exception as e:
                print(f"[Classifier] Failed to load joblib model: {e}")
                self.is_trained_model_loaded = False
        else:
            self.is_trained_model_loaded = False

    def predict(self, text: str) -> Dict[str, Any]:
        """
        Predicts pollution category for given text.
        Returns predicted label, confidence score, method indicator, and category probabilities.
        """
        if not text or not text.strip():
            return {
                "label": "Other",
                "confidence": 0.50,
                "method": "default_empty",
                "probabilities": {cat: 0.20 for cat in self.categories}
            }

        # If trained ML model exists, execute ML inference
        if self.is_trained_model_loaded and self.model and self.vectorizer:
            try:
                feature_text = preprocessor.preprocess_for_classification(text)
                X_vec = self.vectorizer.transform([feature_text])
                pred_label = self.model.predict(X_vec)[0]

                # Get class probabilities if supported
                if hasattr(self.model, "predict_proba"):
                    probs = self.model.predict_proba(X_vec)[0]
                    prob_dict = {cat: float(p) for cat, p in zip(self.model.classes_, probs)}
                    confidence = float(max(probs))
                else:
                    confidence = 0.85
                    prob_dict = {cat: (0.85 if cat == pred_label else 0.0375) for cat in self.categories}

                return {
                    "label": pred_label,
                    "confidence": round(confidence, 2),
                    "method": "trained_tfidf_logistic_regression",
                    "probabilities": prob_dict
                }
            except Exception as e:
                print(f"[Classifier] ML prediction error: {e}, falling back to rule-assisted baseline.")

        # Fallback Rule-Assisted Classification
        return self._rule_assisted_classification(text)

    def _rule_assisted_classification(self, text: str) -> Dict[str, Any]:
        """Keyword-density rule model for baseline category classification."""
        lower_text = text.lower()
        scores = {cat: 0.0 for cat in self.categories}

        for cat, keywords in self.rule_keywords.items():
            for kw in keywords:
                if kw in lower_text:
                    scores[cat] += 1.0

        total_matches = sum(scores.values())

        if total_matches == 0:
            return {
                "label": "Other",
                "confidence": 0.55,
                "method": "baseline_rule_assisted",
                "probabilities": {cat: 0.20 for cat in self.categories}
            }

        top_cat = max(scores, key=scores.get)
        confidence = min(0.95, round(0.60 + (scores[top_cat] / total_matches) * 0.35, 2))

        # Build relative probabilities
        prob_dict = {}
        for cat in self.categories:
            if total_matches > 0:
                prob_dict[cat] = round((scores[cat] / total_matches) * 0.80 + 0.04, 2)
            else:
                prob_dict[cat] = 0.20

        return {
            "label": top_cat,
            "confidence": confidence,
            "method": "baseline_rule_assisted",
            "probabilities": prob_dict
        }

classifier_engine = PollutionClassifier()
