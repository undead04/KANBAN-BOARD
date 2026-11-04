# 📋 PRODUCT SPECIFICATION: KANBAN BOARD MVP (FRONTEND-ONLY)

## 1. Tổng quan dự án (Project Overview)
- **Tên dự án:** Kanban Board Web App
- **Mục tiêu:** Ứng dụng quản lý công việc dạng bảng Kanban chạy thuần Frontend (Client-side), tối ưu cho trải nghiệm người dùng mượt mà, phục vụ thực hành kỹ năng **Vibe Coding**.
- **Mô hình hoạt động:** Hoàn toàn chạy trên trình duyệt (SPA - Single Page Application), không phụ thuộc backend API, lưu trữ dữ liệu cục bộ qua `localStorage`.

---

## 2. Tech Stack lựa chọn
- **Core:** React 18+ (Functional Components & Hooks)
- **Ngôn ngữ:** TypeScript (Strict Mode, gõ type chặt chẽ)
- **Build Tool:** Vite (nhanh, nhẹ, HMR tức thì)
- **Styling:** Tailwind CSS (utility-first, responsive, dễ style theme)
- **Icons:** `lucide-react` (bộ icon hiện đại, tối giản)
- **Kéo thả (Drag & Drop):** `@hello-pangea/dnd` hoặc `@dnd-kit` (hỗ trợ kéo thả mượt mà, khả năng tiếp cận tốt)
- **State Management & Persistence:** React State / Context API + đồng bộ tự động với `localStorage`

---

## 3. Kiến trúc dữ liệu (Data Models)

### 3.1. Priority & Tag
```typescript
export type Priority = 'low' | 'medium' | 'high';

export interface Tag {
  id: string;
  name: string;
  color: string; // Hex code hoặc Tailwind color class (ví dụ: 'bg-emerald-500')
}
```

### 3.2. Task (Thẻ công việc)
```typescript
export interface Task {
  id: string;
  columnId: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate?: string; // YYYY-MM-DD
  colorTag: string; // Mã màu hoặc tên màu đại diện
  createdAt: string; // ISO String
}
```

### 3.3. Column (Cột công việc)
```typescript
export interface Column {
  id: string;
  title: string;
  order: number;
}
```

### 3.4. App State & Filter
```typescript
export interface FilterState {
  searchQuery: string;
  priorityFilter: Priority | 'all';
  tagFilter: string | 'all';
}
```

---

## 4. Danh sách tính năng chi tiết (Functional Requirements)

### 4.1. Quản lý cột (Column Management)
- **Cột mặc định:** Khởi tạo sẵn 4 cột:
  1. `Backlog`
  2. `To Do`
  3. `In Progress`
  4. `Done`
- **Thêm cột:** Cho phép nhập tên cột mới và thêm vào cuối bảng.
- **Sửa cột:** Cho phép đổi tên trực tiếp (inline edit hoặc modal).
- **Xóa cột:** Có cảnh báo xác nhận trước khi xóa (xóa luôn các task bên trong hoặc di chuyển sang cột khác).

### 4.2. Quản lý thẻ (Card/Task CRUD)
- **Thông tin thẻ:**
  - Tiêu đề (bắt buộc)
  - Mô tả chi tiết (tùy chọn)
  - Độ ưu tiên: Low (Xanh lá), Medium (Vàng/Cam), High (Đỏ)
  - Hạn chót (Due Date picker)
  - Tag màu (Color Tag để phân loại trực quan)
- **Thao tác:**
  - Thêm thẻ mới trực tiếp dưới từng cột.
  - Xem chi tiết thẻ trong Modal/Dialog.
  - Sửa thông tin thẻ.
  - Xóa thẻ (có xác nhận).

### 4.3. Kéo thả (Drag & Drop Interaction)
- Kéo thả thẻ từ cột này sang cột khác, tự động cập nhật `columnId`.
- Kéo thả sắp xếp lại thứ tự ưu tiên của thẻ trong cùng một cột.
- Hiệu ứng animation mượt mà khi nhấc thẻ (lift effect), placeholder vị trí rơi (drop placeholder).

### 4.4. Tìm kiếm & Bộ lọc (Search & Filters)
- **Thanh tìm kiếm:** Lọc real-time theo tiêu đề hoặc mô tả của thẻ.
- **Lọc theo Độ ưu tiên:** Dropdown chọn All / Low / Medium / High.
- **Lọc theo Tag màu:** Dropdown hoặc danh sách badge màu để lọc các thẻ tương ứng.
- Hiển thị số lượng thẻ khớp với bộ lọc trên từng cột.

### 4.5. Lưu trữ & Dữ liệu mẫu (Persistence & Mock Data)
- **LocalStorage Sync:** Mọi thay đổi (thêm, sửa, xóa, kéo thả) đều tự động lưu vào `localStorage`.
- **Seed Data:** Nếu `localStorage` trống (người dùng mở lần đầu), tự động nạp bộ dữ liệu mẫu sinh động với các công việc mẫu phong phú để người dùng test ngay.
- **Nút "Reset về dữ liệu mẫu":** Cho phép reset nhanh dữ liệu về trạng thái ban đầu khi cần test lại.

### 4.6. Giao diện & Chế độ sáng/tối (UI/UX & Theme)
- Hỗ trợ nút chuyển đổi **Dark Mode / Light Mode**, ghi nhớ lựa chọn vào `localStorage`.
- Giao diện hiện đại, bo góc mềm mại, độ bóng (shadow) tinh tế theo phong cách Linear/Notion.
- Responsive cơ bản: xem tốt trên màn hình máy tính và cuộn ngang linh hoạt trên màn hình hẹp/tablet.

---

## 5. Cấu trúc thư mục dự kiến (Folder Structure)

```text
kanban-app/
├── docs/
│   └── SPEC.md
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── board/
│   │   │   ├── Board.tsx
│   │   │   ├── ColumnContainer.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   └── ColumnHeader.tsx
│   │   ├── modals/
│   │   │   ├── TaskModal.tsx
│   │   │   └── ConfirmDialog.tsx
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── SearchAndFilterBar.tsx
│   │   │   └── ThemeToggle.tsx
│   ├── context/
│   │   ├── KanbanContext.tsx
│   │   └── ThemeContext.tsx
│   ├── data/
│   │   └── mockData.ts
│   ├── hooks/
│   │   └── useLocalStorage.ts
│   ├── types/
│   │   └── kanban.ts
│   ├── utils/
│   │   └── helpers.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 6. Lộ trình triển khai Vibe Coding (Implementation Milestones)
1. **Milestone 1:** Khởi tạo project (Vite + React + TS + Tailwind + Lucide) & cấu hình types.
2. **Milestone 2:** Mock data & Render giao diện khung tĩnh (Header, Board, 4 cột, Task Cards, Theme Toggle).
3. **Milestone 3:** Tích hợp Context API & Đồng bộ `localStorage`.
4. **Milestone 4:** Tích hợp thư viện Drag & Drop mượt mà.
5. **Milestone 5:** Hoàn thiện Modal thêm/sửa/xóa Task và quản lý Column (thêm/sửa/xóa).
6. **Milestone 6:** Hoàn thiện thanh Search & Filter realtime.
7. **Milestone 7:** Tinh chỉnh UI/UX, animations, kiểm thử toàn diện.

