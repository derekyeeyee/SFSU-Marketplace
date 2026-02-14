"""Seed / reset utility for the SFSU Marketplace database.

Set MODE at the top to control behavior:
  0 — Truncate ALL three collections (accounts, listings, messages)
  1 — Seed sample accounts + listings
"""

from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

from database import Database, ListingInput, AccountInput, get_db_from_env  # noqa: E402

# ========== SET MODE HERE ==========
# 0 - truncate all
# 1 - sample accounts + listings
MODE = 1
# ====================================


SEED_ACCOUNTS = [
    AccountInput(username="alice", password="password123", email="alice@sfsu.edu"),
    AccountInput(username="bob", password="password123", email="bob@sfsu.edu"),
    AccountInput(username="charlie", password="password123", email="charlie@sfsu.edu"),
]

SEED_LISTINGS = [
    # 7 featured items (matching R2 placeholder images)
    ListingInput(type="item", title="Wooden Chair", price=25.00, image_key="ChairPlaceholder.jpg", user="alice"),
    ListingInput(type="item", title="Wall Mirror", price=15.00, image_key="MirrorPlaceholder.jpg", user="bob"),
    ListingInput(type="item", title="Dinner Plates Set", price=10.00, image_key="PlatesPlaceholder.jpg", user="alice"),
    ListingInput(type="item", title="Bookshelf", price=40.00, image_key="ShelfPlaceholder.webp", user="charlie"),
    ListingInput(type="item", title="Study Table", price=35.00, image_key="TablePlaceholder.webp", user="bob"),
    ListingInput(type="item", title="Textbook Bundle", price=20.00, image_key="TextbookPlaceholder.jpg", user="alice"),
    ListingInput(type="item", title="Desk Lamp", price=12.00, image_key="ChairPlaceholder.jpg", user="charlie"),
    # 3 requests
    ListingInput(type="request", title="Looking for a Mini Fridge", price=0, user="bob"),
    ListingInput(type="request", title="Need a Graphing Calculator", price=30.00, user="alice"),
    ListingInput(type="request", title="ISO Bike Lock", price=15.00, user="charlie"),
]


def truncate_all(db: Database) -> None:
    """Mode 0: drop every document from all three collections."""
    del_listings = db.listings.delete_many({}).deleted_count
    del_accounts = db.accounts.delete_many({}).deleted_count
    del_messages = db.messages.delete_many({}).deleted_count
    print(
        f"Truncated: {del_listings} listings, "
        f"{del_accounts} accounts, {del_messages} messages"
    )


def seed_data(db: Database) -> None:
    """Mode 1: insert sample accounts and listings."""
    print("Creating accounts...")
    for acct in SEED_ACCOUNTS:
        try:
            aid = db.create_account(acct)
            print(f"  Created account '{acct.username}' → {aid}")
        except Exception as e:
            print(f"  Skipped '{acct.username}': {e}")

    print("Creating listings...")
    for li in SEED_LISTINGS:
        lid = db.create_listing(li)
        print(f"  Created listing '{li.title}' → {lid}")


handlers = {
    0: truncate_all,
    1: seed_data,
}


if __name__ == "__main__":
    database = get_db_from_env()
    handler = handlers.get(MODE)
    if handler is None:
        print(f"Unknown MODE={MODE}. Valid modes: {list(handlers.keys())}")
    else:
        print(f"Running MODE={MODE} ({handler.__name__})...")
        handler(database)
        print("Done.")
