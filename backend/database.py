import os
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Optional, Dict, List

from pymongo import MongoClient, DESCENDING
from bson import ObjectId

def utcnow() -> datetime:
    return datetime.now(timezone.utc)

def _normalize_type(t: str) -> str:
    t = (t or "").strip().lower()
    if t in ("request", "req", "requests"):
        return "request"
    if t in ("item", "items", "listing"):
        return "item"
    raise ValueError("type must be 'request' or 'item'")

@dataclass
class PostInput:
    type: str
    title: str
    price: float = 0.0
    image_key: Optional[str] = None
    user: str = ""

class PostsRepo:
    def __init__(self, uri: str, db_name: str, collection_name: str):
        self.client = MongoClient(uri)
        self.col = self.client[db_name][collection_name]

        # Helpful indexes (safe to call repeatedly)
        self.col.create_index([("created_at", DESCENDING)])
        self.col.create_index([("user", 1), ("created_at", DESCENDING)])
        self.col.create_index([("type", 1), ("created_at", DESCENDING)])
        self.col.create_index([("sold_at", 1)])

    def create_post(self, post: PostInput) -> str:
        doc = {
            "type": _normalize_type(post.type),
            "title": post.title.strip(),
            "price": float(post.price),
            "image_key": post.image_key,
            "created_at": utcnow(),
            "sold_at": None,
            "user": post.user.strip(),
        }
        res = self.col.insert_one(doc)
        return str(res.inserted_id)

    def get_post(self, post_id: str) -> Optional[Dict[str, Any]]:
        doc = self.col.find_one({"_id": ObjectId(post_id)})
        return self._public(doc) if doc else None

    def list_posts(
        self,
        *,
        type: Optional[str] = None,
        user: Optional[str] = None,
        include_sold: bool = True,
        limit: int = 50,
    ) -> List[Dict[str, Any]]:
        q: Dict[str, Any] = {}
        if type:
            q["type"] = _normalize_type(type)
        if user:
            q["user"] = user
        if not include_sold:
            q["sold_at"] = None

        cur = self.col.find(q).sort("created_at", DESCENDING).limit(max(1, min(limit, 200)))
        return [self._public(d) for d in cur]

    def update_post(self, post_id: str, updates: Dict[str, Any]) -> bool:
        # Whitelist fields you allow to be updated
        allowed = {"type", "title", "price", "image_key", "sold_at", "user"}
        safe_updates: Dict[str, Any] = {}

        for k, v in updates.items():
            if k not in allowed:
                continue
            if k == "type":
                safe_updates["type"] = _normalize_type(v)
            elif k == "title":
                safe_updates["title"] = str(v).strip()
            elif k == "price":
                safe_updates["price"] = float(v)
            elif k == "sold_at":
                # allow None, "now", or datetime-ish ISO string
                if v is None:
                    safe_updates["sold_at"] = None
                elif v == "now":
                    safe_updates["sold_at"] = utcnow()
                else:
                    # assume ISO-8601 string
                    safe_updates["sold_at"] = datetime.fromisoformat(v)
            else:
                safe_updates[k] = v

        if not safe_updates:
            return False

        res = self.col.update_one({"_id": ObjectId(post_id)}, {"$set": safe_updates})
        return res.modified_count == 1

    def mark_sold(self, post_id: str) -> bool:
        res = self.col.update_one({"_id": ObjectId(post_id)}, {"$set": {"sold_at": utcnow()}})
        return res.modified_count == 1

    def delete_post(self, post_id: str) -> bool:
        res = self.col.delete_one({"_id": ObjectId(post_id)})
        return res.deleted_count == 1

    def _public(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        # Convert ObjectId + datetimes into JSON-friendly values
        return {
            "id": str(doc["_id"]),
            "type": doc.get("type"),
            "title": doc.get("title"),
            "price": doc.get("price"),
            "image_key": doc.get("image_key"),
            "created_at": doc.get("created_at").isoformat() if doc.get("created_at") else None,
            "sold_at": doc.get("sold_at").isoformat() if doc.get("sold_at") else None,
            "user": doc.get("user"),
        }

def get_repo_from_env() -> PostsRepo:
    uri = os.environ["MONGODB_URI"]
    db_name = os.getenv("MONGODB_DB", "campuslist")
    col_name = os.getenv("MONGODB_COLLECTION", "posts")
    return PostsRepo(uri, db_name, col_name)
