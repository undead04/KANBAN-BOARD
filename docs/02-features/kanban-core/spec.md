# 📋 ĐẶC TẢ TÍNH NĂNG LÕI: KANBAN CORE (SPEC.MD)

Tài liệu này đặc tả chi tiết nghiệp vụ quản lý Cột, quản lý Thẻ và Tương tác Kéo thả.

---

## 1. Quản Lý Cột (Column Management)

- **Cột mặc định ban đầu:** Khởi tạo sẵn 4 cột:
  1. `Backlog` (order: 0)
  2. `To Do` (order: 1)
  3. `In Progress` (order: 2)
  4. `Done` (order: 3)
- **Thêm cột mới:**
  - Nhập tiêu đề cột (tối đa 50 ký tự, không được để trống).
  - Cột mới tự động thêm vào vị trí cuối cùng của bảng.
- **Sửa cột:**
  - Cho phép đổi tên trực tiếp hoặc qua modal.
- **Xóa cột:**
  - Hiển thị hộp thoại cảnh báo xác nhận (`ConfirmDialog`) trước khi xóa.
  - Khi xóa cột: Xóa toàn bộ các Task nằm trong cột đó (hoặc chuyển thẻ sang cột mặc định).

---

## 2. Quản Lý Thẻ (Task CRUD)

- **Thông tin thẻ:**
  - **Tiêu đề (Title):** Bắt buộc, tối đa 120 ký tự.
  - **Mô tả (Description):** Tùy chọn, hỗ trợ xuống dòng.
  - **Độ ưu tiên (Priority):** Bắt buộc chọn 1 trong 3: `Low` (Xanh lá), `Medium` (Vàng/Cam), `High` (Đỏ).
  - **Hạn chót (Due Date):** Tùy chọn, chọn ngày theo lịch định dạng YYYY-MM-DD.
  - **Nhãn màu (Color Tag):** Chọn màu đại diện phân loại trực quan.
- **Thao tác người dùng:**
  - Nút "+ Thêm thẻ" đặt ở chân mỗi cột, tự động gán `columnId` tương ứng.
  - Bấm vào thẻ để mở `TaskModal` xem chi tiết và chỉnh sửa.
  - Nút Xóa thẻ có hộp thoại xác nhận `ConfirmDialog`.

---

## 3. Kéo Thả (@dnd-kit Interaction)

- Kéo thả thẻ từ cột này sang cột khác: Tự động cập nhật `columnId` của thẻ sang cột mới.
- Kéo thả sắp xếp thứ tự trong cùng cột: Cập nhật lại chỉ số mảng thứ tự hiển thị.
- Hiệu ứng thị giác:
  - Khi nhấc thẻ: Hiển thị thẻ bóng mờ / nổi lên (lift overlay).
  - Khi lướt qua: Có vùng đệm giữ chỗ (drop placeholder).
- Hỗ trợ cả chuột (mouse) trên desktop và thao tác chạm vuốt (touch) trên màn hình cảm ứng/mobile.
