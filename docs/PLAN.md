# 🗺️ KẾ HOẠCH TRIỂN KHAI CHI TIẾT (PLAN.MD)

Tài liệu này chia nhỏ lộ trình triển khai dự án Kanban Board thành **6 Milestones** tuần tự. Mỗi milestone đều là một phiên bản chạy được (**Working Software**) và có tiêu chí nghiệm thu rõ ràng để kiểm chứng trước khi chuyển bước.

---

## 📌 Tổng quan 6 Milestones

| Milestone | Tên Milestone | Trọng tâm |
| :--- | :--- | :--- |
| **M1** | Project Setup & Static Shell | Khởi tạo repo, config Tailwind/Lucide, dựng giao diện khung tĩnh với Mock Data |
| **M2** | Store, Theme & LocalStorage | Zustand store, Dark/Light Mode, đồng bộ tự động `localStorage` |
| **M3** | Task CRUD & Modal | Thêm, sửa, xem chi tiết và xóa Task qua Modal UI |
| **M4** | Column CRUD | Thêm cột mới, đổi tên cột và xóa cột (có xác nhận) |
| **M5** | Drag & Drop (@dnd-kit) | Kéo thả mượt mà giữa các cột và sắp xếp thứ tự trong cùng một cột |
| **M6** | Search, Filters & Polish | Tìm kiếm từ khóa, bộ lọc Priority/Tag, hoàn thiện trải nghiệm & Build production |

---

## 🚀 Chi tiết từng Milestone

### Milestone 1: Khởi tạo dự án & Giao diện khung tĩnh (Project Setup & Static Shell)
- **Mục tiêu:** Tạo nền móng dự án chuẩn TypeScript, cài đặt các thư viện lõi và dựng thành công giao diện Kanban tĩnh đẹp mắt với Mock Data mẫu.
- **Các việc cần làm:**
  1. Khởi tạo dự án bằng Vite (`react-ts`).
  2. Cài đặt các dependencies: `tailwindcss`, `postcss`, `autoprefixer`, `lucide-react`, `clsx`, `tailwind-merge`, `zustand`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.
  3. Cấu hình Tailwind CSS và dark mode class.
  4. Tạo file types `src/types/kanban.ts` (Task, Column, Priority, Tag).
  5. Tạo bộ dữ liệu khởi tạo `src/data/initialData.ts` gồm 4 cột mặc định (*Backlog, To Do, In Progress, Done*) và một số thẻ mẫu.
  6. Xây dựng các component tĩnh: `Header.tsx`, `Board.tsx`, `ColumnContainer.tsx`, `TaskCard.tsx`.
- **Cách kiểm chứng hoàn thành:**
  - Chạy `npm run dev`, mở trình duyệt hiển thị đầy đủ giao diện bảng với 4 cột và các thẻ mẫu có màu sắc, badge độ ưu tiên rõ ràng.
  - Terminal và Browser Console sạch sẽ, không có lỗi hay warning.

---

### Milestone 2: Zustand Store, Theme Toggle & LocalStorage
- **Mục tiêu:** Đưa toàn bộ trạng thái và mock data vào Zustand store, kích hoạt tự động lưu `localStorage` và hoàn thiện tính năng chuyển đổi Dark / Light mode.
- **Các việc cần làm:**
  1. Xây dựng `src/store/kanbanStore.ts` sử dụng Zustand kèm middleware `persist`.
  2. Kết nối `Board`, `ColumnContainer`, `TaskCard` đọc dữ liệu trực tiếp từ store thông qua selector.
  3. Thêm tính năng quản lý Theme (Dark/Light mode) trong store hoặc helper, tự động cập nhật class `dark` vào thẻ `<html>`.
  4. Tạo component `ThemeToggle.tsx` trên thanh Header.
  5. Bổ sung nút "Khôi phục dữ liệu mẫu" (Reset to Mock Data) trên Header để tiện cho việc test.
- **Cách kiểm chứng hoàn thành:**
  - Bấm nút chuyển Theme: Giao diện chuyển đổi tức thì giữa chế độ sáng và tối, F5 lại trang vẫn giữ đúng theme vừa chọn.
  - Mở DevTools (F12) -> tab *Application* -> *Local Storage*: Thấy dữ liệu bảng và theme được lưu đầy đủ dưới dạng JSON.
  - Bấm nút "Khôi phục dữ liệu mẫu" -> state được nạp lại về trạng thái ban đầu thành công.

---

### Milestone 3: Quản lý Thẻ qua Modal (Task CRUD)
- **Mục tiêu:** Người dùng có thể thêm thẻ mới vào bất kỳ cột nào, xem chi tiết, chỉnh sửa thông tin và xóa thẻ.
- **Các việc cần làm:**
  1. Thêm các actions vào `kanbanStore.ts`: `addTask(columnId, taskData)`, `updateTask(taskId, updates)`, `deleteTask(taskId)`.
  2. Tạo component `TaskModal.tsx`:
     - Nhập Tiêu đề (bắt buộc).
     - Nhập Mô tả chi tiết.
     - Chọn Độ ưu tiên (*Low / Medium / High*).
     - Chọn Hạn chót (*Due Date*).
     - Chọn Nhãn màu (*Color Tag*).
  3. Tạo component `ConfirmDialog.tsx` để xác nhận trước khi xóa thẻ.
  4. Gắn nút "+ Thêm thẻ" ở chân mỗi cột và menu thao tác (Xem/Sửa/Xóa) trên từng `TaskCard`.
- **Cách kiểm chứng hoàn thành:**
  - Bấm "+ Thêm thẻ" tại cột *Backlog* -> Nhập thông tin -> Lưu: Thẻ mới xuất hiện ngay dưới cột đó.
  - Click vào thẻ bất kỳ -> Mở modal hiển thị đúng thông tin -> Đổi tiêu đề / độ ưu tiên -> Bấm Lưu: Thẻ trên giao diện đổi theo.
  - Bấm icon Xóa trên thẻ -> Xuất hiện dialog xác nhận -> Đồng ý: Thẻ biến mất khỏi bảng.
  - F5 lại trang: Tất cả các thao tác thêm, sửa, xóa vừa thực hiện vẫn được bảo toàn trong `localStorage`.

---

### Milestone 4: Quản lý Cột (Column CRUD)
- **Mục tiêu:** Cho phép người dùng linh hoạt tùy biến danh sách cột trên bảng Kanban.
- **Các việc cần làm:**
  1. Thêm các actions vào `kanbanStore.ts`: `addColumn(title)`, `updateColumn(columnId, title)`, `deleteColumn(columnId)`.
  2. Bổ sung tính năng đổi tên cột: click vào tên cột hoặc nút sửa trên `ColumnHeader.tsx` để chỉnh sửa inline/modal.
  3. Bổ sung nút "+ Thêm cột mới" ở phía bên phải ngoài cùng của Board.
  4. Bổ sung nút xóa cột kèm cảnh báo xác nhận (xóa cột đồng thời dọn dẹp các task thuộc cột đó).
- **Cách kiểm chứng hoàn thành:**
  - Bấm "+ Thêm cột mới" -> Nhập "Testing" -> Cột mới xuất hiện ở cuối bảng.
  - Đổi tên cột "Backlog" thành "Ý tưởng mới" -> Tên cột được cập nhật ngay lập tức.
  - Bấm xóa một cột -> Xuất hiện xác nhận -> Đồng ý: Cột và các task bên trong bị xóa khỏi bảng.
  - F5 trang: Cấu trúc cột mới vẫn được lưu nguyên vẹn trong `localStorage`.

---

### Milestone 5: Kéo thả tương tác mượt mà (@dnd-kit)
- **Mục tiêu:** Người dùng có thể kéo thả thẻ giữa các cột và sắp xếp lại thứ tự công việc trong cùng một cột.
- **Các việc cần làm:**
  1. Thêm các actions tính toán kéo thả trong `kanbanStore.ts`: `moveTask(activeId, overId)`, sử dụng `arrayMove` để đổi thứ tự.
  2. Cấu hình `<DndContext>`, sensors (PointerSensor, KeyboardSensor) trong `Board.tsx`.
  3. Bọc danh sách thẻ trong từng cột bằng `<SortableContext>`.
  4. Tích hợp `useSortable` vào `TaskCard.tsx` (xử lý transform, transition, drag handle).
  5. Tạo `<DragOverlay>` để hiển thị bóng mờ mượt mà của thẻ khi đang được nhấc lên kéo đi.
- **Cách kiểm chứng hoàn thành:**
  - Nhấc 1 thẻ từ *To Do* kéo sang thả vào *In Progress*: Thẻ chuyển sang cột mới mượt mà, vị trí đặt chính xác.
  - Kéo 1 thẻ ở vị trí dưới cùng lên đầu cột trong cùng 1 cột: Thẻ được sắp xếp lại đúng vị trí mong muốn.
  - Thử kéo trên chuột hoặc touchpad: Hiệu ứng nhấc thẻ, bóng đổ và placeholder phản hồi nhạy, không giật lag.
  - F5 trang: Vị trí mới sau khi kéo thả của tất cả các thẻ được lưu đúng.

---

### Milestone 6: Tìm kiếm, Bộ lọc & Tinh chỉnh hoàn thiện (Search, Filters & Polish)
- **Mục tiêu:** Hoàn thiện bộ tính năng tìm kiếm/lọc thời gian thực, responsive và kiểm tra chất lượng tổng thể của ứng dụng.
- **Các việc cần làm:**
  1. Bổ sung `filterState` và actions `setSearchQuery`, `setPriorityFilter`, `setTagFilter` vào store.
  2. Tạo component `SearchAndFilter.tsx` nằm dưới Header:
     - Ô input tìm kiếm (debounce hoặc lọc tức thì theo title/description).
     - Dropdown / Pills lọc theo Độ ưu tiên (*All / Low / Medium / High*).
     - Lọc theo Nhãn màu (*All / danh sách màu*).
  3. Cập nhật `ColumnContainer` hiển thị số lượng thẻ đang hiển thị / tổng số thẻ (ví dụ: `3/5`).
  4. Xử lý trạng thái Empty State khi cột không có thẻ nào hoặc khi bộ lọc không khớp thẻ nào.
  5. Kiểm tra responsive trên màn hình laptop và tablet (cho phép cuộn ngang bảng nhẹ nhàng).
  6. Chạy build kiểm tra lỗi type và bundle production: `npm run build`.
- **Cách kiểm chứng hoàn thành:**
  - Nhập một từ khóa vào ô tìm kiếm -> Bảng chỉ hiển thị các thẻ có chứa từ khóa đó.
  - Chọn lọc "High" -> Chỉ những thẻ ưu tiên cao được hiển thị; các cột không có thẻ High sẽ báo rỗng rõ ràng.
  - Kết hợp vừa tìm kiếm vừa chọn bộ lọc -> Kết quả lọc chính xác.
  - Xóa ô tìm kiếm / đặt lại bộ lọc -> Toàn bộ thẻ hiện lại bình thường.
  - Chạy lệnh `npm run build`: Quá trình compile TypeScript và Vite đóng gói thành công 100% không có lỗi.

