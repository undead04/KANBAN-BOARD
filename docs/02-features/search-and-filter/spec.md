# 🔍 ĐẶC TẢ TÍNH NĂNG: TÌM KIẾM & BỘ LỌC (SPEC.MD)

Tài liệu này đặc tả tính năng lọc và tìm kiếm thẻ theo thời gian thực (Milestone 6).

---

## 1. Yêu Cầu Chức Năng

- **Thanh tìm kiếm từ khóa (Search Bar):**
  - Đặt trên thanh điều hướng hoặc ngay trên đỉnh bảng Kanban.
  - Tìm kiếm real-time (tức thì theo từng ký tự gõ) khớp với:
    - Tiêu đề thẻ (`title`).
    - Hoặc mô tả chi tiết của thẻ (`description`).
  - Không phân biệt chữ hoa, chữ thường.
- **Bộ lọc theo Độ ưu tiên (Priority Filter):**
  - Dropdown hoặc Button group: `Tất cả` | `Low` | `Medium` | `High`.
  - Chỉ hiển thị các thẻ có độ ưu tiên tương ứng.
- **Bộ lọc theo Nhãn màu (Color Tag Filter):**
  - Dropdown hoặc danh sách badge màu sắc.
  - Cho phép lọc ra các thẻ mang màu sắc được chọn.
- **Hiển thị số lượng (Counter Badge):**
  - Trên mỗi tiêu đề cột, hiển thị số lượng thẻ khớp với bộ lọc / tổng số thẻ (ví dụ: `3/5`).
  - Nếu không có thẻ nào khớp: Hiển thị trạng thái rỗng trực quan (*"Không tìm thấy thẻ phù hợp"*).

---

## 2. Thiết Kế Logic Trong Store
- Trạng thái bộ lọc (`filterState`):
  ```typescript
  searchQuery: string;
  priorityFilter: Priority | 'all';
  tagFilter: string | 'all';
  ```
- Component `ColumnContainer` gọi hàm selector tính toán danh sách thẻ thỏa mãn đồng thời cả 3 điều kiện:
  ```typescript
  const filteredTasks = tasks.filter(task => {
    const matchQuery = task.title.toLowerCase().includes(query) || 
                       task.description.toLowerCase().includes(query);
    const matchPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchTag = tagFilter === 'all' || task.colorTag === tagFilter;
    return matchQuery && matchPriority && matchTag;
  });
  ```
