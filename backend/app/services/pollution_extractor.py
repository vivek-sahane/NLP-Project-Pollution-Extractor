import time
from typing import Dict, Any, List
from app.nlp.preprocessor import preprocessor
from app.nlp.ner import ner_engine
from app.nlp.classifier import classifier_engine
from app.nlp.severity import severity_detector
from app.nlp.relationship_extractor import relationship_extractor

class UnifiedPollutionExtractor:
    """
    Unified Pollution Information Extractor orchestrating Preprocessing, NER,
    Classification, Severity Detection, Relationship Mapping, and XAI Evidence generation.
    """

    def analyze_text(self, text: str) -> Dict[str, Any]:
        """Runs the complete NLP analysis pipeline on raw text."""
        start_time = time.time()

        if not text or len(text.strip()) < 5:
            return {
                "input_text": text or "",
                "summary": "Text too short for meaningful pollution analysis.",
                "pollution_category": "Other",
                "category_confidence": 0.0,
                "category_method": "none",
                "source": {"name": "Unknown Source", "category": "Unknown", "confidence": 0.0},
                "pollutants": [],
                "locations": [],
                "severity": {"label": "Unknown", "confidence": 0.0, "evidence": None},
                "entities": [],
                "relationships": [],
                "confidence_summary": {"category": 0.0, "source": 0.0, "pollutant": 0.0, "overall": 0.0},
                "processing_time_ms": 0.0,
                "is_demo": False
            }

        # 1. Preprocessing
        prep = preprocessor.process(text)
        cleaned_text = prep["cleaned_text"]

        # 2. Named Entity Recognition
        ner_res = ner_engine.extract_entities(cleaned_text)
        sources = ner_res["sources"]
        pollutants = ner_res["pollutants"]
        locations = ner_res["locations"]
        all_entities = ner_res["all_entities"]

        # 3. Pollution Category Classification
        cls_res = classifier_engine.predict(cleaned_text)

        # 4. Severity Detection
        sev_res = severity_detector.detect(cleaned_text)

        # 5. Relationship Extraction
        relationships = relationship_extractor.extract_relationships(
            cleaned_text, sources, pollutants, locations
        )

        # 6. Format Structured Source
        primary_source_name = sources[0]["text"] if sources else "Unknown Source"
        primary_source_category = self._infer_source_category(primary_source_name, cleaned_text)
        primary_source_conf = sources[0]["confidence"] if sources else 0.50

        formatted_source = {
            "name": primary_source_name,
            "category": primary_source_category,
            "confidence": primary_source_conf
        }

        # 7. Format Pollutants & Locations
        formatted_pollutants = [
            {"name": p["text"], "confidence": p["confidence"], "evidence": p.get("evidence")}
            for p in pollutants
        ]
        if not formatted_pollutants:
            formatted_pollutants = [{"name": "Unspecified Pollutant", "confidence": 0.50, "evidence": None}]

        formatted_locations = [
            {"name": l["text"], "confidence": l["confidence"], "evidence": l.get("evidence")}
            for l in locations
        ]
        if not formatted_locations:
            formatted_locations = [{"name": "Unspecified Location", "confidence": 0.50, "evidence": None}]

        # 8. Calculate Overall Confidence
        cat_conf = cls_res["confidence"]
        pol_conf = formatted_pollutants[0]["confidence"]
        overall_conf = round((cat_conf + primary_source_conf + pol_conf) / 3.0, 2)

        # 9. Summary synthesis
        summary = (
            f"Detected {cls_res['label']} originating from {primary_source_name} "
            f"({primary_source_category}) affecting {formatted_locations[0]['name']}. "
            f"Severity evaluated as {sev_res['label']}."
        )

        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "input_text": text,
            "summary": summary,
            "pollution_category": cls_res["label"],
            "category_confidence": cls_res["confidence"],
            "category_method": cls_res["method"],
            "source": formatted_source,
            "pollutants": formatted_pollutants,
            "locations": formatted_locations,
            "severity": sev_res,
            "entities": all_entities,
            "relationships": relationships,
            "confidence_summary": {
                "category": cls_res["confidence"],
                "source": primary_source_conf,
                "pollutant": pol_conf,
                "overall": overall_conf
            },
            "processing_time_ms": elapsed_ms,
            "is_demo": False
        }

    def _infer_source_category(self, source_name: str, text: str) -> str:
        """Infer source category label (Industrial, Agricultural, Transportation, Waste, Mining, etc.)."""
        s_lower = source_name.lower()
        t_lower = text.lower()

        if any(w in s_lower or w in t_lower for w in ["factory", "plant", "mill", "refinery", "industrial", "smelter", "generator"]):
            return "Industrial Plant"
        elif any(w in s_lower or w in t_lower for w in ["crop", "stubble", "agricultural", "farm", "pesticide", "fertilizer"]):
            return "Agricultural Burning"
        elif any(w in s_lower or w in t_lower for w in ["truck", "vehicle", "automobile", "traffic", "bus", "diesel", "exhaust"]):
            return "Vehicular Emissions"
        elif any(w in s_lower or w in t_lower for w in ["waste", "landfill", "sewage", "plastic", "dumping"]):
            return "Waste Management & Sewage"
        elif any(w in s_lower or w in t_lower for w in ["construction", "demolition", "machinery", "building"]):
            return "Construction Site"
        elif any(w in s_lower or w in t_lower for w in ["mining", "quarrying", "mine", "coal dust"]):
            return "Mining Operation"
        return "General Source"

pollution_extractor = UnifiedPollutionExtractor()
