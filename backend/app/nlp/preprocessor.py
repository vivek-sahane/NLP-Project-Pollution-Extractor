import re
from typing import List, Dict, Any

class TextPreprocessor:
    """
    Clean, reusable text preprocessing module for pollution text mining.
    Preserves domain entities (PM2.5, chemical plant, sulfur dioxide, locations).
    """

    def __init__(self):
        # Specific stopwords to filter when building clean feature tokens for ML classification,
        # but NOT during NER extraction.
        self.ml_stopwords = {
            "a", "an", "the", "and", "or", "but", "if", "because", "as", "until", 
            "while", "of", "at", "by", "for", "with", "about", "against", "between", 
            "into", "through", "during", "before", "after", "above", "below", "to", 
            "from", "up", "upon", "down", "in", "out", "on", "off", "over", "under", 
            "again", "further", "then", "once", "here", "there", "when", "where", 
            "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", 
            "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", 
            "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"
        }

    def normalize_whitespace(self, text: str) -> str:
        """Collapse multiple spaces, tabs, and newlines into single spaces."""
        if not text:
            return ""
        text = re.sub(r'[\r\n\t]+', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    def clean_text(self, text: str) -> str:
        """Remove control characters and weird unicode symbols while preserving standard punctuation."""
        if not text:
            return ""
        text = self.normalize_whitespace(text)
        # Remove unusual non-printable characters
        text = re.sub(r'[^\x20-\x7E\n\r\t°µ]', '', text)
        return text.strip()

    def segment_sentences(self, text: str) -> List[str]:
        """Split raw text into clean sentences using regex lookbehinds for punctuation."""
        cleaned = self.clean_text(text)
        if not cleaned:
            return []
        # Split on sentence boundaries (., !, ?) while protecting abbreviations like PM2.5 or e.g.
        sentence_candidates = re.split(r'(?<=[.!?])\s+(?=[A-Z0-9])', cleaned)
        sentences = [s.strip() for s in sentence_candidates if s.strip()]
        return sentences if sentences else [cleaned]

    def tokenize(self, text: str, lower: bool = True) -> List[str]:
        """Tokenize text into words, preserving chemical terms like PM2.5, PM10, etc."""
        cleaned = self.clean_text(text)
        if lower:
            cleaned = cleaned.lower()
        # Match words, numbers with decimals (PM2.5), and hyphens
        tokens = re.findall(r'[a-zA-Z0-9]+(?:\.[0-9]+)?', cleaned)
        return [t for t in tokens if t]

    def preprocess_for_classification(self, text: str) -> str:
        """
        Prepares text specifically for the TF-IDF ML Classifier:
        lower-cases, cleans, and joins non-stopword tokens.
        """
        tokens = self.tokenize(text, lower=True)
        filtered = [t for t in tokens if t not in self.ml_stopwords and len(t) > 1]
        return " ".join(filtered)

    def process(self, text: str) -> Dict[str, Any]:
        """Return comprehensive preprocessing output."""
        cleaned = self.clean_text(text)
        sentences = self.segment_sentences(cleaned)
        tokens = self.tokenize(cleaned, lower=False)
        feature_text = self.preprocess_for_classification(cleaned)
        
        return {
            "original_text": text,
            "cleaned_text": cleaned,
            "sentence_count": len(sentences),
            "sentences": sentences,
            "token_count": len(tokens),
            "tokens": tokens,
            "feature_text": feature_text
        }

preprocessor = TextPreprocessor()
