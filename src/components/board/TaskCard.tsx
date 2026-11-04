import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task, Priority } from '../../types/kanban';
import { Calendar, Trash2, Flag } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  isOverlay?: boolean;
}

const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; badgeClass: string; iconClass: string }
> = {
  low: {
    label: 'Thấp',
    badgeClass:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    iconClass: 'text-emerald-500',
  },
  medium: {
    label: 'Vừa',
    badgeClass:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    iconClass: 'text-amber-500',
  },
  high: {
    label: 'Cao',
    badgeClass:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
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

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  isOverlay = false,
}) => {
  if (!task) return null;

  const priorityInfo = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const tagColorClass = COLOR_TAG_MAP[task.colorTag] || 'bg-slate-400';

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
    disabled: isOverlay,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  // Overlay preview representation
  if (isOverlay) {
    return (
      <div className="relative bg-white dark:bg-slate-900 border-2 border-sky-400 dark:border-sky-500 rounded-xl p-4 shadow-2xl scale-[1.02] rotate-1 cursor-grabbing ring-4 ring-sky-500/20 select-none">
        <div
          className={`absolute top-3 left-0 w-1.5 h-6 rounded-r-full ${tagColorClass}`}
        />
        <div className="flex items-center justify-between gap-2 mb-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${priorityInfo.badgeClass}`}
          >
            <Flag className={`w-3 h-3 ${priorityInfo.iconClass}`} />
            {priorityInfo.label}
          </span>
        </div>
        <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 mb-1 leading-snug">
          {task.title}
        </h3>
        {task.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
            {task.description}
          </p>
        )}
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
  }

  // Placeholder when card is currently being dragged
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 border-2 border-dashed border-sky-400 dark:border-sky-500 bg-sky-50/30 dark:bg-sky-950/20 rounded-xl p-4 min-h-[100px] transition-all"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onEdit?.(task)}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/90 rounded-xl p-4 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150 cursor-grab active:cursor-grabbing select-none"
    >
      {/* Color tag stripe on the left */}
      <div
        className={`absolute top-3 left-0 w-1 h-6 rounded-r-full ${tagColorClass}`}
      />

      {/* Header: Priority & Delete button */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${priorityInfo.badgeClass}`}
        >
          <Flag className={`w-3 h-3 ${priorityInfo.iconClass}`} />
          {priorityInfo.label}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(task);
          }}
          className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 transition opacity-70 group-hover:opacity-100 cursor-pointer"
          aria-label="Xóa thẻ"
          title="Xóa thẻ công việc"
        >
          <Trash2 className="w-3.5 h-3.5" />
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
