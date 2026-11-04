---
name: github-workflow
description: Quy trình Git/GitHub chuẩn thực tế chuyên nghiệp theo 2 giai đoạn: Tạo branch trước khi code (Feature Branch Workflow), sau đó commit, review, tạo Pull Request và dọn dẹp branch.
---

# Skill: Git & GitHub Workflow Chuẩn Doanh Nghiệp (Branch First Flow)

Quy trình chuẩn thực tế trong mọi công ty công nghệ luôn chia làm **2 giai đoạn rõ rệt**:
- **Giai đoạn A (Trước khi code):** Luôn tạo và đứng trên branch tính năng mới, tuyệt đối không code thẳng vào `main`.
- **Giai đoạn B (Sau khi code xong):** Review, commit chuẩn, push, tạo Pull Request và dọn branch.

---

## GIAI ĐOẠN A: TRƯỚC KHI BẮT ĐẦU CODE (Khởi tạo Feature Branch)

Kích hoạt ngay khi người dùng nói chuẩn bị làm tính năng mới, fix bug hoặc bắt đầu một task:

1. **Đồng bộ nhánh chính (`main`):**
   ```bash
   git checkout main
   git pull origin main
   ```
2. **Tạo và chuyển sang Branch mới ngay lập tức:**
   Đặt tên theo chuẩn định danh dự án:
   - Tính năng mới: `feature/<tên-tính-năng>` (ví dụ: `feature/user-auth`)
   - Sửa bug: `fix/<tên-bug>` (ví dụ: `fix/login-button-crash`)
   - Cải tiến/Dọn code: `refactor/<tên-task>`
   - Chạy lệnh:
     ```bash
     git checkout -b <tên-branch>
     ```
3. **Báo người dùng:** Đã sẵn sàng trên branch mới, bây giờ mới tiến hành code.

---

## GIAI ĐOẠN B: SAU KHI CODE XONG (Review, PR & Release)

Kích hoạt khi người dùng hoàn thành code tính năng và muốn đưa lên GitHub:

### Bước 1: Pre-commit Audit (Tự Động Review Code)
- Kiểm tra các file đã thay đổi: `git status` và `git diff`.
- Đảm bảo **không commit** nhầm file `.env`, API key, credentials hoặc thư mục tạm/build (`node_modules/`, `dist/`).
- Dọn dẹp các dòng `console.log` debug rác.

### Bước 2: Stage & Commit Theo Chuẩn Conventional Commits
1. Stage toàn bộ file:
   ```bash
   git add .
   ```
2. Tạo commit message chuẩn quốc tế:
   - `feat(scope): ...` (Tính năng mới)
   - `fix(scope): ...` (Sửa lỗi)
   - `refactor(scope): ...` (Tái cấu trúc)
   - `docs(scope): ...` (Tài liệu)
   - Ví dụ: `git commit -m "feat(auth): thêm form đăng nhập và validate Zod schema"`

### Bước 3: Đẩy Code & Tạo Pull Request (PR)
1. Push branch lên GitHub remote:
   ```bash
   git push -u origin <tên-branch>
   ```
2. Tạo Pull Request chuyên nghiệp qua GitHub CLI (`gh`):
   ```bash
   gh pr create --title "<Loại>: <Tiêu đề PR>" --body "## Tóm tắt thay đổi
- <Mô tả chức năng 1>
- <Mô tả chức năng 2>

## Checklist kiểm thử
- [x] Đã tự review code và dọn log thừa
- [x] Đã test chạy thử thành công trên local"
   ```
   *(Nếu chưa cài `gh`, xuất link tạo PR trực tiếp trên trình duyệt để người dùng bấm vào).*

---

## GIAI ĐOẠN C: SAU KHI MERGE PR (Cleanup - Dọn Dẹp)
Khi PR đã được merge vào `main` trên GitHub:
1. Chuyển về nhánh `main` và kéo code mới nhất về:
   ```bash
   git checkout main
   git pull origin main
   ```
2. Xóa sạch branch tính năng cũ trên máy local để tránh rác repository:
   ```bash
   git branch -d <tên-branch>
   ```
