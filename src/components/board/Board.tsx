import React, { useState } from 'react';
import { ColumnContainer } from './ColumnContainer';
import { Plus } from 'lucide-react';
import { useKanbanStore } from '../../store/kanbanStore';
import type { Task, Priority, Column } from '../../types/kanban';
import { TaskModal } from '../modals/TaskModal';
import { ColumnModal } from '../modals/ColumnModal';
import { ConfirmDialog } from '../modals/ConfirmDialog';

export const Board: React.FC = () => {
  const columns = useKanbanStore((state) => state.columns);
  const tasks = useKanbanStore((state) => state.tasks);

  // Task actions
  const addTask = useKanbanStore((state) => state.addTask);
  const updateTask = useKanbanStore((state) => state.updateTask);
  const deleteTask = useKanbanStore((state) => state.deleteTask);

  // Column actions
  const addColumn = useKanbanStore((state) => state.addColumn);
  const updateColumn = useKanbanStore((state) => state.updateColumn);
  const deleteColumn = useKanbanStore((state) => state.deleteColumn);

  // Task Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [targetColumnId, setTargetColumnId] = useState<string>('');

  // Confirm delete task dialog states
  const [isConfirmTaskOpen, setIsConfirmTaskOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Column Modal states
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

  // Confirm delete column dialog states
  const [isConfirmColumnOpen, setIsConfirmColumnOpen] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<Column | null>(null);

  // Task Handlers
  const handleOpenAddTask = (columnId: string) => {
    setTaskToEdit(null);
    setTargetColumnId(columnId);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setTaskToEdit(task);
    setTargetColumnId(task.columnId);
    setIsTaskModalOpen(true);
  };

  const handleOpenDeleteTask = (task: Task) => {
    setTaskToDelete(task);
    setIsConfirmTaskOpen(true);
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

  const handleConfirmDeleteTask = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
  };

  // Column Handlers
  const handleCreateColumn = (title: string) => {
    addColumn(title);
  };

  const handleRenameColumn = (columnId: string, newTitle: string) => {
    updateColumn(columnId, newTitle);
  };

  const handleOpenDeleteColumn = (column: Column) => {
    setColumnToDelete(column);
    setIsConfirmColumnOpen(true);
  };

  const handleConfirmDeleteColumn = () => {
    if (columnToDelete) {
      deleteColumn(columnToDelete.id);
      setColumnToDelete(null);
    }
  };

  // Count tasks in column to be deleted for warning message
  const tasksInColumnToDelete = columnToDelete
    ? tasks.filter((t) => t.columnId === columnToDelete.id).length
    : 0;

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
              onAddTask={handleOpenAddTask}
              onEditTask={handleOpenEditTask}
              onDeleteTask={handleOpenDeleteTask}
              onRenameColumn={handleRenameColumn}
              onDeleteColumn={handleOpenDeleteColumn}
            />
          );
        })}

        {/* Add Column Button */}
        <button
          type="button"
          onClick={() => setIsColumnModalOpen(true)}
          className="flex items-center justify-center gap-2 w-80 h-14 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:border-slate-400 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 text-xs font-semibold transition cursor-pointer"
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

      {/* Confirm Delete Task Dialog */}
      <ConfirmDialog
        isOpen={isConfirmTaskOpen}
        title="Xác nhận xóa công việc"
        message={
          taskToDelete
            ? `Bạn có chắc muốn xóa công việc "${taskToDelete.title}"? Dữ liệu sẽ không thể khôi phục.`
            : undefined
        }
        confirmLabel="Xóa công việc"
        cancelLabel="Hủy bỏ"
        onConfirm={handleConfirmDeleteTask}
        onClose={() => {
          setIsConfirmTaskOpen(false);
          setTaskToDelete(null);
        }}
      />

      {/* Column Modal (Create Column) */}
      <ColumnModal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
        onSave={handleCreateColumn}
        mode="create"
      />

      {/* Confirm Delete Column Dialog */}
      <ConfirmDialog
        isOpen={isConfirmColumnOpen}
        title="Xác nhận xóa cột"
        message={
          columnToDelete
            ? tasksInColumnToDelete > 0
              ? `Bạn có chắc muốn xóa cột "${columnToDelete.title}" cùng với ${tasksInColumnToDelete} công việc bên trong? Dữ liệu sẽ không thể khôi phục.`
              : `Bạn có chắc muốn xóa cột "${columnToDelete.title}"? Dữ liệu sẽ không thể khôi phục.`
            : undefined
        }
        confirmLabel="Xóa cột"
        cancelLabel="Hủy bỏ"
        onConfirm={handleConfirmDeleteColumn}
        onClose={() => {
          setIsConfirmColumnOpen(false);
          setColumnToDelete(null);
        }}
      />
    </div>
  );
};
