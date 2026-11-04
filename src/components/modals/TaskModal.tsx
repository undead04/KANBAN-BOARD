import React, { useState, useEffect } from 'react';
import type { Task, Priority, Column } from '../../types/kanban';
import { X, Calendar, Flag, Tag as TagIcon, LayoutList, AlertCircle } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: {
    title: string;
    description: string;
    columnId: string;
    priority: Priority;
    dueDate?: string;
    colorTag: string;
  }) => void;
  taskToEdit?: Task | null;
  defaultColumnId?: string;
  columns: Column[];
}

const AVAILABLE_COLORS = [
  { id: 'emerald', name: 'Xanh lá', bg: 'bg-emerald-500', ring: 'ring-emerald-400' },
  { id: 'sky', name: 'Xanh lam', bg: 'bg-sky-500', ring: 'ring-sky-400' },
  { id: 'amber', name: 'Vàng cam', bg: 'bg-amber-500', ring: 'ring-amber-400' },
  { id: 'rose', name: 'Đỏ hồng', bg: 'bg-rose-500', ring: 'ring-rose-400' },
  { id: 'purple', name: 'Tím', bg: 'bg-purple-500', ring: 'ring-purple-400' },
  { id: 'indigo', name: 'Chàm', bg: 'bg-indigo-500', ring: 'ring-indigo-400' },
];

const PRIORITIES: { value: Priority; label: string; activeClass: string }[] = [
  {
    value: 'low',
    label: 'Thấp',
    activeClass: 'bg-emerald-50 text-emerald-700 border-emerald-400 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-600',
  },
  {
    value: 'medium',
    label: 'Vừa',
    activeClass: 'bg-amber-50 text-amber-700 border-amber-400 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-600',
  },
  {
    value: 'high',
    label: 'Cao',
    activeClass: 'bg-rose-50 text-rose-700 border-rose-400 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-600',
  },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  defaultColumnId,
  columns,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [columnId, setColumnId] = useState(defaultColumnId || (columns[0]?.id ?? ''));
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [colorTag, setColorTag] = useState('sky');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description || '');
        setColumnId(taskToEdit.columnId);
        setPriority(taskToEdit.priority);
        setDueDate(taskToEdit.dueDate || '');
        setColorTag(taskToEdit.colorTag || 'sky');
      } else {
        setTitle('');
        setDescription('');
        setColumnId(defaultColumnId || (columns[0]?.id ?? ''));
        setPriority('medium');
        setDueDate('');
        setColorTag('sky');
      }
      setError(null);
    }
  }, [isOpen, taskToEdit, defaultColumnId, columns]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề cho công việc');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      columnId,
      priority,
      dueDate: dueDate || undefined,
      colorTag,
    });
    onClose();
  };

  const isEditing = Boolean(taskToEdit);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 my-8 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isEditing ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isEditing ? 'Cập nhật thông tin chi tiết cho thẻ' : 'Nhập các thông tin cần thiết bên dưới'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-900">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tiêu đề công việc <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              placeholder="VD: Thiết kế giao diện Dashboard..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Description input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mô tả chi tiết
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Thêm mô tả hoặc ghi chú cụ thể..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
            />
          </div>

          {/* Column & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Column selection */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <LayoutList className="w-3.5 h-3.5" />
                Cột trạng thái
              </label>
              <select
                value={columnId}
                onChange={(e) => setColumnId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Due date */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <Calendar className="w-3.5 h-3.5" />
                Hạn chót (Due date)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          {/* Priority selection */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <Flag className="w-3.5 h-3.5" />
              Độ ưu tiên
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRIORITIES.map((p) => {
                const isSelected = priority === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border text-center transition flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? p.activeClass
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Flag className="w-3 h-3" />
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color tag palette */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <TagIcon className="w-3.5 h-3.5" />
              Màu phân loại
            </label>
            <div className="flex items-center gap-3">
              {AVAILABLE_COLORS.map((color) => {
                const isSelected = colorTag === color.id;
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setColorTag(color.id)}
                    title={color.name}
                    className={`w-7 h-7 rounded-full ${color.bg} transition-all transform flex items-center justify-center ${
                      isSelected
                        ? `ring-3 ring-offset-2 dark:ring-offset-slate-900 ${color.ring} scale-110 shadow-sm`
                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                  >
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-white shadow-xs" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition"
            >
              {isEditing ? 'Lưu thay đổi' : 'Tạo công việc'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
