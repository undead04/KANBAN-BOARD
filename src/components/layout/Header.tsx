import React from 'react';
import { Kanban, Sparkles, RotateCcw } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useKanbanStore } from '../../store/kanbanStore';

export const Header: React.FC = () => {
  const columnsCount = useKanbanStore((state) => state.columns.length);
  const tasksCount = useKanbanStore((state) => state.tasks.length);
  const resetToInitialData = useKanbanStore((state) => state.resetToInitialData);

  const handleReset = () => {
    if (window.confirm('Bạn có chắc muốn khôi phục lại toàn bộ dữ liệu mẫu mặc định?')) {
      resetToInitialData();
    }
  };

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Kanban className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Kanban Flow
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Sparkles className="w-3 h-3" />
                Vibe Coding MVP
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Frontend-only Kanban Board with React + TypeScript
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <span className="font-semibold text-slate-700 dark:text-slate-200">{columnsCount}</span> Cột •
            <span className="font-semibold text-slate-700 dark:text-slate-200 ml-1">{tasksCount}</span> Thẻ
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title="Khôi phục về dữ liệu mẫu ban đầu"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Khôi phục mẫu</span>
          </button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
