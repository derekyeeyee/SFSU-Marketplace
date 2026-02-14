from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from database import PostInput, get_repo_from_env

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

repo = get_repo_from_env()


# --------------- Schemas ---------------

class CreatePostBody(BaseModel):
    type: str
    title: str
    price: float = 0.0
    image_key: Optional[str] = None
    description: str = ""
    user: str = ""


# --------------- Routes ----------------

@app.get("/")
def root():
    return {"message": "SFSU Marketplace API is running."}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/posts")
def list_posts(
    type: Optional[str] = Query(None),
    include_sold: bool = Query(True),
    limit: int = Query(50, ge=1, le=200),
):
    return repo.list_posts(type=type, include_sold=include_sold, limit=limit)


@app.get("/posts/featured")
def get_featured_posts(limit: int = Query(10, ge=1, le=50)):
    return repo.list_posts(type="item", include_sold=False, limit=limit)


@app.get("/posts/{post_id}")
def get_post(post_id: str):
    post = repo.get_post(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@app.post("/posts", status_code=201)
def create_post(body: CreatePostBody):
    post_input = PostInput(
        type=body.type,
        title=body.title,
        price=body.price,
        image_key=body.image_key,
        user=body.user,
    )
    post_id = repo.create_post(post_input)
    return {"id": post_id}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
