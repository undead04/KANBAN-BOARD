# AGENTS.md

Hướng dẫn dành riêng cho AI Agent khi phát triển dự án.

## 1. Stack đã chốt
- **Core:** React 18+, TypeScript (Strict Mode), Vite
- **Styling:** Tailwind CSS (Class-based Dark mode), Lucide React
- **Drag & Drop:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **State & Storage:** Zustand kèm middleware `persist` (lưu `localStorage`)
- *Chi tiết:* [docs/README.md](docs/README.md) & [docs/01-architecture/](docs/01-architecture/)

## 2. Lệnh vận hành
- Chạy dev server: `npm run dev`
- Kiểm tra type & build production: `npm run build`
- Chạy toàn bộ test: `npm test`

## 3. Cấu trúc & Phân nhiệm
- `src/store/`: Nắm 100% state và xử lý toàn bộ nghiệp vụ (CRUD, kéo thả, filter).
- `src/components/`: Presentational components, chỉ render JSX và dispatch action.
- `src/types/`: Khai báo kiểu dữ liệu chung (Task, Column, Priority, Tag...).
- `src/data/`: Chứa mock data ban đầu (`initialData.ts`).

## 4. Convention & Nguyên tắc cốt lõi
- **Logic ở Store, UI chỉ hiển thị:** Tuyệt đối không tính toán mảng hoặc mutate state trong component.
- **Type Safety:** TypeScript nghiêm ngặt, cấm lạm dụng kiểu `any`.
- **Giao tiếp:** Luôn dùng Tiếng Việt ngắn gọn, thân thiện, tập trung vào kết quả.
- **Defensive Programming:** Luôn kiểm tra an toàn `null-safe` khi đọc dữ liệu từ storage hoặc remote.

## 5. Điều cấm (Strict Constraints)
- **Cấm** cài thêm thư viện state khác (Redux, MobX, Context API rườm rà).
- **Cấm** tự ý refactor hoặc xóa code ngoài phạm vi milestone đang làm.
- **Cấm** tự ý `git push` hoặc tạo Pull Request khi người dùng chưa đồng ý hoặc chưa yêu cầu đích danh. Mọi thay đổi trong quá trình code chỉ commit ở local.
- **Cấm** tự ý chạy các lệnh hủy diệt Database (`DROP`, `TRUNCATE`, `DELETE` không có `WHERE`).
- **Cấm** nhảy cóc milestone: Phải chạy và kiểm chứng xong bước hiện tại mới làm bước sau.

## 6. Quy trình phối hợp Teamwork (Sub-Agents Workflow)
Khi người dùng kích hoạt lệnh `/teamwork` cho tính năng mới hoặc xử lý bug khó:
- **Agent Trưởng (Parent):** Lập Plan chi tiết, giữ vai trò Tech Lead điều phối.
- **Trạm 1 (`codebase-researcher` - Model Flash):** Đọc codebase, tra cứu docs, đề xuất cấu trúc file/types trước khi code.
- **Trạm 2 (`core-developer` - Model Flash):** Lập trình theo đúng SPEC và AGENTS.md, tự sửa lỗi build.
- **Trạm 3 (`quality-tester` - Model Pro):** Kiểm thử độc lập theo skill `.gemini/skills/rigorous-testing/`, cố tình bẻ gãy code bằng các case dữ liệu bẩn. Nếu fail, bắt buộc yêu cầu Developer sửa.

## 7. Kích hoạt Skills / Rules bổ trợ
- **Khi thao tác Database:** Bắt buộc tuân thủ rule [`.gemini/rules/database-safety.md`](.gemini/rules/database-safety.md) và skill [`.gemini/skills/db-migration/`](.gemini/skills/db-migration/SKILL.md) (luôn có UP/DOWN rollback, bọc trong Transaction, hỏi xác nhận trước khi chạy).
- **Khi Review Code / Hoàn thành task:** Bắt buộc áp dụng rule [`.gemini/rules/code-review.md`](.gemini/rules/code-review.md) và skill [`.gemini/skills/code-review/`](.gemini/skills/code-review/SKILL.md).
- **Khi làm việc với Git:** Tuân thủ skill [`.gemini/skills/github-workflow/`](.gemini/skills/github-workflow/SKILL.md) (tách branch trước khi code, commit ở local; chỉ push/PR khi được yêu cầu).
