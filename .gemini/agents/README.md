# 🤖 ĐỘI NGŨ SUB-AGENTS (AI TEAMWORK)

Hệ thống được trang bị 3 Sub-Agents chuyên biệt hóa cao để làm việc song song hiệu quả:

---

## 1. Danh Sách 3 Sub-Agents

| Tên Sub-Agent | Vai Trò | Quyền Hạn | Trọng Tâm |
| :--- | :--- | :--- | :--- |
| **`codebase-researcher`** | Nghiên cứu & Khảo sát | **Read-only** (Không sửa code, có Context7) | Đọc codebase, tra cứu docs mới, tìm nguyên nhân lỗi, đề xuất giải pháp. |
| **`core-developer`** | Lập trình viên chính | **Write Code** (Sửa file, chạy dev server) | Viết tính năng, fix bug, tuân thủ `AGENTS.md` (Zustand store + React UI). |
| **`quality-tester`** | Tester khó tính (QA) | **Write Test & Run Test** | Viết test độc lập theo SPEC, săn lỗi biên, test chống gian lận. |

---

## 2. Quy Trình Phối Hợp Tối Ưu (Optimal Workflow)

```text
[ Người dùng giao Task ]
           │
           ▼
[ BƯỚC 1: Gọi codebase-researcher ]
- Khảo sát các file bị ảnh hưởng
- Tra cứu tài liệu thư viện mới
- Lập bản tóm tắt phương án
           │
           ▼
[ BƯỚC 2: Gọi core-developer ]
- Nhận bản tóm tắt từ researcher
- Viết code vào source code chính
- Tự chạy dev server kiểm tra không lỗi cú pháp
           │
           ▼
[ BƯỚC 3: Gọi quality-tester ]
- Viết test độc lập theo SPEC (Black-box)
- Chạy test kiểm thử các case dữ liệu bẩn
- Báo cáo kết quả và xác nhận hoàn thành
```

