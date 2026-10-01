import spacy
from spacy.pipeline import EntityRuler
import re
from typing import List, Dict, Any, Tuple

class PollutionNER:
    """
    Hybrid Named Entity Recognizer for Pollution Extraction.
    Uses spaCy pretrained NER + EntityRuler patterns + regex dictionary fallback.
    """

    def __init__(self):
        # Dictionary of domain patterns
        self.sources_dict = [
            "industrial factory", "chemical factory", "chemical plant", "fertilizer plant",
            "industrial plant", "power plant", "thermal power plant", "thermal power station",
            "captive power plant", "textile mill", "paper mill", "brick kiln", "refinery",
            "petro-chemical refinery", "zinc smelter", "battery plant", "gas facility",
            "factory", "cargo truck", "cargo trucks", "diesel truck", "diesel trucks",
            "city bus", "city buses", "heavy vehicle", "heavy vehicles", "truck", "trucks",
            "vehicle", "vehicles", "automobile", "automobiles", "construction site",
            "construction activity", "construction activities", "demolition activity",
            "highway expansion", "metro construction", "mining operation", "mining operations",
            "quarrying", "limestone quarrying", "open-cast mining", "agricultural burning",
            "crop burning", "stubble burning", "crop residue burning", "waste burning",
            "solid municipal waste burning", "plastic waste burning", "landfill", "unlined landfill",
            "sewage plant", "sewage discharge", "wastewater facility", "municipal wastewater facility",
            "tanning chemicals discharge", "generator sets", "natural gas pipeline"
        ]

        self.pollutants_dict = [
            "pm2.5", "pm10", "pm 2.5", "pm 10", "sulfur dioxide", "nitrogen dioxide",
            "carbon monoxide", "ozone", "methane", "lead", "mercury", "arsenic", "cadmium",
            "particulate matter", "fine particulate matter", "dust", "mineral dust", "coal dust",
            "smoke", "thick black smoke", "toxic gases", "toxic gas", "toxic fumes", "haze",
            "smog", "sewage", "untreated sewage", "raw sewage", "domestic sewage", "wastewater",
            "untreated wastewater", "chemical waste", "industrial waste", "chemical discharge",
            "industrial effluent", "effluent", "oil", "oil spill", "pesticides", "fertilizers",
            "heavy metals", "acid runoff", "toxic foam", "industrial noise", "traffic noise",
            "construction noise", "loudspeakers", "leachate"
        ]

        self.severity_dict = {
            "critical": ["critical", "hazardous", "dangerous", "emergency", "fatal", "extreme"],
            "high": ["severe", "high", "elevated", "excessive", "toxic", "dense", "intolerable"],
            "moderate": ["moderate", "significant", "considerable", "uncontrolled"],
            "low": ["low", "minor", "slight", "minimal", "acceptable"]
        }

        self.known_locations = [
            "Pune", "Nashik", "Delhi", "New Delhi", "Punjab", "Mumbai", "Chennai", "Nagpur",
            "Thane", "Bengaluru", "Hyderabad", "Solapur", "Kolhapur", "Ahmedabad", "Jaipur",
            "Vadodara", "Kolkata", "Satna", "Agra", "Udaipur", "Lucknow", "Korba", "Vapi",
            "Bhopal", "Surat", "Moradabad", "Kochi", "Coimbatore", "Ghaziabad", "Visakhapatnam",
            "Haryana", "Noida", "Kanpur", "Chandigarh", "Dhanbad", "Bharuch", "Goa", "Indore",
            "Assam", "Howrah", "Chandrapur", "Ankleshwar", "Bhatinda", "Gurgaon", "Faridabad",
            "Mangalore", "Tarapur", "Dibrugarh", "Ludhiana", "Bellary", "Tirupur", "Jamshedpur",
            "Yamuna", "Godavari", "Mula-Mutha", "Ganges", "Ganga"
        ]

        self._nlp = None
        self._init_spacy_pipeline()

    def _init_spacy_pipeline(self):
        """Initialize spaCy pipeline with custom EntityRuler patterns."""
        try:
            # Try loading English model
            self._nlp = spacy.load("en_core_web_sm")
        except Exception:
            # Fallback to blank model if en_core_web_sm is absent
            self._nlp = spacy.blank("en")

        # Create or update EntityRuler
        if "entity_ruler" in self._nlp.pipe_names:
            ruler = self._nlp.get_pipe("entity_ruler")
        else:
            ruler = self._nlp.add_pipe("entity_ruler", before="ner" if "ner" in self._nlp.pipe_names else None)

        patterns = []
        # Add POLLUTION_SOURCE patterns
        for src in self.sources_dict:
            patterns.append({"label": "POLLUTION_SOURCE", "pattern": src})
            patterns.append({"label": "POLLUTION_SOURCE", "pattern": src.title()})

        # Add POLLUTANT patterns
        for pol in self.pollutants_dict:
            patterns.append({"label": "POLLUTANT", "pattern": pol})
            patterns.append({"label": "POLLUTANT", "pattern": pol.upper()})
            patterns.append({"label": "POLLUTANT", "pattern": pol.title()})

        # Add LOCATION patterns
        for loc in self.known_locations:
            patterns.append({"label": "LOCATION", "pattern": loc})

        ruler.add_patterns(patterns)

    def extract_entities(self, text: str) -> Dict[str, Any]:
        """
        Runs spaCy NER pipeline + dictionary regex matching.
        Returns extracted entities with category, span, confidence score, and evidence text.
        """
        if not text or not text.strip():
            return {
                "sources": [],
                "pollutants": [],
                "locations": [],
                "severities": [],
                "all_entities": []
            }

        doc = self._nlp(text)
        found_entities = []
        seen_spans = set()

        # 1. Process spaCy doc entities
        for ent in doc.ents:
            span_key = (ent.start_char, ent.end_char)
            if span_key in seen_spans:
                continue

            label = ent.label_
            # Map standard spaCy GPE/LOC/FAC to LOCATION or POLLUTION_SOURCE
            if label in ["GPE", "LOC"]:
                label = "LOCATION"
            elif label == "ORG" and any(k in ent.text.lower() for k in ["chemical", "factory", "refinery", "plant", "mill", "inc"]):
                label = "POLLUTION_SOURCE"
            
            if label in ["POLLUTION_SOURCE", "POLLUTANT", "LOCATION", "SEVERITY"]:
                seen_spans.add(span_key)
                confidence = 0.94 if ent.label_ in ["POLLUTION_SOURCE", "POLLUTANT"] else 0.88
                evidence = self._extract_evidence(text, ent.start_char, ent.end_char)
                found_entities.append({
                    "text": ent.text.strip(),
                    "type": label,
                    "start": ent.start_char,
                    "end": ent.end_char,
                    "confidence": confidence,
                    "method": "spacy_ner",
                    "evidence": evidence
                })

        # 2. Dictionary / Regex Matching Fallback for missed domain terms
        lower_text = text.lower()

        # Sources match
        for src in sorted(self.sources_dict, key=len, reverse=True):
            for match in re.finditer(r'\b' + re.escape(src) + r'\b', lower_text):
                start, end = match.span()
                if not self._is_overlapping((start, end), seen_spans):
                    seen_spans.add((start, end))
                    matched_text = text[start:end]
                    evidence = self._extract_evidence(text, start, end)
                    found_entities.append({
                        "text": matched_text,
                        "type": "POLLUTION_SOURCE",
                        "start": start,
                        "end": end,
                        "confidence": 0.95,
                        "method": "rule_match",
                        "evidence": evidence
                    })

        # Pollutants match
        for pol in sorted(self.pollutants_dict, key=len, reverse=True):
            for match in re.finditer(r'\b' + re.escape(pol) + r'\b', lower_text):
                start, end = match.span()
                if not self._is_overlapping((start, end), seen_spans):
                    seen_spans.add((start, end))
                    matched_text = text[start:end]
                    evidence = self._extract_evidence(text, start, end)
                    found_entities.append({
                        "text": matched_text,
                        "type": "POLLUTANT",
                        "start": start,
                        "end": end,
                        "confidence": 0.96,
                        "method": "rule_match",
                        "evidence": evidence
                    })

        # Locations match
        for loc in sorted(self.known_locations, key=len, reverse=True):
            for match in re.finditer(r'\b' + re.escape(loc) + r'\b', text, re.IGNORECASE):
                start, end = match.span()
                if not self._is_overlapping((start, end), seen_spans):
                    seen_spans.add((start, end))
                    matched_text = text[start:end]
                    evidence = self._extract_evidence(text, start, end)
                    found_entities.append({
                        "text": matched_text,
                        "type": "LOCATION",
                        "start": start,
                        "end": end,
                        "confidence": 0.98,
                        "method": "rule_match",
                        "evidence": evidence
                    })

        # Organize by type
        sources = [e for e in found_entities if e["type"] == "POLLUTION_SOURCE"]
        pollutants = [e for e in found_entities if e["type"] == "POLLUTANT"]
        locations = [e for e in found_entities if e["type"] == "LOCATION"]
        severities = [e for e in found_entities if e["type"] == "SEVERITY"]

        return {
            "sources": sources,
            "pollutants": pollutants,
            "locations": locations,
            "severities": severities,
            "all_entities": found_entities
        }

    def _is_overlapping(self, span: Tuple[int, int], seen_spans: set) -> bool:
        """Check if target span overlaps with any previously extracted span."""
        s1, e1 = span
        for s2, e2 in seen_spans:
            if max(s1, s2) < min(e1, e2):
                return True
        return False

    def _extract_evidence(self, text: str, start: int, end: int, window: int = 40) -> str:
        """Extract surrounding text context window for XAI explainability."""
        ctx_start = max(0, start - window)
        ctx_end = min(len(text), end + window)
        snippet = text[ctx_start:ctx_end].replace("\n", " ").strip()
        if ctx_start > 0:
            snippet = "..." + snippet
        if ctx_end < len(text):
            snippet = snippet + "..."
        return snippet

ner_engine = PollutionNER()
