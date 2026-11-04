# 🏛️ NGUYÊN TẮC KIẾN TRÚC & PHÂN NHIỆM (SYSTEM PRINCIPLES)

Tài liệu này định hình nguyên tắc tổ chức mã nguồn và luồng di chuyển dữ liệu trong toàn bộ hệ thống.

---

## 1. Nguyên Tắc Cốt Lõi: "Logic ở Store, UI chỉ hiển thị"

> [!IMPORTANT]
> **Component chỉ là "bộ vỏ hiển thị" (Presentational Layer). Toàn bộ tính toán, sắp xếp mảng, mutation state phải nằm 100% trong Zustand Store.**

```text
[ Thao tác người dùng: Click / Kéo thả / Nhập form ]
                        │
                        ▼
[ React Component ] ──(Dispatch Action)──► [ Zustand Store ]
        ▲                                          │
        │                                    (Xử lý logic,
        │                                     cập nhật mảng &
        │                                     đồng bộ LocalStorage)
        │                                          │
        └─────────(Re-render qua Selector)─────────┘
```

### 1.1. Trách nhiệm của Store (`src/store/`):
- Nắm giữ **Single Source of Truth** của ứng dụng (danh sách cột, danh sách thẻ, trạng thái bộ lọc).
- Xử lý các thao tác CRUD: `addTask`, `updateTask`, `deleteTask`, `addColumn`, `updateColumn`, `deleteColumn`.
- Xử lý toán học & chỉ số mảng kéo thả: `moveTask`, `reorderTasks`.
- Quản lý đồng bộ `localStorage` và nạp dữ liệu khởi tạo (`initialData.ts`).

### 1.2. Trách nhiệm của Components (`src/components/`):
- Sử dụng selector để chỉ re-render khi dữ liệu liên quan thay đổi (ví dụ: `useKanbanStore(s => s.tasks)`).
- Gọi action kèm dữ liệu payload tối giản.
- **TUYỆT ĐỐI KHÔNG:** Dùng `.push()`, `.splice()`, mutate state trực tiếp hoặc tính toán logic nghiệp vụ phức tạp ngay trong component.

---

## 2. Thiết Kế Luồng Kéo Thả (@dnd-kit Architecture)

1. **`Board.tsx`** bọc toàn bộ giao diện trong `<DndContext>`:
   - `onDragStart`: Lưu lại `activeId` của thẻ đang được nhấc lên (hiển thị Overlay preview).
   - `onDragOver`: Tính toán vị trí tạm thời khi thẻ đang lướt qua giữa các cột.
   - `onDragEnd`: Thu thập `activeId` và `overId`, sau đó ủy quyền toàn bộ cho Store:
     ```typescript
     useKanbanStore.getState().handleDragEnd(activeId, overId);
     ```
2. **`kanbanStore.ts`** xử lý logic sắp xếp:
   - Kiểm tra xem kéo thả trong cùng cột hay sang cột khác.
   - Dùng `arrayMove` của `@dnd-kit/sortable` để cập nhật vị trí mới.
   - Tự động kích hoạt middleware `persist` lưu xuống `localStorage`.

---

## 3. Cấu Trúc Thư Mục Source Code Chuẩn

```text
src/
├── assets/                  # Tài nguyên tĩnh
├── components/              # Giao diện (Thin Container & Presentational)
│   ├── board/               # Board, ColumnContainer, ColumnHeader, TaskCard
│   ├── modals/              # TaskModal, ColumnModal, ConfirmDialog
│   └── layout/              # Header, SearchAndFilter, ThemeToggle
├── data/                    # initialData.ts (Mock data mẫu)
├── store/                   # kanbanStore.ts, themeStore.ts
├── types/                   # kanban.ts (Định nghĩa TypeScript)
├── utils/                   # cn.ts, dndHelpers.ts
├── App.tsx                  # Root component
├── main.tsx                 # Entry point
└── index.css                # Tailwind directives
```
