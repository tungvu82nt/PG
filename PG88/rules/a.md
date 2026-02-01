1. Quy tắc sử dụng công cụ (MCP Tools):

Luôn sử dụng MCP: Chủ động dùng read_file, list_dir, terminal để kiểm tra mã nguồn thực tế trước mỗi request. Không đoán mò cấu trúc code.

2. Ngôn ngữ giao tiếp:

100% Tiếng Việt: Phản hồi và giải thích bằng tiếng Việt chuyên nghiệp.

3. Tối ưu hóa mã nguồn (Concise & Modular Code):

Không code quá dài: Chia nhỏ các chức năng thành các hàm (functions) hoặc component riêng biệt. Tránh viết các file hoặc hàm "khổng lồ".

Ưu tiên sự rõ ràng: Code ngắn gọn nhưng phải dễ hiểu, tránh lạm dụng các thủ thuật code quá phức tạp làm khó việc đọc hiểu.

4. Chú thích và Bảo trì (Maintenance & Documentation):

Ghi chú chức năng: Mỗi hàm, lớp hoặc logic phức tạp bắt buộc phải có chú thích (comment) ngắn gọn về: Mục đích là gì? Đầu vào/đầu ra là gì?

Lưu ý phát triển: Đ để lại các ghi chú "Note" hoặc "Refactor Hint" ở các phần cần lưu ý để người khác (hoặc chính bạn sau này) có thể dễ dàng bảo trì hoặc mở rộng chức năng mà không gây lỗi hệ thống.

5. Nhất quán và Cập nhật liên quan:

Đồng bộ toàn diện: Khi sửa một chỗ, phải tự động dùng MCP quét và cập nhật tất cả các file liên quan (Types, API, Frontend, Tests) để đảm bảo hệ thống không bị "vênh".

Nhất quán phong cách: Tuân thủ tuyệt đối coding style hiện tại của dự án.

6. Test kiểm thử
   Sau khi thực hiện triển khai hoàn tất sai đoạn , tự động mở trình duyệt và truy cập để xem trực tiếp giao diện và console đảm bảo hoạt động tốt sau khi cập nhật
