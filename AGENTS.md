# AGENTS.md

Hướng dẫn dành riêng cho AI Agent khi phát triển dự án Kanban Board.

## 1. Stack đã chốt
- **Core:** React 18+, TypeScript (Strict Mode), Vite
- **Styling:** Tailwind CSS (Class-based Dark mode), Lucide React
- **Drag & Drop:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **State & Storage:** Zustand kèm middleware `persist` (lưu `localStorage`)
- *Chi tiết:* [docs/SPEC.md](docs/SPEC.md) & [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## 2. Lệnh vận hành
- Chạy dev server: `npm run dev`
- Kiểm tra type & build production: `npm run build`

## 3. Cấu trúc & Phân nhiệm
- `src/store/`: Nắm 100% state và xử lý toàn bộ nghiệp vụ (CRUD, kéo thả, filter).
- `src/components/`: Presentational components, chỉ render JSX và dispatch action.
- `src/types/`: Khai báo kiểu dữ liệu chung (Task, Column, Priority, Tag...).
- `src/data/`: Chứa mock data ban đầu (`initialData.ts`).

## 4. Convention & Nguyên tắc cốt lõi
- **Logic ở Store, UI chỉ hiển thị:** Tuyệt đối không tính toán mảng hoặc mutate state trong component.
- **Type Safety:** TypeScript nghiêm ngặt, cấm lạm dụng kiểu `any`.
- **Giao tiếp:** Luôn dùng Tiếng Việt ngắn gọn, thân thiện, tập trung vào kết quả.

## 5. Điều cấm (Strict Constraints)
- **Cấm** cài thêm thư viện state khác (Redux, MobX, Context API rườm rà).
- **Cấm** tự ý refactor hoặc xóa code ngoài phạm vi milestone đang làm.
- **Cấm** tự ý `git push` hoặc tạo Pull Request khi người dùng chưa đồng ý hoặc chưa yêu cầu đích danh. Mọi thay đổi trong quá trình code chỉ commit ở local.
- **Cấm** nhảy cóc milestone: Phải chạy và kiểm chứng xong bước hiện tại mới làm bước sau.

## 6. Quy trình triển khai & Kích hoạt Skills
- Thực hiện tuần tự 6 milestones trong [docs/PLAN.md](docs/PLAN.md).
- Gặp lỗi: Tự đọc log terminal/console, tự sửa đến khi chạy được mới báo hoàn thành.
- **Khi viết Test:** Bắt buộc kích hoạt skill `.gemini/skills/rigorous-testing/` (test theo SPEC, bao phủ edge cases, cấm viết test xuôi theo code).
- **Khi làm việc với Git:** Tuân thủ skill `.gemini/skills/github-workflow/` (tách branch trước khi code, commit ở local; chỉ push/PR khi được yêu cầu).
