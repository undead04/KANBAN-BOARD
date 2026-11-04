import React, { useState } from 'react';
import { ColumnContainer } from './ColumnContainer';
import { Plus } from 'lucide-react';
import { useKanbanStore } from '../../store/kanbanStore';
import type { Task, Priority } from '../../types/kanban';
import { TaskModal } from '../modals/TaskModal';
import { ConfirmDialog } from '../modals/ConfirmDialog';

export const Board: React.FC = () => {
  const columns = useKanbanStore((state) => state.columns);
  const tasks = useKanbanStore((state) => state.tasks);
  const addTask = useKanbanStore((state) => state.addTask);
  const updateTask = useKanbanStore((state) => state.updateTask);
  const deleteTask = useKanbanStore((state) => state.deleteTask);

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [targetColumnId, setTargetColumnId] = useState<string>('');

  // Confirm delete dialog states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const handleOpenAdd = (columnId: string) => {
    setTaskToEdit(null);
    setTargetColumnId(columnId);
    setIsTaskModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setTaskToEdit(task);
    setTargetColumnId(task.columnId);
    setIsTaskModalOpen(true);
  };

  const handleOpenDelete = (task: Task) => {
    setTaskToDelete(task);
    setIsConfirmOpen(true);
  };

  const handleSaveTask = (taskData: {
    title: string;
    description: string;
    columnId: string;
    priority: Priority;
    dueDate?: string;
    colorTag: string;
  }) => {
    if (taskToEdit) {
      updateTask(taskToEdit.id, taskData);
    } else {
      addTask(taskData);
    }
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
  };

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
              onAddTask={handleOpenAdd}
              onEditTask={handleOpenEdit}
              onDeleteTask={handleOpenDelete}
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

      {/* Task Modal (Create & Edit) */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        defaultColumnId={targetColumnId}
        columns={columns}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Xác nhận xóa công việc"
        message={
          taskToDelete
            ? `Bạn có chắc muốn xóa công việc "${taskToDelete.title}"? Dữ liệu sẽ không thể khôi phục.`
            : undefined
        }
        confirmLabel="Xóa công việc"
        cancelLabel="Hủy bỏ"
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setIsConfirmOpen(false);
          setTaskToDelete(null);
        }}
      />
    </div>
  );
};
