# Database Safety & Anti-Data-Loss Rules

Áp dụng cho mọi hành động liên quan đến Database, SQL Query hoặc công cụ MCP Database (PostgreSQL, MySQL, SQLite...).

---

## 1. ĐIỀU CẤM TUYỆT ĐỐI (Strictly Forbidden Commands)
- ❌ **CẤM** chạy các câu lệnh hủy diệt: `DROP TABLE`, `DROP DATABASE`, `TRUNCATE`, `DROP SCHEMA`.
- ❌ **CẤM** chạy `DELETE FROM` hoặc `UPDATE` mà **KHÔNG CÓ** mệnh đề `WHERE` cụ thể theo ID.
- ❌ **CẤM** tự ý chạy các lệnh thay đổi schema (`ALTER TABLE`, `DROP COLUMN`) trực tiếp trên CSDL thật mà không qua script migration có sự xác nhận của người dùng.

---

## 2. QUY TẮC AN TOÀN BẮT BUỘC (Safety Protocols)
1. **Kiểm tra trước khi xóa/sửa (Dry-run First):**
   - Trước khi chạy `UPDATE` hoặc `DELETE`, BẮT BUỘC chạy câu lệnh `SELECT COUNT(*)` với cùng điều kiện `WHERE` để báo trước cho người dùng biết có bao nhiêu bản ghi sẽ bị ảnh hưởng.
2. **Sử dụng Transaction:**
   - Mọi thao tác ghi dữ liệu nhiều bước phải được bọc trong khối:
     ```sql
     BEGIN;
     -- các câu lệnh thao tác
     -- kiểm tra kết quả
     COMMIT; -- hoặc ROLLBACK nếu có lỗi
     ```
3. **Sao lưu trước khi thay đổi cấu trúc lớn:**
   - Nhắc nhở người dùng export/dump dữ liệu hoặc tạo bản sao lưu trước khi thực hiện các thay đổi lớn về bảng/cột.

