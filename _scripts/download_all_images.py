import argparse
import base64
import hashlib
import json
import os
import re
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Iterable, List, Optional, Set, Tuple


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _read_json(path: str):
    # Mục đích: đọc JSON UTF-8, trả về object Python hoặc None nếu thiếu file.
    if not os.path.exists(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _read_text(path: str) -> str:
    # Mục đích: đọc text UTF-8, trả về chuỗi rỗng nếu thiếu file.
    if not os.path.exists(path):
        return ""
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def _extract_urls_from_sources(base_dir: str) -> List[str]:
    # Mục đích: gom URL ảnh từ các file debug đã crawl, đầu ra là list URL.
    urls: List[str] = []

    captured_image_requests = _read_json(os.path.join(base_dir, "_debug", "captured_image_requests.json"))
    if isinstance(captured_image_requests, list):
        for u in captured_image_requests:
            if isinstance(u, str):
                urls.append(u)

    auth_crawled_images = _read_json(os.path.join(base_dir, "_debug", "auth_crawled_images.json"))
    if isinstance(auth_crawled_images, list):
        for item in auth_crawled_images:
            if isinstance(item, dict) and isinstance(item.get("src"), str):
                urls.append(item["src"])

    found_media_full = _read_json(os.path.join(base_dir, "_debug", "found_media_full.json"))
    if isinstance(found_media_full, dict) and isinstance(found_media_full.get("images"), list):
        for u in found_media_full["images"]:
            if isinstance(u, str):
                urls.append(u)

    provider_mapping_txt = _read_text(os.path.join(base_dir, "_debug", "provider_logos", "_mapping.txt"))
    if provider_mapping_txt:
        for raw_line in provider_mapping_txt.splitlines():
            line = raw_line.strip()
            if not line or "=" not in line:
                continue
            _, url = line.split("=", 1)
            url = url.strip()
            if url:
                urls.append(url)

    return urls


def _normalize_urls(urls: Iterable[str]) -> List[str]:
    # Mục đích: lọc/chuẩn hoá URL ảnh và dedupe theo thứ tự xuất hiện.
    seen: Set[str] = set()
    out: List[str] = []
    for u in urls:
        u = (u or "").strip()
        if not u:
            continue
        if not (u.startswith("http://") or u.startswith("https://") or u.startswith("data:image/")):
            continue
        if "facebook.com/tr" in u:
            continue
        if u not in seen:
            seen.add(u)
            out.append(u)
    return out


_SAFE_CHARS_RE = re.compile(r"[^a-zA-Z0-9._-]+")


def _safe_filename_from_url(url: str, content_type: Optional[str] = None) -> str:
    # Mục đích: tạo tên file an toàn, có hash để tránh trùng.
    parsed = url
    if url.startswith("data:image/"):
        base = "inline"
        ext = "bin"
        m = re.match(r"^data:image/([a-zA-Z0-9+.-]+);base64,", url)
        if m:
            ext = m.group(1).replace("+", "_")
        h = hashlib.sha1(url.encode("utf-8")).hexdigest()[:12]
        return f"{base}__{h}.{ext}"

    path = parsed.split("?", 1)[0]
    base = path.replace("https://", "").replace("http://", "")
    base = base.replace("/", "__")
    base = _SAFE_CHARS_RE.sub("_", base).strip("_")
    if len(base) > 140:
        base = base[-140:]

    ext = None
    m = re.search(r"\.(png|jpg|jpeg|gif|webp|svg)$", path, flags=re.IGNORECASE)
    if m:
        ext = m.group(1).lower()
    elif content_type:
        if "image/png" in content_type:
            ext = "png"
        elif "image/jpeg" in content_type:
            ext = "jpg"
        elif "image/gif" in content_type:
            ext = "gif"
        elif "image/webp" in content_type:
            ext = "webp"
        elif "image/svg" in content_type:
            ext = "svg"
        else:
            ext = "bin"
    else:
        ext = "bin"

    h = hashlib.sha1(url.encode("utf-8")).hexdigest()[:12]
    return f"{base}__{h}.{ext}"


def _decode_data_image(data_url: str) -> Tuple[bytes, Optional[str]]:
    # Mục đích: decode data:image/*;base64,... => (bytes, content_type).
    m = re.match(r"^data:(image/[a-zA-Z0-9+.-]+);base64,(.*)$", data_url, flags=re.DOTALL)
    if not m:
        raise ValueError("Unsupported data URL")
    content_type = m.group(1)
    payload = m.group(2)
    return base64.b64decode(payload), content_type


def _http_get(url: str, timeout_sec: int = 30) -> Tuple[int, bytes, str]:
    # Mục đích: tải ảnh qua HTTP(S) (ưu tiên requests nếu có), trả về (status, body, content_type).
    try:
        import requests  # type: ignore

        resp = requests.get(
            url,
            timeout=timeout_sec,
            stream=False,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "image/avif,image/webp,image/png,image/*;q=0.8,*/*;q=0.5",
            },
        )
        content_type = resp.headers.get("content-type", "")
        return resp.status_code, resp.content, content_type
    except ModuleNotFoundError:
        import urllib.request

        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "image/avif,image/webp,image/png,image/*;q=0.8,*/*;q=0.5",
            },
        )
        with urllib.request.urlopen(req, timeout=timeout_sec) as resp:  # nosec
            status = getattr(resp, "status", 200)
            content_type = resp.headers.get("content-type", "")
            body = resp.read()
            return int(status), body, content_type


def _download_one(url: str, out_dir: str) -> Tuple[str, bool, Optional[str]]:
    # Mục đích: tải 1 ảnh về out_dir, trả về (url, success, error).
    try:
        if url.startswith("data:image/"):
            body, content_type = _decode_data_image(url)
            filename = _safe_filename_from_url(url, content_type)
            out_path = os.path.join(out_dir, filename)
            if os.path.exists(out_path) and os.path.getsize(out_path) > 0:
                return url, True, None
            with open(out_path, "wb") as f:
                f.write(body)
            return url, True, None

        last_error: Optional[str] = None
        for _ in range(3):
            status, body, content_type = _http_get(url)
            if status == 200 and ("image" in (content_type or "") or url.lower().endswith(".svg")):
                filename = _safe_filename_from_url(url, content_type)
                out_path = os.path.join(out_dir, filename)
                if os.path.exists(out_path) and os.path.getsize(out_path) > 0:
                    return url, True, None
                with open(out_path, "wb") as f:
                    f.write(body)
                return url, True, None
            last_error = f"status={status} content-type={content_type}"[:200]
        return url, False, last_error or "unknown"
    except Exception as e:
        return url, False, str(e)[:200]


def main() -> int:
    # Mục đích: entrypoint CLI để tải toàn bộ ảnh về 1 thư mục.
    parser = argparse.ArgumentParser(description="Download all discovered image URLs into a folder")
    parser.add_argument("--out", default=os.path.join(BASE_DIR, "_downloaded_images"))
    parser.add_argument("--workers", type=int, default=8)
    args = parser.parse_args()

    out_dir = os.path.abspath(args.out)
    os.makedirs(out_dir, exist_ok=True)

    raw_urls = _extract_urls_from_sources(BASE_DIR)
    urls = _normalize_urls(raw_urls)
    if not urls:
        print("No image URLs found from sources.")
        return 1

    print(f"Found {len(urls)} unique image URLs. Output: {out_dir}")

    lock = threading.Lock()
    done = 0
    ok = 0
    fail = 0

    def on_progress(success: bool):
        nonlocal done, ok, fail
        with lock:
            done += 1
            if success:
                ok += 1
            else:
                fail += 1
            if done % 50 == 0 or done == len(urls):
                print(f"Progress: {done}/{len(urls)} | OK={ok} FAIL={fail}")

    with ThreadPoolExecutor(max_workers=max(1, args.workers)) as ex:
        futures = {ex.submit(_download_one, url, out_dir): url for url in urls}
        for fut in as_completed(futures):
            url = futures[fut]
            try:
                _, success, err = fut.result()
            except Exception as e:
                success = False
                err = str(e)
            on_progress(success)
            if not success:
                print(f"[FAIL] {url} | {err}")

    print(f"Done. OK={ok} FAIL={fail} | Folder: {out_dir}")
    return 0 if ok > 0 else 2


if __name__ == "__main__":
    raise SystemExit(main())

