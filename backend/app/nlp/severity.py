import re
from typing import Dict, Any

class SeverityDetector:
    """
    Linguistic Indicator Severity Extractor.
    Extracts explicit severity levels (Low, Moderate, High, Critical, Unknown)
    supported strictly by textual evidence.
    """

    def __init__(self):
        self.severity_patterns = [
            ("Critical", [
                r'\bcritical\b', r'\bhazardous\b', r'\bdangerous\b', r'\bfatal\b',
                r'\bemergency\b', r'\bextreme\b', r'\blethal\b'
            ]),
            ("High", [
                r'\bsevere\b', r'\bhigh\b', r'\belevated\b', r'\btoxic\b', r'\bdense\b',
                r'\bintolerable\b', r'\bexcessive\b', r'\bheavy contamination\b'
            ]),
            ("Moderate", [
                r'\bmoderate\b', r'\bconsiderable\b', r'\buncontrolled\b', r'\bnotable\b',
                r'\bsignificant\b'
            ]),
            ("Low", [
                r'\blow\b', r'\bminor\b', r'\bslight\b', r'\bminimal\b', r'\bacceptable\b'
            ])
        ]

    def detect(self, text: str) -> Dict[str, Any]:
        """
        Detect severity from input text.
        Returns label, confidence, method, and extracted evidence indicator.
        """
        if not text or not text.strip():
            return {
                "label": "Unknown",
                "confidence": 0.0,
                "evidence": None,
                "method": "no_text"
            }

        lower_text = text.lower()

        for label, patterns in self.severity_patterns:
            for pattern in patterns:
                match = re.search(pattern, lower_text)
                if match:
                    matched_word = text[match.start():match.end()]
                    evidence = self._extract_context(text, match.start(), match.end())
                    return {
                        "label": label,
                        "confidence": 0.92,
                        "evidence": evidence,
                        "matched_indicator": matched_word,
                        "method": "linguistic_indicator"
                    }

        return {
            "label": "Unknown",
            "confidence": 0.50,
            "evidence": None,
            "matched_indicator": None,
            "method": "no_evidence_detected"
        }

    def _extract_context(self, text: str, start: int, end: int, window: int = 35) -> str:
        ctx_start = max(0, start - window)
        ctx_end = min(len(text), end + window)
        snippet = text[ctx_start:ctx_end].replace("\n", " ").strip()
        if ctx_start > 0:
            snippet = "..." + snippet
        if ctx_end < len(text):
            snippet = snippet + "..."
        return snippet

severity_detector = SeverityDetector()
