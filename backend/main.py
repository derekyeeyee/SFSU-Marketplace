import os
import uuid
from pathlib import Path
from typing import Optional

import boto3
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from database import (
    ListingInput,
    AccountInput,
    MessageInput,
    get_db_from_env,
    new_id,
)

load_dotenv(Path(__file__).resolve().parent / ".env")

app = FastAPI(title="SFSU Marketplace API")

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = get_db_from_env()

# --------------- R2 / S3 client ---------------

_s3 = None


def _get_s3():
    global _s3
    if _s3 is None:
        _s3 = boto3.client(
            "s3",
            endpoint_url=os.environ["R2_ENDPOINT_URL"],
            aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
            aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
            region_name="auto",
        )
    return _s3


R2_BUCKET = os.getenv("R2_BUCKET", "sf-hacks-marketplace")


# --------------- Request Schemas ---------------


class CreateListingBody(BaseModel):
    type: str
    title: str
    price: float = 0.0
    image_key: Optional[str] = None
    user: str = ""


class RegisterBody(BaseModel):
    username: str
    password: str
    email: str


class LoginBody(BaseModel):
    username: str
    password: str


class SendMessageBody(BaseModel):
    senderid: str
    recipientid: str
    listingid: str
    message: str
    conversationid: Optional[str] = None


# --------------- Helpers ---------------


def _safe_account(account: dict) -> dict:
    """Strip password from account data before returning to client."""
    return {
        "id": account["_id"],
        "username": account["username"],
        "email": account["email"],
        "createdat": account.get("createdat"),
        "isactive": account.get("isactive"),
        "role": account.get("role"),
    }


# --------------- Health ---------------


@app.get("/")
def root():
    return {"message": "SFSU Marketplace API is running."}


@app.get("/health")
def health():
    return {"status": "ok"}


# --------------- Listings ---------------


@app.get("/listings")
def list_listings(
    type: Optional[str] = Query(None),
    user: Optional[str] = Query(None),
    include_sold: bool = Query(True),
    limit: int = Query(50, ge=1, le=200),
):
    return db.list_listings(
        type=type, user=user, include_sold=include_sold, limit=limit
    )


@app.get("/listings/featured")
def get_featured_listings(limit: int = Query(10, ge=1, le=50)):
    return db.list_listings(type="item", include_sold=False, limit=limit)


@app.get("/listings/{listing_id}")
def get_listing(listing_id: str):
    listing = db.get_listing(listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing


@app.post("/listings", status_code=201)
def create_listing(body: CreateListingBody):
    try:
        listing_id = db.create_listing(
            ListingInput(
                type=body.type,
                title=body.title,
                price=body.price,
                image_key=body.image_key,
                user=body.user,
            )
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"id": listing_id}


@app.patch("/listings/{listing_id}/sold")
def mark_listing_sold(listing_id: str):
    ok = db.mark_listing_sold(listing_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Listing not found")
    return {"ok": True}


@app.delete("/listings/{listing_id}")
def delete_listing(listing_id: str):
    ok = db.delete_listing(listing_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Listing not found")
    return {"ok": True}


# --------------- Auth ---------------


@app.post("/auth/register", status_code=201)
def register(body: RegisterBody):
    try:
        account_id = db.create_account(
            AccountInput(
                username=body.username,
                password=body.password,
                email=body.email,
            )
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    account = db.get_account(account_id)
    if not account:
        raise HTTPException(status_code=500, detail="Account creation failed")

    return {"user": _safe_account(account)}


@app.post("/auth/login")
def login(body: LoginBody):
    account = db.get_account_by_username(body.username)
    if not account:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if account.get("password") != body.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not account.get("isactive", True):
        raise HTTPException(status_code=403, detail="Account is deactivated")

    return {"user": _safe_account(account)}


@app.get("/accounts/by-username/{username}")
def get_account_by_username(username: str):
    account = db.get_account_by_username(username)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return _safe_account(account)


@app.get("/accounts/{account_id}")
def get_account(account_id: str):
    account = db.get_account(account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return _safe_account(account)


# --------------- Messages ---------------


@app.post("/messages", status_code=201)
def send_message(body: SendMessageBody):
    conv_id = body.conversationid or new_id()
    try:
        msg_id = db.create_message(
            MessageInput(
                senderid=body.senderid,
                conversationid=conv_id,
                message=body.message,
                listingid=body.listingid,
                recipientid=body.recipientid,
            )
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"id": msg_id, "conversationid": conv_id}


@app.get("/messages")
def list_messages(
    conversationid: Optional[str] = Query(None),
    listingid: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
):
    return db.list_messages(
        conversationid=conversationid,
        listingid=listingid,
        limit=limit,
    )


@app.get("/messages/conversations/{user_id}")
def list_conversations(user_id: str):
    """Aggregated conversation previews for a user's inbox."""
    pipeline = [
        {
            "$match": {
                "$or": [
                    {"senderid": user_id},
                    {"recipientid": user_id},
                ],
            }
        },
        {"$sort": {"timestamp": -1}},
        {
            "$group": {
                "_id": "$conversationid",
                "lastmessage": {"$first": "$message"},
                "lasttimestamp": {"$first": "$timestamp"},
                "listingid": {"$first": "$listingid"},
                "senderid": {"$first": "$senderid"},
                "recipientid": {"$first": "$recipientid"},
            }
        },
        {"$sort": {"lasttimestamp": -1}},
    ]

    results = list(db.messages.aggregate(pipeline))

    conversations = []
    for r in results:
        other_id = (
            r["recipientid"] if r["senderid"] == user_id else r["senderid"]
        )

        listing = db.listings.find_one({"_id": r["listingid"]}, {"title": 1})
        listing_title = listing["title"] if listing else "Unknown listing"

        other_acct = db.accounts.find_one({"_id": other_id}, {"username": 1})
        other_name = other_acct["username"] if other_acct else "Unknown user"

        conversations.append(
            {
                "conversationid": r["_id"],
                "lastmessage": r["lastmessage"],
                "lasttimestamp": r.get("lasttimestamp"),
                "listingid": r.get("listingid"),
                "listingtitle": listing_title,
                "otheruserid": other_id,
                "otherusername": other_name,
            }
        )

    return conversations


@app.get("/messages/find-conversation")
def find_conversation(
    listingid: str = Query(...),
    user1: str = Query(...),
    user2: str = Query(...),
):
    """Find existing conversation between two users about a listing."""
    pipeline = [
        {
            "$match": {
                "listingid": listingid,
                "$or": [
                    {"senderid": user1, "recipientid": user2},
                    {"senderid": user2, "recipientid": user1},
                ],
            }
        },
        {"$group": {"_id": "$conversationid"}},
        {"$limit": 1},
    ]

    results = list(db.messages.aggregate(pipeline))
    if results:
        return {"conversationid": results[0]["_id"]}
    return {"conversationid": None}


@app.patch("/messages/{message_id}/read")
def mark_message_read(message_id: str):
    ok = db.mark_message_read(message_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"ok": True}


# --------------- Upload ---------------


@app.post("/upload", status_code=201)
def upload_image(file: UploadFile = File(...)):
    """Upload an image to R2 and return the object key."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    ext = Path(file.filename or "img").suffix or ".jpg"
    key = f"listings/{uuid.uuid4().hex}{ext}"

    try:
        s3 = _get_s3()
        s3.upload_fileobj(
            file.file,
            R2_BUCKET,
            key,
            ExtraArgs={"ContentType": file.content_type},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {e}")

    return {"key": key}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
