import React, { useState, useRef, useEffect } from 'react';
import type { Column } from '../../types/kanban';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

interface ColumnHeaderProps {
  column: Column;
  taskCount: number;
  onRename: (columnId: string, newTitle: string) => void;
  onDelete: (column: Column) => void;
}

export const ColumnHeader: React.FC<ColumnHeaderProps> = ({
  column,
  taskCount,
  onRename,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Focus and select input text when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setEditTitle(column.title);
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing, column.title]);

  // Click outside listener for the dropdown menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleSaveRename = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== column.title) {
      onRename(column.id, trimmed);
    } else {
      setEditTitle(column.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveRename();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditTitle(column.title);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center justify-between px-2 py-1.5 mb-2 relative">
      {/* Title & Count */}
      <div className="flex items-center gap-2 flex-1 min-w-0 mr-1">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveRename}
            onKeyDown={handleKeyDown}
            className="w-full text-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-sky-500 dark:border-sky-400 outline-none shadow-xs"
            placeholder="Nhập tên cột..."
            maxLength={50}
          />
        ) : (
          <h2
            onDoubleClick={() => setIsEditing(true)}
            title="Nhấp đúp để đổi tên cột"
            className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate cursor-pointer hover:text-sky-600 dark:hover:text-sky-400 transition-colors select-none"
          >
            {column.title}
          </h2>
        )}

        {!isEditing && (
          <span className="flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-semibold rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex-shrink-0">
            {taskCount}
          </span>
        )}
      </div>

      {/* Menu button & Dropdown */}
      <div className="relative flex items-center" ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className={`p-1 rounded-lg transition ${
            isMenuOpen
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
          }`}
          aria-label="Tùy chọn cột"
          title="Tùy chọn cột"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {/* Dropdown Popover */}
        {isMenuOpen && (
          <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                setIsEditing(true);
              }}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/70 transition-colors cursor-pointer text-left"
            >
              <Pencil className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              Đổi tên cột
            </button>
            <div className="my-1 border-t border-slate-100 dark:border-slate-700/60" />
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                onDelete(column);
              }}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer text-left font-medium"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              Xóa cột
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
