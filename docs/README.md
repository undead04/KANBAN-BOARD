# 📚 MỤC LỤC TÀI LIỆU DỰ ÁN (DOCUMENTATION INDEX)

Tài liệu được phân chia theo cấu trúc Module chuẩn doanh nghiệp để tối ưu token cho AI Agent và giúp lập trình viên tra cứu tức thì:

---

## 📂 00-overview (Tổng quan)
- [`00-overview/product-vision.md`](00-overview/product-vision.md): Mục tiêu dự án, chân dung người dùng (Persona) và triết lý thiết kế.
- [`00-overview/roadmap.md`](00-overview/roadmap.md): Lộ trình 6 Milestones (MVP) và các pha mở rộng trong tương lai.

## 📂 01-architecture (Kiến trúc hệ thống)
- [`01-architecture/tech-stack.md`](01-architecture/tech-stack.md): Lựa chọn công nghệ (Vite, React, TS, Tailwind, Zustand, `@dnd-kit`) và lệnh vận hành.
- [`01-architecture/data-models.md`](01-architecture/data-models.md): Mô hình dữ liệu cốt lõi (`Task`, `Column`, `Priority`, `Tag`).
- [`01-architecture/system-principles.md`](01-architecture/system-principles.md): Nguyên tắc *"Logic ở Store, UI chỉ hiển thị"* và luồng kéo thả `@dnd-kit`.

## 📂 02-features (Đặc tả theo từng Module)
- **Kanban Core:**
  - [`02-features/kanban-core/spec.md`](02-features/kanban-core/spec.md): Quản lý Cột, Thẻ (CRUD) và tương tác kéo thả.
  - [`02-features/kanban-core/plan.md`](02-features/kanban-core/plan.md): Kế hoạch thực thi chi tiết từ Milestone 1 đến Milestone 5.
- **Search & Filter:**
  - [`02-features/search-and-filter/spec.md`](02-features/search-and-filter/spec.md): Tìm kiếm thời gian thực và bộ lọc theo Priority/Tag (Milestone 6).
- **Theme & Persistence:**
  - [`02-features/theme-and-persistence/spec.md`](02-features/theme-and-persistence/spec.md): Chế độ Dark/Light mode và đồng bộ `localStorage`.
- **Future Expansions:**
  - [`02-features/future-expansions/firebase-architecture.md`](02-features/future-expansions/firebase-architecture.md): Bản thiết kế Firebase, mô hình Workspace & cơ chế Real-time Card Locking.
  - [`02-features/future-expansions/README.md`](02-features/future-expansions/README.md): Tổng quan kế hoạch scale.
