# 🗺️ LỘ TRÌNH PHÁT TRIỂN (ROADMAP)

Lộ trình phát triển được chia làm 2 giai đoạn lớn: **Giai đoạn 1 (MVP Frontend-Only)** và **Giai đoạn 2 (Scale Fullstack & Realtime)**.

---

## GIAI ĐOẠN 1: KANBAN BOARD MVP (Hiện tại)
Thực hiện tuần tự 6 Milestones, mỗi milestone đảm bảo là một bản chạy được (**Working Software**):

| Milestone | Tên Milestone | Trọng tâm | Trạng thái |
| :--- | :--- | :--- | :--- |
| **M1** | Project Setup & Static Shell | Khởi tạo repo, config Tailwind/Lucide, dựng khung tĩnh với Mock Data | ✅ Đã hoàn thành |
| **M2** | Store, Theme & LocalStorage | Zustand store, Dark/Light Mode, đồng bộ tự động `localStorage` | 🔄 Đang triển khai |
| **M3** | Task CRUD & Modal | Thêm, sửa, xem chi tiết và xóa Task qua Modal UI | ⏳ Kế tiếp |
| **M4** | Column CRUD | Thêm cột mới, đổi tên cột và xóa cột (có xác nhận) | ⏳ Kế tiếp |
| **M5** | Drag & Drop (@dnd-kit) | Kéo thả mượt mà giữa các cột và sắp xếp thứ tự trong cùng một cột | ⏳ Kế tiếp |
| **M6** | Search, Filters & Polish | Tìm kiếm từ khóa, bộ lọc Priority/Tag, hoàn thiện trải nghiệm & Build production | ⏳ Kế tiếp |

*Chi tiết kế hoạch triển khai từng bước xem tại:* `docs/02-features/kanban-core/plan.md`.

---

## GIAI ĐOẠN 2: SCALE MỞ RỘNG (Định hướng tương lai)
- **Phase 2.1 - Backend & Database:** Chuyển đổi từ `localStorage` sang Cloud Database (Supabase / PostgreSQL / Firebase).
- **Phase 2.2 - Authentication & Multi-Board:** Đăng nhập người dùng (OAuth Google/GitHub), một người dùng có thể tạo nhiều Board khác nhau.
- **Phase 2.3 - Real-time Collaboration:** Cộng tác làm việc nhóm thời gian thực qua WebSocket (khi người A di chuyển thẻ, màn hình người B cập nhật tức thì).
- **Phase 2.4 - Export / Import & Analytics:** Xuất/nhập file JSON/CSV, biểu đồ thống kê tiến độ công việc (Burn-down chart).
