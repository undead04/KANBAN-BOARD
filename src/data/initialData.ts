import type { Column, Task } from '../types/kanban';

export const INITIAL_COLUMNS: Column[] = [
  { id: 'col-backlog', title: 'Backlog', order: 0 },
  { id: 'col-todo', title: 'To Do', order: 1 },
  { id: 'col-inprogress', title: 'In Progress', order: 2 },
  { id: 'col-done', title: 'Done', order: 3 },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    columnId: 'col-backlog',
    title: 'Nghiên cứu kiến trúc @dnd-kit',
    description: 'Đọc kỹ tài liệu về sensors, collision detection và sortable context để tích hợp kéo thả mượt.',
    priority: 'medium',
    dueDate: '2026-11-10',
    colorTag: 'sky',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    columnId: 'col-todo',
    title: 'Thiết kế giao diện Dark Mode',
    description: 'Định nghĩa bảng màu slate/zinc cho Tailwind dark mode và tạo switch toggle trên Header.',
    priority: 'low',
    dueDate: '2026-11-08',
    colorTag: 'purple',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    columnId: 'col-todo',
    title: 'Xây dựng Modal CRUD Task',
    description: 'Form thêm và sửa task gồm: tiêu đề, mô tả, hạn chót, độ ưu tiên và nhãn màu trực quan.',
    priority: 'high',
    dueDate: '2026-11-06',
    colorTag: 'rose',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    columnId: 'col-inprogress',
    title: 'Dựng khung Kanban tĩnh (Milestone 1)',
    description: 'Hoàn thiện Board, ColumnContainer và TaskCard với mock data mẫu hiển thị sắc nét.',
    priority: 'high',
    dueDate: '2026-11-04',
    colorTag: 'amber',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-5',
    columnId: 'col-done',
    title: 'Khởi tạo tài liệu SPEC & ARCHITECTURE',
    description: 'Chốt yêu cầu MVP và tài liệu hóa nguyên tắc: logic ở store, component chỉ hiển thị.',
    priority: 'medium',
    dueDate: '2026-11-04',
    colorTag: 'emerald',
    createdAt: new Date().toISOString(),
  },
];
