# database.py
#
# Rewritten to match the MongoDB JSON Schema validation rules:
#   - All _id fields are strings (not ObjectId)
#   - All dates stored as ISO-8601 strings (not datetime)
#   - All reference IDs stored as strings (not ObjectId)
#   - Listing field is "imagekey" (not "image_key")
#   - Listing price is int (not float)

import os
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from pymongo import MongoClient, DESCENDING, ASCENDING
from bson import ObjectId


# -------------------------
# Helpers
# -------------------------

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def new_id() -> str:
    """Generate a unique string ID (24-char hex, same format as ObjectId)."""
    return str(ObjectId())


def _utcnow_iso() -> str:
    """Current UTC time as an ISO-8601 string."""
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _normalize_listing_type(t: str) -> str:
    t = (t or "").strip().lower()
    if t in ("request", "req", "requests"):
        return "request"
    if t in ("item", "items", "listing", "listings"):
        return "item"
    raise ValueError("type must be 'request(s)' or 'item'")


def _validate_nonempty_str(value: Any, field: str, *, max_len: int = 200) -> str:
    s = str(value or "").strip()
    if not s:
        raise ValueError(f"{field} is required")
    if len(s) > max_len:
        raise ValueError(f"{field} must be <= {max_len} characters")
    return s


# -------------------------
# Inputs
# -------------------------


@dataclass
class ListingInput:
    type: str
    title: str
    price: float = 0.0
    image_key: Optional[str] = None
    user: str = ""


@dataclass
class AccountInput:
    username: str
    password: str
    email: str
    isactive: bool = True
    role: str = "user"  # user/admin


@dataclass
class MessageInput:
    senderid: str
    conversationid: str
    message: str
    listingid: str
    recipientid: str
    isread: bool = False


# -------------------------
# Validation
# -------------------------


def validate_listing_input(li: ListingInput) -> Dict[str, Any]:
    t = _normalize_listing_type(li.type)
    title = _validate_nonempty_str(li.title, "title", max_len=140)

    try:
        price = int(float(li.price or 0))
    except (TypeError, ValueError):
        raise ValueError("price must be a number")
    if price < 0:
        raise ValueError("price must be >= 0")

    # Schema requires imagekey as a string (use "" for no image)
    imagekey = str(li.image_key or "").strip()
    user = _validate_nonempty_str(li.user, "user", max_len=80)

    return {
        "type": t,
        "title": title,
        "price": price,
        "imagekey": imagekey,
        "user": user,
    }


def validate_account_input(ai: AccountInput) -> Dict[str, Any]:
    username = _validate_nonempty_str(ai.username, "username", max_len=40)
    password = _validate_nonempty_str(ai.password, "password", max_len=200)
    if len(password) < 8:
        raise ValueError("password must be at least 8 characters")

    email = _validate_nonempty_str(ai.email, "email", max_len=254)
    if not EMAIL_RE.match(email):
        raise ValueError("email must be a valid email address")

    if not isinstance(ai.isactive, bool):
        raise ValueError("isactive must be a boolean")

    role = str(ai.role or "").strip().lower()
    if role not in ("user", "admin"):
        raise ValueError("role must be 'user' or 'admin'")

    return {
        "username": username,
        "password": password,
        "email": email,
        "isactive": ai.isactive,
        "role": role,
    }


def validate_message_input(mi: MessageInput) -> Dict[str, Any]:
    senderid = _validate_nonempty_str(mi.senderid, "senderid", max_len=50)
    recipientid = _validate_nonempty_str(mi.recipientid, "recipientid", max_len=50)
    conversationid = _validate_nonempty_str(
        mi.conversationid, "conversationid", max_len=50
    )
    listingid = _validate_nonempty_str(mi.listingid, "listingid", max_len=50)
    message = _validate_nonempty_str(mi.message, "message", max_len=4000)

    if not isinstance(mi.isread, bool):
        raise ValueError("isread must be a boolean")

    return {
        "senderid": senderid,
        "recipientid": recipientid,
        "conversationid": conversationid,
        "listingid": listingid,
        "message": message,
        "isread": mi.isread,
    }


# -------------------------
# Database
# -------------------------


class Database:
    """
    Interactor for three collections:
      - accounts
      - listings
      - messages

    All IDs and dates are stored as strings to comply with the
    MongoDB JSON Schema validation rules on the Atlas cluster.
    """

    def __init__(
        self,
        uri: str,
        db_name: str = "SFSU-Marketplace",
        *,
        accounts_col: str = "accounts",
        listings_col: str = "listings",
        messages_col: str = "messages",
        client: Optional[MongoClient] = None,
    ):
        self.client = client or MongoClient(uri)
        db = self.client[db_name]
        self.accounts = db[accounts_col]
        self.listings = db[listings_col]
        self.messages = db[messages_col]

        # Indexes (safe to call repeatedly)
        self.accounts.create_index([("username", ASCENDING)], unique=True)
        self.accounts.create_index([("email", ASCENDING)], unique=True)
        self.accounts.create_index([("createdat", DESCENDING)])

        self.listings.create_index([("createdat", DESCENDING)])
        self.listings.create_index([("user", ASCENDING), ("createdat", DESCENDING)])
        self.listings.create_index([("type", ASCENDING), ("createdat", DESCENDING)])

        self.messages.create_index(
            [("conversationid", ASCENDING), ("timestamp", ASCENDING)]
        )
        self.messages.create_index(
            [("listingid", ASCENDING), ("timestamp", ASCENDING)]
        )
        self.messages.create_index(
            [
                ("recipientid", ASCENDING),
                ("isread", ASCENDING),
                ("timestamp", DESCENDING),
            ]
        )

    # ---------
    # Listings
    # ---------

    def create_listing(self, listing: ListingInput) -> str:
        base = validate_listing_input(listing)
        doc = {
            "_id": new_id(),
            **base,
            "createdat": _utcnow_iso(),
            "soldat": None,
        }
        self.listings.insert_one(doc)
        return doc["_id"]

    def get_listing(self, listing_id: str) -> Optional[Dict[str, Any]]:
        doc = self.listings.find_one({"_id": listing_id})
        return self._public_listing(doc) if doc else None

    def list_listings(
        self,
        *,
        type: Optional[str] = None,
        user: Optional[str] = None,
        include_sold: bool = True,
        limit: int = 50,
    ) -> List[Dict[str, Any]]:
        q: Dict[str, Any] = {}
        if type:
            q["type"] = _normalize_listing_type(type)
        if user:
            q["user"] = str(user).strip()
        if not include_sold:
            q["soldat"] = None

        lim = max(1, min(int(limit), 200))
        cur = self.listings.find(q).sort("createdat", DESCENDING).limit(lim)
        return [self._public_listing(d) for d in cur]

    def update_listing(self, listing_id: str, updates: Dict[str, Any]) -> bool:
        allowed = {"type", "title", "price", "imagekey", "user"}
        safe: Dict[str, Any] = {}
        for k, v in (updates or {}).items():
            if k not in allowed:
                continue
            if k == "type":
                safe["type"] = _normalize_listing_type(str(v))
            elif k == "title":
                safe["title"] = _validate_nonempty_str(v, "title", max_len=140)
            elif k == "price":
                try:
                    price = int(float(v))
                except (TypeError, ValueError):
                    raise ValueError("price must be a number")
                if price < 0:
                    raise ValueError("price must be >= 0")
                safe["price"] = price
            elif k == "imagekey":
                safe["imagekey"] = str(v or "").strip()
            elif k == "user":
                safe["user"] = _validate_nonempty_str(v, "user", max_len=80)

        if not safe:
            return False

        res = self.listings.update_one({"_id": listing_id}, {"$set": safe})
        return res.matched_count == 1

    def mark_listing_sold(self, listing_id: str) -> bool:
        res = self.listings.update_one(
            {"_id": listing_id}, {"$set": {"soldat": _utcnow_iso()}}
        )
        return res.matched_count == 1

    def delete_listing(self, listing_id: str) -> bool:
        res = self.listings.delete_one({"_id": listing_id})
        return res.deleted_count == 1

    def _public_listing(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "id": doc["_id"],
            "type": doc.get("type"),
            "title": doc.get("title"),
            "price": doc.get("price"),
            "imagekey": doc.get("imagekey"),
            "createdat": doc.get("createdat"),
            "soldat": doc.get("soldat"),
            "user": doc.get("user"),
        }

    # ---------
    # Accounts
    # ---------

    def create_account(self, account: AccountInput) -> str:
        base = validate_account_input(account)
        doc = {
            "_id": new_id(),
            **base,
            "createdat": _utcnow_iso(),
        }
        self.accounts.insert_one(doc)
        return doc["_id"]

    def get_account(self, account_id: str) -> Optional[Dict[str, Any]]:
        doc = self.accounts.find_one({"_id": account_id})
        return self._public_account(doc) if doc else None

    def get_account_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        u = str(username or "").strip()
        doc = self.accounts.find_one({"username": u})
        return self._public_account(doc) if doc else None

    def list_accounts(self, *, limit: int = 50) -> List[Dict[str, Any]]:
        lim = max(1, min(int(limit), 200))
        cur = self.accounts.find({}).sort("createdat", DESCENDING).limit(lim)
        return [self._public_account(d) for d in cur]

    def update_account(self, account_id: str, updates: Dict[str, Any]) -> bool:
        allowed = {"username", "password", "email", "isactive", "role"}
        safe: Dict[str, Any] = {}

        for k, v in (updates or {}).items():
            if k not in allowed:
                continue
            if k == "username":
                safe["username"] = _validate_nonempty_str(v, "username", max_len=40)
            elif k == "password":
                pw = _validate_nonempty_str(v, "password", max_len=200)
                if len(pw) < 8:
                    raise ValueError("password must be at least 8 characters")
                safe["password"] = pw
            elif k == "email":
                email = _validate_nonempty_str(v, "email", max_len=254)
                if not EMAIL_RE.match(email):
                    raise ValueError("email must be a valid email address")
                safe["email"] = email
            elif k == "isactive":
                if not isinstance(v, bool):
                    raise ValueError("isactive must be a boolean")
                safe["isactive"] = v
            elif k == "role":
                role = str(v or "").strip().lower()
                if role not in ("user", "admin"):
                    raise ValueError("role must be 'user' or 'admin'")
                safe["role"] = role

        if not safe:
            return False

        res = self.accounts.update_one({"_id": account_id}, {"$set": safe})
        return res.matched_count == 1

    def deactivate_account(self, account_id: str) -> bool:
        res = self.accounts.update_one(
            {"_id": account_id}, {"$set": {"isactive": False}}
        )
        return res.matched_count == 1

    def delete_account(self, account_id: str) -> bool:
        res = self.accounts.delete_one({"_id": account_id})
        return res.deleted_count == 1

    def _public_account(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "_id": doc["_id"],
            "username": doc.get("username"),
            "password": doc.get("password"),
            "email": doc.get("email"),
            "createdat": doc.get("createdat"),
            "isactive": doc.get("isactive"),
            "role": doc.get("role"),
        }

    # ---------
    # Messages
    # ---------

    def create_message(self, message: MessageInput) -> str:
        base = validate_message_input(message)
        doc = {
            "_id": new_id(),
            **base,
            "timestamp": _utcnow_iso(),
        }
        self.messages.insert_one(doc)
        return doc["_id"]

    def get_message(self, message_id: str) -> Optional[Dict[str, Any]]:
        doc = self.messages.find_one({"_id": message_id})
        return self._public_message(doc) if doc else None

    def list_messages(
        self,
        *,
        conversationid: Optional[str] = None,
        listingid: Optional[str] = None,
        limit: int = 100,
    ) -> List[Dict[str, Any]]:
        q: Dict[str, Any] = {}
        if conversationid:
            q["conversationid"] = conversationid
        if listingid:
            q["listingid"] = listingid

        lim = max(1, min(int(limit), 500))
        cur = self.messages.find(q).sort("timestamp", ASCENDING).limit(lim)
        return [self._public_message(d) for d in cur]

    def mark_message_read(self, message_id: str) -> bool:
        res = self.messages.update_one(
            {"_id": message_id}, {"$set": {"isread": True}}
        )
        return res.matched_count == 1

    def delete_message(self, message_id: str) -> bool:
        res = self.messages.delete_one({"_id": message_id})
        return res.deleted_count == 1

    def _public_message(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "id": doc["_id"],
            "senderid": doc.get("senderid"),
            "conversationid": doc.get("conversationid"),
            "message": doc.get("message"),
            "listingid": doc.get("listingid"),
            "recipientid": doc.get("recipientid"),
            "timestamp": doc.get("timestamp"),
            "isread": doc.get("isread"),
        }


def get_db_from_env(*, client: Optional[MongoClient] = None) -> Database:
    uri = os.environ["MONGODB_URI"]
    db_name = os.getenv("MONGODB_DB", "SFSU-Marketplace")
    return Database(uri, db_name=db_name, client=client)
