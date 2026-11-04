import React from 'react';
import type { Task, Priority } from '../../types/kanban';
import { Calendar, MoreVertical, Flag } from 'lucide-react';

interface TaskCardProps {
  task: Task;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; badgeClass: string; iconClass: string }> = {
  low: {
    label: 'Thấp',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    iconClass: 'text-emerald-500',
  },
  medium: {
    label: 'Vừa',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    iconClass: 'text-amber-500',
  },
  high: {
    label: 'Cao',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
    iconClass: 'text-rose-500',
  },
};

const COLOR_TAG_MAP: Record<string, string> = {
  emerald: 'bg-emerald-500',
  sky: 'bg-sky-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  purple: 'bg-purple-500',
  indigo: 'bg-indigo-500',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const priorityInfo = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const tagColorClass = COLOR_TAG_MAP[task.colorTag] || 'bg-slate-400';

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/90 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing">
      {/* Color tag stripe on the left */}
      <div className={`absolute top-3 left-0 w-1 h-6 rounded-r-full ${tagColorClass}`} />

      {/* Header: Priority & Action button */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${priorityInfo.badgeClass}`}
        >
          <Flag className={`w-3 h-3 ${priorityInfo.iconClass}`} />
          {priorityInfo.label}
        </span>

        <button
          type="button"
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Tùy chọn thẻ"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 mb-1 leading-snug">
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {/* Footer: Due date */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500">
        {task.dueDate ? (
          <span className="flex items-center gap-1.5 font-medium text-slate-500 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            {task.dueDate}
          </span>
        ) : (
          <span />
        )}
        <span className="capitalize text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
          #{task.colorTag}
        </span>
      </div>
    </div>
  );
};
