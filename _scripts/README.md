# Bộ công cụ Phân tích pg88.com

Thư mục này chứa các script Python được sử dụng để phân tích ngược (Reverse Engineering) trang web pg88.com.

## Các script chính

### 1. Crawling & Data Collection
- `crawl_homepage_icons.py`: Sử dụng Playwright để crawl tất cả hình ảnh từ trang chủ (bao gồm lazy loading).
  - **Cách chạy:** `python _scripts/crawl_homepage_icons.py`
  - **Output:** `_debug/homepage_images.json`

- `fetch_real_game_list.py`: Tải danh sách toàn bộ 6000+ game từ API.
  - **Cách chạy:** `python _scripts/fetch_real_game_list.py`
  - **Output:** `_debug/full_game_list_real.json`

### 2. Analysis & Verification
- `analyze_found_patterns.py`: Phân tích các file ảnh đã crawl để tìm ra quy luật URL (Pattern Discovery).
  - **Cách chạy:** `python _scripts/analyze_found_patterns.py`

- `verify_known_imagepaths.py`: Kiểm tra tính hợp lệ của trường `imagepath` trong dữ liệu game (phát hiện Soft 404).

- `probe_correct_api.py`: Thử nghiệm các API endpoint quan trọng (`/games/floating`, `/hot_games`).

### 3. Utility
- `fuzz_one_image.py`: Brute-force URL cho một ảnh cụ thể để tìm prefix đúng.
- `verify_content_type.py`: Kiểm tra xem URL trả về ảnh thật hay trang HTML lỗi (Soft 404).

## Yêu cầu môi trường
- Python 3.8+
- Thư viện: `requests`, `playwright`
- Cài đặt Playwright: `playwright install chromium`
