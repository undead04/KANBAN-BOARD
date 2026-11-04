# 🗺️ KẾ HOẠCH TRIỂN KHAI KANBAN CORE (PLAN.MD)

Tài liệu này chi tiết hóa các bước thực thi từ Milestone 1 đến Milestone 5 của tính năng lõi Kanban.

---

## 📌 Milestone 1: Khởi tạo dự án & Giao diện khung tĩnh
- **Mục tiêu:** Tạo nền móng dự án chuẩn TypeScript, cài đặt dependencies lõi, render giao diện tĩnh với 4 cột và thẻ mẫu.
- **Trạng thái:** ✅ Đã hoàn thành và commit ở local.

---

## 📌 Milestone 2: Zustand Store, Theme Toggle & LocalStorage
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

## 📌 Milestone 3: Quản lý Thẻ qua Modal (Task CRUD)
- **Mục tiêu:** Thêm thẻ mới, xem chi tiết, chỉnh sửa thông tin và xóa thẻ.
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
  - F5 lại trang: Mọi thao tác thêm/sửa/xóa đều được bảo toàn trong `localStorage`.

---

## 📌 Milestone 4: Quản lý Cột (Column CRUD)
- **Mục tiêu:** Người dùng có thể thêm cột mới, đổi tên cột trực tiếp và xóa cột thừa.
- **Các việc cần làm:**
  1. Thêm các actions vào `kanbanStore.ts`: `addColumn(title)`, `updateColumnTitle(columnId, newTitle)`, `deleteColumn(columnId)`.
  2. Tạo component `ColumnModal.tsx` hoặc Inline Edit trên `ColumnHeader.tsx` để sửa tên cột trực tiếp.
  3. Bổ sung nút "+ Thêm cột" ở cuối bảng Kanban.
  4. Bổ sung nút xóa cột kèm cảnh báo xác nhận trong `ConfirmDialog`.
- **Cách kiểm chứng hoàn thành:**
  - Bấm "+ Thêm cột" -> Nhập "Review" -> Cột mới xuất hiện ở vị trí cuối cùng của bảng.
  - Double-click hoặc bấm nút sửa trên tên cột -> Đổi tên thành "Code Review" -> Lưu thành công.
  - Bấm xóa cột -> Xác nhận -> Cột và toàn bộ thẻ bên trong được dọn sạch.
  - F5 lại trang: Trạng thái các cột được duy trì chính xác.

---

## 📌 Milestone 5: Kéo thả tương tác mượt mà (@dnd-kit)
- **Mục tiêu:** Kéo thả thẻ giữa các cột và sắp xếp thứ tự thẻ trong cùng cột một cách mượt mà.
- **Các việc cần làm:**
  1. Tích hợp `DndContext`, `PointerSensor`, `KeyboardSensor` vào `Board.tsx`.
  2. Bọc danh sách thẻ trong `ColumnContainer.tsx` bằng `SortableContext` với strategy `verticalListSortingStrategy`.
  3. Cập nhật `TaskCard.tsx` sử dụng hook `useSortable` để có thuộc tính `listeners`, `attributes`, `transform`, `transition`.
  4. Sử dụng `<DragOverlay>` để hiển thị bóng mờ của thẻ khi đang được nhấc lên di chuyển.
  5. Xử lý sự kiện `onDragEnd` và `onDragOver` cập nhật chính xác vị trí trong `kanbanStore.ts`.
- **Cách kiểm chứng hoàn thành:**
  - Kéo thẻ từ cột *Backlog* thả sang cột *In Progress*: Thẻ di chuyển mượt mà, chuyển hẳn sang cột mới, không bị giật lag hay mất dữ liệu.
  - Kéo đổi vị trí giữa thẻ thứ 1 và thẻ thứ 3 trong cùng một cột: Thứ tự thẻ được cập nhật chính xác.
  - F5 lại trang: Vị trí thẻ sau khi kéo thả vẫn được giữ nguyên.
