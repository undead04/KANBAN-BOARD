# 🏗️ KIẾN TRÚC HỆ THỐNG (ARCHITECTURE.MD)

Tài liệu này ghi lại quyết định kiến trúc, cấu trúc dự án và các nguyên tắc thiết kế cho ứng dụng Kanban Board (Frontend-only).

---

## 1. Quyết định lựa chọn Tech Stack (Phương án 2)

Dự án lựa chọn **Phương án 2: Chuẩn hiện đại & Tách biệt Logic**:
- **Core & Build Tool:** React 18+ | TypeScript (Strict Mode) | Vite
- **Styling & UI:** Tailwind CSS (Class-based Dark Mode) | Lucide React
- **Kéo thả (Drag & Drop):** `@dnd-kit` (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`)
- **Quản lý State & Lưu trữ:** Zustand (kèm middleware `persist` cho `localStorage`)

### Lý do lựa chọn:
1. **`@dnd-kit` thay vì `@hello-pangea/dnd` (Option 1):** `@dnd-kit` là tiêu chuẩn hiện đại, có tính module hóa cao, hỗ trợ cảm ứng (touch) tốt trên thiết bị di động, animation mượt mà và không phụ thuộc vào cấu trúc DOM cứng nhắc.
2. **`Zustand` thay vì React Context API:** Tách rời 100% logic nghiệp vụ ra khỏi cây component React, tránh re-render thừa, code gọn gàng không boilerplate rườm rà.
3. **Không dùng Shadcn/ui ngay từ đầu (Option 3):** Tránh phát sinh quá nhiều code mẫu (boilerplate UI), giữ codebase tinh gọn để người học tập trung sâu vào tư duy Vibe Coding và luồng dữ liệu Kanban.
4. **Tích hợp `localStorage` không tốn công:** Middleware `persist` của Zustand tự động đồng bộ hóa state và nạp mock data khởi tạo mà không cần viết custom hook phức tạp.

---

## 2. Nguyên tắc kiến trúc cốt lõi

> [!IMPORTANT]
> **NGUYÊN TẮC VÀNG: "Logic ở Store, Component chỉ hiển thị"**

```text
[ Người dùng thao tác ]
        │
        ▼
[ UI Component ] ──(Trigger Action)──► [ Zustand Store ]
        ▲                                     │
        │                               (Xử lý logic,
        │                                cập nhật state &
        │                                sync localStorage)
        │                                     │
        └────────(Re-render qua Selector)─────┘
```

### 2.1. Trách nhiệm của Store (`src/store/`):
- **Nắm giữ toàn bộ Single Source of Truth:** Danh sách cột, thẻ công việc, bộ lọc tìm kiếm, theme sáng/tối.
- **Thực thi 100% logic nghiệp vụ (Actions):**
  - Thêm / sửa / xóa / đổi tên cột.
  - Thêm / sửa / xóa thẻ; kiểm tra validation dữ liệu thẻ.
  - Xử lý toán học & chỉ số mảng khi kéo thả (`reorderTasks`, `moveTaskBetweenColumns`).
  - Lọc dữ liệu theo từ khóa, độ ưu tiên, tag màu.
  - Quản lý đồng bộ `localStorage` và nạp dữ liệu mẫu ban đầu.

### 2.2. Trách nhiệm của Components (`src/components/`):
- **Chỉ nhận dữ liệu và hiển thị (Presentational / Thin Container):** Dùng selector của Zustand để lấy đúng dữ liệu cần hiển thị (ví dụ: `useKanbanStore(state => state.columns)`).
- **Ủy quyền toàn bộ xử lý cho Store:** Khi người dùng click nút, submit form, hoặc kết thúc kéo thả (`onDragEnd`), component chỉ gọi action tương ứng từ store kèm payload tối giản (ví dụ: `moveTask(activeId, overId)`).
- **Tuyệt đối không tự mutate state** hoặc viết các thuật toán biến đổi mảng phức tạp ngay trong component.

---

## 3. Cấu trúc thư mục đề xuất (Project Structure)

```text
kanban-board/
├── docs/
│   ├── SPEC.md                  # Đặc tả yêu cầu chi tiết của sản phẩm
│   └── ARCHITECTURE.md          # Tài liệu kiến trúc & nguyên tắc thiết kế
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/                  # Ảnh, font, tài nguyên tĩnh
│   ├── components/              # Các thành phần giao diện (chỉ render & gọi action)
│   │   ├── board/
│   │   │   ├── Board.tsx            # Khung chứa toàn bộ bảng Kanban & DndContext
│   │   │   ├── ColumnContainer.tsx  # Cột kéo thả (Droppable Column)
│   │   │   ├── ColumnHeader.tsx     # Tiêu đề cột, nút thêm/sửa/xóa cột
│   │   │   └── TaskCard.tsx         # Thẻ công việc (Draggable Card)
│   │   ├── modals/
│   │   │   ├── TaskModal.tsx        # Modal thêm / sửa / xem chi tiết thẻ
│   │   │   ├── ColumnModal.tsx      # Modal tạo / đổi tên cột
│   │   │   └── ConfirmDialog.tsx    # Hộp thoại xác nhận xóa
│   │   └── layout/
│   │       ├── Header.tsx           # Thanh tiêu đề trên cùng
│   │       ├── SearchAndFilter.tsx  # Thanh tìm kiếm và bộ lọc thẻ
│   │       └── ThemeToggle.tsx      # Nút chuyển đổi Dark/Light mode
│   ├── data/
│   │   └── initialData.ts       # Mock data mặc định ban đầu
│   ├── store/
│   │   ├── kanbanStore.ts       # Store Zustand chính: columns, tasks, actions kéo thả/CRUD
│   │   └── filterStore.ts       # Store quản lý trạng thái search & filter (hoặc gộp chung)
│   ├── types/
│   │   └── kanban.ts            # Định nghĩa Interface & Type (Task, Column, Priority, Tag...)
│   ├── utils/
│   │   ├── dndHelpers.ts        # Helper tính toán vị trí kéo thả cho @dnd-kit
│   │   └── cn.ts                # Tiện ích nối class Tailwind (clsx / tailwind-merge)
│   ├── App.tsx                  # Root component kết nối Layout & Board
│   ├── main.tsx                 # Entry point Vite React
│   └── index.css                # Cấu hình Tailwind directive & Base styles
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 4. Thiết kế luồng xử lý Kéo thả (@dnd-kit Flow)

1. **`Board.tsx`** đóng vai trò lắng nghe sự kiện từ `<DndContext>`:
   - `onDragStart`: Đánh dấu thẻ hoặc cột đang được nhấc lên (hiển thị Overlay preview).
   - `onDragOver`: Tính toán vị trí tạm thời khi thẻ lướt qua các cột khác nhau.
   - `onDragEnd`: Thu thập `activeId` (thẻ được kéo) và `overId` (vị trí thả), sau đó gọi trực tiếp action:
     ```typescript
     useKanbanStore.getState().handleDragEnd(activeId, overId);
     ```
2. **`kanbanStore.ts`** tiếp nhận `handleDragEnd`:
   - Xác định thẻ thuộc cùng cột hay khác cột.
   - Sử dụng `arrayMove` từ `@dnd-kit/sortable` để cập nhật lại thứ tự mảng.
   - Tự động lưu trạng thái mới vào `localStorage`.

