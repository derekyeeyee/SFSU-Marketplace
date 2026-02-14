# database.py
import os
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from pymongo import MongoClient, DESCENDING, ASCENDING
from bson import ObjectId
from bson.errors import InvalidId


# -------------------------
# Helpers
# -------------------------

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _iso_utc(dt: Optional[datetime]) -> Optional[str]:
    if not dt:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    dt = dt.astimezone(timezone.utc)
    return dt.isoformat().replace("+00:00", "Z")


def _parse_object_id(value: Any, *, field: str) -> ObjectId:
    if isinstance(value, ObjectId):
        return value
    try:
        return ObjectId(str(value))
    except (InvalidId, TypeError):
        raise ValueError(f"{field} must be a valid ObjectId string")


def _parse_datetime_like(v: Any, *, field: str) -> Optional[datetime]:
    """
    Accepts:
      - None
      - "now"
      - datetime
      - ISO-8601 strings (with or without 'Z')
    Returns aware datetime in UTC (or None).
    """
    if v is None:
        return None
    if v == "now":
        return utcnow()
    if isinstance(v, datetime):
        dt = v
    else:
        s = str(v).strip()
        if s.endswith("Z"):
            s = s[:-1] + "+00:00"
        try:
            dt = datetime.fromisoformat(s)
        except ValueError:
            raise ValueError(f"{field} must be an ISO-8601 datetime string, datetime, None, or 'now'")

    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


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
    type: str  # requests or item
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
        price = float(li.price or 0.0)
    except (TypeError, ValueError):
        raise ValueError("price must be a number")
    if price < 0:
        raise ValueError("price must be >= 0")

    image_key = None if li.image_key is None else str(li.image_key).strip() or None
    user = _validate_nonempty_str(li.user, "user", max_len=80)

    return {
        "type": t,
        "title": title,
        "price": price,
        "image_key": image_key,
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
    sender_oid = _parse_object_id(mi.senderid, field="senderid")
    recipient_oid = _parse_object_id(mi.recipientid, field="recipientid")
    conv_oid = _parse_object_id(mi.conversationid, field="conversationid")
    listing_oid = _parse_object_id(mi.listingid, field="listingid")
    message = _validate_nonempty_str(mi.message, "message", max_len=4000)

    if not isinstance(mi.isread, bool):
        raise ValueError("isread must be a boolean")

    return {
        "senderid": sender_oid,
        "recipientid": recipient_oid,
        "conversationid": conv_oid,
        "listingid": listing_oid,
        "message": message,
        "isread": mi.isread,
    }


# -------------------------
# Repo (Interactor)
# -------------------------

class Database:
    """
    Interactor for:
      - accounts
      - listings
      - messages
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
        self.listings.create_index([("soldat", ASCENDING)])

        self.messages.create_index([("conversationid", ASCENDING), ("timestamp", ASCENDING)])
        self.messages.create_index([("listingid", ASCENDING), ("timestamp", ASCENDING)])
        self.messages.create_index([("recipientid", ASCENDING), ("isread", ASCENDING), ("timestamp", DESCENDING)])

    # ---------
    # Listings
    # ---------

    def create_listing(self, listing: ListingInput) -> str:
        base = validate_listing_input(listing)
        doc = {
            **base,
            "createdat": utcnow(),
            "soldat": None,
        }
        res = self.listings.insert_one(doc)
        return str(res.inserted_id)

    def get_listing(self, listing_id: str) -> Optional[Dict[str, Any]]:
        oid = _parse_object_id(listing_id, field="listing_id")
        doc = self.listings.find_one({"_id": oid})
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
        oid = _parse_object_id(listing_id, field="listing_id")

        allowed = {"type", "title", "price", "image_key", "soldat", "user"}
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
                    price = float(v)
                except (TypeError, ValueError):
                    raise ValueError("price must be a number")
                if price < 0:
                    raise ValueError("price must be >= 0")
                safe["price"] = price
            elif k == "soldat":
                safe["soldat"] = _parse_datetime_like(v, field="soldat")
            elif k == "user":
                safe["user"] = _validate_nonempty_str(v, "user", max_len=80)
            else:
                safe[k] = None if v is None else v

        if not safe:
            return False

        res = self.listings.update_one({"_id": oid}, {"$set": safe})
        return res.matched_count == 1

    def mark_listing_sold(self, listing_id: str) -> bool:
        oid = _parse_object_id(listing_id, field="listing_id")
        res = self.listings.update_one({"_id": oid}, {"$set": {"soldat": utcnow()}})
        return res.matched_count == 1

    def delete_listing(self, listing_id: str) -> bool:
        oid = _parse_object_id(listing_id, field="listing_id")
        res = self.listings.delete_one({"_id": oid})
        return res.deleted_count == 1

    def _public_listing(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "id": str(doc["_id"]),
            "type": doc.get("type"),
            "title": doc.get("title"),
            "price": doc.get("price"),
            "imagekey": doc.get("image_key"),  # expose as imagekey per your naming
            "createdat": _iso_utc(doc.get("createdat")),
            "soldat": _iso_utc(doc.get("soldat")),
            "user": doc.get("user"),
        }

    # ---------
    # Accounts
    # ---------

    def create_account(self, account: AccountInput) -> str:
        base = validate_account_input(account)
        doc = {
            **base,
            "createdat": utcnow(),
        }
        res = self.accounts.insert_one(doc)
        return str(res.inserted_id)

    def get_account(self, account_id: str) -> Optional[Dict[str, Any]]:
        oid = _parse_object_id(account_id, field="account_id")
        doc = self.accounts.find_one({"_id": oid})
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
        oid = _parse_object_id(account_id, field="account_id")

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

        res = self.accounts.update_one({"_id": oid}, {"$set": safe})
        return res.matched_count == 1

    def deactivate_account(self, account_id: str) -> bool:
        oid = _parse_object_id(account_id, field="account_id")
        res = self.accounts.update_one({"_id": oid}, {"$set": {"isactive": False}})
        return res.matched_count == 1

    def delete_account(self, account_id: str) -> bool:
        oid = _parse_object_id(account_id, field="account_id")
        res = self.accounts.delete_one({"_id": oid})
        return res.deleted_count == 1

    def _public_account(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "_id": str(doc["_id"]),
            "username": doc.get("username"),
            "password": doc.get("password"),  # note: you probably don't want to expose this in an API
            "email": doc.get("email"),
            "createdat": _iso_utc(doc.get("createdat")),
            "isactive": doc.get("isactive"),
            "role": doc.get("role"),
        }

    # ---------
    # Messages
    # ---------

    def create_message(self, message: MessageInput) -> str:
        base = validate_message_input(message)
        doc = {
            **base,
            "timestamp": utcnow(),
        }
        res = self.messages.insert_one(doc)
        return str(res.inserted_id)

    def get_message(self, message_id: str) -> Optional[Dict[str, Any]]:
        oid = _parse_object_id(message_id, field="message_id")
        doc = self.messages.find_one({"_id": oid})
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
            q["conversationid"] = _parse_object_id(conversationid, field="conversationid")
        if listingid:
            q["listingid"] = _parse_object_id(listingid, field="listingid")

        lim = max(1, min(int(limit), 500))
        cur = self.messages.find(q).sort("timestamp", ASCENDING).limit(lim)
        return [self._public_message(d) for d in cur]

    def mark_message_read(self, message_id: str) -> bool:
        oid = _parse_object_id(message_id, field="message_id")
        res = self.messages.update_one({"_id": oid}, {"$set": {"isread": True}})
        return res.matched_count == 1

    def delete_message(self, message_id: str) -> bool:
        oid = _parse_object_id(message_id, field="message_id")
        res = self.messages.delete_one({"_id": oid})
        return res.deleted_count == 1

    def _public_message(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "id": str(doc["_id"]),
            "senderid": str(doc.get("senderid")) if doc.get("senderid") else None,
            "conversationid": str(doc.get("conversationid")) if doc.get("conversationid") else None,
            "message": doc.get("message"),
            "listingid": str(doc.get("listingid")) if doc.get("listingid") else None,
            "recipientid": str(doc.get("recipientid")) if doc.get("recipientid") else None,
            "timestamp": _iso_utc(doc.get("timestamp")),
            "isread": doc.get("isread"),
        }


def get_db_from_env(*, client: Optional[MongoClient] = None) -> Database:
    uri = os.environ["MONGODB_URI"]
    db_name = os.getenv("MONGODB_DB", "SFSU-Marketplace")
    return Database(uri, db_name=db_name, client=client)
