from pathlib import Path
import os

from database import PostInput, get_repo_from_env

# ---------------------------------------------------------------------------
# Mode selector (extend this later with more numeric modes)
# 0: truncate all posts in collection
# 1: insert 10 item posts (includes the 7 featured items)
# ---------------------------------------------------------------------------
MODE = 1


def load_env_file(env_path: Path) -> None:
    if not env_path.exists():
        raise FileNotFoundError(f".env file not found at: {env_path}")

    for raw_line in env_path.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        os.environ[key.strip()] = value.strip().strip('"').strip("'")


def mode_truncate_all() -> None:
    repo = get_repo_from_env()
    result = repo.col.delete_many({})
    print(f"Truncated collection. Deleted {result.deleted_count} documents.")


def mode_insert_ten_items() -> None:
    repo = get_repo_from_env()

    items = [
        # 7 featured items currently shown in frontend
        PostInput("item", "Wooden Chair", 50.0, "placeholders/ChairPlaceholder.jpg", "seed-script"),
        PostInput("item", "Wall Mirror", 35.0, "placeholders/MirrorPlaceholder.jpg", "seed-script"),
        PostInput("item", "Dinner Plates Set", 20.0, "placeholders/PlatesPlaceholder.jpg", "seed-script"),
        PostInput("item", "Bookshelf", 80.0, "placeholders/ShelfPlaceholder.webp", "seed-script"),
        PostInput("item", "Study Table", 85.0, "placeholders/TablePlaceholder.webp", "seed-script"),
        PostInput("item", "Textbook Bundle", 30.0, "placeholders/TextbookPlaceholder.jpg", "seed-script"),
        PostInput("item", "Desk Lamp", 18.0, "placeholders/ChairPlaceholder.jpg", "seed-script"),
        # 3 additional items
        PostInput("item", "Office Chair", 45.0, "placeholders/ChairPlaceholder.jpg", "seed-script"),
        PostInput("item", "Floor Mirror", 55.0, "placeholders/MirrorPlaceholder.jpg", "seed-script"),
        PostInput("item", "Dining Table", 120.0, "placeholders/TablePlaceholder.webp", "seed-script"),
    ]

    inserted_ids: list[str] = []
    for item in items:
        inserted_ids.append(repo.create_post(item))

    print(f"Inserted {len(inserted_ids)} item posts.")
    print("Inserted ids:")
    for post_id in inserted_ids:
        print(f"- {post_id}")


def main() -> None:
    env_path = Path(__file__).resolve().parent / ".env"
    load_env_file(env_path)

    handlers = {
        0: mode_truncate_all,
        1: mode_insert_ten_items,
    }

    handler = handlers.get(MODE)
    if handler is None:
        valid = ", ".join(str(k) for k in sorted(handlers))
        raise ValueError(f"Unsupported MODE={MODE}. Valid values: {valid}")

    handler()


if __name__ == "__main__":
    main()
