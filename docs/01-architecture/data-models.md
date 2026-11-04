# 🧱 MÔ HÌNH DỮ LIỆU (DATA MODELS)

Toàn bộ kiểu dữ liệu cốt lõi được định nghĩa tại `src/types/kanban.ts`. Mọi thay đổi về cấu trúc dữ liệu phải được cập nhật đồng bộ tại đây.

---

## 1. Priority & Tag

```typescript
export type Priority = 'low' | 'medium' | 'high';

export interface Tag {
  id: string;
  name: string;
  color: string; // Hex code hoặc Tailwind color class (ví dụ: 'bg-emerald-500')
}
```

---

## 2. Task (Thẻ công việc)

```typescript
export interface Task {
  id: string;
  columnId: string;       // Thuộc về cột nào
  title: string;          // Tiêu đề bắt buộc
  description: string;    // Chi tiết công việc
  priority: Priority;     // Độ ưu tiên: low | medium | high
  dueDate?: string;       // Định dạng YYYY-MM-DD
  colorTag: string;       // Mã màu đại diện
  createdAt: string;      // ISO 8601 String
}
```

---

## 3. Column (Cột trạng thái)

```typescript
export interface Column {
  id: string;             // Ví dụ: 'backlog', 'todo', 'in-progress', 'done'
  title: string;          // Tên hiển thị của cột
  order: number;          // Thứ tự sắp xếp cột trên bảng (0, 1, 2, 3...)
}
```

---

## 4. Filter & Search State

```typescript
export interface FilterState {
  searchQuery: string;
  priorityFilter: Priority | 'all';
  tagFilter: string | 'all';
}
```

---

## 5. Định hướng Mở rộng Schema (Fullstack Scale)
Khi tích hợp CSDL (PostgreSQL / Supabase) trong tương lai:
- Thêm trường `userId` / `creatorId` vào `Task` và `Column`.
- Thêm bảng `boards`: `id`, `title`, `ownerId`, `isShared`.
- Thêm bảng `board_members`: `boardId`, `userId`, `role` (`viewer` | `editor` | `admin`).
