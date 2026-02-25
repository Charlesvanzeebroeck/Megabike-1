from __future__ import annotations

"""
Migrate rider photos from external URLs to Supabase Storage.

Steps:
  1. Fetch all active riders with an external photo_url
  2. Download each image
  3. Upload to Supabase Storage bucket "rider-photos"
  4. Update the rider's photo_url to the new public URL

Usage:
  cd ingest
  python migrate_photos_to_storage.py
"""

import os
import time
import random
import requests
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

from supabase import create_client, Client
from dotenv import load_dotenv

# ── Config ──────────────────────────────────────────────
BUCKET_NAME = "rider-photos"
BATCH_SIZE = 50
MAX_WORKERS = 5
SUPABASE_STORAGE_BASE = None  # Set dynamically

# ── Setup ───────────────────────────────────────────────
script_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(script_dir, "..", ".env")
load_dotenv(dotenv_path=env_path)

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(url, key)
SUPABASE_STORAGE_BASE = f"{url}/storage/v1/object/public/{BUCKET_NAME}"


def ensure_bucket_exists():
    """Create the storage bucket if it doesn't already exist."""
    try:
        supabase.storage.get_bucket(BUCKET_NAME)
        print(f"✓ Bucket '{BUCKET_NAME}' already exists.")
    except Exception:
        print(f"Creating bucket '{BUCKET_NAME}'...")
        supabase.storage.create_bucket(
            BUCKET_NAME,
            options={"public": True, "file_size_limit": 500_000}  # 500KB max
        )
        print(f"✓ Bucket '{BUCKET_NAME}' created.")


def fetch_riders_with_external_photos():
    """Fetch riders whose photo_url points to an external URL (not our storage)."""
    print("Fetching riders with external photo URLs...")
    all_riders = []
    offset = 0
    page_size = 1000

    while True:
        response = (
            supabase.table("riders")
            .select("id, rider_name, photo_url")
            .eq("active", True)
            .not_.is_("photo_url", "null")
            .neq("photo_url", "")
            .order("id")
            .range(offset, offset + page_size - 1)
            .execute()
        )
        batch = response.data or []
        # Only include riders with external URLs (not already migrated)
        external = [r for r in batch if r["photo_url"] and not r["photo_url"].startswith(SUPABASE_STORAGE_BASE)]
        all_riders.extend(external)

        if len(batch) < page_size:
            break
        offset += page_size

    print(f"Found {len(all_riders)} riders with external photo URLs.")
    return all_riders


def download_image(photo_url: str) -> 'bytes | None':
    """Download an image from a URL. Returns bytes or None on failure."""
    try:
        time.sleep(random.uniform(0.05, 0.2))  # Be polite
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Referer": "https://www.procyclingstats.com/",
        }
        res = requests.get(photo_url, headers=headers, timeout=15)
        if res.status_code == 200 and len(res.content) > 100:
            return res.content
    except Exception as e:
        print(f"  ✗ Download failed: {e}")
    return None


def get_content_type(photo_url: str) -> str:
    """Infer the content type from the URL extension."""
    lower = photo_url.lower()
    if lower.endswith(".png"):
        return "image/png"
    if lower.endswith(".webp"):
        return "image/webp"
    if lower.endswith(".jpeg"):
        return "image/jpeg"
    return "image/jpeg"  # Default


def upload_to_storage(rider_id: str, image_data: bytes, content_type: str) -> 'str | None':
    """Upload image to Supabase Storage. Returns the public URL or None."""
    ext = "jpg"
    if content_type == "image/png":
        ext = "png"
    elif content_type == "image/webp":
        ext = "webp"
    elif content_type == "image/jpeg":
        ext = "jpg"

    file_path = f"{rider_id}.{ext}"

    try:
        supabase.storage.from_(BUCKET_NAME).upload(
            path=file_path,
            file=image_data,
            file_options={"content-type": content_type, "upsert": "true"}
        )
        public_url = f"{SUPABASE_STORAGE_BASE}/{file_path}"
        return public_url
    except Exception as e:
        print(f"  ✗ Upload failed: {e}")
        return None


def process_rider(rider: dict) -> bool:
    """Download + upload + update DB for a single rider."""
    rider_id = rider["id"]
    rider_name = rider["rider_name"]
    photo_url = rider["photo_url"]

    image_data = download_image(photo_url)
    if not image_data:
        print(f"  ✗ [{rider_name}] Could not download image")
        return False

    content_type = get_content_type(photo_url)
    new_url = upload_to_storage(rider_id, image_data, content_type)
    if not new_url:
        return False

    try:
        supabase.table("riders").update({"photo_url": new_url}).eq("id", rider_id).execute()
        print(f"  ✓ [{rider_name}] → {new_url}")
        return True
    except Exception as e:
        print(f"  ✗ [{rider_name}] DB update failed: {e}")
        return False


def main():
    ensure_bucket_exists()
    riders = fetch_riders_with_external_photos()

    if not riders:
        print("No riders to migrate. Done!")
        return

    print(f"\nStarting migration of {len(riders)} rider photos...\n")

    success = 0
    failed = 0

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(process_rider, r): r for r in riders}
        for future in as_completed(futures):
            if future.result():
                success += 1
            else:
                failed += 1

    print(f"\n{'='*50}")
    print(f"Migration complete!")
    print(f"  ✓ Success: {success}")
    print(f"  ✗ Failed:  {failed}")
    print(f"  Total:     {len(riders)}")
    print(f"{'='*50}")


if __name__ == "__main__":
    main()
