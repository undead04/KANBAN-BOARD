import React, { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { ColumnContainer } from './ColumnContainer';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';
import { useKanbanStore, filterTasks } from '../../store/kanbanStore';
import type { Task, Priority, Column } from '../../types/kanban';
import { TaskModal } from '../modals/TaskModal';
import { ColumnModal } from '../modals/ColumnModal';
import { ConfirmDialog } from '../modals/ConfirmDialog';

export const Board: React.FC = () => {
  const columns = useKanbanStore((state) => state.columns || []);
  const allTasks = useKanbanStore((state) => state.tasks || []);

  const searchQuery = useKanbanStore((state) => state.searchQuery || '');
  const priorityFilter = useKanbanStore((state) => state.priorityFilter || 'all');
  const tagFilter = useKanbanStore((state) => state.tagFilter || 'all');
  const sortBy = useKanbanStore((state) => state.sortBy || 'manual');

  const filteredTasks = useMemo(
    () => filterTasks(allTasks, searchQuery, priorityFilter, tagFilter, sortBy),
    [allTasks, searchQuery, priorityFilter, tagFilter, sortBy]
  );

  const isFiltering =
    (searchQuery || '').trim() !== '' ||
    priorityFilter !== 'all' ||
    tagFilter !== 'all' ||
    sortBy !== 'manual';

  // Task actions
  const addTask = useKanbanStore((state) => state.addTask);
  const updateTask = useKanbanStore((state) => state.updateTask);
  const deleteTask = useKanbanStore((state) => state.deleteTask);
  const moveTask = useKanbanStore((state) => state.moveTask);

  // Column actions
  const addColumn = useKanbanStore((state) => state.addColumn);
  const updateColumn = useKanbanStore((state) => state.updateColumn);
  const deleteColumn = useKanbanStore((state) => state.deleteColumn);
  const sortColumnByPriority = useKanbanStore((state) => state.sortColumnByPriority);

  // Drag and drop state
  const [activeTask, setActiveTask] = useState<Task | null>(null);

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

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const foundTask = allTasks.find((t) => t && t.id === active.id);
    if (foundTask) {
      setActiveTask(foundTask);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const activeTaskItem = allTasks.find((t) => t && t.id === activeId);
    if (!activeTaskItem) return;

    // 1. Kéo qua một Task ở cột khác
    const overTaskItem = allTasks.find((t) => t && t.id === overId);
    if (overTaskItem && activeTaskItem.columnId !== overTaskItem.columnId) {
      moveTask(activeId, overId);
      return;
    }

    // 2. Kéo qua một Column khác (ví dụ cột rỗng)
    const overColumnItem = columns.find((c) => c && c.id === overId);
    if (overColumnItem && activeTaskItem.columnId !== overColumnItem.id) {
      moveTask(activeId, overId);
      return;
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId !== overId) {
      moveTask(activeId, overId);
    }
  };

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
    ? (allTasks || []).filter((t) => t && t.columnId === columnToDelete.id).length
    : 0;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 overflow-x-auto p-4 sm:p-6">
        <div className="flex items-start gap-5 min-w-max pb-6">
          {columns.filter(Boolean).map((column) => {
            const columnDisplayedTasks = filteredTasks.filter(
              (task) => task && task.columnId === column.id
            );
            const columnTotalTasks = allTasks.filter(
              (task) => task && task.columnId === column.id
            );

            return (
              <ColumnContainer
                key={column.id}
                column={column}
                tasks={columnDisplayedTasks}
                totalCount={columnTotalTasks.length}
                isFiltering={isFiltering}
                onAddTask={handleOpenAddTask}
                onEditTask={handleOpenEditTask}
                onDeleteTask={handleOpenDeleteTask}
                onRenameColumn={handleRenameColumn}
                onDeleteColumn={handleOpenDeleteColumn}
                onSortPriority={(colId) => sortColumnByPriority(colId, 'desc')}
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

        {/* Drag Overlay Preview */}
        <DragOverlay
          dropAnimation={{
            duration: 200,
            easing: 'ease',
          }}
        >
          {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
        </DragOverlay>

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
    </DndContext>
  );
};
