import React from 'react';
import type { Column, Task } from '../../types/kanban';
import { ColumnContainer } from './ColumnContainer';
import { Plus } from 'lucide-react';

interface BoardProps {
  columns: Column[];
  tasks: Task[];
}

export const Board: React.FC<BoardProps> = ({ columns, tasks }) => {
  return (
    <div className="flex-1 overflow-x-auto p-6">
      <div className="flex items-start gap-5 min-w-max pb-6">
        {columns.map((column) => {
          const columnTasks = tasks.filter((task) => task.columnId === column.id);
          return (
            <ColumnContainer
              key={column.id}
              column={column}
              tasks={columnTasks}
            />
          );
        })}

        {/* Add Column Button (Placeholder for Milestone 4) */}
        <button
          type="button"
          className="flex items-center justify-center gap-2 w-80 h-14 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:border-slate-400 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 text-xs font-semibold transition"
        >
          <Plus className="w-4 h-4" />
          Thêm cột mới
        </button>
      </div>
    </div>
  );
};
