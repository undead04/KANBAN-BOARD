# 🛠️ CÔNG NGHỆ LỰA CHỌN (TECH STACK)

Dự án chốt sử dụng **Phương án 2: Chuẩn hiện đại & Tách biệt Logic**:

---

## 1. Thành phần Công nghệ

| Lớp (Layer) | Công nghệ | Phiên bản | Vai trò & Lý do lựa chọn |
| :--- | :--- | :--- | :--- |
| **Core Framework** | React | 18+ | Functional Components, Hooks hiện đại, hệ sinh thái rộng lớn. |
| **Ngôn ngữ** | TypeScript | Strict Mode | Đảm bảo an toàn kiểu dữ liệu (type safety), cấm hoàn toàn `any`. |
| **Build Tool** | Vite | Latest | Tốc độ khởi động server tức thì, Hot Module Replacement (HMR) cực nhanh. |
| **Styling** | Tailwind CSS | v3 / v4 | Utility-first CSS, tùy biến giao diện nhanh, hỗ trợ Dark Mode dạng class (`dark`). |
| **Icon Library** | Lucide React | Latest | Bộ icon hiện đại, nhẹ, đồng bộ phong cách với giao diện tối giản. |
| **Drag & Drop** | `@dnd-kit` | Latest | Bộ thư viện kéo thả hiện đại gồm `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`. Hỗ trợ touch mobile tốt, animation mượt, không phụ thuộc DOM cứng nhắc. |
| **State Management** | Zustand | Latest | Quản lý state tập trung bên ngoài React Tree, tránh re-render thừa. |
| **Persistence** | Zustand `persist` | Built-in | Middleware tự động serialize state xuống `localStorage` và rehydrate khi mở app. |

---

## 2. Lệnh Vận Hành Dự Án

```bash
# Cài đặt thư viện
npm install

# Chạy server phát triển (Dev server)
npm run dev

# Kiểm tra kiểu dữ liệu (Type check) & Build production
npm run build

# Xem trước bản build production
npm run preview
```
