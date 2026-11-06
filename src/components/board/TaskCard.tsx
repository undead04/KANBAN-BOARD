import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task, Priority } from '../../types/kanban';
import { Calendar, Trash2, Flag, Lock, AlertCircle } from 'lucide-react';
import { usePresenceStore } from '../../store/presenceStore';
import { isTaskOverdue } from '../../utils/dateHelpers';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  isOverlay?: boolean;
  currentUserId?: string;
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
  currentUserId = 'current-user-1',
}) => {
  if (!task) return null;

  // Real-time Presence: Card Locking check
  const isLockedByOther = usePresenceStore((state) =>
    state.isTaskLockedByOther(task.id, currentUserId)
  );
  const lockInfo = usePresenceStore((state) =>
    isLockedByOther ? state.getLockInfo(task.id) : null
  );

  const priorityInfo = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const tagColorClass = COLOR_TAG_MAP[task.colorTag] || 'bg-slate-400';
  const isOverdue = isTaskOverdue(task.dueDate, task.columnId);

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
    disabled: isOverlay || isLockedByOther,
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
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${priorityInfo.badgeClass}`}
            >
              <Flag className={`w-3 h-3 ${priorityInfo.iconClass}`} />
              {priorityInfo.label}
            </span>
            {isOverdue && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800">
                <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                Quá hạn
              </span>
            )}
          </div>
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
            <span
              className={`flex items-center gap-1.5 ${
                isOverdue
                  ? 'text-rose-600 dark:text-rose-400 font-semibold'
                  : 'font-medium text-slate-500 dark:text-slate-400'
              }`}
            >
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
      {...(!isLockedByOther ? listeners : {})}
      onClick={() => {
        if (!isLockedByOther) {
          onEdit?.(task);
        }
      }}
      className={`group relative bg-white dark:bg-slate-900 border rounded-xl p-4 shadow-xs transition-all duration-150 select-none ${
        isLockedByOther
          ? 'ring-2 ring-amber-500 border-amber-400 dark:border-amber-600 shadow-md shadow-amber-500/10 cursor-not-allowed opacity-95'
          : 'border-slate-200 dark:border-slate-800/90 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 cursor-grab active:cursor-grabbing'
      }`}
    >
      {/* Real-time Presence Lock Banner if locked by another user */}
      {isLockedByOther && (
        <div className="mb-2.5 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] font-semibold flex items-center justify-between gap-1.5 animate-pulse">
          <span className="flex items-center gap-1.5 truncate">
            <span className="text-sm">{lockInfo?.lockedBy?.avatar || '🔒'}</span>
            <span className="truncate">{lockInfo?.lockedBy?.name || 'Thành viên'} đang giữ...</span>
          </span>
          <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-amber-700 dark:text-amber-300 px-1 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60 shrink-0">
            <Lock className="w-2.5 h-2.5" />
            Đang khóa
          </span>
        </div>
      )}

      {/* Color tag stripe on the left */}
      <div
        className={`absolute top-3 left-0 w-1 h-6 rounded-r-full ${tagColorClass}`}
      />

      {/* Header: Priority, Overdue badge & Delete button */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${priorityInfo.badgeClass}`}
          >
            <Flag className={`w-3 h-3 ${priorityInfo.iconClass}`} />
            {priorityInfo.label}
          </span>
          {isOverdue && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800">
              <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
              Quá hạn
            </span>
          )}
        </div>

        {!isLockedByOther && (
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
        )}
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
          <span
            className={`flex items-center gap-1.5 ${
              isOverdue
                ? 'text-rose-600 dark:text-rose-400 font-semibold'
                : 'font-medium text-slate-500 dark:text-slate-400'
            }`}
          >
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
