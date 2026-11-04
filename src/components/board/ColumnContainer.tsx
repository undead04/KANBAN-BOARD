import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Column, Task } from '../../types/kanban';
import { ColumnHeader } from './ColumnHeader';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';

interface ColumnContainerProps {
  column: Column;
  tasks: Task[];
  onAddTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onRenameColumn: (columnId: string, newTitle: string) => void;
  onDeleteColumn: (column: Column) => void;
}

export const ColumnContainer: React.FC<ColumnContainerProps> = ({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onRenameColumn,
  onDeleteColumn,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  const taskIds = tasks.map((t) => t.id);

  return (
    <div
      className={`flex flex-col flex-shrink-0 w-80 bg-slate-50/80 dark:bg-slate-900/60 border rounded-2xl p-3 max-h-[calc(100vh-8rem)] shadow-sm transition-all duration-200 ${
        isOver
          ? 'border-sky-400 dark:border-sky-500 ring-2 ring-sky-400/20 bg-sky-50/20 dark:bg-sky-950/20'
          : 'border-slate-200/80 dark:border-slate-800/80'
      }`}
    >
      {/* Column Header */}
      <ColumnHeader
        column={column}
        taskCount={tasks.length}
        onRename={onRenameColumn}
        onDelete={onDeleteColumn}
      />

      {/* Task List (Droppable & Sortable area) */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto space-y-3 px-0.5 py-1 min-h-[150px]"
      >
        <SortableContext
          items={taskIds}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="h-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-400">
            Kéo thả hoặc thêm thẻ mới vào đây
          </div>
        )}
      </div>

      {/* Add Task Button */}
      <button
        type="button"
        onClick={() => onAddTask(column.id)}
        className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 px-3 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:white bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-xs transition cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        Thêm công việc
      </button>
    </div>
  );
};
