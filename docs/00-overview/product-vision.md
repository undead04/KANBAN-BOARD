# 🎯 TẦM NHÌN SẢN PHẨM (PRODUCT VISION)

## 1. Mục tiêu dự án
- **Tên sản phẩm:** Kanban Board Web App
- **Định vị:** Ứng dụng quản lý công việc và luồng dự án dạng bảng Kanban (tương tự Trello / Linear), giao diện hiện đại, tối giản, mượt mà.
- **Mục tiêu kỹ thuật:** 
  - Khởi đầu với phiên bản **Frontend-Only MVP** chạy độc lập trên trình duyệt (SPA), không phụ thuộc backend API, lưu trữ `localStorage`.
  - Thiết kế kiến trúc module hóa ngay từ đầu để sẵn sàng scale lên hệ thống Fullstack (Backend API, CSDL đám mây, Realtime collaboration) mà không phải đập đi xây lại.
  - Phục vụ thực hành phương pháp **Vibe Coding** chuẩn mực: Dev nắm quyền kiểm soát kiến trúc & đặc tả (Spec-driven), AI Agent thực thi code và kiểm thử nghiêm ngặt.

---

## 2. Đối tượng người dùng (User Personas)
1. **Lập trình viên / Cá nhân (Solo Developer / Creator):** Cần một bảng quản lý công việc cá nhân nhẹ, mở lên là dùng ngay, không cần đăng nhập rườm rà.
2. **Nhóm làm việc nhỏ (Small Team - Định hướng tương lai):** Cần bảng cộng tác trực quan, phân chia cột theo trạng thái công việc và theo dõi độ ưu tiên rõ ràng.

---

## 3. Triết lý thiết kế sản phẩm (Product Principles)
- **Zero Latency:** Phản hồi tức thì với mọi thao tác kéo thả, lọc, thêm thẻ.
- **Local-First & Data Persistence:** Dữ liệu luôn được lưu trữ an toàn trên thiết bị của người dùng, không bao giờ mất dữ liệu khi F5 hoặc mất mạng.
- **Minimalist & Clean Aesthetic:** Bo góc mềm mại, phân cấp thị giác rõ ràng với badge độ ưu tiên và nhãn màu sắc theo phong cách Linear/Notion.
