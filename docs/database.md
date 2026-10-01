# Database Schema Documentation

## Database Name
`pollution_extractor_db`

## Collection
`pollution_analyses`

## Document Schema
```json
{
  "_id": "uuid-string-v4",
  "inputText": "A chemical factory near Pune released sulfur dioxide...",
  "source": {
    "name": "chemical factory",
    "category": "Industrial Plant",
    "confidence": 0.94
  },
  "pollutants": [
    {
      "name": "sulfur dioxide",
      "confidence": 0.96,
      "evidence": "...released sulfur dioxide into the atmosphere..."
    }
  ],
  "locations": [
    {
      "name": "Pune",
      "confidence": 0.98,
      "evidence": "...near Pune released..."
    }
  ],
  "pollutionCategory": "Air Pollution",
  "severity": {
    "label": "High",
    "confidence": 0.92,
    "matched_indicator": "severe"
  },
  "entities": [
    {
      "text": "chemical factory",
      "type": "POLLUTION_SOURCE",
      "start": 2,
      "end": 18,
      "confidence": 0.94,
      "method": "rule_match",
      "evidence": "..."
    }
  ],
  "relationships": [
    {
      "source": "chemical factory",
      "pollutant": "sulfur dioxide",
      "location": "Pune",
      "relationship": "chemical factory emitted/released sulfur dioxide in/near Pune",
      "confidence": 0.96
    }
  ],
  "createdAt": "2026-10-02T04:15:00.000Z",
  "processingTimeMs": 14.5,
  "isDemo": false
}
```

## Indexes
- `pollutionCategory`
- `source.category`
- `createdAt`
- `locations.name`
- `pollutants.name`

## Local Fallback Mechanism
If MongoDB daemon is absent or unreachable on `mongodb://localhost:27017`, `DatabaseService` automatically redirects storage operations to `data/analyses_store.json`, keeping all read/write/filter/dashboard features fully functional.
