import os
import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from pymongo import MongoClient
from app.config import settings

class DatabaseService:
    """
    MongoDB database service with seamless local JSON fallback
    for high reliability and immediate zero-dependency running.
    """

    def __init__(self):
        self.db = None
        self.collection = None
        self.is_mongodb_connected = False
        self.fallback_file = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "data", "analyses_store.json"
        )
        self._init_db()

    def _init_db(self):
        """Try connecting to MongoDB; fallback to JSON file if unreachable."""
        try:
            client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=1500)
            client.admin.command('ping')
            self.db = client[settings.DATABASE_NAME]
            self.collection = self.db["pollution_analyses"]
            
            # Ensure indexes
            self.collection.create_index("pollutionCategory")
            self.collection.create_index("source.category")
            self.collection.create_index("createdAt")
            self.collection.create_index("locations.name")
            self.collection.create_index("pollutants.name")
            
            self.is_mongodb_connected = True
            print(f"[Database] Successfully connected to MongoDB database '{settings.DATABASE_NAME}'")
        except Exception as e:
            self.is_mongodb_connected = False
            print(f"[Database] MongoDB not available ({e}). Using persistent local store fallback.")
            self._ensure_fallback_file()

    def _ensure_fallback_file(self):
        os.makedirs(os.path.dirname(self.fallback_file), exist_ok=True)
        if not os.path.exists(self.fallback_file):
            with open(self.fallback_file, "w", encoding="utf-8") as f:
                json.dump([], f)

    def _read_fallback(self) -> List[Dict[str, Any]]:
        self._ensure_fallback_file()
        try:
            with open(self.fallback_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []

    def _write_fallback(self, data: List[Dict[str, Any]]):
        self._ensure_fallback_file()
        with open(self.fallback_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, default=str)

    def save_analysis(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        """Save analysis record to database or fallback file."""
        if "_id" not in doc or not doc["_id"]:
            doc["_id"] = str(uuid.uuid4())
        if "createdAt" not in doc or not doc["createdAt"]:
            doc["createdAt"] = datetime.utcnow().isoformat()

        if self.is_mongodb_connected and self.collection is not None:
            try:
                self.collection.insert_one(doc)
                doc["id"] = doc["_id"]
                return doc
            except Exception as e:
                print(f"[Database] MongoDB save failed: {e}. Writing to fallback.")

        # Fallback file save
        items = self._read_fallback()
        # Remove existing if overwriting
        items = [item for item in items if item.get("_id") != doc["_id"] and item.get("id") != doc["_id"]]
        doc["id"] = doc["_id"]
        items.insert(0, doc)
        self._write_fallback(items)
        return doc

    def get_analyses(
        self,
        search: Optional[str] = None,
        category: Optional[str] = None,
        source_category: Optional[str] = None,
        severity: Optional[str] = None,
        sort_by: str = "newest",
        page: int = 1,
        limit: int = 10
        ,date_from: Optional[str] = None
        ,date_to: Optional[str] = None
    ) -> Dict[str, Any]:
        """Fetch analyses with searching, multi-criteria filtering, and pagination."""
        if self.is_mongodb_connected and self.collection is not None:
            try:
                query = {}
                if category and category != "all":
                    query["pollutionCategory"] = category
                if source_category and source_category != "all":
                    query["source.category"] = source_category
                if severity and severity != "all":
                    query["severity.label"] = severity
                if search:
                    regex = {"$regex": search, "$options": "i"}
                    query["$or"] = [
                        {"inputText": regex},
                        {"source.name": regex},
                        {"source.category": regex},
                        {"locations.name": regex},
                        {"pollutants.name": regex}
                    ]
                if date_from or date_to:
                    date_query = {}
                    if date_from:
                        date_query["$gte"] = date_from
                    if date_to:
                        date_query["$lte"] = f"{date_to}T23:59:59"
                    query["createdAt"] = date_query

                sort_order = -1 if sort_by == "newest" else 1
                total = self.collection.count_documents(query)
                cursor = self.collection.find(query).sort("createdAt", sort_order).skip((page - 1) * limit).limit(limit)
                items = list(cursor)
                for item in items:
                    item["id"] = str(item["_id"])
                    if "_id" in item:
                        del item["_id"]
                return {"items": items, "total": total, "page": page, "limit": limit}
            except Exception as e:
                print(f"[Database] MongoDB query failed: {e}. Querying fallback file.")

        # Local JSON Fallback query execution
        items = self._read_fallback()

        filtered = []
        for item in items:
            # Category filter
            if category and category != "all" and item.get("pollutionCategory") != category:
                continue
            # Source category filter
            src_cat = item.get("source", {}).get("category")
            if source_category and source_category != "all" and src_cat != source_category:
                continue
            # Severity filter
            sev_label = item.get("severity", {}).get("label") if isinstance(item.get("severity"), dict) else item.get("severity")
            if severity and severity != "all" and sev_label != severity:
                continue
            # Search query
            if search:
                s_lower = search.lower()
                text_match = s_lower in item.get("inputText", "").lower()
                src_match = s_lower in item.get("source", {}).get("name", "").lower()
                loc_match = any(s_lower in loc.get("name", "").lower() for loc in item.get("locations", []))
                pol_match = any(s_lower in pol.get("name", "").lower() for pol in item.get("pollutants", []))
                if not (text_match or src_match or loc_match or pol_match):
                    continue
            created_at = item.get("createdAt", "")
            if date_from and created_at[:10] < date_from:
                continue
            if date_to and created_at[:10] > date_to:
                continue

            filtered.append(item)

        # Sort
        filtered.sort(key=lambda x: x.get("createdAt", ""), reverse=(sort_by == "newest"))

        total = len(filtered)
        start_idx = (page - 1) * limit
        paginated_items = filtered[start_idx : start_idx + limit]

        return {
            "items": paginated_items,
            "total": total,
            "page": page,
            "limit": limit
        }

    def get_analysis_by_id(self, analysis_id: str) -> Optional[Dict[str, Any]]:
        """Fetch a single analysis by ID."""
        if self.is_mongodb_connected and self.collection is not None:
            try:
                item = self.collection.find_one({"_id": analysis_id})
                if item:
                    item["id"] = str(item["_id"])
                    del item["_id"]
                    return item
            except Exception:
                pass

        items = self._read_fallback()
        for item in items:
            if item.get("_id") == analysis_id or item.get("id") == analysis_id:
                return item
        return None

    def delete_analysis(self, analysis_id: str) -> bool:
        """Delete an analysis record by ID."""
        deleted = False
        if self.is_mongodb_connected and self.collection is not None:
            try:
                res = self.collection.delete_one({"_id": analysis_id})
                if res.deleted_count > 0:
                    deleted = True
            except Exception:
                pass

        items = self._read_fallback()
        new_items = [i for i in items if i.get("_id") != analysis_id and i.get("id") != analysis_id]
        if len(new_items) < len(items):
            self._write_fallback(new_items)
            deleted = True

        return deleted

    def get_dashboard_stats(self) -> Dict[str, Any]:
        """Aggregate statistics for Recharts dashboard visualization."""
        if self.is_mongodb_connected and self.collection is not None:
            try:
                items = list(self.collection.find())
            except Exception:
                items = self._read_fallback()
        else:
            items = self._read_fallback()

        total = len(items)
        categories: Dict[str, int] = {}
        source_categories: Dict[str, int] = {}
        pollutants: Dict[str, int] = {}
        locations: Dict[str, int] = {}
        severities: Dict[str, int] = {}
        analyses_by_date: Dict[str, int] = {}

        for item in items:
            # Pollution category
            cat = item.get("pollutionCategory", "Other")
            categories[cat] = categories.get(cat, 0) + 1

            # Source category
            src = item.get("source", {})
            src_cat = src.get("category", "Unknown Source") if isinstance(src, dict) else "Unknown Source"
            source_categories[src_cat] = source_categories.get(src_cat, 0) + 1

            # Pollutants
            p_list = item.get("pollutants", [])
            for p in p_list:
                p_name = p.get("name") if isinstance(p, dict) else str(p)
                if p_name:
                    pollutants[p_name] = pollutants.get(p_name, 0) + 1

            # Locations
            l_list = item.get("locations", [])
            for l in l_list:
                l_name = l.get("name") if isinstance(l, dict) else str(l)
                if l_name:
                    locations[l_name] = locations.get(l_name, 0) + 1

            # Severities
            sev = item.get("severity", {})
            sev_label = sev.get("label", "Unknown") if isinstance(sev, dict) else str(sev)
            severities[sev_label] = severities.get(sev_label, 0) + 1
            date_key = str(item.get("createdAt", ""))[:10]
            if date_key:
                analyses_by_date[date_key] = analyses_by_date.get(date_key, 0) + 1

        # Format arrays for Recharts
        cat_dist = [{"name": k, "value": v} for k, v in categories.items()]
        src_dist = [{"name": k, "value": v} for k, v in sorted(source_categories.items(), key=lambda x: x[1], reverse=True)[:6]]
        top_pollutants = [{"name": k, "count": v} for k, v in sorted(pollutants.items(), key=lambda x: x[1], reverse=True)[:6]]
        top_locations = [{"name": k, "count": v} for k, v in sorted(locations.items(), key=lambda x: x[1], reverse=True)[:6]]
        sev_dist = [{"name": k, "value": v} for k, v in severities.items()]
        over_time = [{"name": k, "value": v} for k, v in sorted(analyses_by_date.items())]

        return {
            "totalAnalyses": total,
            "categoryDistribution": cat_dist,
            "sourceCategoryDistribution": src_dist,
            "topPollutants": top_pollutants,
            "topLocations": top_locations,
            "severityDistribution": sev_dist,
            "analysesOverTime": over_time,
            "databaseType": "MongoDB" if self.is_mongodb_connected else "Local Resilient Store"
        }

db_service = DatabaseService()
