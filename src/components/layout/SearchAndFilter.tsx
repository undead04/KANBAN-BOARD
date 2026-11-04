import React from 'react';
import { Search, X, Filter, RotateCcw } from 'lucide-react';
import { useKanbanStore } from '../../store/kanbanStore';
import type { Priority } from '../../types/kanban';

const PRIORITY_OPTIONS: { value: Priority | 'all'; label: string; colorClass?: string }[] = [
  { value: 'all', label: 'Tất cả mức độ' },
  { value: 'low', label: 'Thấp', colorClass: 'text-emerald-600 dark:text-emerald-400' },
  { value: 'medium', label: 'Vừa', colorClass: 'text-amber-600 dark:text-amber-400' },
  { value: 'high', label: 'Cao', colorClass: 'text-rose-600 dark:text-rose-400' },
];

const TAG_OPTIONS: { value: string; label: string; bgClass: string }[] = [
  { value: 'all', label: 'Tất cả nhãn', bgClass: 'bg-slate-400' },
  { value: 'sky', label: 'Sky', bgClass: 'bg-sky-500' },
  { value: 'emerald', label: 'Emerald', bgClass: 'bg-emerald-500' },
  { value: 'amber', label: 'Amber', bgClass: 'bg-amber-500' },
  { value: 'rose', label: 'Rose', bgClass: 'bg-rose-500' },
  { value: 'purple', label: 'Purple', bgClass: 'bg-purple-500' },
  { value: 'indigo', label: 'Indigo', bgClass: 'bg-indigo-500' },
];

export const SearchAndFilter: React.FC = () => {
  const searchQuery = useKanbanStore((state) => state.searchQuery);
  const priorityFilter = useKanbanStore((state) => state.priorityFilter);
  const tagFilter = useKanbanStore((state) => state.tagFilter);

  const setSearchQuery = useKanbanStore((state) => state.setSearchQuery);
  const setPriorityFilter = useKanbanStore((state) => state.setPriorityFilter);
  const setTagFilter = useKanbanStore((state) => state.setTagFilter);
  const resetFilters = useKanbanStore((state) => state.resetFilters);

  const totalTasks = useKanbanStore((state) => state.tasks.length);
  const filteredTasksCount = useKanbanStore((state) => state.getFilteredTasks().length);

  const isFiltering =
    searchQuery.trim() !== '' || priorityFilter !== 'all' || tagFilter !== 'all';

  return (
    <div className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-2.5 transition-colors">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tiêu đề hoặc mô tả..."
            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition cursor-pointer"
              aria-label="Xóa từ khóa tìm kiếm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Filters & Reset */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs">
          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 py-1">
            <Filter className="w-3 h-3 text-slate-400" />
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">
              Ưu tiên:
            </span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
              className="bg-transparent text-slate-800 dark:text-slate-200 font-medium text-xs focus:outline-none cursor-pointer pr-1"
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Color Tag Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 py-1">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                tagFilter === 'all'
                  ? 'bg-slate-400'
                  : TAG_OPTIONS.find((t) => t.value === tagFilter)?.bgClass || 'bg-slate-400'
              }`}
            />
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">
              Nhãn:
            </span>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 font-medium text-xs focus:outline-none cursor-pointer pr-1 capitalize"
            >
              {TAG_OPTIONS.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white capitalize"
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Match counter badge */}
          {isFiltering && (
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800 animate-in fade-in duration-200">
                Hiển thị {filteredTasksCount}/{totalTasks}
              </span>

              {/* Reset filter button */}
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                title="Xóa tất cả bộ lọc"
              >
                <RotateCcw className="w-3 h-3" />
                Đặt lại
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
