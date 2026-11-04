# 🚀 ĐỊNH HƯỚNG MỞ RỘNG TƯƠNG LAI (FUTURE EXPANSIONS)

Thư mục này lưu trữ các bản thiết kế kiến trúc kỹ thuật chi tiết đã chốt cho giai đoạn mở rộng sản phẩm (Scale Phase).

---

## 📑 Các Bản Đặc Tả Kỹ Thuật Đã Chốt:

- 👉 [**`firebase-architecture.md`**](firebase-architecture.md): Bản thiết kế toàn diện gồm:
  1. **Firebase BaaS:** Firebase Auth + Cloud Firestore.
  2. **Mô hình Workspace & Phân quyền:** Phân cấp Workspace $\rightarrow$ Boards $\rightarrow$ Columns/Tasks với các vai trò Owner, Admin, Member, Viewer.
  3. **Cơ chế Real-time Card Locking:** Khóa thẻ khi có người đang nhấc kéo, hiển thị avatar người đang giữ và tự giải phóng khi thả hoặc timeout.

---

> [!NOTE]
> Các module này sẽ được kích hoạt ngay sau khi hoàn thành 6 Milestones của bản Kanban MVP (Frontend-only).
