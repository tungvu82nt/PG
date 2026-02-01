# Phân Loại và Đánh Giá Mã Nguồn Dự Án

Tài liệu này phân loại chi tiết các script trong thư mục `_scripts/`, mô tả chức năng, trạng thái hiện tại và đánh giá độ chính xác.

## 1. Core System (Hệ Thống Cốt Lõi)
Các script này hoạt động ổn định và đóng vai trò chính trong quy trình Crawl - Map - Download.

| Tên File | Chức Năng Chính | Trạng Thái | Đánh Giá |
|----------|-----------------|------------|----------|
| `crawl_authenticated_images.py` | Sử dụng Playwright với token xác thực để crawl hình ảnh từ 7 danh mục game (Slots, Fish, Casino...). Xử lý lazy load và lazy rendering. | **Active** | ✅ **Chính xác**. Logic xử lý overlay, scroll và trích xuất `src`/`alt` hoạt động tốt. |
| `map_game_uuid.py` | Mapping giữa Game ID (từ API) và Image UUID (từ crawl frontend) dựa trên `alt` attribute. | **Active** | ✅ **Chính xác**. Giải quyết được vấn đề API không trả về `imagepath`. |
| `crawl_provider_logos.py` | Crawl logo nhà cung cấp dựa trên danh sách provider ID. Sử dụng absolute paths và cơ chế fallback URL. | **Active** | ✅ **Chính xác**. Đã fix lỗi 520 false positive bằng requests.get. |
| `verify_provider_logos.py` | Kiểm tra tính hợp lệ của các URL logo đã crawl. | **Active** | ✅ **Chính xác**. Đảm bảo không có link chết trong mapping. |
| `download_all_images.py` | Tổng hợp URL từ mọi nguồn debug, chuẩn hóa, lọc trùng và tải xuống đa luồng. | **Active** | ✅ **Chính xác**. Đã xử lý lọc Facebook tracker và data URI. |
| `authenticated_api_scan.py` | Kiểm tra các endpoint API với JWT token để xác nhận cấu trúc dữ liệu trả về. | **Active** | ✅ **Chính xác**. Xác nhận API `allGameList` thiếu `imagepath`. |

## 2. Exploration & Debugging (Công Cụ Khám Phá)
Các script này dùng để phân tích cấu trúc, fuzzing hoặc debug lỗi cụ thể. Vẫn có giá trị tham khảo.

| Tên File | Chức Năng | Trạng Thái | Ghi Chú |
|----------|-----------|------------|---------|
| `capture_api.py` | Intercept API response qua Playwright (bản cũ). | **Maintenance** | Nên dùng `crawl_authenticated_images.py` thay thế vì có auth. |
| `check_game_popular.py` | Kiểm tra logic hiển thị game phổ biến. | **Utility** | Hữu ích khi check logic ranking. |
| `analyze_js_logic.py` | Phân tích file JS để tìm logic ghép URL. | **Utility** | Dùng để reverse engineer frontend logic. |
| `verify_media_access.py` | Kiểm tra quyền truy cập trực tiếp vào CDN. | **Utility** | Dùng để debug lỗi 403/520. |

## 3. Deprecated / Legacy (Cũ / Không Còn Sử Dụng)
Các script này đã được di chuyển vào thư mục `_scripts/_archive` để lưu trữ.

*   `capture_api.py`, `capture_api_v2.py`, `capture_provider_api.py`: Các script intercept cũ.
*   `fuzz_*.py` (`fuzz_one_image.py`, `fuzz_game_icon_pattern.py`): Các script dò tìm brute-force.
*   `probe_*.py`: Các script thăm dò API cũ.
*   `playwright_bypass.py`, `advanced_playwright_bypass.py`: Các thử nghiệm bypass Cloudflare cũ.
*   `fetch_real_game_list.py`: Script lấy danh sách game cũ.
*   `crawl_game_icons.py`, `crawl_homepage_icons.py`: Các phiên bản crawl cũ.
*   `debug_*.py`: Các script debug cũ.

## 4. Cấu Trúc Dữ Liệu Đầu Ra (Output Structure)
Thư mục `_debug/` và `_downloaded_images/` chứa kết quả chạy của hệ thống.

*   `_debug/auth_crawled_images.json`: Dữ liệu thô hình ảnh từ frontend.
*   `_debug/game_uuid_mapping.json`: Bảng ánh xạ quan trọng nhất (GameID -> Image URL).
*   `_debug/provider_logos/_mapping.txt`: Mapping Provider ID -> Logo URL.
*   `_downloaded_images/`: Kho chứa tất cả tài nguyên đã tải về.

## 5. Kết Luận & Đề Xuất
*   **Chất lượng mã nguồn**: Các file Core được viết tốt, có xử lý lỗi (try-except), log rõ ràng và sử dụng đường dẫn tuyệt đối (absolute paths) để tránh lỗi môi trường.
*   **Tính đầy đủ**: Hệ thống đã bao phủ toàn bộ quy trình từ Scan -> Map -> Verify -> Download.
*   **Hành động tiếp theo**:
    1.  Dọn dẹp các file rác trong `_scripts` vào thư mục `_archive` để dễ quản lý.
    2.  Tập trung chạy `crawl_authenticated_images.py` định kỳ để cập nhật hình ảnh mới.
