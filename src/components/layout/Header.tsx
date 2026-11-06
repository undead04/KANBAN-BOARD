import React from 'react';
import { Kanban, Sparkles, RotateCcw, Lock, Unlock } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useKanbanStore } from '../../store/kanbanStore';
import { usePresenceStore } from '../../store/presenceStore';

export const Header: React.FC = () => {
  const columnsCount = useKanbanStore((state) => state.columns?.length ?? 0);
  const tasksCount = useKanbanStore((state) => state.tasks?.length ?? 0);
  const firstTaskId = useKanbanStore((state) => state.tasks?.[0]?.id);
  const resetToInitialData = useKanbanStore((state) => state.resetToInitialData);

  // Presence simulation
  const isFirstTaskLocked = usePresenceStore((state) =>
    firstTaskId ? state.isTaskLockedByOther(firstTaskId, 'current-user-1') : false
  );
  const acquireLock = usePresenceStore((state) => state.acquireLock);
  const releaseLock = usePresenceStore((state) => state.releaseLock);

  const handleToggleSimLock = () => {
    if (!firstTaskId) return;

    if (isFirstTaskLocked) {
      releaseLock(firstTaskId, 'sim-user-b');
    } else {
      acquireLock(firstTaskId, {
        userId: 'sim-user-b',
        name: 'Nguyễn Văn B (Remote)',
        avatar: '👨‍💻',
      });
    }
  };

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
          {/* Card Locking Demo Simulation Button */}
          {firstTaskId && (
            <button
              type="button"
              onClick={handleToggleSimLock}
              className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                isFirstTaskLocked
                  ? 'bg-amber-500 text-white border-amber-600 shadow-amber-500/30 animate-pulse'
                  : 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40'
              }`}
              title="Mô phỏng thành viên khác trong Workspace đang khóa thẻ này trong 10 giây"
            >
              {isFirstTaskLocked ? (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Đang khóa thẻ 1 (10s)</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Giả lập Khóa Thẻ</span>
                  <span className="sm:hidden">Khóa Thẻ</span>
                </>
              )}
            </button>
          )}

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
