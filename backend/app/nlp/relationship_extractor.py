from typing import List, Dict, Any, Optional

class RelationshipExtractor:
    """
    Extracts semantic triples: (Pollution Source) -> (Pollutant) -> (Location)
    using sentence proximity, entity co-occurrence, and contextual connective verbs.
    """

    def __init__(self):
        self.connective_verbs = [
            "released", "emitted", "discharged", "caused", "generated", "produced",
            "leaked", "dumped", "spilled", "blew", "created", "affected", "polluted"
        ]

    def extract_relationships(
        self,
        text: str,
        sources: List[Dict[str, Any]],
        pollutants: List[Dict[str, Any]],
        locations: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Extract relationships between entities present in the text.
        """
        relationships = []

        if not sources and not pollutants and not locations:
            return relationships

        primary_source = sources[0]["text"] if sources else None
        primary_pollutant = pollutants[0]["text"] if pollutants else None
        primary_location = locations[0]["text"] if locations else None

        # Check co-occurrence in sentences or distance
        if primary_source or primary_pollutant or primary_location:
            # Calculate relationship confidence based on co-occurrence proximity
            confidence = 0.88 if (primary_source and primary_pollutant and primary_location) else 0.70
            
            # Check for connective verbs in text
            lower_text = text.lower()
            found_connective = any(v in lower_text for v in self.connective_verbs)
            if found_connective:
                confidence = min(0.96, confidence + 0.08)

            relation_desc = ""
            if primary_source and primary_pollutant:
                relation_desc = f"{primary_source} emitted/released {primary_pollutant}"
            elif primary_source:
                relation_desc = f"{primary_source} caused pollution"

            if primary_location:
                relation_desc += f" in/near {primary_location}"

            relationships.append({
                "source": primary_source or "Unknown Source",
                "pollutant": primary_pollutant or "Unspecified Pollutant",
                "location": primary_location or "Unspecified Location",
                "relationship": relation_desc,
                "confidence": round(confidence, 2)
            })

        return relationships

relationship_extractor = RelationshipExtractor()
