# 🚀 KIẾN TRÚC MỞ RỘNG TƯƠNG LAI: FIREBASE & WORKSPACE

Tài liệu này ghi nhận các quyết định kiến trúc cốt lõi đã chốt cho **Giai đoạn 2 (Scale Fullstack & Real-time)**.

---

## 1. Nền Tảng Cloud: Firebase BaaS
- **Authentication:** Firebase Auth (Hỗ trợ Google Sign-in 1-click & Email/Password).
- **Database:** Cloud Firestore (NoSQL document store linh hoạt, hỗ trợ realtime snapshot listener tức thì `onSnapshot`).
- **Security:** Firestore Security Rules bảo vệ dữ liệu theo `workspaceId` và `role` của từng user.

---

## 2. Mô Hình Phân Cấp Dữ Liệu (Workspace & RBAC)

Hệ thống được thiết kế theo cấu trúc tổ chức chuyên nghiệp:

```text
[ Workspaces ] (Không gian làm việc)
      │
      ├── Members: [ { userId, email, role: 'owner' | 'admin' | 'member' | 'viewer' } ]
      │
      └── [ Boards ] (Các bảng Kanban trong Workspace)
            │
            └── [ Columns & Tasks ]
```

### Phân quyền (RBAC - Role-Based Access Control):
- **Owner / Admin:** Tạo/xóa Workspace, mời/xóa thành viên, đổi quyền, quản lý toàn bộ Boards.
- **Member:** Tạo Board mới, thêm/sửa/xóa và kéo thả thẻ trong các Board được phân quyền.
- **Viewer:** Chỉ xem bảng, tìm kiếm, lọc thẻ; không được phép sửa, xóa hoặc kéo thả.

---

## 3. Cơ Chế Realtime & Khóa Thẻ Đang Giữ (Card Locking)

Để tránh xung đột khi nhiều thành viên cùng thao tác:

```text
[ Người A nhấc thẻ lên ]
         │
         ▼
Ghi trạng thái Lock lên Firestore:
{
  isLocked: true,
  lockedBy: { userId: "user_A", name: "Nguyễn Văn A", avatar: "..." },
  lockedAt: Timestamp
}
         │
         ▼ (Realtime Broadcast qua onSnapshot)
[ Màn hình Người B & các thành viên khác ]:
- Thẻ hiển thị viền phát sáng (Pulsing Glow).
- Hiện avatar và badge: "Nguyễn Văn A đang kéo thẻ này".
- Vô hiệu hóa (Disable) kéo thả thẻ này đối với người B.
         │
         ▼
[ Người A thả thẻ / Hủy kéo ]:
- Cập nhật vị trí mới và gỡ bỏ lock (`isLocked: false, lockedBy: null`).
- Tự động giải phóng lock sau 10 giây nếu người A bị mất mạng hoặc crash (Timeout Auto-release).
```

---

## 4. Lộ Trình Triển Khai Sau Khi Xong MVP Frontend
1. Cài đặt Firebase SDK: `npm install firebase`.
2. Tạo file cấu hình `src/services/firebase.ts`.
3. Viết hook `useFirestoreSync` thay thế cho middleware `persist` của `localStorage`.
4. Gắn Realtime Presence & Card Lock vào `Board.tsx`.

