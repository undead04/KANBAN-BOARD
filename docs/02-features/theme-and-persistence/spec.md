# 🌓 ĐẶC TẢ TÍNH NĂNG: GIAO DIỆN, THEME & LƯU TRỮ (SPEC.MD)

Tài liệu này đặc tả cơ chế chuyển đổi giao diện Sáng / Tối và đồng bộ dữ liệu `localStorage`.

---

## 1. Dark / Light Mode

- **Nguyên lý hoạt động:**
  - Dựa trên cơ chế Class-based của Tailwind CSS.
  - Khi bật Dark mode: Thêm class `dark` vào thẻ gốc `<html class="dark">`.
  - Khi bật Light mode: Gỡ bỏ class `dark`.
- **Nút chuyển Theme (`ThemeToggle.tsx`):**
  - Đặt trên thanh `Header`.
  - Icon Mặt trời (Sun) khi đang ở Dark mode và Icon Mặt trăng (Moon) khi đang ở Light mode.
- **Lưu trữ lựa chọn:**
  - Tự động ghi nhớ theme người dùng chọn vào `localStorage` (key: `kanban-theme`).
  - Khi mở trang lần đầu: Kiểm tra xem hệ thống người dùng (OS) có đang dùng Dark mode không (`prefers-color-scheme: dark`) để thiết lập theme mặc định tương ứng.

---

## 2. Đồng Bộ LocalStorage & Dữ Liệu Khởi Tạo (Persistence)

- **Cấu trúc lưu trữ:**
  - Key chính: `kanban-storage` (chứa toàn bộ `columns` và `tasks`).
- **Nạp dữ liệu mẫu ban đầu (Initial Seed Data):**
  - Nếu `localStorage` hoàn toàn trống (người dùng mới truy cập lần đầu), tự động nạp bộ dữ liệu phong phú từ `src/data/initialData.ts`.
- **Nút "Khôi phục dữ liệu mẫu" (Reset to Initial Data):**
  - Đặt trên `Header` hoặc thanh công cụ.
  - Khi bấm: Xóa dữ liệu hiện tại trong `localStorage` và nạp lại trạng thái ban đầu để người dùng dễ dàng test lại tính năng từ đầu.
